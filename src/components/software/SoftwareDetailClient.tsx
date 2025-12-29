'use client';

import { useState, useEffect } from 'react';
import { useTranslatedContent } from '@/hooks/useTranslatedContent';
import ShareButtons from '@/components/ShareButtons';
import FacebookComments from '@/components/FacebookComments';
import { Package } from 'lucide-react';
import Image from 'next/image';

interface SoftwareDetailClientProps {
    software: {
        id: string;
        name: string;
        summary: string | null;
        description_html: string | null;
        icon_url: string | null;
        translations?: string | null;
    };
    siteUrl: string;
    slug: string;
    enableComments: boolean;
}

export default function SoftwareDetailClient({
    software,
    siteUrl,
    slug,
    enableComments
}: SoftwareDetailClientProps) {
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationError, setTranslationError] = useState<string | null>(null);
    const [currentData, setCurrentData] = useState(software);

    // Use translated content hook
    const translatedSoftware = useTranslatedContent(
        currentData,
        currentData.translations,
        ['name', 'summary', 'description_html']
    );

    // Auto-translate effect for software (same logic as ArticleViewer)
    useEffect(() => {
        const checkAndTranslate = async () => {
            const savedLang = localStorage.getItem('preferred_language') || 'vi';
            if (savedLang !== 'en') return;

            // Check if translation exists
            const translations = currentData.translations
                ? (typeof currentData.translations === 'string' ? JSON.parse(currentData.translations) : currentData.translations)
                : {};

            if (translations.en) return;

            // Note: Software translation would need a separate API endpoint
            // For now, we just show the original content if no translation exists
            // Admin can pre-translate software descriptions via admin panel
        };

        checkAndTranslate();
    }, [currentData]);

    const pageUrl = `${siteUrl}/phan-mem/${slug}`;

    return (
        <div>
            {/* Translation Error */}
            {translationError && (
                <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 px-4 py-2 rounded-lg text-sm mb-4">
                    {translationError}
                </div>
            )}

            {/* Software Header */}
            <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 bg-golden/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    {software.icon_url ? (
                        <Image
                            src={software.icon_url}
                            alt={translatedSoftware.name}
                            width={48}
                            height={48}
                            className="rounded-lg"
                        />
                    ) : (
                        <Package className="w-10 h-10 text-golden" />
                    )}
                </div>
                <div>
                    <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2 text-slate-900 dark:text-white">
                        {translatedSoftware.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        {translatedSoftware.summary}
                    </p>
                </div>
            </div>

            {/* Description */}
            {translatedSoftware.description_html && (
                <div
                    className="prose prose-lg dark:prose-invert max-w-none
                    prose-headings:font-heading
                    prose-a:text-golden mb-8"
                    dangerouslySetInnerHTML={{ __html: translatedSoftware.description_html }}
                />
            )}

            {/* Share Buttons */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-8">
                <p className="text-sm text-gray-500 mb-3">Chia sẻ:</p>
                <ShareButtons
                    url={pageUrl}
                    title={translatedSoftware.name}
                />
            </div>

            {/* Facebook Comments */}
            {enableComments && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h2 className="text-xl font-bold mb-4">Bình luận</h2>
                    <FacebookComments url={pageUrl} />
                </div>
            )}
        </div>
    );
}
