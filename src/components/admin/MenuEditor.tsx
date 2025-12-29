'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { NavItem } from '@/types/settings';

interface MenuEditorProps {
    items: NavItem[];
    onChange: (items: NavItem[]) => void;
}

export default function MenuEditor({ items, onChange }: MenuEditorProps) {
    const [newItem, setNewItem] = useState<NavItem>({ href: '', label: '', label_en: '' });

    const addItem = () => {
        if (newItem.href && newItem.label) {
            onChange([...items, newItem]);
            setNewItem({ href: '', label: '', label_en: '' });
        }
    };

    const removeItem = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof NavItem, value: string) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === items.length - 1)
        ) {
            return;
        }

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        const updated = [...items];
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
        onChange(updated);
    };

    return (
        <div className="space-y-4">
            {/* Current Items */}
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                        <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />

                        <Input
                            value={item.label}
                            onChange={(e) => updateItem(index, 'label', e.target.value)}
                            placeholder="Tên menu"
                            className="flex-1"
                        />

                        <Input
                            value={item.label_en || ''}
                            onChange={(e) => updateItem(index, 'label_en', e.target.value)}
                            placeholder="Tên EN"
                            className="w-32"
                        />

                        <Input
                            value={item.href}
                            onChange={(e) => updateItem(index, 'href', e.target.value)}
                            placeholder="/duong-dan"
                            className="flex-1"
                        />

                        <div className="flex items-center gap-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => moveItem(index, 'up')}
                                disabled={index === 0}
                                className="h-8 w-8"
                            >
                                <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => moveItem(index, 'down')}
                                disabled={index === items.length - 1}
                                className="h-8 w-8"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(index)}
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add New Item */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 border-dashed">
                <Plus className="w-4 h-4 text-blue-500 flex-shrink-0" />

                <Input
                    value={newItem.label}
                    onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                    placeholder="Tên menu mới"
                    className="flex-1"
                />

                <Input
                    value={newItem.label_en || ''}
                    onChange={(e) => setNewItem({ ...newItem, label_en: e.target.value })}
                    placeholder="Tên EN"
                    className="w-32"
                />

                <Input
                    value={newItem.href}
                    onChange={(e) => setNewItem({ ...newItem, href: e.target.value })}
                    placeholder="/duong-dan"
                    className="flex-1"
                />

                <Button
                    type="button"
                    onClick={addItem}
                    disabled={!newItem.href || !newItem.label}
                    size="sm"
                >
                    Thêm
                </Button>
            </div>

            {items.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                    Chưa có menu item nào. Thêm item đầu tiên ở trên.
                </p>
            )}
        </div>
    );
}
