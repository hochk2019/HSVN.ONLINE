'use server';

import { createServerSupabaseClient } from './supabase-server';
import type { Category, SoftwareProduct, SoftwareVersion } from '@/types/database.types';

interface PublicPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image: string | null;
    published_at: string | null;
    meta_title: string | null;
    meta_description: string | null;
    category: { id: string; name: string; slug: string } | null;
    author: { id: string; full_name: string | null } | null;
    view_count?: number;
    translations?: string | null; // JSON string or object
}

interface FullPost extends PublicPost {
    content: string | null;
    content_html: string | null;
    updated_at: string | null;
}

// Get published posts for public viewing
export async function getPublishedPosts(options?: {
    categorySlug?: string;
    limit?: number;
    offset?: number;
    search?: string;
}): Promise<{ posts: PublicPost[]; count: number; error: string | null }> {
    const supabase = await createServerSupabaseClient();

    // If categorySlug is provided, first get the category_id
    let categoryId: string | null = null;
    if (options?.categorySlug) {
        const { data: cat } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', options.categorySlug)
            .single();
        categoryId = cat?.id || null;
        if (!categoryId) {
            return { posts: [], count: 0, error: null };
        }
    }

    let query = supabase
        .from('posts')
        .select(`
            id, title, slug, excerpt, featured_image, published_at, meta_title, meta_description,
            category:categories(id, name, slug),
            author:profiles(id, full_name)
        `, { count: 'exact' })
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false });

    // Filter by category BEFORE pagination
    if (categoryId) {
        query = query.eq('category_id', categoryId);
    }
    if (options?.search) {
        query = query.ilike('title', `%${options.search}%`);
    }

    // Apply pagination with range (not limit)
    const limit = options?.limit || 12;
    const offset = options?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching published posts:', error);
        return { posts: [], count: 0, error: error.message };
    }

    return { posts: (data as unknown as PublicPost[]) || [], count: count || 0, error: null };
}


// Get latest posts grouped by category for homepage
export async function getLatestPostsByCategory(limitPerCategory: number = 3): Promise<{
    categories: Array<{
        categoryName: string;
        categorySlug: string;
        posts: PublicPost[];
    }>;
    error: string | null;
}> {
    const supabase = await createServerSupabaseClient();

    // First get all categories
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');

    if (catError) {
        return { categories: [], error: catError.message };
    }

    // Get latest posts for each category
    const result = [];
    for (const cat of categories || []) {
        const { data: posts } = await supabase
            .from('posts')
            .select(`
                id, title, slug, excerpt, featured_image, published_at, meta_title, meta_description,
                category:categories(id, name, slug),
                author:profiles(id, full_name)
            `)
            .eq('status', 'published')
            .eq('category_id', cat.id)
            .lte('published_at', new Date().toISOString())
            .order('published_at', { ascending: false })
            .limit(limitPerCategory);

        if (posts && posts.length > 0) {
            result.push({
                categoryName: cat.name,
                categorySlug: cat.slug,
                posts: posts as unknown as PublicPost[],
            });
        }
    }

    return { categories: result, error: null };
}

// Get single published post by slug
export async function getPublishedPost(categorySlug: string, postSlug: string): Promise<{ post: FullPost | null; error: string | null }> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            category:categories(id, name, slug),
            author:profiles(id, full_name, avatar_url)
        `)
        .eq('slug', postSlug)
        .eq('status', 'published')
        .single();

    if (error || !data) {
        return { post: null, error: error?.message || 'Not found' };
    }

    const post = data as unknown as FullPost;

    // Verify category matches
    if (post.category?.slug !== categorySlug) {
        return { post: null, error: 'Category mismatch' };
    }

    return { post, error: null };
}

// Get all categories with post count
export async function getPublicCategories(): Promise<{ categories: Category[]; error: string | null }> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('categories')
        .select(`
            *,
            posts:posts(count)
        `)
        .order('sort_order');

    if (error) {
        return { categories: [], error: error.message };
    }

    return { categories: (data as unknown as Category[]) || [], error: null };
}

// Get category by slug
export async function getCategoryBySlug(slug: string): Promise<{ category: Category | null; error: string | null }> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        return { category: null, error: error.message };
    }

    return { category: data, error: null };
}

// Get active software products for public viewing
export async function getPublicSoftware(): Promise<{ products: SoftwareProduct[]; error: string | null }> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('software_products')
        .select('*')
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        return { products: [], error: error.message };
    }

    return { products: data || [], error: null };
}

// Get software by slug with versions
export async function getPublicSoftwareBySlug(slug: string): Promise<{ software: SoftwareProduct | null; versions: SoftwareVersion[]; error: string | null }> {
    const supabase = await createServerSupabaseClient();

    const { data: software, error } = await supabase
        .from('software_products')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

    if (error || !software) {
        return { software: null, versions: [], error: error?.message || 'Not found' };
    }

    // Get versions
    const { data: versions } = await supabase
        .from('software_versions')
        .select('*')
        .eq('software_id', software.id)
        .eq('status', 'active')
        .order('released_at', { ascending: false });

    return { software, versions: versions || [], error: null };
}

// Log download and increment counter
export async function logDownload(versionId: string, softwareId: string): Promise<{ success: boolean; error?: unknown }> {
    const supabase = await createServerSupabaseClient();

    try {
        // Log the download
        await supabase.from('download_logs').insert({
            version_id: versionId,
            downloaded_at: new Date().toISOString(),
        });

        // Direct increment (no RPC needed)
        const { data: software } = await supabase
            .from('software_products')
            .select('download_count')
            .eq('id', softwareId)
            .single();

        if (software) {
            await supabase
                .from('software_products')
                .update({ download_count: (software.download_count || 0) + 1 })
                .eq('id', softwareId);
        }

        return { success: true };
    } catch (error) {
        console.error('Error logging download:', error);
        return { success: false, error };
    }
}

// Search posts and software with filters
export async function searchContent(
    query: string,
    options?: {
        type?: 'all' | 'post' | 'software';
        categoryId?: string;
        limit?: number;
    }
): Promise<{ posts: PublicPost[]; software: SoftwareProduct[]; error: string | null }> {
    const supabase = await createServerSupabaseClient();

    if (!query || query.trim().length < 2) {
        return { posts: [], software: [], error: 'Query too short' };
    }

    const searchTerm = `%${query.trim()}%`;
    const type = options?.type || 'all';
    const limit = options?.limit || 20;

    let posts: PublicPost[] = [];
    let software: SoftwareProduct[] = [];

    // Search posts if type is 'all' or 'post'
    if (type === 'all' || type === 'post') {
        let postQuery = supabase
            .from('posts')
            .select(`
                id, title, slug, excerpt, featured_image, published_at,
                category:categories(id, name, slug)
            `)
            .eq('status', 'published')
            .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm}`)
            .order('published_at', { ascending: false })
            .limit(limit);

        // Filter by category if provided
        if (options?.categoryId) {
            postQuery = postQuery.eq('category_id', options.categoryId);
        }

        const { data } = await postQuery;
        posts = (data as unknown as PublicPost[]) || [];
    }

    // Search software if type is 'all' or 'software'
    if (type === 'all' || type === 'software') {
        const { data } = await supabase
            .from('software_products')
            .select('id, name, slug, summary, icon_url, download_count')
            .eq('status', 'active')
            .or(`name.ilike.${searchTerm},summary.ilike.${searchTerm}`)
            .order('download_count', { ascending: false })
            .limit(10);

        software = (data as unknown as SoftwareProduct[]) || [];
    }

    return { posts, software, error: null };
}


