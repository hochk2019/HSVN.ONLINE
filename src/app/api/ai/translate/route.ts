import { NextRequest, NextResponse } from 'next/server';
import { translatePost } from '@/lib/ai-service';
import { createClient } from '@supabase/supabase-js';
import { getUserProfile } from '@/lib/auth-actions';

// Initialize Supabase Client (prefer Admin, fallback to Anon)
function getSupabaseClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('[API Translate] Service Role Key:', serviceRoleKey ? 'SET' : 'MISSING');

    if (!url) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
    }

    if (serviceRoleKey) {
        console.log('[API Translate] Using Service Role Key - canSave=true');
        return { client: createClient(url, serviceRoleKey), canSave: true };
    }

    if (anonKey) {
        console.warn('[API Translate] Using Anon Key - canSave=false');
        return { client: createClient(url, anonKey), canSave: false };
    }

    throw new Error('Missing Supabase Config (Service Role or Anon Key)');
}

export async function POST(request: NextRequest) {
    console.log('[API Translate] Request received');
    try {
        // 0. Security Check: Require Admin
        const profile = await getUserProfile();
        if (!profile || profile.role !== 'admin') {
            console.log('[API Translate] Unauthorized - not admin');
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
        }
        console.log('[API Translate] Admin verified:', profile.email);

        const body = await request.json();
        const { postId, language = 'en' } = body;

        if (!postId) {
            return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
        }
        console.log('[API Translate] Processing postId:', postId, 'language:', language);

        // 2. Initialize Client
        let supabase;
        let canSave = false;
        try {
            const result = getSupabaseClient();
            supabase = result.client;
            canSave = result.canSave;
            console.log('[API Translate] Client initialized, canSave:', canSave);
        } catch (e: any) {
            console.error('[API Translate] Supabase Init Error:', e.message);
            return NextResponse.json({ error: `Server Config Error: ${e.message}` }, { status: 500 });
        }

        // 3. Fetch Post
        const { data: post, error: fetchError } = await supabase
            .from('posts')
            .select('id, title, excerpt, content_html, translations, status')
            .eq('id', postId)
            .single();

        if (fetchError || !post) {
            console.error('[API] Fetch Post Error:', fetchError);
            return NextResponse.json({ error: 'Post not found or permission denied' }, { status: 404 });
        }

        if (post.status !== 'published') {
            return NextResponse.json({ error: 'Post is not published' }, { status: 403 });
        }

        // 4. Check cache
        const currentTranslations = post.translations || {};
        if (currentTranslations[language] && typeof currentTranslations[language] === 'object') {
            const cached = currentTranslations[language];
            // Validate cached content is not empty
            if (cached.content_html && cached.content_html.trim()) {
                console.log('[API] Translation already exists, returning cached version');
                return NextResponse.json({ translated: cached });
            }
        }

        // 5. Translate
        console.log(`[API] Translating post ${postId} to ${language}...`);
        const { translated, error: translateError } = await translatePost(
            post.title,
            post.excerpt,
            post.content_html,
            language
        );

        if (translateError) {
            console.error('[API] AI Translation Error:', translateError);
            return NextResponse.json({ error: translateError }, { status: 500 });
        }

        // 6. Save if possible
        if (canSave) {
            const updatedTranslations = {
                ...currentTranslations,
                [language]: translated
            };

            const { error: updateError } = await supabase
                .from('posts')
                .update({ translations: updatedTranslations })
                .eq('id', postId);

            if (updateError) {
                console.error('[API] Failed to save translation:', updateError);
            } else {
                console.log('[API] Translation saved to DB');
            }
        } else {
            console.log('[API] Skipping save (No Service Role Key)');
        }

        return NextResponse.json({ translated });

    } catch (error: any) {
        console.error('[API] Unhandled Error:', error);
        return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 });
    }
}
