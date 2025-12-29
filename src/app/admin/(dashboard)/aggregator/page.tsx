import { getImportedArticles } from '@/lib/aggregator-actions';
import ImportedArticleList from '@/components/admin/ImportedArticleList';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Rss, Settings, RefreshCw, FileText, CheckCircle, XCircle } from 'lucide-react';

interface Props {
    searchParams: Promise<{ status?: string }>;
}

export default async function AggregatorPage({ searchParams }: Props) {
    const { status } = await searchParams;
    const currentStatus = status || 'pending';

    const { articles, error } = await getImportedArticles(currentStatus);

    // Get counts for each status
    const { articles: pendingArticles } = await getImportedArticles('pending');
    const { articles: approvedArticles } = await getImportedArticles('approved');
    const { articles: rejectedArticles } = await getImportedArticles('rejected');

    const tabs = [
        {
            id: 'pending',
            label: 'Chờ duyệt',
            count: pendingArticles?.length || 0,
            icon: FileText,
            color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
        },
        {
            id: 'approved',
            label: 'Đã duyệt',
            count: approvedArticles?.length || 0,
            icon: CheckCircle,
            color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
        },
        {
            id: 'rejected',
            label: 'Đã bỏ qua',
            count: rejectedArticles?.length || 0,
            icon: XCircle,
            color: 'text-red-600 bg-red-100 dark:bg-red-900/30',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Thu thập bài viết</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Duyệt và xuất bản bài viết từ nguồn RSS
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/aggregator/sources">
                        <Button variant="outline">
                            <Settings className="w-4 h-4 mr-2" />
                            Quản lý nguồn
                        </Button>
                    </Link>
                    <form action="/api/cron/fetch-feeds" method="POST">
                        <Button type="submit" variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Lấy bài ngay
                        </Button>
                    </form>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tabs.map((tab) => (
                    <Link
                        key={tab.id}
                        href={`/admin/aggregator?status=${tab.id}`}
                        className={`p-4 rounded-xl border-2 transition-all ${currentStatus === tab.id
                            ? 'border-golden bg-golden/5'
                            : 'border-gray-200 dark:border-gray-700 hover:border-golden/50'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${tab.color}`}>
                                    <tab.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{tab.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{tab.count}</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* Articles List */}
            <ImportedArticleList articles={articles || []} />
        </div>
    );
}
