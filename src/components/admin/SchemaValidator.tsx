'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, XCircle, Loader2, FileCheck } from 'lucide-react';

interface SchemaValidatorProps {
    type: 'article' | 'software';
    data: {
        title?: string;
        description?: string;
        image?: string;
        author?: string;
        datePublished?: string;
        // Software specific
        softwareVersion?: string;
        operatingSystem?: string;
        downloadUrl?: string;
    };
}

interface ValidationResult {
    isValid: boolean;
    score: number;
    errors: string[];
    warnings: string[];
    suggestions: string[];
}

export default function SchemaValidator({ type, data }: SchemaValidatorProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const buildSchema = () => {
        if (type === 'article') {
            return {
                '@context': 'https://schema.org',
                '@type': 'Article',
                headline: data.title,
                description: data.description,
                image: data.image,
                author: data.author ? { '@type': 'Person', name: data.author } : undefined,
                datePublished: data.datePublished,
            };
        } else {
            return {
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                name: data.title,
                description: data.description,
                softwareVersion: data.softwareVersion,
                operatingSystem: data.operatingSystem,
                downloadUrl: data.downloadUrl,
            };
        }
    };

    const validate = async () => {
        setLoading(true);
        setError(null);

        try {
            const schema = buildSchema();
            const response = await fetch('/api/ai/validate-schema', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ schema, type }),
            });

            const validationResult = await response.json();

            if (validationResult.error) {
                setError(validationResult.error);
            } else {
                setResult(validationResult);
            }
        } catch {
            setError('Không thể validate schema');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={validate}
                disabled={loading}
                className="w-full"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang kiểm tra...
                    </>
                ) : (
                    <>
                        <FileCheck className="w-4 h-4 mr-2 text-blue-600" />
                        Kiểm tra Schema SEO
                    </>
                )}
            </Button>

            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}

            {result && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2 text-sm">
                    {/* Score */}
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Schema Score:</span>
                        <span className={`font-bold ${result.score >= 80 ? 'text-green-600' :
                            result.score >= 60 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                            {result.score}/100
                        </span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                        {result.isValid ? (
                            <>
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span className="text-green-600">Schema hợp lệ</span>
                            </>
                        ) : (
                            <>
                                <XCircle className="w-4 h-4 text-red-600" />
                                <span className="text-red-600">Schema có lỗi</span>
                            </>
                        )}
                    </div>

                    {/* Errors */}
                    {result.errors?.length > 0 && (
                        <div className="space-y-1">
                            {result.errors.map((err, i) => (
                                <div key={i} className="flex items-start gap-2 text-red-600">
                                    <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span className="text-xs">{err}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Warnings */}
                    {result.warnings?.length > 0 && (
                        <div className="space-y-1">
                            {result.warnings.map((warn, i) => (
                                <div key={i} className="flex items-start gap-2 text-amber-600">
                                    <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span className="text-xs">{warn}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Suggestions */}
                    {result.suggestions?.length > 0 && (
                        <div className="space-y-1 pt-2 border-t">
                            <span className="text-xs text-gray-500 font-medium">Gợi ý cải thiện:</span>
                            {result.suggestions.map((sug, i) => (
                                <div key={i} className="text-xs text-gray-600 dark:text-gray-400">
                                    • {sug}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
