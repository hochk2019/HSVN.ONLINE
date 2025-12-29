'use server';

import { createServerSupabaseClient } from './supabase-server';
import { revalidatePath } from 'next/cache';
import { logAuditEvent } from './audit-actions';

export async function getPosts(options?: {
    status?: string;
    categoryId?: string;
    limit?: number;
    offset?: number;
    search?: string;
}) {
    const supabase = await createServerSupabaseClient();

    let query = supabase
        .from('posts')
        .select(`
            *,
            category:categories(id, name, slug),
            author:profiles(id, full_name, email)
        `)
        .order('created_at', { ascending: false });

    if (options?.status) {
        query = query.eq('status', options.status);
    }
    if (options?.categoryId) {
        query = query.eq('category_id', options.categoryId);
    }
    if (options?.search) {
        query = query.ilike('title', `%${options.search}%`);
    }
    if (options?.limit) {
        query = query.limit(options.limit);
    }
    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching posts:', error);
        return { posts: [], count: 0, error: error.message };
    }

    return { posts: data || [], count: count || 0, error: null };
}

export async function getPostBySlug(slug: string) {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            category:categories(id, name, slug),
            author:profiles(id, full_name, email)
        `)
        .eq('slug', slug)
        .single();

    if (error) {
        return { post: null, error: error.message };
    }

    return { post: data, error: null };
}

// Post type for return values
interface PostData {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: object | null;
    content_html: string | null;
    category_id: string | null;
    status: string;
    meta_title: string | null;
    meta_description: string | null;
    featured_image: string | null;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    category?: { id: string; name: string; slug: string } | null;
    author?: { id: string; full_name: string | null; email: string | null } | null;
    translations?: string | null;
}

export async function getPostById(id: string): Promise<{ post: PostData | null; error: string | null }> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            category:categories(id, name, slug),
            author:profiles(id, full_name, email)
        `)
        .eq('id', id)
        .single();

    if (error) {
        return { post: null, error: error.message };
    }

    return { post: data as PostData, error: null };
}

export async function createPost(formData: FormData) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const excerpt = formData.get('excerpt') as string;
    const contentHtml = formData.get('content_html') as string;
    const contentJson = formData.get('content') as string;
    const categoryId = formData.get('category_id') as string;
    const status = formData.get('status') as string || 'draft';
    const scheduledAt = formData.get('scheduled_at') as string;
    const metaTitle = formData.get('meta_title') as string;
    const metaDescription = formData.get('meta_description') as string;
    const featuredImage = formData.get('featured_image') as string;
    const tagIds = JSON.parse(formData.get('tag_ids') as string || '[]') as string[];

    const { data, error } = await supabase
        .from('posts')
        .insert({
            title,
            slug,
            excerpt,
            content_html: contentHtml,
            content: contentJson ? JSON.parse(contentJson) : null,
            category_id: categoryId || null,
            status,
            scheduled_at: status === 'scheduled' ? scheduledAt : null,
            author_id: user.id,
            meta_title: metaTitle || title,
            meta_description: metaDescription || excerpt,
            featured_image: featuredImage || null,
            published_at: status === 'published' ? new Date().toISOString() : null,
            translations: formData.get('translations') ? JSON.parse(formData.get('translations') as string) : {}, // Handle JSON
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating post:', error);
        return { error: error.message };
    }

    // Save tags
    if (tagIds.length > 0) {
        await supabase.from('post_tags').insert(
            tagIds.map(tagId => ({ post_id: data.id, tag_id: tagId }))
        );
    }

    // Audit log
    await logAuditEvent('create', 'post', data.id, { title, status });

    revalidatePath('/admin/posts');
    return { post: data, error: null };
}

