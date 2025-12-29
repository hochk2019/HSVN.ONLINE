'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Tag, FolderOpen, Check, AlertCircle } from 'lucide-react';

interface Category {
    id: string;
    name: string;
}

interface TagItem {
    id: string;
    name: string;
}

interface AISuggestProps {
    title: string;
    content: string;
    categories: Category[];
    tags: TagItem[];
    currentCategoryId?: string;
    currentTagIds: string[];
    onCategorySuggested?: (categoryId: string, reason: string) => void;
    onTagsSuggested?: (tagIds: string[], newTags: string[]) => void;
}

export default function AISuggest({
    title,
    content,
    categories,
    tags,
    currentCategoryId,
    currentTagIds,
    onCategorySuggested,
    onTagsSuggested,
}: AISuggestProps) {
    const [loading, setLoading] = useState<'category' | 'tags' | null>(null);
    const [categoryResult, setCategoryResult] = useState<{
        id: string;
        name: string;
        confidence: number;
        reason: string;
    } | null>(null);
    const [tagsResult, setTagsResult] = useState<{
        suggested: TagItem[];
        newTags: string[];
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Extract plain text from HTML content
    const getPlainText = (html: string): string => {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    };

    const suggestCategory = async () => {
        if (!title || !content) {
            setError('Cần có tiêu đề và nội dung để AI phân tích');
            return;
        }

        setLoading('category');
        setError(null);

        try {
            const response = await fetch('/api/ai/classify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'category',
                    title,
                    content: getPlainText(content).substring(0, 3000),
                    categories: categories.map(c => ({ id: c.id, name: c.name })),
                }),
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error);
            } else if (data.recommendedId) {
                const category = categories.find(c => c.id === data.recommendedId);
                if (category) {
                    setCategoryResult({
                        id: category.id,
                        name: category.name,
                        confidence: data.confidence || 0.8,
                        reason: data.reason || '',
                    });
                }
            }
        } catch {
            setError('Không thể kết nối đến AI service');
        } finally {
            setLoading(null);
        }
    };

    const suggestTags = async () => {
        if (!title || !content) {
            setError('Cần có tiêu đề và nội dung để AI phân tích');
            return;
        }

        setLoading('tags');
        setError(null);

        try {
            const response = await fetch('/api/ai/classify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'tags',
                    title,
                    content: getPlainText(content).substring(0, 3000),
                    tags: tags.map(t => ({ id: t.id, name: t.name })),
                }),
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error);
            } else {
                const suggestedTags = (data.suggestedTagIds || [])
                    .map((id: string) => tags.find(t => t.id === id))
                    .filter(Boolean) as TagItem[];

                setTagsResult({
                    suggested: suggestedTags,
                    newTags: data.newTagSuggestions || [],
                });
            }
        } catch {
            setError('Không thể kết nối đến AI service');
        } finally {
            setLoading(null);
        }
    };

    const applyCategory = () => {
        if (categoryResult && onCategorySuggested) {
            onCategorySuggested(categoryResult.id, categoryResult.reason);
            setCategoryResult(null);
        }
    };

    const applyTags = () => {
        if (tagsResult && onTagsSuggested) {
            const tagIds = tagsResult.suggested.map(t => t.id);
            onTagsSuggested(tagIds, tagsResult.newTags);
            setTagsResult(null);
        }
    };

    return (
        <div className="space-y-4 p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <Sparkles className="w-5 h-5" />
                <h4 className="font-semibold">AI Gợi ý</h4>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={suggestCategory}
                    disabled={loading !== null}
                    className="bg-white dark:bg-gray-800"
                >
                    {loading === 'category' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <FolderOpen className="w-4 h-4 mr-2 text-blue-600" />
                    )}
                    Gợi ý danh mục
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={suggestTags}
                    disabled={loading !== null}
                    className="bg-white dark:bg-gray-800"
                >
                    {loading === 'tags' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Tag className="w-4 h-4 mr-2 text-green-600" />
                    )}
                    Gợi ý tags
                </Button>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* Category Result */}
            {categoryResult && (
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Danh mục đề xuất:</span>
                        <span className="text-xs text-gray-500">
                            Độ tin cậy: {Math.round(categoryResult.confidence * 100)}%
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded text-sm font-medium">
                            {categoryResult.name}
                        </span>
                        <Button type="button" size="sm" onClick={applyCategory}>
                            <Check className="w-4 h-4 mr-1" />
                            Áp dụng
                        </Button>
                    </div>
                    {categoryResult.reason && (
                        <p className="text-xs text-gray-500 mt-2">{categoryResult.reason}</p>
                    )}
                </div>
            )}

            {/* Tags Result */}
            {tagsResult && (tagsResult.suggested.length > 0 || tagsResult.newTags.length > 0) && (
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Tags đề xuất:</span>
                        <Button type="button" size="sm" onClick={applyTags}>
                            <Check className="w-4 h-4 mr-1" />
                            Áp dụng
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {tagsResult.suggested.map(tag => (
                            <span
                                key={tag.id}
                                className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded text-xs"
                            >
                                {tag.name}
                            </span>
                        ))}
                        {tagsResult.newTags.map(name => (
                            <span
                                key={name}
                                className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded text-xs"
                            >
                                + {name} (mới)
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
