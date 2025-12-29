'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Menu, X, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import LanguageSwitcher, { useLanguage } from '@/components/LanguageSwitcher';
import type { NavItem } from '@/types/settings';

interface HeaderProps {
    navItems: NavItem[];
    siteName: string;
}

export default function Header({ navItems, siteName }: HeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [mobileExpandedItems, setMobileExpandedItems] = useState<Set<string>>(new Set());
    const { language } = useLanguage();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const getLabel = (item: NavItem) => {
        if (mounted && language === 'en' && item.label_en) {
            return item.label_en;
        }
        return item.label;
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    const toggleMobileExpand = (href: string) => {
        setMobileExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(href)) {
                newSet.delete(href);
            } else {
                newSet.add(href);
            }
            return newSet;
        });
    };

    const renderNavItem = (item: NavItem, isMobile = false) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        const hasChildren = item.children && item.children.length > 0;

        if (isMobile) {
            // Mobile: Accordion style
            return (
                <div key={item.href}>
                    <div className="flex items-center">
                        <Link
                            href={item.href}
                            onClick={() => !hasChildren && setMobileMenuOpen(false)}
                            className={cn(
                                'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-golden text-white'
                                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                            )}
                        >
                            {getLabel(item)}
                        </Link>
                        {hasChildren && (
                            <button
                                onClick={() => toggleMobileExpand(item.href)}
                                className="p-2 text-slate-400 hover:text-white"
                            >
                                {mobileExpandedItems.has(item.href) ? (
                                    <ChevronDown className="w-4 h-4" />
                                ) : (
                                    <ChevronRight className="w-4 h-4" />
                                )}
                            </button>
                        )}
                    </div>
                    {hasChildren && mobileExpandedItems.has(item.href) && (
                        <div className="ml-4 mt-1 space-y-1 border-l border-slate-700 pl-3">
                            {item.children!.map(child => (
                                <Link
                                    key={child.href}
                                    href={child.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                        'block py-2 px-3 rounded-lg text-sm transition-colors',
                                        pathname === child.href
                                            ? 'text-golden'
                                            : 'text-slate-400 hover:text-white'
                                    )}
                                >
                                    {getLabel(child)}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        // Desktop: Hover dropdown
        if (hasChildren) {
            return (
                <div
                    key={item.href}
                    className="relative group"
                    onMouseEnter={() => setOpenDropdown(item.href)}
                    onMouseLeave={() => setOpenDropdown(null)}
                >
                    <Link
                        href={item.href}
                        className={cn(
                            'flex items-center gap-1 text-sm font-medium transition-colors',
                            isActive
                                ? 'text-golden'
                                : 'text-slate-300 hover:text-white'
                        )}
                    >
                        {getLabel(item)}
                        <ChevronDown className={cn(
                            "w-3 h-3 transition-transform",
                            openDropdown === item.href && "rotate-180"
                        )} />
                    </Link>

                    {/* Dropdown Menu */}
                    <div className={cn(
                        "absolute top-full left-0 mt-1 py-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl min-w-[180px] z-50 transition-all",
                        openDropdown === item.href
                            ? "opacity-100 visible translate-y-0"
                            : "opacity-0 invisible -translate-y-2"
                    )}>
                        {item.children!.map(child => (
                            <Link
                                key={child.href}
                                href={child.href}
                                className={cn(
                                    "block px-4 py-2 text-sm transition-colors",
                                    pathname === child.href
                                        ? 'text-golden bg-slate-700/50'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                                )}
                            >
                                {getLabel(child)}
                            </Link>
                        ))}
                    </div>
                </div>
            );
        }

        // Regular link (no children)
        return (
            <Link
                key={item.href}
                href={item.href}
                className={cn(
                    'text-sm font-medium transition-colors',
                    isActive
                        ? 'text-golden'
                        : 'text-slate-300 hover:text-white'
                )}
            >
                {getLabel(item)}
            </Link>
        );
    };

    return (
        <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 shadow-lg">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <Image
                        src="/logo.png"
                        alt={siteName}
                        width={44}
                        height={44}
                        className="w-11 h-11"
                    />
                    <span className="font-heading font-bold text-xl text-golden-gradient">
                        {siteName}
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {navItems.map(item => renderNavItem(item, false))}
                </nav>

                <div className="flex items-center gap-2">
                    {/* Desktop Search Form */}
                    <form onSubmit={handleSearch} className="hidden md:flex items-center">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm..."
                                className="w-40 lg:w-52 px-3 py-1.5 pl-9 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-golden focus:border-transparent transition-all"
                            />
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                    </form>

                    {/* Language Switcher - Desktop */}
                    <LanguageSwitcher variant="minimal" className="hidden md:flex" />

                    {/* Mobile Search Button */}
                    <button
                        className="md:hidden p-2 text-slate-300 hover:text-golden transition-colors"
                        onClick={() => setSearchOpen(!searchOpen)}
                    >
                        <Search className="w-5 h-5" />
                    </button>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-slate-300 hover:text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Search Bar */}
            {searchOpen && (
                <div className="md:hidden bg-slate-800 border-t border-slate-700 py-3 px-4">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Nhập từ khóa tìm kiếm..."
                            autoFocus
                            className="flex-1 px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-golden"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-golden text-white rounded-lg hover:bg-golden-dark transition-colors"
                        >
                            Tìm
                        </button>
                    </form>
                </div>
            )}

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <nav className="md:hidden bg-slate-800 border-t border-slate-700 py-4">
                    <div className="container mx-auto px-4 space-y-2">
                        {navItems.map(item => renderNavItem(item, true))}
                    </div>
                </nav>
            )}
        </header>
    );
}
