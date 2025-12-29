import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// POST /api/admin/tags - Create a new tag
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();

        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, slug } = await request.json();

        if (!name || !slug) {
            return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
        }

        // Check if tag already exists
        const { data: existing } = await supabase
            .from('tags')
            .select('id')
            .eq('slug', slug)
            .single();

        if (existing) {
            return NextResponse.json({ error: 'Tag với slug này đã tồn tại' }, { status: 409 });
        }

        // Create new tag
        const { data: newTag, error } = await supabase
            .from('tags')
            .insert({ name, slug })
            .select()
            .single();

        if (error) {
            console.error('Error creating tag:', error);
            return NextResponse.json({ error: 'Không thể tạo tag' }, { status: 500 });
        }

        return NextResponse.json(newTag);
    } catch (err) {
        console.error('Tag creation error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET /api/admin/tags - Get all tags
export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();

        const { data: tags, error } = await supabase
            .from('tags')
            .select('*')
            .order('name');

        if (error) {
            return NextResponse.json({ error: 'Không thể lấy danh sách tag' }, { status: 500 });
        }

        return NextResponse.json(tags);
    } catch (err) {
        console.error('Tags fetch error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
