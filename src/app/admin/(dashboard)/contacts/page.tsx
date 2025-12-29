import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Clock, CheckCircle, Eye, MessageSquare, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import ContactActions from '@/components/admin/ContactActions';
import ContactAIAnalyzer from '@/components/admin/ContactAIAnalyzer';
import { getContacts, getContactStats } from '@/lib/admin-contact-actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Liên hệ',
};

const ITEMS_PER_PAGE = 20;

const statusTabs = [
    { value: 'all', label: 'Tất cả' },
    { value: 'new', label: 'Chưa đọc' },
    { value: 'read', label: 'Đã đọc' },
    { value: 'replied', label: 'Đã trả lời' },
    { value: 'archived', label: 'Lưu trữ' },
];

export default async function ContactsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
    const params = await searchParams;
    const status = params.status || 'all';
    const search = params.search || '';
    const page = parseInt(params.page || '1');
    const offset = (page - 1) * ITEMS_PER_PAGE;

    const { contacts, total } = await getContacts({
        status: status !== 'all' ? status : undefined,
        search: search || undefined,
        limit: ITEMS_PER_PAGE,
        offset,
    });

    // Get counts using efficient SQL aggregate (no more fetching 1000 records)
    const stats = await getContactStats();
    const unread = stats.new;
    const read = stats.read;
    const replied = stats.replied;

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    // Build URL helper
    const buildUrl = (newParams: Record<string, string | undefined>) => {
        const merged = { status, search, page: String(page), ...newParams };
        const params = new URLSearchParams();
        Object.entries(merged).forEach(([k, v]) => {
            if (v && v !== 'all' && v !== '1' && v !== '') params.set(k, v);
        });
        return `/admin/contacts${params.toString() ? `?${params.toString()}` : ''}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-bold">Liên hệ</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Quản lý tin nhắn từ khách hàng
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Mail className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{unread}</div>
                            <div className="text-sm text-gray-500">Chưa đọc</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                            <Eye className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{read}</div>
                            <div className="text-sm text-gray-500">Đã đọc</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{replied}</div>
                            <div className="text-sm text-gray-500">Đã trả lời</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter & Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Status Tabs */}
                        <div className="flex gap-1 flex-wrap">
                            {statusTabs.map((tab) => (
                                <Link
                                    key={tab.value}
                                    href={buildUrl({ status: tab.value, page: '1' })}
                                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${status === tab.value
                                        ? 'bg-golden text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {tab.label}
                                </Link>
                            ))}
                        </div>

                        {/* Search */}
                        <form action="/admin/contacts" method="GET" className="flex gap-2">
                            <input type="hidden" name="status" value={status} />
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    name="search"
                                    defaultValue={search}
                                    placeholder="Tìm theo tên, email..."
                                    className="pl-9 w-64"
                                />
                            </div>
                            <Button type="submit" variant="outline">Tìm</Button>
                        </form>
                    </div>
                </CardContent>
            </Card>

            {/* Messages List */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách tin nhắn ({total})</CardTitle>
                </CardHeader>
                <CardContent>
                    {contacts.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Không có tin nhắn nào</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {contacts.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`p-4 rounded-lg border transition-colors ${msg.status === 'new'
                                        ? 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium">{msg.name}</span>
                                                <span className="text-sm text-gray-500">{msg.email}</span>
                                                {msg.status === 'new' && (
                                                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                                                        Mới
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                {msg.subject}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                {msg.message}
                                            </p>
                                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                                                <Clock className="w-3 h-3" />
                                                {new Date(msg.created_at || Date.now()).toLocaleString('vi-VN')}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <ContactActions
                                                contactId={msg.id}
                                                currentStatus={(msg.status || 'new') as 'new' | 'read' | 'replied' | 'archived'}
                                            />
                                            <ContactAIAnalyzer
                                                message={msg.message || ''}
                                                subject={msg.subject || undefined}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <Link
                                href={buildUrl({ page: String(Math.max(1, page - 1)) })}
                                className={`p-2 rounded-lg ${page === 1 ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Link>
                            <span className="text-sm">
                                Trang {page} / {totalPages}
                            </span>
                            <Link
                                href={buildUrl({ page: String(Math.min(totalPages, page + 1)) })}
                                className={`p-2 rounded-lg ${page === totalPages ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
