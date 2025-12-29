'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Key, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VoyageKey {
    id: string;
    label: string;
    key: string;
    addedAt: string;
}

interface VoyageKeyManagerProps {
    keysJson: string;           // JSON string of VoyageKey[]
    activeKey: string;          // Current active key value
    onKeysChange: (json: string) => void;
    onActiveKeyChange: (key: string) => void;
}

export default function VoyageKeyManager({
    keysJson,
    activeKey,
    onKeysChange,
    onActiveKeyChange
}: VoyageKeyManagerProps) {
    // Parse keys safely
    const keys: VoyageKey[] = (() => {
        try {
            return keysJson ? JSON.parse(keysJson) : [];
        } catch {
            return [];
        }
    })();

    const [newKey, setNewKey] = useState('');
    const [newLabel, setNewLabel] = useState('');
    const [visibleKeyId, setVisibleKeyId] = useState<string | null>(null);

    const handleAdd = () => {
        if (!newKey.trim()) return;

        const newItem: VoyageKey = {
            id: Date.now().toString(),
            key: newKey.trim(),
            label: newLabel.trim() || `API Key ${keys.length + 1}`,
            addedAt: new Date().toISOString()
        };

        const newKeys = [...keys, newItem];
        onKeysChange(JSON.stringify(newKeys));

        // Auto select if it's the first key
        if (keys.length === 0) {
            onActiveKeyChange(newItem.key);
        }

        setNewKey('');
        setNewLabel('');
    };

    const handleDelete = (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa API key này?')) return;
        const newKeys = keys.filter(k => k.id !== id);
        onKeysChange(JSON.stringify(newKeys));

        // If deleted key was active, unset active
        const deletedKey = keys.find(k => k.id === id);
        if (deletedKey && deletedKey.key === activeKey) {
            onActiveKeyChange('');
        }
    };

    const toggleVisibility = (id: string) => {
        setVisibleKeyId(prev => prev === id ? null : id);
    };

    const maskKey = (key: string) => {
        if (key.length < 10) return '********';
        return `${key.substring(0, 5)}...${key.substring(key.length - 4)}`;
    };

    return (
        <div className="space-y-4">
            {/* List */}
            <div className="space-y-2">
                {keys.map((item) => (
                    <div
                        key={item.id}
                        className={cn(
                            "flex items-center justify-between p-3 rounded-lg border transition-all",
                            activeKey === item.key
                                ? "bg-golden/10 border-golden"
                                : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                        )}
                    >
                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer",
                                    activeKey === item.key ? "bg-golden text-white" : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                                )}
                                onClick={() => onActiveKeyChange(item.key)}
                                title={activeKey === item.key ? "Đang sử dụng" : "Bấm để chọn"}
                            >
                                {activeKey === item.key ? <CheckCircle2 className="w-5 h-5" /> : <Key className="w-4 h-4" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm truncate">{item.label}</span>
                                    {activeKey === item.key && (
                                        <Badge variant="outline" className="text-[10px] bg-golden/20 text-golden-dark border-golden/50 h-5">
                                            Active
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-mono mt-0.5">
                                    <span>
                                        {visibleKeyId === item.id ? item.key : maskKey(item.key)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => toggleVisibility(item.id)}
                                        className="hover:text-gray-900 dark:hover:text-gray-300"
                                    >
                                        {visibleKeyId === item.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                            className="text-gray-400 hover:text-red-500 shrink-0"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}

                {keys.length === 0 && (
                    <div className="text-center py-6 text-gray-500 text-sm border-2 border-dashed rounded-lg bg-gray-50 dark:bg-gray-900/50">
                        Chưa có API Key nào được lưu. Hãy thêm mới bên dưới.
                    </div>
                )}
            </div>

            {/* Add New */}
            <div className="flex gap-2 items-start pt-2 border-t">
                <div className="grid gap-2 flex-1">
                    <Input
                        placeholder="Nhập Voyage API Key (pa-...)"
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        className="font-mono text-sm"
                    />
                    <Input
                        placeholder="Tên gợi nhớ (Ví dụ: Key Free 1)"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        className="text-sm"
                    />
                </div>
                <Button
                    type="button"
                    onClick={handleAdd}
                    disabled={!newKey.trim()}
                    className="h-[88px]" // Match height of 2 inputs + gap
                >
                    <Plus className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
