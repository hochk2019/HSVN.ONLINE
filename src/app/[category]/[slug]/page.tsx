import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPublishedPost, getPublishedPosts } from '@/lib/public-actions';
import { getSettings } from '@/lib/settings-actions';
import { ArrowLeft, Tag } from 'lucide-react';
import RecentPosts from '@/components/layout/RecentPosts';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import SmartCTA, { SmartCTACompact } from '@/components/SmartCTA';
import RecommendedPosts from '@/components/RecommendedPosts';
import TrackPostView from '@/components/tracking/TrackPostView';
import ArticleViewer from '@/components/article/ArticleViewer';

export const revalidate = 60; // ISR: revalidate every 60 seconds

interface PageProps {
    params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { category, slug } = await params;
    const result = await getPublishedPost(category, slug);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hsvn.online';

    const post = result.post as {
        title: string;
        meta_title: string | null;
        meta_description: string | null;
        excerpt: string | null;
        published_at: string;
        featured_image: string | null;
        author?: { full_name: string | null } | null;
    } | null;

    if (!post) {
        return { title: 'Không tìm thấy bài viết' };
    }

    return {
        title: post.meta_title || post.title,
        description: post.meta_description || post.excerpt,
        alternates: {
            canonical: `${baseUrl}/${category}/${slug}`,
        },
        openGraph: {
            title: post.meta_title || post.title,
            description: post.meta_description || post.excerpt || undefined,
            type: 'article',
            publishedTime: post.published_at,
            authors: post.author?.full_name ? [post.author.full_name] : undefined,
            images: post.featured_image ? [post.featured_image] : undefined,
            url: `${baseUrl}/${category}/${slug}`,
        },
        twitter: {
            card: 'summary_large_image',
            title: post.meta_title || post.title,
            description: post.meta_description || post.excerpt || undefined,
        },
    };
}

export default async function ArticlePage({ params }: PageProps) {
    const { category: categorySlug, slug } = await params;
    const { post, error } = await getPublishedPost(categorySlug, slug);
    const { settings } = await getSettings();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hsvn.online';

    if (error || !post) {
        notFound();
    }

    // Get related posts from same category
    const { posts: relatedPosts } = await getPublishedPosts({
        categorySlug,
        limit: 6,
    });
    const filteredRelated = relatedPosts.filter((p: any) => p.id !== post.id).slice(0, 5);

    // JSON-LD Article Schema
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt || post.meta_description,
        image: post.featured_image || undefined,
        datePublished: post.published_at,
        dateModified: post.updated_at || post.published_at,
        author: {
            '@type': 'Person',
            name: post.author?.full_name || 'Golden Logistics',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Golden Logistics',
            logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}/logo.png`,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${baseUrl}/${categorySlug}/${slug}`,
        },
    };

    return (
        <>
            {/* JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />

            {/* Tracking */}
            <TrackPostView postId={post.id} slug={slug} />

            {/* BreadcrumbList JSON-LD */}
            <BreadcrumbJsonLd
                baseUrl={baseUrl}
                items={[
                    { name: 'Trang chủ', url: '/' },
                    { name: post.category?.name || categorySlug, url: `/${categorySlug}` },
                    { name: post.title, url: `/${categorySlug}/${slug}` },
                ]}
            />

            <div className="bg-slate-50 dark:bg-slate-950">
                <div className="container mx-auto px-4 py-8">
                    {/* Breadcrumb */}
                    <nav className="text-sm text-slate-500 mb-6">
                        <Link href="/" className="hover:text-golden">Trang chủ</Link>
                        <span className="mx-2">/</span>
                        <Link href={`/${categorySlug}`} className="hover:text-golden">{post.category?.name}</Link>
                        <span className="mx-2">/</span>
                        <span className="text-slate-700 dark:text-slate-300 line-clamp-1">{post.title}</span>
                    </nav>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <ArticleViewer
                                post={post}
                                siteUrl={baseUrl}
                                enableComments={settings.enable_facebook_comments === 'true'}
                            />

                            {/* Related Posts */}
                            {filteredRelated.length > 0 && (
                                <section className="mt-8 bg-slate-100 dark:bg-slate-800/50 rounded-xl p-6">
                                    <h2 className="font-heading text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                                        <Tag className="w-5 h-5 text-golden" />
                                        Bài viết liên quan
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredRelated.map((relatedPost: any) => (
                                            <Link
                                                key={relatedPost.id}
                                                href={`/${categorySlug}/${relatedPost.slug}`}
                                                className="group"
                                            >
                                                <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-golden border border-transparent">
                                                    {relatedPost.featured_image ? (
                                                        <div className="aspect-video relative">
                                                            <Image
                                                                src={relatedPost.featured_image}
                                                                alt={relatedPost.title}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="aspect-video bg-gradient-to-br from-golden/20 to-golden/5 flex items-center justify-center">
                                                            <Tag className="w-8 h-8 text-golden" />
                                                        </div>
                                                    )}
                                                    <div className="p-4">
                                                        <h3 className="font-medium line-clamp-2 text-slate-900 dark:text-white group-hover:text-golden transition-colors">
                                                            {relatedPost.title}
                                                        </h3>
                                                        <p className="text-xs text-slate-500 mt-2">
                                                            {new Date(relatedPost.published_at).toLocaleDateString('vi-VN')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Back Link */}
                            <div className="mt-8">
                                <Link
                                    href={`/${categorySlug}`}
                                    className="inline-flex items-center gap-2 text-golden hover:underline font-medium"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Quay lại {post.category?.name}
                                </Link>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                {/* Smart CTA */}
                                <SmartCTACompact pageType="article" category={post.category?.name} />

                                {/* AI Recommended Posts */}
                                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm">
                                    <RecommendedPosts limit={5} title="Đề xuất cho bạn" />
                                </div>

                                {/* Recent Posts */}
                                <RecentPosts limit={5} excludeIds={[post.id]} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
