'use server';

import { createServerSupabaseClient as createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

// Types
export interface FeedSource {
    id: string;
    name: string;
    url: string;
    category_id: string | null;
    fetch_interval: number;
    is_active: boolean;
    last_fetched_at: string | null;
    articles_count: number;
    created_at: string;
}

export interface ImportedArticle {
    id: string;
    source_id: string;
    original_url: string;
    original_title: string;
    original_content: string | null;
    ai_rewritten_title: string | null;
    ai_rewritten_content: string | null;
    featured_image: string | null;
    source_name: string | null;
    status: 'pending' | 'approved' | 'rejected';
    post_id: string | null;
    fetched_at: string;
    created_at: string;
    feed_sources?: FeedSource;
}

// ==================== FEED SOURCES ====================

export async function getFeedSources() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('feed_sources')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching feed sources:', error);
        return { sources: [], error: error.message };
    }

    return { sources: data || [], error: null };
}

export async function getFeedSourceById(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('feed_sources')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        return { source: null, error: error.message };
    }

    return { source: data, error: null };
}

export async function createFeedSource(formData: FormData) {
    const supabase = await createClient();

    const name = formData.get('name') as string;
    const url = formData.get('url') as string;
    const category_id = formData.get('category_id') as string || null;
    const fetch_interval = parseInt(formData.get('fetch_interval') as string) || 60;
    const is_active = formData.get('is_active') === 'true';

    const { data, error } = await supabase
        .from('feed_sources')
        .insert({
            name,
            url,
            category_id: category_id || null,
            fetch_interval,
            is_active,
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/aggregator');
    revalidatePath('/admin/aggregator/sources');
    return { success: true, source: data };
}

export async function updateFeedSource(id: string, formData: FormData) {
    const supabase = await createClient();

    const name = formData.get('name') as string;
    const url = formData.get('url') as string;
    const category_id = formData.get('category_id') as string || null;
    const fetch_interval = parseInt(formData.get('fetch_interval') as string) || 60;
    const is_active = formData.get('is_active') === 'true';

    const { error } = await supabase
        .from('feed_sources')
        .update({
            name,
            url,
            category_id: category_id || null,
            fetch_interval,
            is_active,
        })
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/aggregator');
    revalidatePath('/admin/aggregator/sources');
    return { success: true };
}

export async function deleteFeedSource(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('feed_sources')
        .delete()
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/aggregator');
    revalidatePath('/admin/aggregator/sources');
    return { success: true };
}

export async function toggleFeedSource(id: string, is_active: boolean) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('feed_sources')
        .update({ is_active })
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/aggregator/sources');
    return { success: true };
}

// ==================== IMPORTED ARTICLES ====================

export async function getImportedArticles(status?: string) {
    const supabase = await createClient();

    let query = supabase
        .from('imported_articles')
        .select('*, feed_sources(name, url)')
        .order('fetched_at', { ascending: false });

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching imported articles:', error);
        return { articles: [], error: error.message };
    }

    return { articles: data || [], error: null };
}

export async function getImportedArticleById(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('imported_articles')
        .select('*, feed_sources(name, url)')
        .eq('id', id)
        .single();

    if (error) {
        return { article: null, error: error.message };
    }

    return { article: data, error: null };
}

export async function approveArticle(id: string) {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Unauthorized' };
    }

    // Get the article first
    const { data: article, error: fetchError } = await supabase
        .from('imported_articles')
        .select('*, feed_sources(name)')
        .eq('id', id)
        .single();

    if (fetchError || !article) {
        return { success: false, error: 'Article not found' };
    }

    // Create a draft post with author
    const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
            title: article.ai_rewritten_title || article.original_title,
            slug: generateSlug(article.ai_rewritten_title || article.original_title),
            content_html: article.ai_rewritten_content || article.original_content,
            excerpt: article.source_name || `Nguồn: ${article.feed_sources?.name || 'Unknown'}`,
            featured_image: article.featured_image,
            status: 'draft',
            category_id: null,
            author_id: user.id,
        })
        .select()
        .single();

    if (postError) {
        return { success: false, error: postError.message };
    }

    // Update article status
    await supabase
        .from('imported_articles')
        .update({
            status: 'approved',
            post_id: post.id,
        })
        .eq('id', id);

    revalidatePath('/admin/aggregator');
    revalidatePath('/admin/posts');
    return { success: true, postId: post.id };
}

export async function rejectArticle(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('imported_articles')
        .update({ status: 'rejected' })
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/aggregator');
    return { success: true };
}

export async function deleteImportedArticle(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('imported_articles')
        .delete()
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/aggregator');
    return { success: true };
}

// Helper function to generate slug
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 100);
}
