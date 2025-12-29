'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bell, Check, Mail, FileText, Info } from 'lucide-react';
import { markAsRead, markAllAsRead, type Notification } from '@/lib/notification-actions';

interface NotificationBellProps {
    notifications: Notification[];
    unreadCount: number;
}

export default function NotificationBell({ notifications, unreadCount }: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [localNotifications, setLocalNotifications] = useState(notifications);
    const [localUnreadCount, setLocalUnreadCount] = useState(unreadCount);

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id);
        setLocalNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
        setLocalUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        setLocalNotifications(prev =>
            prev.map(n => ({ ...n, is_read: true }))
        );
        setLocalUnreadCount(0);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'contact': return <Mail className="w-4 h-4 text-blue-500" />;
            case 'post': return <FileText className="w-4 h-4 text-green-500" />;
            default: return <Info className="w-4 h-4 text-gray-500" />;
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        return `${diffDays} ngày trước`;
    };

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-700 dark:text-gray-300 hover:text-golden"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="w-5 h-5" />
                {localUnreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[8px] h-2 px-0.5 bg-red-500 text-[10px] text-white rounded-full flex items-center justify-center">
                        {localUnreadCount > 9 ? '9+' : ''}
                    </span>
                )}
            </Button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                        {/* Header */}
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h3 className="font-medium text-sm text-gray-900 dark:text-white">
                                Thông báo {localUnreadCount > 0 && `(${localUnreadCount})`}
                            </h3>
                            {localUnreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-golden hover:underline"
                                >
                                    Đánh dấu đã đọc
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-80 overflow-y-auto">
                            {localNotifications.length === 0 ? (
                                <div className="p-6 text-center">
                                    <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Không có thông báo
                                    </p>
                                </div>
                            ) : (
                                localNotifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!notif.is_read ? 'bg-golden/5' : ''
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0 mt-0.5">
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {notif.link ? (
                                                    <Link
                                                        href={notif.link}
                                                        onClick={() => {
                                                            if (!notif.is_read) handleMarkAsRead(notif.id);
                                                            setIsOpen(false);
                                                        }}
                                                        className="block"
                                                    >
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                            {notif.title}
                                                        </p>
                                                        {notif.message && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                                                {notif.message}
                                                            </p>
                                                        )}
                                                    </Link>
                                                ) : (
                                                    <>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                            {notif.title}
                                                        </p>
                                                        {notif.message && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                                                {notif.message}
                                                            </p>
                                                        )}
                                                    </>
                                                )}
                                                <p className="text-[10px] text-gray-400 mt-1">
                                                    {formatTime(notif.created_at)}
                                                </p>
                                            </div>
                                            {!notif.is_read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notif.id)}
                                                    className="flex-shrink-0 text-gray-400 hover:text-golden"
                                                    title="Đánh dấu đã đọc"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
