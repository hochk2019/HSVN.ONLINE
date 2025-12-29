'use server';

import { createServerSupabaseClient } from './supabase-server';
import { revalidatePath } from 'next/cache';
import type { Category, Tag } from '@/types/database.types';

interface ActionResult<T = void> {
    error: string | null;
    category?: T extends 'category' ? Category : never;
    tag?: T extends 'tag' ? Tag : never;
}

export async function getAdminCategories(): Promise<{ categories: Category[]; error: string | null }> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order');

    if (error) {
        return { categories: [], error: error.message };
    }

    return { categories: data || [], error: null };
}

export async function getCategoryById(id: string): Promise<{ category: Category | null; postCount: number; error: string | null }> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        return { category: null, postCount: 0, error: error.message };
    }

    // Get post count for this category
    const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id);

    return { category: data, postCount: count || 0, error: null };
}

export async function createCategory(formData: FormData): Promise<{ category?: Category; error: string | null }> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const sortOrder = parseInt(formData.get('sort_order') as string) || 0;
    const parentId = formData.get('parent_id') as string || null;

    const { data, error } = await supabase
        .from('categories')
        .insert({
            name,
            slug,
            description,
            sort_order: sortOrder,
            parent_id: parentId || null
        })
        .select()
        .single();

    if (error) return { error: error.message };

    revalidatePath('/admin/categories');
    return { category: data, error: null };
}

export async function updateCategory(id: string, formData: FormData): Promise<{ error: string | null }> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const sortOrder = parseInt(formData.get('sort_order') as string) || 0;
    const parentId = formData.get('parent_id') as string || null;

    const { error } = await supabase
        .from('categories')
        .update({
            name,
            slug,
            description,
            sort_order: sortOrder,
            parent_id: parentId || null
        })
        .eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/admin/categories');
    return { error: null };
}

export async function deleteCategory(id: string): Promise<{ error: string | null }> {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/admin/categories');
    return { error: null };
}

// Tags
export async function getAdminTags(): Promise<{ tags: Tag[]; error: string | null }> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');

    if (error) {
        return { tags: [], error: error.message };
    }

    return { tags: data || [], error: null };
}

export async function createTag(formData: FormData): Promise<{ tag?: Tag; error: string | null }> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;

    const { data, error } = await supabase
        .from('tags')
        .insert({ name, slug })
        .select()
        .single();

    if (error) return { error: error.message };

    revalidatePath('/admin/tags');
    return { tag: data, error: null };
}

export async function getTagById(id: string): Promise<{ tag: Tag | null; postCount: number; error: string | null }> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        return { tag: null, postCount: 0, error: error.message };
    }

    // Get post count for this tag
    const { count } = await supabase
        .from('post_tags')
        .select('*', { count: 'exact', head: true })
        .eq('tag_id', id);

    return { tag: data, postCount: count || 0, error: null };
}

export async function updateTag(id: string, formData: FormData): Promise<{ error: string | null }> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;

    const { error } = await supabase
        .from('tags')
        .update({ name, slug })
        .eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/admin/tags');
    return { error: null };
}

export async function deleteTag(id: string): Promise<{ error: string | null }> {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/admin/tags');
    return { error: null };
}

