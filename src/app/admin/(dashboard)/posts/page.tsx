import Link from 'next/link';
import { getPosts, getCategories, deletePost } from '@/lib/post-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Quản lý bài viết',
};

export default async function PostsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; category?: string; search?: string; page?: string }>;
}) {
    const params = await searchParams;
    const currentPage = parseInt(params.page || '1');
    const limit = 20;
    const offset = (currentPage - 1) * limit;

    const [{ posts, count }, { categories }] = await Promise.all([
        getPosts({
            status: params.status,
            categoryId: params.category,
            search: params.search,
            limit,
            offset,
        }),
        getCategories(),
    ]);

    const totalPages = Math.ceil((count || 0) / limit);

    const statusColors: Record<string, string> = {
        draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-bold">Bài viết</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Quản lý tất cả bài viết trên website
                    </p>
                </div>
                <Link href="/admin/posts/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Bài viết mới
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <form className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Tìm kiếm bài viết..."
                                    defaultValue={params.search}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                                />
                            </div>
                        </div>
                        <select
                            name="status"
                            defaultValue={params.status}
                            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="draft">Nháp</option>
                            <option value="published">Đã xuất bản</option>
                            <option value="scheduled">Lên lịch</option>
                        </select>
                        <select
                            name="category"
                            defaultValue={params.category}
                            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                        >
                            <option value="">Tất cả chuyên mục</option>
                            {categories.map((cat: { id: string; name: string }) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <Button type="submit" variant="secondary">
                            <Filter className="w-4 h-4 mr-2" />
                            Lọc
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Posts Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tiêu đề
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Chuyên mục
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày tạo
                                    </th>
                                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {posts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            Không có bài viết nào
                                        </td>
                                    </tr>
                                ) : (
                                    posts.map((post: {
                                        id: string;
                                        title: string | null;
                                        slug: string | null;
                                        status: string | null;
                                        created_at: string | null;
                                        category?: { name: string; slug: string } | null;
                                    }) => (
                                        <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                                        {post.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        /{post.category?.slug || 'uncategorized'}/{post.slug}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {post.category?.name || '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[post.status || 'draft']}`}>
                                                    {post.status === 'draft' && 'Nháp'}
                                                    {post.status === 'published' && 'Đã xuất bản'}
                                                    {post.status === 'scheduled' && 'Lên lịch'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : ''}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/${post.category?.slug || 'bai-viet'}/${post.slug}`}
                                                        target="_blank"
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                        title="Xem"
                                                    >
                                                        <Eye className="w-4 h-4 text-gray-500" />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/posts/${post.id}`}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                        title="Sửa"
                                                    >
                                                        <Edit className="w-4 h-4 text-gray-500" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Link
                            key={page}
                            href={`/admin/posts?page=${page}${params.status ? `&status=${params.status}` : ''}${params.category ? `&category=${params.category}` : ''}${params.search ? `&search=${params.search}` : ''}`}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${page === currentPage
                                ? 'bg-golden text-white'
                                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            {page}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
