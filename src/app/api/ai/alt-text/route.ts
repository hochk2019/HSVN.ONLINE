import { NextRequest, NextResponse } from 'next/server';
import { generateAltText } from '@/lib/ai-service';
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
        const { imageUrl, title, content } = body;

        if (!imageUrl) {
            return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
        }

        const result = await generateAltText(imageUrl, { title, content });

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ altText: result.content });

    } catch (error) {
        console.error('Alt Text API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
