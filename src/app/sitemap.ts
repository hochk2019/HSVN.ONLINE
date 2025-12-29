import { MetadataRoute } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const revalidate = 3600; // Revalidate sitemap every hour

interface PostWithCategory {
    slug: string;
    updated_at: string;
    categories: { slug: string } | null;
}

interface SoftwareItem {
    slug: string;
    updated_at: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hsvn.online';
    const supabase = await createServerSupabaseClient();

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
        { url: `${baseUrl}/phan-mem`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/cong-van`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/thu-tuc-hai-quan`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/hs-code`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/lien-he`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/gioi-thieu`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    ];

    // Fetch published posts
    const { data: posts } = await supabase
        .from('posts')
        .select('slug, updated_at, categories!inner(slug)')
        .eq('status', 'published')
        .order('updated_at', { ascending: false });

    const postPages: MetadataRoute.Sitemap = (posts as PostWithCategory[] || []).map((post) => ({
        url: `${baseUrl}/${post.categories?.slug || 'article'}/${post.slug}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // Fetch software products - FIXED: was is_active, now status='active'
    const { data: software } = await supabase
        .from('software_products')
        .select('slug, updated_at')
        .eq('status', 'active')
        .order('updated_at', { ascending: false });

    const softwarePages: MetadataRoute.Sitemap = (software as SoftwareItem[] || []).map((sw) => ({
        url: `${baseUrl}/phan-mem/${sw.slug}`,
        lastModified: new Date(sw.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [...staticPages, ...postPages, ...softwarePages];
}
