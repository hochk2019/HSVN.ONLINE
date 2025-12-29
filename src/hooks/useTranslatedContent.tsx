'use client';

import { useState, useEffect } from 'react';

const LANGUAGE_STORAGE_KEY = 'preferred_language';

/**
 * Hook to get translated content based on user's language preference
 * @param originalContent - The original Vietnamese content
 * @param translations - JSON string containing translations
 * @param fields - Array of field keys to translate
 */
export function useTranslatedContent<T extends Record<string, any>>(
    originalContent: T,
    translations: string | null | undefined,
    fields: (keyof T)[]
): T {
    const [language, setLanguage] = useState('vi');
    const [translatedContent, setTranslatedContent] = useState(originalContent);

    useEffect(() => {
        // Get initial language
        const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (stored && stored !== 'vi') {
            setLanguage(stored);
        }

        // Listen for language changes
        const handleLanguageChange = (e: CustomEvent) => {
            setLanguage(e.detail);
        };

        window.addEventListener('languageChange', handleLanguageChange as EventListener);
        return () => {
            window.removeEventListener('languageChange', handleLanguageChange as EventListener);
        };
    }, []);

    useEffect(() => {
        if (language === 'vi' || !translations) {
            setTranslatedContent(originalContent);
            return;
        }

        try {
            const parsed = typeof translations === 'string'
                ? JSON.parse(translations)
                : translations;

            const langData = parsed[language];

            if (!langData) {
                setTranslatedContent(originalContent);
                return;
            }

            // Create new content with translations where available
            const newContent = { ...originalContent };
            for (const field of fields) {
                if (langData[field as string] && langData[field as string].trim()) {
                    newContent[field] = langData[field as string];
                }
            }
            setTranslatedContent(newContent);
        } catch {
            setTranslatedContent(originalContent);
        }
    }, [language, translations, originalContent, fields]);

    return translatedContent;
}

/**
 * Server-side helper to get translated content
 * @param originalContent - The original content object
 * @param translations - JSON string containing translations
 * @param fields - Array of field keys to translate
 * @param targetLanguage - Target language code
 */
export function getTranslatedContent<T extends Record<string, any>>(
    originalContent: T,
    translations: string | null | undefined,
    fields: (keyof T)[],
    targetLanguage: string = 'vi'
): T {
    if (targetLanguage === 'vi' || !translations) {
        return originalContent;
    }

    try {
        const parsed = JSON.parse(translations);
        const langData = parsed[targetLanguage];

        if (!langData) {
            return originalContent;
        }

        const newContent = { ...originalContent };
        for (const field of fields) {
            if (langData[field as string] && langData[field as string].trim()) {
                newContent[field] = langData[field as string];
            }
        }
        return newContent;
    } catch {
        return originalContent;
    }
}

/**
 * Component that displays translated content with language-aware re-rendering
 */
export function TranslatedText({
    original,
    translations,
    field
}: {
    original: string;
    translations?: string | null;
    field: string;
}) {
    const content = useTranslatedContent(
        { [field]: original } as Record<string, string>,
        translations,
        [field]
    );

    return <>{content[field]}</>;
}
