import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { generateEmbedding } from '@/lib/voyage-service';

/**
 * POST /api/embeddings/search
 * Semantic search for relevant content
 * 
 * Body: { query: string, limit?: number, threshold?: number }
 */
export async function POST(request: NextRequest) {
    try {
        const { query, limit = 5, threshold = 0.3 } = await request.json();

        if (!query || typeof query !== 'string') {
            return NextResponse.json(
                { error: 'query is required' },
                { status: 400 }
            );
        }

        // Generate embedding for the query
        const { embedding, error: embedError } = await generateEmbedding(query);

        if (embedError || !embedding) {
            return NextResponse.json(
                { error: embedError || 'Failed to generate query embedding' },
                { status: 500 }
            );
        }

        const supabase = await createServerSupabaseClient();

        // Use the search_posts function we created in pgvector setup
        const { data: results, error: searchError } = await supabase
            .rpc('search_posts', {
                query_embedding: `[${embedding.join(',')}]`,
                match_threshold: threshold,
                match_count: limit,
            });

        if (searchError) {
            console.error('[Search] RPC error:', searchError);
            return NextResponse.json(
                { error: 'Search failed' },
                { status: 500 }
            );
        }

        // Get post details for results
        const postIds = [...new Set(results?.map((r: { post_id: string }) => r.post_id) || [])];

        let postsMap: Record<string, { title: string; slug: string; category_slug?: string }> = {};

        if (postIds.length > 0) {
            const { data: posts } = await supabase
                .from('posts')
                .select('id, title, slug, category:categories(slug)')
                .in('id', postIds);

            if (posts) {
                postsMap = posts.reduce<Record<string, { title: string; slug: string; category_slug?: string }>>((acc, post) => {
                    acc[post.id] = {
                        title: post.title,
                        slug: post.slug,
                        category_slug: (post.category as { slug?: string } | null)?.slug,
                    };
                    return acc;
                }, {});
            }
        }

        // Format results
        const formattedResults = (results || []).map((r: { post_id: string; chunk_text: string; similarity: number }) => ({
            postId: r.post_id,
            title: postsMap[r.post_id]?.title || 'Unknown',
            slug: postsMap[r.post_id]?.slug,
            categorySlug: postsMap[r.post_id]?.category_slug,
            chunk: r.chunk_text,
            similarity: Math.round(r.similarity * 100) / 100,
            url: postsMap[r.post_id]?.category_slug && postsMap[r.post_id]?.slug
                ? `/${postsMap[r.post_id].category_slug}/${postsMap[r.post_id].slug}`
                : null,
        }));

        return NextResponse.json({
            query,
            results: formattedResults,
            count: formattedResults.length,
        });

    } catch (error) {
        console.error('[Search] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
