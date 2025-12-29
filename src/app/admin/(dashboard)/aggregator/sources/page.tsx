import { getFeedSources, deleteFeedSource, toggleFeedSource } from '@/lib/aggregator-actions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Rss, ToggleLeft, ToggleRight, Trash2, Edit, ExternalLink } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function SourcesPage() {
    const { sources, error } = await getFeedSources();

    async function handleDelete(formData: FormData) {
        'use server';
        const id = formData.get('id') as string;
        await deleteFeedSource(id);
        revalidatePath('/admin/aggregator/sources');
    }

    async function handleToggle(formData: FormData) {
        'use server';
        const id = formData.get('id') as string;
        const is_active = formData.get('is_active') === 'true';
        await toggleFeedSource(id, !is_active);
        revalidatePath('/admin/aggregator/sources');
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nguồn tin RSS</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Quản lý các nguồn RSS để lấy bài viết tự động
                    </p>
                </div>
                <Link href="/admin/aggregator/sources/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm nguồn
                    </Button>
                </Link>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* Sources List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {sources.length > 0 ? (
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    Nguồn
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    Chuyên mục
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    Bài lấy
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {sources.map((source: any) => (
                                <tr key={source.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                                <Rss className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">{source.name}</div>
                                                <a
                                                    href={source.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-golden flex items-center gap-1"
                                                >
                                                    {new URL(source.url).hostname}
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                                        {source.categories?.name || (
                                            <span className="text-gray-400">Chưa chọn</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                                        {source.articles_count}
                                    </td>
                                    <td className="px-6 py-4">
                                        <form action={handleToggle}>
                                            <input type="hidden" name="id" value={source.id} />
                                            <input type="hidden" name="is_active" value={source.is_active.toString()} />
                                            <button
                                                type="submit"
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${source.is_active
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                                    }`}
                                            >
                                                {source.is_active ? (
                                                    <>
                                                        <ToggleRight className="w-3 h-3" />
                                                        Đang chạy
                                                    </>
                                                ) : (
                                                    <>
                                                        <ToggleLeft className="w-3 h-3" />
                                                        Tạm dừng
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/aggregator/sources/${source.id}`}>
                                                <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-golden">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <form action={handleDelete}>
                                                <input type="hidden" name="id" value={source.id} />
                                                <Button
                                                    type="submit"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-12">
                        <Rss className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            Chưa có nguồn tin nào
                        </h3>
                        <p className="text-gray-500 mt-1">
                            Thêm nguồn RSS để bắt đầu lấy bài viết tự động
                        </p>
                        <Link href="/admin/aggregator/sources/new">
                            <Button className="mt-4">
                                <Plus className="w-4 h-4 mr-2" />
                                Thêm nguồn đầu tiên
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
