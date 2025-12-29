'use client';

import { useLanguage } from './LanguageSwitcher';
import { useEffect, useState } from 'react';

interface LocalizedTextProps {
    vi: string;
    en?: string;
}

export default function LocalizedText({ vi, en }: LocalizedTextProps) {
    const { language } = useLanguage();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // SSR or Initial Render: Always show VI
    if (!mounted) return <>{vi}</>;

    if (language === 'en' && en) {
        return <>{en}</>;
    }
    return <>{vi}</>;
}
