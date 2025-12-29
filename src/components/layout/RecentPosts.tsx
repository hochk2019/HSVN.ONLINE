import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase-server';

interface RecentPostsProps {
    limit?: number;
    excludeIds?: string[];
}

interface RecentPost {
    id: string;
    title: string;
    slug: string;
    featured_image: string | null;
    published_at: string | null;
    categories: { name: string; slug: string };
}

async function getRecentPosts(limit: number = 5, excludeIds: string[] = []): Promise<RecentPost[]> {
    const supabase = await createServerSupabaseClient();

    let query = supabase
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
        .order('published_at', { ascending: false })
        .limit(limit);

    if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    const { data } = await query;
    return (data as unknown as RecentPost[]) || [];
}

export default async function RecentPosts({ limit = 5, excludeIds = [] }: RecentPostsProps) {
    const posts = await getRecentPosts(limit, excludeIds);

    if (posts.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-slate-900 px-4 py-3">
                <h3 className="font-heading font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-golden" />
                    Bài viết mới
                </h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {posts.map((post) => (
                    <Link
                        key={post.id}
                        href={`/${post.categories.slug}/${post.slug}`}
                        className="flex gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                    >
                        {post.featured_image ? (
                            <Image
                                src={post.featured_image}
                                alt={post.title}
                                width={60}
                                height={60}
                                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                            />
                        ) : (
                            <div className="w-14 h-14 bg-golden/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Clock className="w-5 h-5 text-golden" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2 group-hover:text-golden transition-colors">
                                {post.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">
                                {post.published_at ? new Date(post.published_at).toLocaleDateString('vi-VN') : ''}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
            <Link
                href="/cong-van"
                className="block px-4 py-3 text-center text-sm font-medium text-golden hover:bg-golden/5 border-t border-slate-100 dark:border-slate-700"
            >
                Xem tất cả <ArrowRight className="w-4 h-4 inline ml-1" />
            </Link>
        </div>
    );
}
