import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Validation Schema
const TrackSchema = z.object({
    sessionId: z.string().max(100),
    eventType: z.string().max(50),
    targetType: z.string().max(50).optional().nullable(),
    targetId: z.string().max(100).optional().nullable(),
    targetSlug: z.string().max(200).optional().nullable(),
    metadata: z.record(z.string(), z.unknown()).optional().nullable()
});

// Track user events for recommendation engine
export async function POST(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Not configured' }, { status: 500 });
        }

        const body = await request.json();

        // Validate Payload
        const validation = TrackSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid payload', details: validation.error.format() },
                { status: 400 }
            );
        }

        const {
            sessionId,
            eventType,
            targetType,
            targetId,
            targetSlug,
            metadata
        } = validation.data;

        // Get client info
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';
        const referrer = request.headers.get('referer') || null;

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { error } = await supabase.from('user_events').insert({
            session_id: sessionId,
            event_type: eventType,
            target_type: targetType || null,
            target_id: targetId || null,
            target_slug: targetSlug || null,
            metadata: metadata || {},
            ip_address: ip,
            user_agent: userAgent,
            referrer: referrer
        });

        if (error) {
            console.error('[Track Error]:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[Track API Error]:', error);
        return NextResponse.json(
            { error: 'Failed to track event' },
            { status: 500 }
        );
    }
}

// Get recommendations for a session
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');
        const limit = parseInt(searchParams.get('limit') || '5');

        if (!sessionId) {
            return NextResponse.json(
                { error: 'sessionId required' },
                { status: 400 }
            );
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ recommendations: [] });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Call the recommendation function
        const { data, error } = await supabase.rpc('get_recommendations', {
            p_session_id: sessionId,
            p_limit: limit
        });

        if (error) {
            console.error('[Recommendations Error]:', error);
            return NextResponse.json({ recommendations: [] });
        }

        return NextResponse.json({ recommendations: data || [] });

    } catch (error) {
        console.error('[Recommendations API Error]:', error);
        return NextResponse.json({ recommendations: [] });
    }
}
