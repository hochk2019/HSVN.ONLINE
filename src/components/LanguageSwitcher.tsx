'use client';

import { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

const LANGUAGE_STORAGE_KEY = 'preferred_language';

const languages = [
    { code: 'vi', label: 'Tiếng Việt', short: 'VN' },
    { code: 'en', label: 'English', short: 'EN' },
];

export function useLanguage() {
    const [language, setLanguageState] = useState('vi');

    useEffect(() => {
        const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (stored && ['vi', 'en'].includes(stored)) {
            setLanguageState(stored);
        }

        const handleChange = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            setLanguageState(detail);
        };

        window.addEventListener('languageChange', handleChange);
        return () => window.removeEventListener('languageChange', handleChange);
    }, []);

    const setLanguage = (lang: string) => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
        setLanguageState(lang);
        // Trigger re-render across components
        window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
    };

    return { language, setLanguage };
}

export function getPreferredLanguage(): string {
    if (typeof window === 'undefined') return 'vi';
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'vi';
}

interface LanguageSwitcherProps {
    className?: string;
    variant?: 'default' | 'minimal';
}

export default function LanguageSwitcher({
    className = '',
    variant = 'default'
}: LanguageSwitcherProps) {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentLang = languages.find(l => l.code === language) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => setIsOpen(!isOpen);
    const selectLanguage = (code: string) => {
        setLanguage(code);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                onClick={toggleDropdown}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg border transition-all ${variant === 'minimal'
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
                    : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
            >
                <span className={`text-sm font-bold ${variant === 'minimal' && language === 'en' ? 'text-golden' : ''}`}>
                    {currentLang.short}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => selectLanguage(lang.code)}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between group ${language === lang.code
                                ? 'bg-golden/10 text-golden'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            <span className="font-medium">{lang.short}</span>
                            <span className="text-xs text-slate-400 group-hover:text-slate-500 dark:text-slate-500">
                                {lang.label}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
