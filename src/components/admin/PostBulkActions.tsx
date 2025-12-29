'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { bulkUpdatePostStatus, bulkDeletePosts } from '@/lib/post-actions';
import { Trash2, Eye, EyeOff, Archive, Loader2, CheckSquare, Square, AlertTriangle } from 'lucide-react';

interface Post {
    id: string;
    title: string | null;
    status: string | null;
}

interface PostBulkActionsProps {
    posts: Post[];
}

export default function PostBulkActions({ posts }: PostBulkActionsProps) {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === posts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(posts.map(p => p.id));
        }
    };

    const handleBulkAction = async (action: 'publish' | 'draft' | 'archive' | 'delete') => {
        if (selectedIds.length === 0) return;

        if (action === 'delete') {
            if (!confirm(`Bạn có chắc muốn xóa ${selectedIds.length} bài viết?`)) return;
        }

        startTransition(async () => {
            let result;
            if (action === 'delete') {
                result = await bulkDeletePosts(selectedIds);
            } else {
                const statusMap = { publish: 'published', draft: 'draft', archive: 'archived' } as const;
                result = await bulkUpdatePostStatus(selectedIds, statusMap[action]);
            }

            if (result.error) {
                setMessage({ type: 'error', text: result.error });
            } else {
                setMessage({
                    type: 'success',
                    text: action === 'delete'
                        ? `Đã xóa ${result.count} bài viết`
                        : `Đã cập nhật ${result.count} bài viết`
                });
                setSelectedIds([]);
                router.refresh();
            }

            setTimeout(() => setMessage(null), 3000);
        });
    };

    return (
        <div className="space-y-4">
            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-golden/10 border border-golden/30 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-sm font-medium">
                        Đã chọn <strong>{selectedIds.length}</strong> bài viết
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBulkAction('publish')}
                            disabled={isPending}
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            Xuất bản
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBulkAction('draft')}
                            disabled={isPending}
                        >
                            <EyeOff className="w-4 h-4 mr-1" />
                            Chuyển nháp
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBulkAction('archive')}
                            disabled={isPending}
                        >
                            <Archive className="w-4 h-4 mr-1" />
                            Lưu trữ
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleBulkAction('delete')}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Xóa
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Message */}
            {message && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success'
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Posts Table with Checkboxes */}
            <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <th className="px-4 py-3 text-left">
                            <button onClick={toggleSelectAll} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                                {selectedIds.length === posts.length && posts.length > 0 ? (
                                    <CheckSquare className="w-5 h-5 text-golden" />
                                ) : (
                                    <Square className="w-5 h-5 text-gray-400" />
                                )}
                            </button>
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tiêu đề
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trạng thái
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {posts.map((post) => (
                        <tr key={post.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${selectedIds.includes(post.id) ? 'bg-golden/5' : ''
                            }`}>
                            <td className="px-4 py-3">
                                <button
                                    onClick={() => toggleSelect(post.id)}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                >
                                    {selectedIds.includes(post.id) ? (
                                        <CheckSquare className="w-5 h-5 text-golden" />
                                    ) : (
                                        <Square className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                                {post.title}
                            </td>
                            <td className="px-4 py-3">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${post.status === 'published'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : post.status === 'scheduled'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                    }`}>
                                    {post.status === 'draft' && 'Nháp'}
                                    {post.status === 'published' && 'Đã xuất bản'}
                                    {post.status === 'scheduled' && 'Lên lịch'}
                                    {post.status === 'archived' && 'Lưu trữ'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
