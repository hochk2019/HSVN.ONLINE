'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import type { Profile } from '@/types/database.types';
import NotificationBell from './NotificationBell';
import AdminSearch from './AdminSearch';
import type { Notification } from '@/lib/notification-actions';

interface AdminHeaderProps {
    profile: Profile | null;
    onMenuToggle?: () => void;
    notifications?: Notification[];
    unreadCount?: number;
}

export default function AdminHeader({ profile, onMenuToggle, notifications = [], unreadCount = 0 }: AdminHeaderProps) {
    const [loggingOut, setLoggingOut] = useState(false);
    const router = useRouter();

    async function handleLogout() {
        setLoggingOut(true);
        await logout();
    }

    const initials = profile?.full_name
        ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : profile?.email?.slice(0, 2).toUpperCase() || 'AD';

    return (
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6">
            {/* Left - Mobile menu + Search */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={onMenuToggle}
                >
                    <Menu className="w-5 h-5" />
                </Button>

                {/* Admin Search Component */}
                <AdminSearch />
            </div>

            {/* Right - Notifications + User */}
            <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <NotificationBell notifications={notifications} unreadCount={unreadCount} />


                <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
                    <div className="hidden sm:block text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {profile?.full_name || 'Admin'}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                            {profile?.role || 'user'}
                        </div>
                    </div>

                    <Avatar>
                        {profile?.avatar_url && (
                            <AvatarImage src={profile.avatar_url} alt={profile.full_name || 'Avatar'} />
                        )}
                        <AvatarFallback className="bg-golden text-white text-sm">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        title="Đăng xuất"
                        className="text-gray-700 dark:text-gray-300 hover:text-red-500"
                    >
                        {loggingOut ? (
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <LogOut className="w-5 h-5" />
                        )}
                    </Button>
                </div>
            </div>
        </header>
    );
}
