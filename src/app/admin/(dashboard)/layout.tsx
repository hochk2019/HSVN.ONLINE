import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/auth-actions';
import { getNotifications } from '@/lib/notification-actions';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Admin',
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [profile, notificationData] = await Promise.all([
        getUserProfile(),
        getNotifications(10),
    ]);

    // If not logged in, the middleware will redirect to login
    // But we also check here for extra safety
    if (!profile) {
        redirect('/admin/login');
    }

    const isAdmin = profile.role === 'admin';

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
            {/* Sidebar - Desktop */}
            <div className="hidden lg:block">
                <AdminSidebar isAdmin={isAdmin} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <AdminHeader
                    profile={profile}
                    notifications={notificationData.notifications}
                    unreadCount={notificationData.unreadCount}
                />

                <main className="flex-1 p-4 lg:p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

