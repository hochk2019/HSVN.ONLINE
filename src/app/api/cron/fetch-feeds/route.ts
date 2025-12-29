import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseFeed, extractFeaturedImage, cleanContent } from '@/lib/feed-parser';

// Use service role for cron jobs
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// AI Rewrite function using existing AI service
async function aiRewriteContent(
    title: string,
    content: string,
    targetLanguage: string = 'vi'
): Promise<{ title: string; content: string }> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'}/api/ai/content`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'rewrite',
                content: `Tiêu đề: ${title}\n\nNội dung:\n${content.substring(0, 5000)}`,
                options: {
                    language: targetLanguage,
                    instructions: `Viết lại bài viết này bằng tiếng Việt theo phong cách chuyên nghiệp. 
                    Giữ nguyên ý chính nhưng viết lại hoàn toàn bằng từ ngữ mới. 
                    Trả về format:
                    TIÊU ĐỀ: [tiêu đề mới]
                    NỘI DUNG:
                    [nội dung đã viết lại]`,
                },
            }),
        });

        if (!response.ok) {
            throw new Error('AI rewrite failed');
        }

        const data = await response.json();
        const aiText = data.content || '';

        // Parse AI response
        const titleMatch = aiText.match(/TIÊU ĐỀ:\s*(.+?)(?=\n|NỘI DUNG)/i);
        const contentMatch = aiText.match(/NỘI DUNG:\s*([\s\S]+)/i);

        return {
            title: titleMatch?.[1]?.trim() || title,
            content: contentMatch?.[1]?.trim() || aiText,
        };
    } catch (error) {
        console.error('AI rewrite error:', error);
        // Return original if AI fails
        return { title, content };
    }
}

export async function GET(request: NextRequest) {
    return handleFetch(request);
}

export async function POST(request: NextRequest) {
    return handleFetch(request);
}

async function handleFetch(request: NextRequest) {
    // Verify cron secret (for Vercel Cron)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Allow if no secret set (local dev) or valid secret
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        // Also allow POST from admin UI without secret
        if (request.method !== 'POST') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    try {
        // Get active feed sources
        const { data: sources, error: sourcesError } = await supabase
            .from('feed_sources')
            .select('*')
            .eq('is_active', true);

        if (sourcesError) {
            return NextResponse.json({ error: sourcesError.message }, { status: 500 });
        }

        if (!sources || sources.length === 0) {
            return NextResponse.json({ message: 'No active sources', fetched: 0 });
        }

        let totalFetched = 0;
        const results: any[] = [];

        for (const source of sources) {
            try {
                // Parse the feed
                const feed = await parseFeed(source.url);
                let fetchedFromSource = 0;

                for (const item of feed.items.slice(0, 10)) { // Max 10 items per source
                    // Check if already exists
                    const { data: existing } = await supabase
                        .from('imported_articles')
                        .select('id')
                        .eq('original_url', item.link)
                        .single();

                    if (existing) continue; // Skip duplicates

                    // Extract featured image
                    const featuredImage = extractFeaturedImage(item);

                    // Clean content
                    const cleanedContent = cleanContent(item.content);

                    // AI Rewrite
                    const { title: aiTitle, content: aiContent } = await aiRewriteContent(
                        item.title,
                        cleanedContent
                    );

                    // Insert article
                    const { error: insertError } = await supabase
                        .from('imported_articles')
                        .insert({
                            source_id: source.id,
                            original_url: item.link,
                            original_title: item.title,
                            original_content: cleanedContent,
                            ai_rewritten_title: aiTitle,
                            ai_rewritten_content: aiContent,
                            featured_image: featuredImage,
                            source_name: `Nguồn: ${source.name}`,
                            status: 'pending',
                        });

                    if (!insertError) {
                        fetchedFromSource++;
                        totalFetched++;
                    }
                }

                // Update source fetch time and count
                await supabase
                    .from('feed_sources')
                    .update({
                        last_fetched_at: new Date().toISOString(),
                        articles_count: supabase.rpc('increment', { row_id: source.id, amount: fetchedFromSource }),
                    })
                    .eq('id', source.id);

                results.push({
                    source: source.name,
                    fetched: fetchedFromSource,
                });

            } catch (sourceError) {
                console.error(`Error fetching source ${source.name}:`, sourceError);
                results.push({
                    source: source.name,
                    error: String(sourceError),
                });
            }
        }

        // Redirect back to aggregator page if POST from admin
        if (request.method === 'POST') {
            return NextResponse.redirect(new URL('/admin/aggregator', request.url));
        }

        return NextResponse.json({
            success: true,
            totalFetched,
            results,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Cron fetch error:', error);
        return NextResponse.json(
            { error: String(error) },
            { status: 500 }
        );
    }
}
