'use server';

import { createServerSupabaseClient } from './supabase-server';
import { revalidatePath } from 'next/cache';

export interface Testimonial {
    id: string;
    author_name: string;
    author_title: string | null;
    author_avatar: string | null;
    content: string;
    rating: number;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export async function getTestimonials(includeInactive = false) {
    const supabase = await createServerSupabaseClient();

    let query = supabase
        .from('testimonials')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

    if (!includeInactive) {
        query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching testimonials:', error);
        return { testimonials: [], error: error.message };
    }

    return { testimonials: data as Testimonial[], error: null };
}

export async function createTestimonial(data: {
    author_name: string;
    author_title?: string;
    author_avatar?: string;
    content: string;
    rating?: number;
    is_active?: boolean;
    display_order?: number;
}) {
    const supabase = await createServerSupabaseClient();

    const { data: testimonial, error } = await supabase
        .from('testimonials')
        .insert([{
            author_name: data.author_name,
            author_title: data.author_title || null,
            author_avatar: data.author_avatar || null,
            content: data.content,
            rating: data.rating || 5,
            is_active: data.is_active !== false,
            display_order: data.display_order || 0,
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating testimonial:', error);
        return { testimonial: null, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/testimonials');

    return { testimonial: testimonial as Testimonial, error: null };
}

export async function updateTestimonial(id: string, data: Partial<Testimonial>) {
    const supabase = await createServerSupabaseClient();

    const { data: testimonial, error } = await supabase
        .from('testimonials')
        .update({
            ...data,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating testimonial:', error);
        return { testimonial: null, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/testimonials');

    return { testimonial: testimonial as Testimonial, error: null };
}

export async function deleteTestimonial(id: string) {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting testimonial:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/testimonials');

    return { success: true, error: null };
}

export async function reorderTestimonials(orderedIds: string[]) {
    const supabase = await createServerSupabaseClient();

    // Update each testimonial's display_order based on its position in the array
    const updates = orderedIds.map((id, index) =>
        supabase
            .from('testimonials')
            .update({ display_order: index, updated_at: new Date().toISOString() })
            .eq('id', id)
    );

    await Promise.all(updates);

    revalidatePath('/');
    revalidatePath('/admin/testimonials');

    return { success: true };
}
