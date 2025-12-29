import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { searchContent } from '@/lib/public-actions';
import { Card, CardContent } from '@/components/ui/card';
import { Search, FileText, Package, Calendar, Download } from 'lucide-react';
import SearchBox from '@/components/SearchBox';

export const metadata: Metadata = {
    title: 'Tìm kiếm | Golden Logistics',
    description: 'Tìm kiếm bài viết, phần mềm và thông tin trên Golden Logistics',
};

interface PageProps {
    searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
    const { q: query } = await searchParams;
    const results = query ? await searchContent(query) : { posts: [], software: [] };

    return (
        <div className="bg-slate-50 dark:bg-slate-950">
            <div className="container mx-auto px-4 py-8">
                {/* Search Form */}
                <div className="max-w-2xl mx-auto mb-12">
                    <h1 className="font-heading text-3xl font-bold text-center mb-6 text-slate-900 dark:text-white">
                        <Search className="inline-block w-8 h-8 mr-2 text-golden" />
                        Tìm kiếm
                    </h1>
                    <form action="/tim-kiem" method="GET" className="relative">
                        <input
                            type="text"
                            name="q"
                            defaultValue={query || ''}
                            placeholder="Nhập từ khóa tìm kiếm..."
                            className="w-full px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-golden focus:border-transparent"
                        />
                        <button
                            type="submit"
                            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 bg-golden text-white rounded-lg hover:bg-golden-dark transition-colors"
                        >
                            Tìm
                        </button>
                    </form>
                </div>

                {/* Results */}
                {query && (
                    <div className="space-y-8">
                        <p className="text-center text-slate-600 dark:text-slate-400">
                            Tìm thấy <strong>{results.posts.length + results.software.length}</strong> kết quả cho "{query}"
                        </p>

                        {/* Software Results */}
                        {results.software.length > 0 && (
                            <section>
                                <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                                    <Package className="w-5 h-5 text-golden" />
                                    Phần mềm ({results.software.length})
                                </h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {results.software.map((sw: any) => (
                                        <Link key={sw.id} href={`/phan-mem/${sw.slug}`}>
                                            <Card className="hover:shadow-lg transition-shadow">
                                                <CardContent className="p-4 flex items-center gap-4">
                                                    {sw.icon_url ? (
                                                        <Image src={sw.icon_url} alt={sw.name} width={48} height={48} className="rounded-lg" />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-golden/10 rounded-lg flex items-center justify-center">
                                                            <Package className="w-6 h-6 text-golden" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-slate-900 dark:text-white">{sw.name}</h3>
                                                        <p className="text-sm text-slate-500 line-clamp-1">{sw.summary}</p>
                                                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                                            <Download className="w-3 h-3" />
                                                            {sw.download_count?.toLocaleString() || 0} lượt tải
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Post Results */}
                        {results.posts.length > 0 && (
                            <section>
                                <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                                    <FileText className="w-5 h-5 text-golden" />
                                    Bài viết ({results.posts.length})
                                </h2>
                                <div className="space-y-4">
                                    {results.posts.map((post: any) => (
                                        <Link key={post.id} href={`/${post.category?.slug || 'article'}/${post.slug}`}>
                                            <Card className="hover:shadow-lg transition-shadow">
                                                <CardContent className="p-4 flex gap-4">
                                                    {post.featured_image && (
                                                        <Image
                                                            src={post.featured_image}
                                                            alt={post.title}
                                                            width={120}
                                                            height={80}
                                                            className="rounded-lg object-cover"
                                                        />
                                                    )}
                                                    <div className="flex-1">
                                                        <div className="text-xs text-golden mb-1">{post.category?.name}</div>
                                                        <h3 className="font-medium text-slate-900 dark:text-white mb-1">{post.title}</h3>
                                                        <p className="text-sm text-slate-500 line-clamp-2">{post.excerpt}</p>
                                                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(post.published_at).toLocaleDateString('vi-VN')}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* No Results */}
                        {results.posts.length === 0 && results.software.length === 0 && (
                            <div className="text-center py-12">
                                <Search className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-500">Không tìm thấy kết quả phù hợp</p>
                                <p className="text-sm text-slate-400 mt-2">Thử tìm với từ khóa khác</p>
                            </div>
                        )}
                    </div>
                )}

                {/* No Query */}
                {!query && (
                    <div className="text-center py-12">
                        <Search className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500">Nhập từ khóa để tìm kiếm bài viết và phần mềm</p>
                    </div>
                )}
            </div>
        </div>
    );
}
