import { NextRequest, NextResponse } from 'next/server';
import {
    generateExcerpt,
    generateMetaDescription,
    generateOutline,
    suggestTitle,
    expandContent
} from '@/lib/ai-service';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

const RATE_LIMIT = 20; // requests per minute
const RATE_WINDOW = 60; // seconds

async function checkRateLimit(userId: string): Promise<boolean> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        console.warn('[Rate Limit] No service key, skipping DB rate limit');
        return true; // Allow if not configured
    }

    try {
        const supabase = createClient(supabaseUrl, serviceKey);
        const { data, error } = await supabase.rpc('check_rate_limit', {
            p_key: `ai_content:${userId}`,
            p_limit: RATE_LIMIT,
            p_window_seconds: RATE_WINDOW
        });

        if (error) {
            console.error('[Rate Limit] RPC Error:', error);
            return true; // Allow on error to not block users
        }

        return data === true;
    } catch (e) {
        console.error('[Rate Limit] Exception:', e);
        return true;
    }
}

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limiting (DB-based)
        const allowed = await checkRateLimit(user.id);
        if (!allowed) {
            return NextResponse.json({ error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' }, { status: 429 });
        }

        const body = await request.json();
        const { action, content, title, topic, keywords, text, context } = body;

        let result;

        switch (action) {
            case 'excerpt':
                result = await generateExcerpt(content || '', title || '');
                break;
            case 'meta':
                result = await generateMetaDescription(content || '', title || '');
                break;
            case 'outline':
                result = await generateOutline(topic || '', keywords);
                break;
            case 'title':
                result = await suggestTitle(title || '', content);
                break;
            case 'expand':
                result = await expandContent(text || '', context);
                break;
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ content: result.content });

    } catch (error) {
        console.error('AI API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
