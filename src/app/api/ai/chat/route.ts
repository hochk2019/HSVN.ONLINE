import { NextRequest, NextResponse } from 'next/server';
import { chatWithCopilot } from '@/lib/ai-service';
import { createClient } from '@supabase/supabase-js';

const RATE_LIMIT = 20; // requests per minute per IP
const RATE_WINDOW = 60; // seconds

async function checkRateLimit(ip: string): Promise<boolean> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        console.warn('[Chat Rate Limit] No service key, skipping DB rate limit');
        return true;
    }

    try {
        const supabase = createClient(supabaseUrl, serviceKey);
        const { data, error } = await supabase.rpc('check_rate_limit', {
            p_key: `chat:${ip}`,
            p_limit: RATE_LIMIT,
            p_window_seconds: RATE_WINDOW
        });

        if (error) {
            console.error('[Chat Rate Limit] RPC Error:', error);
            return true; // Allow on error
        }

        return data === true;
    } catch (e) {
        console.error('[Chat Rate Limit] Exception:', e);
        return true;
    }
}

// Log chat session (non-blocking)
async function logChatSession(data: {
    sessionId: string;
    ip: string;
    userAgent: string;
    userMessage: string;
    aiResponse: string | null;
    modelUsed: string | undefined;
    responseTimeMs: number;
    error: string | null;
}) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.warn('[Chat Log] Supabase credentials not configured');
            return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        await supabase.from('chat_sessions').insert({
            session_id: data.sessionId,
            ip_address: data.ip,
            user_agent: data.userAgent,
            user_message: data.userMessage,
            ai_response: data.aiResponse,
            model_used: data.modelUsed,
            response_time_ms: data.responseTimeMs
        });
    } catch (error) {
        console.error('[Chat Log Error]:', error);
    }
}

export async function POST(request: NextRequest) {
    const startTime = Date.now();

    try {
        // Get client info
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Check rate limit (DB-based)
        const allowed = await checkRateLimit(ip);
        if (!allowed) {
            return NextResponse.json(
                { error: 'Bạn đã gửi quá nhiều tin nhắn. Vui lòng chờ 1 phút.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { message, history, sessionId } = body;

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Vui lòng nhập tin nhắn' },
                { status: 400 }
            );
        }

        // Limit message length
        if (message.length > 2000) {
            return NextResponse.json(
                { error: 'Tin nhắn quá dài. Tối đa 2000 ký tự.' },
                { status: 400 }
            );
        }

        // Call AI service
        const result = await chatWithCopilot(
            message,
            Array.isArray(history) ? history.slice(-10) : []
        );

        const responseTime = Date.now() - startTime;

        // Log session asynchronously (don't await)
        logChatSession({
            sessionId: sessionId || `anon_${Date.now()}`,
            ip,
            userAgent,
            userMessage: message,
            aiResponse: result.content || null,
            modelUsed: result.modelUsed,
            responseTimeMs: responseTime,
            error: result.error
        });

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            content: result.content,
            timestamp: new Date().toISOString(),
            modelUsed: result.modelUsed,
            responseTimeMs: responseTime
        });

    } catch (error) {
        console.error('[Chat API Error]:', error);
        return NextResponse.json(
            { error: 'Lỗi xử lý yêu cầu. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}

