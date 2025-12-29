import { NextRequest, NextResponse } from 'next/server';
import { findRelatedContent } from '@/lib/ai-service';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
    try {
        // Check authentication (optional for public use)
        const supabase = await createServerSupabaseClient();

        const body = await request.json();
        const { postId, title, content, limit = 5 } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        // Get available posts (excluding current)
        const { data: posts } = await supabase
            .from('posts')
            .select('id, title, excerpt')
            .eq('status', 'published')
            .neq('id', postId || '')
            .order('published_at', { ascending: false })
            .limit(30);

        if (!posts || posts.length === 0) {
            return NextResponse.json({ relatedPosts: [] });
        }

        const typedPosts = posts.map(p => ({ id: p.id, title: p.title, excerpt: p.excerpt ?? undefined }));
        const result = await findRelatedContent(title, content || '', typedPosts);

        if (result.error) {
            // Fallback to simple matching if AI fails
            const fallbackPosts = posts.slice(0, limit);
            return NextResponse.json({
                relatedPosts: fallbackPosts,
                source: 'fallback'
            });
        }

        // Get full post data for related IDs
        const relatedPosts = posts.filter(p => result.relatedIds.includes(p.id)).slice(0, limit);

        return NextResponse.json({
            relatedPosts,
            source: 'ai'
        });

    } catch (error) {
        console.error('Related Content API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
