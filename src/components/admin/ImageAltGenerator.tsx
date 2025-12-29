'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';

interface ImageAltGeneratorProps {
    imageUrl: string;
    currentAlt?: string;
    title?: string;
    content?: string;
    onAltGenerated?: (alt: string) => void;
}

export default function ImageAltGenerator({
    imageUrl,
    currentAlt,
    title,
    content,
    onAltGenerated
}: ImageAltGeneratorProps) {
    const [loading, setLoading] = useState(false);
    const [generatedAlt, setGeneratedAlt] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const generateAlt = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/ai/alt-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl, title, content }),
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error);
            } else {
                setGeneratedAlt(data.altText);
                if (onAltGenerated) {
                    onAltGenerated(data.altText);
                }
            }
        } catch {
            setError('Không thể tạo alt text');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedAlt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-2">
            {currentAlt && (
                <div className="text-xs text-gray-500">
                    <span className="font-medium">Alt hiện tại:</span> {currentAlt}
                </div>
            )}

            {!generatedAlt ? (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateAlt}
                    disabled={loading}
                    className="w-full"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Đang tạo...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                            Tạo Alt Text
                        </>
                    )}
                </Button>
            ) : (
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{generatedAlt}</p>
                        <button
                            onClick={copyToClipboard}
                            className="flex-shrink-0 p-1 hover:bg-purple-100 dark:hover:bg-purple-800 rounded"
                            title="Copy"
                        >
                            {copied ? (
                                <Check className="w-4 h-4 text-green-600" />
                            ) : (
                                <Copy className="w-4 h-4 text-purple-600" />
                            )}
                        </button>
                    </div>
                    <button
                        onClick={generateAlt}
                        className="text-xs text-purple-600 hover:underline mt-1"
                    >
                        Tạo lại
                    </button>
                </div>
            )}

            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
        </div>
    );
}
