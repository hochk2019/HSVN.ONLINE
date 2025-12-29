'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import Link from 'next/link';

export default function SearchBox() {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/tim-kiem?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <>
            {/* Desktop: Full search input */}
            <form onSubmit={handleSubmit} className="hidden md:flex items-center">
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Tìm kiếm..."
                        className="w-40 lg:w-48 px-3 py-1.5 pl-9 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-golden focus:border-transparent transition-all"
                    />
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
            </form>

            {/* Mobile: Search icon link */}
            <Link
                href="/tim-kiem"
                className="md:hidden p-2 text-slate-300 hover:text-golden transition-colors"
                aria-label="Tìm kiếm"
            >
                <Search className="w-5 h-5" />
            </Link>
        </>
    );
}
