import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
    const supabase = await createServerSupabaseClient();

    try {
        const body = await req.json();
        const { postId, path, referrer, userAgent, type, visitId } = body;

        // Simple Device Detection
        let deviceType = 'desktop';
        if (/mobile/i.test(userAgent)) deviceType = 'mobile';
        else if (/tablet/i.test(userAgent)) deviceType = 'tablet';

        // Simple Browser Detection
        let browser = 'other';
        const ua = (userAgent || '').toLowerCase();
        if (ua.includes('chrome')) browser = 'chrome';
        else if (ua.includes('firefox')) browser = 'firefox';
        else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'safari';
        else if (ua.includes('edg')) browser = 'edge';

        // Hash visitor (IP + UA)
        const headers = req.headers;
        const ip = headers.get('x-forwarded-for') || 'unknown';
        const visitorHash = crypto.createHash('md5').update(`${ip}-${userAgent}`).digest('hex');

        if (type === 'init') {
            // Record new visit via RPC (which also increments view_count on posts)
            const { data, error } = await supabase.rpc('record_visit', {
                p_post_id: postId || null,
                p_path: path,
                p_hash: visitorHash,
                p_referrer: referrer ? referrer.substring(0, 255) : null,
                p_device: deviceType,
                p_browser: browser
            });

            if (error) throw error;
            return NextResponse.json({ visitId: data });
        }
        else if (type === 'heartbeat' && visitId) {
            // Update duration via RPC
            const { error } = await supabase.rpc('increment_view_duration', {
                visit_id: visitId,
                seconds: 30
            });

            if (error) console.error('Heartbeat error:', error);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

    } catch (error) {
        console.error('Tracking Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
