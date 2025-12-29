import { NextRequest, NextResponse } from 'next/server';
import { testAIConnection } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { baseUrl, apiKey, model } = body;

        if (!apiKey) {
            return NextResponse.json({ success: false, message: 'Missing API Key' }, { status: 400 });
        }

        const result = await testAIConnection(baseUrl, apiKey, model);
        return NextResponse.json(result);
    } catch (e: any) {
        return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
}
