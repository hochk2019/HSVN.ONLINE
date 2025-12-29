'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, FileText, Mail, Package, User, Loader2 } from 'lucide-react';
import { adminSearch, type AdminSearchResult } from '@/lib/admin-search-actions';

export default function AdminSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<AdminSearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (query.trim().length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            const { results } = await adminSearch(query);
            setResults(results);
            setIsOpen(results.length > 0);
            setLoading(false);
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'post': return <FileText className="w-4 h-4 text-blue-500" />;
            case 'contact': return <Mail className="w-4 h-4 text-green-500" />;
            case 'software': return <Package className="w-4 h-4 text-purple-500" />;
            case 'user': return <User className="w-4 h-4 text-orange-500" />;
            default: return <Search className="w-4 h-4" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'post': return 'Bài viết';
            case 'contact': return 'Liên hệ';
            case 'software': return 'Phần mềm';
            case 'user': return 'Người dùng';
            default: return '';
        }
    };

    return (
        <div ref={containerRef} className="relative hidden md:block">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 w-64">
                {loading ? (
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                ) : (
                    <Search className="w-4 h-4 text-gray-400" />
                )}
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                    placeholder="Tìm kiếm..."
                    className="bg-transparent border-none outline-none text-sm flex-1 text-gray-600 dark:text-gray-300 placeholder:text-gray-400"
                />
            </div>

            {/* Results Dropdown */}
            {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
                    {results.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                            Không tìm thấy kết quả
                        </div>
                    ) : (
                        <div>
                            {results.map((result) => (
                                <Link
                                    key={`${result.type}-${result.id}`}
                                    href={result.link}
                                    onClick={() => {
                                        setIsOpen(false);
                                        setQuery('');
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                >
                                    <div className="flex-shrink-0">
                                        {getIcon(result.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {result.title}
                                        </p>
                                        {result.subtitle && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {result.subtitle}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex-shrink-0">
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                                            {getTypeLabel(result.type)}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
