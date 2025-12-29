'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
    Sparkles, Loader2, FileText, Hash, Lightbulb, X,
    ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Info,
    Search
} from 'lucide-react';

interface AIWritingAssistantProps {
    title: string;
    content: string;
    metaDescription?: string;
    excerpt?: string;
    onExcerptGenerated?: (excerpt: string) => void;
    onMetaGenerated?: (meta: string) => void;
}

interface SEOWarning {
    type: 'error' | 'warning' | 'info';
    field: string;
    message: string;
}

interface SEOCheckResult {
    score: number;
    warnings: SEOWarning[];
    suggestions: string[];
}

// Client-side SEO check function
function checkSEO(params: {
    title?: string;
    metaDescription?: string;
    content?: string;
    excerpt?: string;
}): SEOCheckResult {
    const warnings: SEOWarning[] = [];
    const suggestions: string[] = [];
    let score = 100;

    const { title, metaDescription, content, excerpt } = params;

    // Title checks
    if (title) {
        const titleLength = title.length;
        if (titleLength < 30) {
            warnings.push({
                type: 'warning',
                field: 'title',
                message: `Tiêu đề quá ngắn (${titleLength} ký tự). Nên từ 30-60 ký tự.`
            });
            score -= 15;
            suggestions.push('Mở rộng tiêu đề để bao gồm từ khóa và thu hút hơn');
        } else if (titleLength > 60) {
            warnings.push({
                type: 'error',
                field: 'title',
                message: `Tiêu đề quá dài (${titleLength} ký tự). Nên tối đa 60 ký tự.`
            });
            score -= 20;
            suggestions.push('Rút gọn tiêu đề, giữ lại từ khóa chính');
        }

        if (!/[0-9]/.test(title) && !/hướng dẫn|cách|mẹo|top/i.test(title)) {
            suggestions.push('Cân nhắc thêm số hoặc từ power words');
        }
    } else {
        warnings.push({
            type: 'error',
            field: 'title',
            message: 'Chưa có tiêu đề'
        });
        score -= 30;
    }

    // Meta description checks
    if (metaDescription) {
        const metaLength = metaDescription.length;
        if (metaLength < 120) {
            warnings.push({
                type: 'warning',
                field: 'meta_description',
                message: `Meta description ngắn (${metaLength} ký tự). Nên 120-160.`
            });
            score -= 10;
        } else if (metaLength > 160) {
            warnings.push({
                type: 'error',
                field: 'meta_description',
                message: `Meta description quá dài (${metaLength} ký tự). Sẽ bị cắt.`
            });
            score -= 15;
        }
    } else {
        warnings.push({
            type: 'warning',
            field: 'meta_description',
            message: 'Chưa có meta description'
        });
        score -= 10;
        suggestions.push('Thêm meta description để kiểm soát nội dung trên Google');
    }

    // Content checks
    if (content) {
        const textContent = content.replace(/<[^>]*>/g, ' ');
        const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;
        if (wordCount < 300) {
            warnings.push({
                type: 'warning',
                field: 'content',
                message: `Nội dung ngắn (${wordCount} từ). Nên >1000 từ.`
            });
            score -= 10;
        }
    }

    // Excerpt checks
    if (!excerpt) {
        warnings.push({
            type: 'info',
            field: 'excerpt',
            message: 'Chưa có excerpt'
        });
        score -= 5;
    }

    return {
        score: Math.max(0, score),
        warnings,
        suggestions
    };
}

