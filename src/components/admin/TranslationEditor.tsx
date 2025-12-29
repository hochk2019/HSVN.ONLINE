'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Globe, Languages } from 'lucide-react';

interface TranslationEditorProps {
    translations: string; // JSON string
    onTranslationsChange: (json: string) => void;
    fields: {
        key: string;
        label: string;
        type: 'text' | 'textarea' | 'richtext';
        placeholder?: string;
    }[];
    language?: string; // Default: 'en'
    languageLabel?: string; // Default: 'English'
}

export default function TranslationEditor({
    translations,
    onTranslationsChange,
    fields,
    language = 'en',
    languageLabel = 'English',
}: TranslationEditorProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Parse translations
    let parsed: Record<string, Record<string, string>> = {};
    try {
        parsed = JSON.parse(translations || '{}');
    } catch {
        parsed = {};
    }

    const langData = parsed[language] || {};

    const updateField = (key: string, value: string) => {
        const newParsed = {
            ...parsed,
            [language]: {
                ...langData,
                [key]: value,
            },
        };
        onTranslationsChange(JSON.stringify(newParsed));
    };

    const hasContent = Object.values(langData).some(v => v && v.trim().length > 0);

    return (
        <Card className={`border-dashed ${hasContent ? 'border-green-300 dark:border-green-800' : 'border-gray-300 dark:border-gray-700'}`}>
            <CardHeader className="py-3">
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Languages className="w-4 h-4 text-blue-500" />
                        Bản dịch {languageLabel}
                        {hasContent && (
                            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                                Đã có
                            </span>
                        )}
                    </CardTitle>
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                </button>
            </CardHeader>

            {isExpanded && (
                <CardContent className="pt-0 space-y-4">
                    <p className="text-sm text-gray-500">
                        Nhập nội dung tiếng Anh cho bài viết. Người đọc có thể chuyển đổi ngôn ngữ trên trang xem.
                    </p>

                    {fields.map((field) => (
                        <div key={field.key}>
                            <label className="block text-sm font-medium mb-1.5">
                                {field.label}
                            </label>
                            {field.type === 'text' ? (
                                <Input
                                    value={langData[field.key] || ''}
                                    onChange={(e) => updateField(field.key, e.target.value)}
                                    placeholder={field.placeholder || `${field.label} (${languageLabel})`}
                                />
                            ) : field.type === 'textarea' ? (
                                <textarea
                                    value={langData[field.key] || ''}
                                    onChange={(e) => updateField(field.key, e.target.value)}
                                    rows={3}
                                    placeholder={field.placeholder || `${field.label} (${languageLabel})`}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm resize-y"
                                />
                            ) : (
                                <textarea
                                    value={langData[field.key] || ''}
                                    onChange={(e) => updateField(field.key, e.target.value)}
                                    rows={6}
                                    placeholder={field.placeholder || `HTML content (${languageLabel})`}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm font-mono resize-y"
                                />
                            )}
                        </div>
                    ))}
                </CardContent>
            )}
        </Card>
    );
}
