import Link from 'next/link';
import Image from 'next/image';
import { Tag, ArrowRight } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase-server';

interface RelatedPostsProps {
    currentPostId: string;
    categorySlug: string;
    tagIds?: string[];
    limit?: number;
    showTitle?: boolean;
}

interface RelatedPost {
    id: string;
    title: string;
    slug: string;
    featured_image: string | null;
    published_at: string | null;
    categories: { name: string; slug: string };
}

async function getRelatedPosts(
    currentPostId: string,
    categorySlug: string,
    tagIds: string[] = [],
    limit: number = 5
): Promise<RelatedPost[]> {
    const supabase = await createServerSupabaseClient();

    // First try to find posts with matching tags
    let relatedPosts: RelatedPost[] = [];

    if (tagIds.length > 0) {
        const { data: taggedPosts } = await supabase
            .from('posts')
            .select(`
                id,
                title,
                slug,
                featured_image,
                published_at,
                categories!inner(name, slug),
                post_tags!inner(tag_id)
            `)
            .eq('status', 'published')
            .neq('id', currentPostId)
            .in('post_tags.tag_id', tagIds)
            .order('published_at', { ascending: false })
            .limit(limit);

        if (taggedPosts) {
            relatedPosts = taggedPosts as unknown as RelatedPost[];
        }
    }

    // If not enough, fill with same category posts
    if (relatedPosts.length < limit) {
        const remaining = limit - relatedPosts.length;
        const existingIds = relatedPosts.map(p => p.id);
        existingIds.push(currentPostId);

        const { data: categoryPosts } = await supabase
            .from('posts')
            .select(`
                id,
                title,
                slug,
                featured_image,
                published_at,
                categories!inner(name, slug)
            `)
            .eq('status', 'published')
            .eq('categories.slug', categorySlug)
            .not('id', 'in', `(${existingIds.join(',')})`)
            .order('published_at', { ascending: false })
            .limit(remaining);

        if (categoryPosts) {
            relatedPosts = [...relatedPosts, ...(categoryPosts as unknown as RelatedPost[])];
        }
    }

    return relatedPosts;
}

export default async function RelatedPosts({
    currentPostId,
    categorySlug,
    tagIds = [],
    limit = 5,
    showTitle = true
}: RelatedPostsProps) {
    const posts = await getRelatedPosts(currentPostId, categorySlug, tagIds, limit);

    if (posts.length === 0) return null;

    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
            {showTitle && (
                <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-golden" />
                    Bài viết liên quan
                </h3>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map((post) => (
                    <Link
                        key={post.id}
                        href={`/${post.categories.slug}/${post.slug}`}
                        className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-golden transition-colors group"
                    >
                        {post.featured_image ? (
                            <Image
                                src={post.featured_image}
                                alt={post.title}
                                width={300}
                                height={150}
                                className="w-full h-32 object-cover"
                            />
                        ) : (
                            <div className="w-full h-32 bg-gradient-to-br from-golden/20 to-golden/5 flex items-center justify-center">
                                <Tag className="w-8 h-8 text-golden" />
                            </div>
                        )}
                        <div className="p-4">
                            <h4 className="font-medium text-slate-900 dark:text-white line-clamp-2 group-hover:text-golden transition-colors">
                                {post.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-2">
                                {post.published_at ? new Date(post.published_at).toLocaleDateString('vi-VN') : ''}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
