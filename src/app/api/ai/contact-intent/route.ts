import { NextRequest, NextResponse } from 'next/server';
import { analyzeContactIntent } from '@/lib/ai-service';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { message, subject } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Combine subject and message for better analysis
        const fullMessage = subject ? `Chủ đề: ${subject}\n\nNội dung: ${message}` : message;

        const result = await analyzeContactIntent(fullMessage);

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({
            intent: result.intent,
            confidence: result.confidence,
            suggestedResponse: result.suggestedResponse,
        });

    } catch (error) {
        console.error('Contact Intent API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
