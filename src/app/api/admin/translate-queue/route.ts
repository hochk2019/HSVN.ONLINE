import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserProfile } from '@/lib/auth-actions';
import { translatePost } from '@/lib/ai-service';

// Initialize Supabase Admin Client
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error('Missing Supabase config');
    }

    return createClient(url, serviceKey);
}

// GET: Get queue status
export async function GET(request: NextRequest) {
    const profile = await getUserProfile();
    if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = getSupabaseAdmin();
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let query = supabase
            .from('translation_queue')
            .select(`
                id,
                post_id,
                target_language,
                status,
                error,
                created_at,
                started_at,
                completed_at,
                posts!inner(title, slug)
            `)
            .order('created_at', { ascending: false })
            .limit(50);

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ queue: data });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST: Add to queue or process next item
export async function POST(request: NextRequest) {
    const profile = await getUserProfile();
    if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = getSupabaseAdmin();
        const body = await request.json();
        const { action, postId, language = 'en' } = body;

        if (action === 'add') {
            // Add post to queue
            if (!postId) {
                return NextResponse.json({ error: 'postId required' }, { status: 400 });
            }

            // Check if already in queue
            const { data: existing } = await supabase
                .from('translation_queue')
                .select('id, status')
                .eq('post_id', postId)
                .eq('target_language', language)
                .in('status', ['pending', 'processing'])
                .single();

            if (existing) {
                return NextResponse.json({
                    message: 'Already in queue',
                    status: existing.status
                });
            }

            const { data, error } = await supabase
                .from('translation_queue')
                .insert({
                    post_id: postId,
                    target_language: language,
                    created_by: profile.id
                })
                .select()
                .single();

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ message: 'Added to queue', job: data });
        }

        if (action === 'process') {
            // Process next pending job
            const { data: job, error: jobError } = await supabase
                .rpc('get_next_translation_job');

            if (jobError || !job || job.length === 0) {
                return NextResponse.json({ message: 'No pending jobs' });
            }

            const nextJob = job[0];

            // Fetch post content
            const { data: post, error: postError } = await supabase
                .from('posts')
                .select('id, title, excerpt, content_html, translations')
                .eq('id', nextJob.post_id)
                .single();

            if (postError || !post) {
                await supabase.rpc('complete_translation_job', {
                    p_job_id: nextJob.id,
                    p_success: false,
                    p_error: 'Post not found'
                });
                return NextResponse.json({ error: 'Post not found' }, { status: 404 });
            }

            // Translate
            const { translated, error: translateError } = await translatePost(
                post.title,
                post.excerpt || '',
                post.content_html || '',
                nextJob.target_language
            );

            if (translateError) {
                await supabase.rpc('complete_translation_job', {
                    p_job_id: nextJob.id,
                    p_success: false,
                    p_error: translateError
                });
                return NextResponse.json({ error: translateError }, { status: 500 });
            }

            // Save translation
            const updatedTranslations = {
                ...(post.translations || {}),
                [nextJob.target_language]: translated
            };

            await supabase
                .from('posts')
                .update({ translations: updatedTranslations })
                .eq('id', nextJob.post_id);

            await supabase.rpc('complete_translation_job', {
                p_job_id: nextJob.id,
                p_success: true
            });

            return NextResponse.json({
                message: 'Translation completed',
                postId: nextJob.post_id
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
