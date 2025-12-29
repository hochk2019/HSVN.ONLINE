'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    FileText,
    FolderTree,
    Tag,
    Package,
    Image as ImageIcon,
    Settings,
    Users,
    ClipboardList,
    MessageSquare,
    Database,
    ChevronDown,
    ChevronRight,
    BarChart3,
    Rss
} from 'lucide-react';

interface NavItem {
    title: string;
    href: string;
    icon: any;
}

interface NavGroup {
    title: string;
    items: NavItem[];
}

const navGroups: NavGroup[] = [
    {
        title: 'Tổng quan',
        items: [
            { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        ]
    },
    {
        title: 'Nội dung',
        items: [
            { title: 'Bài viết', href: '/admin/posts', icon: FileText },
            { title: 'Thu thập tin', href: '/admin/aggregator', icon: Rss },
            { title: 'Chuyên mục', href: '/admin/categories', icon: FolderTree },
            { title: 'Tags', href: '/admin/tags', icon: Tag },
            { title: 'Media', href: '/admin/media', icon: ImageIcon },
            { title: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare },
        ]
    },
    {
        title: 'Sản phẩm',
        items: [
            { title: 'Phần mềm', href: '/admin/software', icon: Package },
        ]
    },
    {
        title: 'Tương tác',
        items: [
            { title: 'Liên hệ', href: '/admin/contacts', icon: MessageSquare },
            { title: 'Cấu hình RAG', href: '/admin/rag', icon: Database },
        ]
    }
];

const systemGroup: NavGroup = {
    title: 'Hệ thống',
    items: [
        { title: 'Người dùng', href: '/admin/users', icon: Users },
        { title: 'Cài đặt', href: '/admin/settings', icon: Settings },
        { title: 'Audit Logs', href: '/admin/audit-log', icon: ClipboardList },
    ]
};

interface AdminSidebarProps {
    isAdmin?: boolean;
}

export default function AdminSidebar({ isAdmin = false }: AdminSidebarProps) {
    const pathname = usePathname();
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        'Tổng quan': true,
        'Nội dung': true,
        'Sản phẩm': true,
        'Tương tác': true,
        'Hệ thống': true
    });

    // Auto-expand group if child is active
    useEffect(() => {
        const allGroups = isAdmin ? [...navGroups, systemGroup] : navGroups;
        const newExpanded = { ...expandedGroups };

        allGroups.forEach(group => {
            if (group.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))) {
                newExpanded[group.title] = true;
            }
        });
        setExpandedGroups(newExpanded);
    }, [pathname, isAdmin]);

    const toggleGroup = (title: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const renderGroup = (group: NavGroup) => {
        const isExpanded = expandedGroups[group.title];

        return (
            <div key={group.title} className="mb-2">
                <button
                    onClick={() => toggleGroup(group.title)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-white transition-colors"
                >
                    <span>{group.title}</span>
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>

                {isExpanded && (
                    <div className="space-y-1 mt-1">
                        {group.items.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            return (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ml-2',
                                        isActive
                                            ? 'bg-golden text-white'
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    )}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.title}
                                </a>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <aside className="w-64 bg-gray-900 text-white sticky top-0 h-screen flex flex-col border-r border-gray-800">
            {/* Logo */}
            <div className="p-4 border-b border-gray-800">
                <a href="/admin/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-golden rounded-lg flex items-center justify-center font-heading font-bold text-white shrink-0">
                        GL
                    </div>
                    <div className="overflow-hidden">
                        <div className="font-heading font-semibold text-golden truncate">Golden Logistics</div>
                        <div className="text-xs text-gray-400">Admin Panel</div>
                    </div>
                </a>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
                {navGroups.map(renderGroup)}
                {isAdmin && renderGroup(systemGroup)}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
                <p>© {new Date().getFullYear()} Golden Logistics</p>
                <p className="opacity-50">Version 6.0</p>
            </div>
        </aside>
    );
}
