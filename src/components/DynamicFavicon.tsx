'use client';

import { useEffect } from 'react';

interface DynamicFaviconProps {
    faviconUrl?: string;
    logoUrl?: string;
}

export default function DynamicFavicon({ faviconUrl, logoUrl }: DynamicFaviconProps) {
    useEffect(() => {
        // Determine favicon URL: use faviconUrl if set, otherwise logoUrl, otherwise default
        const iconUrl = faviconUrl || logoUrl || '/logo.png';

        // Update existing favicon link or create new one
        let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = iconUrl;

        // Also update apple-touch-icon
        let appleLink = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
        if (!appleLink) {
            appleLink = document.createElement('link');
            appleLink.rel = 'apple-touch-icon';
            document.head.appendChild(appleLink);
        }
        appleLink.href = iconUrl;

    }, [faviconUrl, logoUrl]);

    return null;
}
