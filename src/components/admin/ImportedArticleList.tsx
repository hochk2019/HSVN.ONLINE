'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { approveArticle, rejectArticle, deleteImportedArticle, ImportedArticle } from '@/lib/aggregator-actions';
import {
    Check,
    X,
    Trash2,
    ExternalLink,
    FileText,
    Clock,
    Sparkles,
    Eye,
    Loader2,
} from 'lucide-react';

interface ImportedArticleListProps {
    articles: ImportedArticle[];
}

export default function ImportedArticleList({ articles }: ImportedArticleListProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [selectedArticle, setSelectedArticle] = useState<ImportedArticle | null>(null);

    const handleApprove = async (id: string) => {
        setLoading(id);
        const result = await approveArticle(id);
        if (result.success && result.postId) {
            router.push(`/admin/posts/${result.postId}`);
        }
        setLoading(null);
        router.refresh();
    };

    const handleReject = async (id: string) => {
        setLoading(id);
        await rejectArticle(id);
        setLoading(null);
        router.refresh();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bạn có chắc muốn xóa bài này?')) {
            setLoading(id);
            await deleteImportedArticle(id);
            setLoading(null);
            router.refresh();
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (articles.length === 0) {
        return (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Chưa có bài viết nào
                </h3>
                <p className="text-gray-500 mt-1">
                    Thêm nguồn RSS và đợi hệ thống lấy bài tự động
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {articles.map((article) => (
                    <div
                        key={article.id}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                            {/* Featured Image */}
                            {article.featured_image && (
                                <div className="flex-shrink-0">
                                    <img
                                        src={article.featured_image}
                                        alt=""
                                        className="w-full lg:w-40 h-24 object-cover rounded-lg"
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-grow min-w-0">
                                {/* Title */}
                                <h3 className="font-semibold text-lg line-clamp-2 mb-2 text-gray-900 dark:text-white">
                                    {article.ai_rewritten_title || article.original_title}
                                </h3>

                                {/* Meta */}
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {formatDate(article.fetched_at)}
                                    </span>
                                    {article.source_name && (
                                        <span className="text-golden">{article.source_name}</span>
                                    )}
                                    {article.ai_rewritten_content && (
                                        <span className="flex items-center gap-1 text-purple-500">
                                            <Sparkles className="w-4 h-4" />
                                            AI đã viết lại
                                        </span>
                                    )}
                                    <a
                                        href={article.original_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 hover:text-golden"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Xem gốc
                                    </a>
                                </div>

                                {/* Preview content */}
                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                                    {(article.ai_rewritten_content || article.original_content || '')
                                        .replace(/<[^>]*>/g, '')
                                        .substring(0, 200)}...
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex lg:flex-col gap-2 flex-shrink-0">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedArticle(article)}
                                >
                                    <Eye className="w-4 h-4 lg:mr-0 mr-2" />
                                    <span className="lg:hidden">Xem</span>
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => handleApprove(article.id)}
                                    disabled={loading === article.id}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {loading === article.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4 lg:mr-0 mr-2" />
                                    )}
                                    <span className="lg:hidden">Duyệt</span>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReject(article.id)}
                                    disabled={loading === article.id}
                                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <X className="w-4 h-4 lg:mr-0 mr-2" />
                                    <span className="lg:hidden">Bỏ qua</span>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDelete(article.id)}
                                    disabled={loading === article.id}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Preview Modal */}
            {selectedArticle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Xem trước bài viết</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedArticle(null)}
                                className="text-gray-700 dark:text-gray-300 hover:text-red-500"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            {selectedArticle.featured_image && (
                                <img
                                    src={selectedArticle.featured_image}
                                    alt=""
                                    className="w-full h-64 object-cover rounded-lg mb-6"
                                />
                            )}
                            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                                {selectedArticle.ai_rewritten_title || selectedArticle.original_title}
                            </h1>
                            {selectedArticle.source_name && (
                                <p className="text-sm text-golden mb-4 italic">
                                    {selectedArticle.source_name}
                                </p>
                            )}
                            <div
                                className="prose dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: selectedArticle.ai_rewritten_content || selectedArticle.original_content || '',
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    handleReject(selectedArticle.id);
                                    setSelectedArticle(null);
                                }}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Bỏ qua
                            </Button>
                            <Button
                                onClick={() => {
                                    handleApprove(selectedArticle.id);
                                    setSelectedArticle(null);
                                }}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Duyệt & chỉnh sửa
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
