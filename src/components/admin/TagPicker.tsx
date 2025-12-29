'use client';

import { useState } from 'react';
import { X, Plus, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TagItem {
    id: string;
    name: string;
    slug: string;
}

interface TagPickerProps {
    availableTags: TagItem[];
    selectedTagIds: string[];
    onChange: (tagIds: string[]) => void;
    onTagCreated?: (newTag: TagItem) => void;
}

// Generate slug from name
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

export default function TagPicker({
    availableTags,
    selectedTagIds,
    onChange,
    onTagCreated
}: TagPickerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [localTags, setLocalTags] = useState<TagItem[]>([]);

    // Combine available tags with newly created local tags
    const allTags = [...availableTags, ...localTags];

    const selectedTags = allTags.filter(tag => selectedTagIds.includes(tag.id));
    const unselectedTags = allTags.filter(tag => !selectedTagIds.includes(tag.id));

    const addTag = (tagId: string) => {
        if (!selectedTagIds.includes(tagId)) {
            onChange([...selectedTagIds, tagId]);
        }
    };

    const removeTag = (tagId: string) => {
        onChange(selectedTagIds.filter(id => id !== tagId));
    };

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;

        setIsCreating(true);
        setError(null);

        try {
            const response = await fetch('/api/admin/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newTagName.trim(),
                    slug: generateSlug(newTagName.trim())
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Không thể tạo tag');
            }

            const newTag: TagItem = await response.json();

            // Add to local tags list
            setLocalTags(prev => [...prev, newTag]);

            // Auto-select the new tag
            addTag(newTag.id);

            // Notify parent if callback provided
            onTagCreated?.(newTag);

            // Reset form
            setNewTagName('');
            setIsAdding(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
        } finally {
            setIsCreating(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCreateTag();
        } else if (e.key === 'Escape') {
            setIsAdding(false);
            setNewTagName('');
            setError(null);
        }
    };

    return (
        <div className="space-y-3">
            {/* Selected Tags */}
            <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                    <span
                        key={tag.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-golden/20 text-golden-dark rounded-md text-sm"
                    >
                        <Tag className="w-3 h-3" />
                        {tag.name}
                        <button
                            type="button"
                            onClick={() => removeTag(tag.id)}
                            className="hover:text-red-500 ml-1"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                {selectedTags.length === 0 && (
                    <span className="text-sm text-gray-400">Chưa chọn tag nào</span>
                )}
            </div>

            {/* Available Tags Dropdown */}
            {unselectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {unselectedTags.slice(0, 10).map(tag => (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => addTag(tag.id)}
                            className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-golden/20 rounded transition-colors"
                        >
                            + {tag.name}
                        </button>
                    ))}
                    {unselectedTags.length > 10 && (
                        <span className="text-xs text-gray-400 self-center">
                            +{unselectedTags.length - 10} more
                        </span>
                    )}
                </div>
            )}

            {/* Add New Tag */}
            {isAdding ? (
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <Input
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Tên tag mới..."
                            className="text-sm h-8"
                            disabled={isCreating}
                            autoFocus
                        />
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleCreateTag}
                            disabled={!newTagName.trim() || isCreating}
                            className="h-8"
                        >
                            {isCreating ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                'Tạo'
                            )}
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                setIsAdding(false);
                                setNewTagName('');
                                setError(null);
                            }}
                            disabled={isCreating}
                            className="h-8"
                        >
                            Hủy
                        </Button>
                    </div>
                    {error && (
                        <p className="text-xs text-red-500">{error}</p>
                    )}
                </div>
            ) : (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAdding(true)}
                    className="text-xs"
                >
                    <Plus className="w-3 h-3 mr-1" />
                    Thêm tag mới
                </Button>
            )}
        </div>
    );
}
