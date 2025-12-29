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

// Download image and upload to Supabase Storage
async function downloadAndUploadImage(
    imageUrl: string,
    sourceId: string
): Promise<string | null> {
    if (!imageUrl) return null;

    try {
        // Fetch image
        const response = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; GoldenLogistics/1.0)',
            },
        });

        if (!response.ok) return null;

        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const buffer = await response.arrayBuffer();

        // Generate unique filename
        const ext = contentType.includes('png') ? 'png' :
            contentType.includes('webp') ? 'webp' :
                contentType.includes('gif') ? 'gif' : 'jpg';
        const filename = `aggregator/${sourceId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('media')
            .upload(filename, buffer, {
                contentType,
                upsert: false,
            });

        if (error) {
            console.error('Storage upload error:', error);
            return null;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('media')
            .getPublicUrl(filename);

        return urlData.publicUrl;
    } catch (error) {
        console.error('Image download error:', error);
        return null;
    }
}

// Simple title similarity check (Jaccard similarity)
function isSimilarTitle(title1: string, title2: string, threshold: number = 0.6): boolean {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    const words1 = new Set(normalize(title1));
    const words2 = new Set(normalize(title2));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size >= threshold;
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
        let totalDuplicates = 0;
        const results: any[] = [];

        for (const source of sources) {
            try {
                // Parse the feed
                const feed = await parseFeed(source.url);
                let fetchedFromSource = 0;
                let duplicatesFromSource = 0;

                // Get recent titles for similarity check
                const { data: recentArticles } = await supabase
                    .from('imported_articles')
                    .select('original_title')
                    .eq('source_id', source.id)
                    .order('created_at', { ascending: false })
                    .limit(50);

                const recentTitles = recentArticles?.map(a => a.original_title) || [];

                for (const item of feed.items.slice(0, 10)) { // Max 10 items per source
                    // Check if URL already exists
                    const { data: existing } = await supabase
                        .from('imported_articles')
                        .select('id')
                        .eq('original_url', item.link)
                        .single();

                    if (existing) {
                        duplicatesFromSource++;
                        continue;
                    }

                    // Check title similarity
                    const isDuplicate = recentTitles.some(t => isSimilarTitle(t, item.title));
                    if (isDuplicate) {
                        duplicatesFromSource++;
                        continue;
                    }

                    // Extract featured image
                    let featuredImage = extractFeaturedImage(item);

                    // Download and upload image to Supabase Storage
                    if (featuredImage) {
                        const uploadedUrl = await downloadAndUploadImage(featuredImage, source.id);
                        if (uploadedUrl) {
                            featuredImage = uploadedUrl;
                        }
                        // Keep original URL as fallback if upload fails
                    }

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
                        recentTitles.push(item.title); // Add to duplicate check list
                    }
                }

                totalDuplicates += duplicatesFromSource;

                // Update source fetch time and increment articles count
                const newCount = (source.articles_count || 0) + fetchedFromSource;
                await supabase
                    .from('feed_sources')
                    .update({
                        last_fetched_at: new Date().toISOString(),
                        articles_count: newCount,
                    })
                    .eq('id', source.id);

                results.push({
                    source: source.name,
                    fetched: fetchedFromSource,
                    duplicates: duplicatesFromSource,
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
            totalDuplicates,
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
