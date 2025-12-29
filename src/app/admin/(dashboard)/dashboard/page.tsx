import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Package, MessageSquare, Download, Eye, FolderTree, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Dashboard',
};

async function getStats() {
    const supabase = await createServerSupabaseClient();

    const [postsResult, softwareResult, contactsResult, categoriesResult] = await Promise.all([
        supabase.from('posts').select('id, status', { count: 'exact', head: true }),
        supabase.from('software_products').select('id, download_count', { count: 'exact' }),
        supabase.from('contact_messages').select('id, status', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
    ]);

    // Count published posts
    const { count: publishedCount } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published');

    // Count unread contacts
    const { count: unreadContacts } = await supabase
        .from('contact_messages')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new');

    // Sum downloads
    const totalDownloads = softwareResult.data?.reduce((acc: number, s: { download_count: number | null }) => acc + (s.download_count || 0), 0) || 0;

    return {
        totalPosts: postsResult.count || 0,
        publishedPosts: publishedCount || 0,
        totalSoftware: softwareResult.count || 0,
        totalDownloads,
        totalContacts: contactsResult.count || 0,
        unreadContacts: unreadContacts || 0,
        totalCategories: categoriesResult.count || 0,
    };
}

async function getRecentActivities() {
    const supabase = await createServerSupabaseClient();

    // Get recent posts
    const { data: recentPosts } = await supabase
        .from('posts')
        .select('id, title, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    // Get recent contacts
    const { data: recentContacts } = await supabase
        .from('contact_messages')
        .select('id, name, subject, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    // Get recent downloads (last 7 days count)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentDownloads } = await supabase
        .from('download_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

    return {
        recentPosts: recentPosts || [],
        recentContacts: recentContacts || [],
        recentDownloads: recentDownloads || 0,
    };
}

export default async function DashboardPage() {
    const [stats, activities] = await Promise.all([
        getStats(),
        getRecentActivities(),
    ]);

    const statCards = [
        {
            title: 'Tổng bài viết',
            value: stats.totalPosts,
            subtext: `${stats.publishedPosts} đã xuất bản`,
            icon: FileText,
            color: 'text-blue-500',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            href: '/admin/posts',
        },
        {
            title: 'Phần mềm',
            value: stats.totalSoftware,
            subtext: `${stats.totalDownloads} lượt tải`,
            icon: Package,
            color: 'text-green-500',
            bgColor: 'bg-green-100 dark:bg-green-900/30',
            href: '/admin/software',
        },
        {
            title: 'Liên hệ',
            value: stats.totalContacts,
            subtext: stats.unreadContacts > 0 ? `${stats.unreadContacts} chưa đọc` : 'Đã xử lý hết',
            icon: MessageSquare,
            color: stats.unreadContacts > 0 ? 'text-red-500' : 'text-amber-500',
            bgColor: stats.unreadContacts > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30',
            href: '/admin/contacts',
        },
        {
            title: 'Chuyên mục',
            value: stats.totalCategories,
            subtext: 'Danh mục bài viết',
            icon: FolderTree,
            color: 'text-purple-500',
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
            href: '/admin/categories',
        },
    ];

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    const statusColors: Record<string, string> = {
        published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        read: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        replied: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    };



    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Chào mừng trở lại! Đây là tổng quan về hệ thống.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <Link key={stat.title} href={stat.href}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {stat.title}
                                        </p>
                                        <p className="text-3xl font-bold mt-1">{stat.value}</p>
                                        <p className="text-xs text-gray-400 mt-1">{stat.subtext}</p>
                                    </div>
                                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Analytics Section */}
            <AnalyticsDashboard />

            {/* Analytics Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-golden/10">
                                <Download className="w-6 h-6 text-golden" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Lượt tải 7 ngày qua</p>
                                <p className="text-2xl font-bold">{activities.recentDownloads}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                                <TrendingUp className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Tổng lượt tải</p>
                                <p className="text-2xl font-bold">{stats.totalDownloads}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                                <BarChart3 className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Tỷ lệ phản hồi</p>
                                <p className="text-2xl font-bold">
                                    {stats.totalContacts > 0
                                        ? Math.round(((stats.totalContacts - stats.unreadContacts) / stats.totalContacts) * 100)
                                        : 100}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Posts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Bài viết gần đây
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {activities.recentPosts.length === 0 ? (
                                <p className="text-sm text-gray-500">Chưa có bài viết nào</p>
                            ) : (
                                activities.recentPosts.map((post: any) => (
                                    <Link
                                        key={post.id}
                                        href={`/admin/posts/${post.id}`}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{post.title}</p>
                                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(post.created_at)}
                                            </p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[post.status] || ''}`}>
                                            {post.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                                        </span>
                                    </Link>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Contacts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            Liên hệ gần đây
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {activities.recentContacts.length === 0 ? (
                                <p className="text-sm text-gray-500">Chưa có liên hệ nào</p>
                            ) : (
                                activities.recentContacts.map((contact: any) => (
                                    <Link
                                        key={contact.id}
                                        href={`/admin/contacts?search=${encodeURIComponent(contact.name)}`}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{contact.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{contact.subject}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[contact.status] || ''}`}>
                                            {contact.status === 'new' ? 'Mới' : contact.status === 'read' ? 'Đã đọc' : 'Đã trả lời'}
                                        </span>
                                    </Link>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Thao tác nhanh</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link
                            href="/admin/posts/new"
                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-golden/10 hover:border-golden border-2 border-transparent transition-all"
                        >
                            <FileText className="w-8 h-8 text-golden mb-2" />
                            <span className="text-sm font-medium">Viết bài mới</span>
                        </Link>
                        <Link
                            href="/admin/software/new"
                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-golden/10 hover:border-golden border-2 border-transparent transition-all"
                        >
                            <Package className="w-8 h-8 text-golden mb-2" />
                            <span className="text-sm font-medium">Thêm phần mềm</span>
                        </Link>
                        <Link
                            href="/admin/media"
                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-golden/10 hover:border-golden border-2 border-transparent transition-all"
                        >
                            <Download className="w-8 h-8 text-golden mb-2" />
                            <span className="text-sm font-medium">Upload Media</span>
                        </Link>
                        <Link
                            href="/"
                            target="_blank"
                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-golden/10 hover:border-golden border-2 border-transparent transition-all"
                        >
                            <Eye className="w-8 h-8 text-golden mb-2" />
                            <span className="text-sm font-medium">Xem trang chủ</span>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