export async function updatePost(id: string, formData: FormData) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const excerpt = formData.get('excerpt') as string;
    const contentHtml = formData.get('content_html') as string;
    const contentJson = formData.get('content') as string;
    const categoryId = formData.get('category_id') as string;
    const status = formData.get('status') as string;
    const scheduledAt = formData.get('scheduled_at') as string;
    const metaTitle = formData.get('meta_title') as string;
    const metaDescription = formData.get('meta_description') as string;
    const featuredImage = formData.get('featured_image') as string;

    // Safe JSON parse helper - handles both string and object inputs
    const safeJsonParse = (value: unknown, defaultValue: unknown = null): unknown => {
        if (value === null || value === undefined) return defaultValue;
        if (typeof value === 'object') return value; // Already parsed
        if (typeof value === 'string' && value.trim()) {
            try {
                return JSON.parse(value);
            } catch {
                return defaultValue;
            }
        }
        return defaultValue;
    };

    const tagIds = safeJsonParse(formData.get('tag_ids'), []) as string[];

    // Get current post to check if status changed to published
    const { data: currentPost } = await supabase
        .from('posts')
        .select('status, published_at')
        .eq('id', id)
        .single();

    const updates: Record<string, unknown> = {
        title,
        slug,
        excerpt,
        content_html: contentHtml,
        content: safeJsonParse(contentJson, null),
        category_id: categoryId || null,
        status,
        scheduled_at: status === 'scheduled' ? scheduledAt : null,
        meta_title: metaTitle || title,
        meta_description: metaDescription || excerpt,
        featured_image: featuredImage || null,
        translations: safeJsonParse(formData.get('translations'), {}),
    };

    // Set published_at only when first published
    if (status === 'published' && currentPost?.status !== 'published') {
        updates.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating post:', error);
        return { error: error.message };
    }

    // Update tags: delete existing, then insert new
    await supabase.from('post_tags').delete().eq('post_id', id);
    if (tagIds.length > 0) {
        await supabase.from('post_tags').insert(
            tagIds.map(tagId => ({ post_id: id, tag_id: tagId }))
        );
    }

    revalidatePath('/admin/posts');
    revalidatePath(`/admin/posts/${id}`);

    // Audit log
    await logAuditEvent('update', 'post', id, { title, status });

    return { post: data, error: null };
}

export async function deletePost(id: string) {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting post:', error);
        return { error: error.message };
    }

    // Audit log
    await logAuditEvent('delete', 'post', id);

    revalidatePath('/admin/posts');
    return { error: null };
}

// Bulk update post status
export async function bulkUpdatePostStatus(ids: string[], status: 'draft' | 'published' | 'archived') {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized', count: 0 };
    }

    const updates: Record<string, unknown> = { status };
    if (status === 'published') {
        updates.published_at = new Date().toISOString();
    }

    const { error, count } = await supabase
        .from('posts')
        .update(updates)
        .in('id', ids);

    if (error) {
        console.error('Error bulk updating posts:', error);
        return { error: error.message, count: 0 };
    }

    // Audit log
    await logAuditEvent('bulk_update', 'post', null, { ids, status });

    revalidatePath('/admin/posts');
    return { error: null, count: count || ids.length };
}

// Bulk delete posts
export async function bulkDeletePosts(ids: string[]) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized', count: 0 };
    }

    const { error, count } = await supabase
        .from('posts')
        .delete()
        .in('id', ids);

    if (error) {
        console.error('Error bulk deleting posts:', error);
        return { error: error.message, count: 0 };
    }

    // Audit log
    await logAuditEvent('bulk_delete', 'post', null, { ids });

    revalidatePath('/admin/posts');
    return { error: null, count: count || ids.length };
}

export async function getCategories() {
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

export async function getTags() {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('tags')
        .select('id, name, slug')
        .order('name');

    if (error) {
        return { tags: [], error: error.message };
    }

    return { tags: data || [], error: null };
}

export async function getMediaFiles() {
    const supabase = await createServerSupabaseClient();

    const { data: files, error } = await supabase.storage
        .from('media')
        .list('uploads', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

    console.log('[getMediaFiles] Storage list result:', { files, error });

    if (error) {
        console.error('[getMediaFiles] Error:', error);
        return { mediaFiles: [], error: error.message };
    }

    // Filter out placeholder files and non-image files
    const imageFiles = (files || []).filter((file) => {
        const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);
        const isNotPlaceholder = !file.name.startsWith('.emptyFolderPlaceholder');
        return isImage && isNotPlaceholder;
    });

    // Add public URLs to files
    const filesWithUrls = imageFiles.map((file) => ({
        ...file,
        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/uploads/${file.name}`,
    }));

    console.log('[getMediaFiles] Processed files:', filesWithUrls.length);

    return { mediaFiles: filesWithUrls, error: null };
}

export async function getAllPublishedPostIds() {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('posts')
        .select('id, title')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

    if (error) {
        console.error('Error fetching published post IDs:', error);
        return { postIds: [], error: error.message };
    }

    return { postIds: data || [], error: null };
}