export default function AIWritingAssistant({
    title,
    content,
    metaDescription,
    excerpt,
    onExcerptGenerated,
    onMetaGenerated
}: AIWritingAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);
    const [result, setResult] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [showSEO, setShowSEO] = useState(false);

    // Calculate SEO score whenever inputs change
    const seoResult = useMemo(() => {
        return checkSEO({ title, metaDescription, content, excerpt });
    }, [title, metaDescription, content, excerpt]);

    const callAI = async (action: string) => {
        setLoading(action);
        setError('');
        setResult('');

        try {
            const response = await fetch('/api/ai/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    title,
                    content,
                    topic: title,
                }),
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error);
            } else {
                setResult(data.content);

                // Auto-fill callbacks
                if (action === 'excerpt' && onExcerptGenerated) {
                    onExcerptGenerated(data.content);
                }
                if (action === 'meta' && onMetaGenerated) {
                    onMetaGenerated(data.content);
                }
            }
        } catch {
            setError('Không thể kết nối đến AI service');
        } finally {
            setLoading(null);
        }
    };

    const actions = [
        { id: 'excerpt', label: 'Tạo tóm tắt', icon: FileText, description: 'Tạo excerpt từ nội dung' },
        { id: 'meta', label: 'Meta SEO', icon: Hash, description: 'Tạo meta description' },
        { id: 'title', label: 'Gợi ý tiêu đề', icon: Lightbulb, description: 'Đề xuất 3 tiêu đề' },
        { id: 'outline', label: 'Dàn ý', icon: FileText, description: 'Tạo dàn ý bài viết' },
    ];

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
        if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    };

    const getWarningIcon = (type: 'error' | 'warning' | 'info') => {
        switch (type) {
            case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'info': return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="border border-purple-200 dark:border-purple-800 rounded-lg overflow-hidden">
            {/* Header */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-900 dark:text-purple-100">AI Writing Assistant</span>
                    {/* SEO Score Badge */}
                    <span className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full ${getScoreColor(seoResult.score)}`}>
                        SEO: {seoResult.score}
                    </span>
                </div>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-purple-600" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-purple-600" />
                )}
            </button>

            {/* Content */}
            {isOpen && (
                <div className="p-4 bg-white dark:bg-gray-900 space-y-4">
                    {/* SEO Checker Toggle */}
                    <button
                        type="button"
                        onClick={() => setShowSEO(!showSEO)}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Kiểm tra SEO</span>
                            {seoResult.warnings.length > 0 && (
                                <span className="px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded">
                                    {seoResult.warnings.length} vấn đề
                                </span>
                            )}
                        </div>
                        {showSEO ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* SEO Results */}
                    {showSEO && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                            {/* Score */}
                            <div className="flex items-center gap-3">
                                <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${getScoreColor(seoResult.score)}`}>
                                    {seoResult.score}/100
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {seoResult.score >= 80 ? (
                                        <span className="flex items-center gap-1 text-green-600">
                                            <CheckCircle className="w-4 h-4" /> Tốt
                                        </span>
                                    ) : seoResult.score >= 60 ? (
                                        'Cần cải thiện'
                                    ) : (
                                        'Cần khắc phục'
                                    )}
                                </div>
                            </div>

                            {/* Warnings */}
                            {seoResult.warnings.length > 0 && (
                                <div className="space-y-2">
                                    {seoResult.warnings.map((warning, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm">
                                            {getWarningIcon(warning.type)}
                                            <span className="text-gray-700 dark:text-gray-300">{warning.message}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Suggestions */}
                            {seoResult.suggestions.length > 0 && (
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-xs font-medium text-gray-500 mb-1">Gợi ý:</p>
                                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                        {seoResult.suggestions.map((s, i) => (
                                            <li key={i} className="flex items-center gap-1">
                                                <span className="w-1 h-1 bg-purple-500 rounded-full" />
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {actions.map((action) => {
                            const Icon = action.icon;
                            const isLoading = loading === action.id;
                            return (
                                <button
                                    key={action.id}
                                    type="button"
                                    onClick={() => callAI(action.id)}
                                    disabled={!!loading || (!title && action.id !== 'outline')}
                                    className="flex flex-col items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                                    ) : (
                                        <Icon className="w-5 h-5 text-purple-600" />
                                    )}
                                    <span className="text-xs mt-1 font-medium text-gray-900 dark:text-gray-100">{action.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Hint */}
                    {!title && (
                        <p className="text-xs text-gray-500 text-center">
                            💡 Nhập tiêu đề để bắt đầu sử dụng AI
                        </p>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Result */}
                    {result && (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setResult('')}
                                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Kết quả AI</span>
                                </div>
                                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {result}
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => navigator.clipboard.writeText(result)}
                                    >
                                        Copy
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
