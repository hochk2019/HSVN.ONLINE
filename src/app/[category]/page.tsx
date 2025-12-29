import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getPublishedPosts } from '@/lib/public-actions';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User, ArrowRight } from 'lucide-react';
import SharedFooter from '@/components/layout/SharedFooter';
import SearchBox from '@/components/SearchBox';

export const revalidate = 60; // ISR: revalidate every 60 seconds

interface PageProps {
    params: Promise<{ category: string }>;
    searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { category: categorySlug } = await params;
    const { category } = await getCategoryBySlug(categorySlug);

    if (!category) {
        return { title: 'Không tìm thấy' };
    }

    return {
        title: category.name,
        description: category.description || `Danh sách bài viết trong chuyên mục ${category.name}`,
        openGraph: {
            title: category.name,
            description: category.description || `Danh sách bài viết trong chuyên mục ${category.name}`,
        },
    };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
    const { category: categorySlug } = await params;
    const { page } = await searchParams;
    const currentPage = parseInt(page || '1');
    const limit = 12;
    const offset = (currentPage - 1) * limit;

    const [{ category }, { posts, count }] = await Promise.all([
        getCategoryBySlug(categorySlug),
        getPublishedPosts({ categorySlug, limit, offset }),
    ]);

    if (!category) {
        notFound();
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return (
        <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
            <div className="container mx-auto px-4 py-8">
                {/* Category Header */}
                <div className="mb-8">
                    <nav className="text-sm text-slate-500 mb-4">
                        <Link href="/" className="hover:text-golden">Trang chủ</Link>
                        <span className="mx-2">/</span>
                        <span className="text-slate-900 dark:text-slate-100">{category.name}</span>
                    </nav>
                    <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2 text-slate-900 dark:text-white">{category.name}</h1>
                    {category.description && (
                        <p className="text-slate-600 dark:text-slate-400">{category.description}</p>
                    )}
                </div>

                {/* Posts Grid */}
                {posts.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500">Chưa có bài viết trong chuyên mục này.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post: any) => (
                            <Link key={post.id} href={`/${categorySlug}/${post.slug}`}>
                                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                                    {post.featured_image && (
                                        <div className="aspect-video relative overflow-hidden rounded-t-lg">
                                            <Image
                                                src={post.featured_image}
                                                alt={post.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    )}
                                    <CardContent className="p-4">
                                        <h2 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-golden transition-colors">
                                            {post.title}
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(post.published_at).toLocaleDateString('vi-VN')}
                                                </span>
                                                {post.author?.full_name && (
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {post.author.full_name}
                                                    </span>
                                                )}
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-golden opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <Link
                                key={pageNum}
                                href={`/${categorySlug}?page=${pageNum}`}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pageNum === currentPage
                                    ? 'bg-golden text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-golden hover:text-white'
                                    }`}
                            >
                                {pageNum}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
