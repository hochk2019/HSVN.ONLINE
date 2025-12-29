import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { generateEmbeddings, chunkText, estimateTokens } from '@/lib/voyage-service';

/**
 * POST /api/embeddings/ingest
 * Ingest a post into the embeddings database
 * 
 * Body: { postId: string } or { postId: string, force: boolean }
 */
export async function POST(request: NextRequest) {
    try {
        const { postId, force = false } = await request.json();

        if (!postId) {
            return NextResponse.json(
                { error: 'postId is required' },
                { status: 400 }
            );
        }

        const supabase = await createServerSupabaseClient();

        // Get post content
        const { data: post, error: postError } = await supabase
            .from('posts')
            .select('id, title, content_html, excerpt, status')
            .eq('id', postId)
            .single();

        if (postError || !post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        // Only ingest published posts
        if (post.status !== 'published' && !force) {
            return NextResponse.json(
                { error: 'Only published posts can be ingested' },
                { status: 400 }
            );
        }

        // Check if already ingested
        const { data: existing } = await supabase
            .from('post_embeddings')
            .select('id')
            .eq('post_id', postId)
            .limit(1);

        if (existing && existing.length > 0 && !force) {
            return NextResponse.json({
                success: true,
                message: 'Post already ingested',
                chunks: existing.length,
            });
        }

        // Delete existing embeddings if force re-ingest
        if (force && existing && existing.length > 0) {
            await supabase
                .from('post_embeddings')
                .delete()
                .eq('post_id', postId);
        }

        // Extract text content from HTML
        const htmlContent = post.content_html || '';
        const textContent = htmlContent
            .replace(/<[^>]*>/g, ' ')  // Remove HTML tags
            .replace(/\s+/g, ' ')       // Normalize whitespace
            .trim();

        if (!textContent) {
            return NextResponse.json(
                { error: 'No content to ingest' },
                { status: 400 }
            );
        }

        // Prepare full content with title and excerpt
        const fullContent = [
            `Tiêu đề: ${post.title}`,
            post.excerpt ? `Tóm tắt: ${post.excerpt}` : '',
            `Nội dung: ${textContent}`,
        ].filter(Boolean).join('\n\n');

        // Chunk the content
        const chunks = chunkText(fullContent);
        console.log(`[Ingest] Post ${postId}: ${chunks.length} chunks, ~${estimateTokens(fullContent)} tokens`);

        // Generate embeddings for all chunks
        const { embeddings, tokens, error: embedError } = await generateEmbeddings(chunks);

        if (embedError) {
            return NextResponse.json(
                { error: embedError },
                { status: 500 }
            );
        }

        // Store embeddings
        const embedRecords = chunks.map((chunk, index) => ({
            post_id: postId,
            chunk_index: index,
            content_chunk: chunk,
            embedding: embeddings[index] ? `[${embeddings[index]!.join(',')}]` : null,
            metadata: {
                tokens: estimateTokens(chunk),
                total_chunks: chunks.length,
            },
        })).filter(r => r.embedding !== null);

        if (embedRecords.length === 0) {
            return NextResponse.json(
                { error: 'Failed to generate embeddings' },
                { status: 500 }
            );
        }

        const { error: insertError } = await supabase
            .from('post_embeddings')
            .insert(embedRecords);

        if (insertError) {
            console.error('[Ingest] Insert error:', insertError);
            return NextResponse.json(
                { error: 'Failed to store embeddings' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            postId,
            chunks: chunks.length,
            tokensUsed: tokens,
        });

    } catch (error) {
        console.error('[Ingest] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/embeddings/ingest?postId=xxx
 * Check if a post has been ingested
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
        // Return stats
        const supabase = await createServerSupabaseClient();
        const { count } = await supabase
            .from('post_embeddings')
            .select('*', { count: 'exact', head: true });

        const { data: uniquePosts } = await supabase
            .from('post_embeddings')
            .select('post_id')
            .limit(1000);

        const uniquePostIds = new Set(uniquePosts?.map(p => p.post_id) || []);

        return NextResponse.json({
            totalChunks: count || 0,
            indexedPosts: uniquePostIds.size,
        });
    }

    const supabase = await createServerSupabaseClient();
    const { data, count } = await supabase
        .from('post_embeddings')
        .select('id, chunk_index, created_at', { count: 'exact' })
        .eq('post_id', postId);

    return NextResponse.json({
        postId,
        isIngested: (count || 0) > 0,
        chunks: count || 0,
        lastUpdated: data?.[0]?.created_at || null,
    });
}
