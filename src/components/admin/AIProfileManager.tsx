'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Edit2, CheckCircle2, Eye, EyeOff, Save, X, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AIProfile {
    id: string;
    name: string;
    description?: string;
    baseUrl: string;
    apiKey: string;
    model: string;
    updatedAt: string;
}

interface AIProfileManagerProps {
    profilesJson: string;           // JSON string of AIProfile[]
    activeProfileId: string;        // Current active profile ID
    onProfilesChange: (json: string) => void;
    onActiveProfileIdChange: (id: string) => void;
}

export default function AIProfileManager({
    profilesJson,
    activeProfileId,
    onProfilesChange,
    onActiveProfileIdChange
}: AIProfileManagerProps) {
    // Parse profiles safely
    const profiles: AIProfile[] = (() => {
        try {
            return profilesJson ? JSON.parse(profilesJson) : [];
        } catch {
            return [];
        }
    })();

    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [visibleKeyId, setVisibleKeyId] = useState<string | null>(null);
    const [isTesting, setIsTesting] = useState(false);

    // Form state
    const [formData, setFormData] = useState<Partial<AIProfile>>({
        name: '',
        baseUrl: 'https://openrouter.ai/api/v1',
        apiKey: '',
        model: 'google/gemma-2-9b-it:free'
    });

    const resetForm = () => {
        setFormData({
            name: '',
            baseUrl: 'https://openrouter.ai/api/v1',
            apiKey: '',
            model: 'google/gemma-2-9b-it:free'
        });
        setIsEditing(false);
        setEditingId(null);
    };

    const handleEdit = (profile: AIProfile) => {
        setFormData(profile);
        setEditingId(profile.id);
        setIsEditing(true);
    };

    const handleSave = () => {
        if (!formData.name || !formData.baseUrl || !formData.model) {
            alert('Vui lòng nhập đầy đủ Tên, Base URL và Model');
            return;
        }

        const now = new Date().toISOString();
        let newProfiles = [...profiles];

        if (editingId) {
            // Update existing
            newProfiles = newProfiles.map(p =>
                p.id === editingId
                    ? { ...p, ...formData, updatedAt: now } as AIProfile
                    : p
            );
        } else {
            // Add new
            const newProfile: AIProfile = {
                id: Date.now().toString(),
                name: formData.name!,
                description: formData.description || '',
                baseUrl: formData.baseUrl!,
                apiKey: formData.apiKey || '',
                model: formData.model!,
                updatedAt: now
            };
            newProfiles.push(newProfile);

            // Auto select if first one
            if (profiles.length === 0) {
                onActiveProfileIdChange(newProfile.id);
            }
        }

        onProfilesChange(JSON.stringify(newProfiles));
        resetForm();
    };

    const handleDelete = (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa cấu hình này?')) return;
        const newProfiles = profiles.filter(p => p.id !== id);
        onProfilesChange(JSON.stringify(newProfiles));

        if (activeProfileId === id) {
            onActiveProfileIdChange('');
        }
    };

    const maskKey = (key: string) => {
        if (!key) return 'Not configured';
        if (key.length < 8) return '********';
        return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
    };

    const handleTestConnection = async () => {
        if (!formData.apiKey || !formData.baseUrl || !formData.model) {
            alert('Vui lòng nhập đầy đủ Base URL, API Key và Model để kiểm tra.');
            return;
        }

        setIsTesting(true);
        try {
            const res = await fetch('/api/ai/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    baseUrl: formData.baseUrl,
                    apiKey: formData.apiKey,
                    model: formData.model
                })
            });

            const data = await res.json();
            if (data.success) {
                alert(data.message);
            } else {
                alert('Kết nối thất bại:\n' + data.message);
            }
        } catch (error: any) {
            alert('Lỗi kết nối: ' + error.message);
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* List */}
            <div className="grid gap-3">
                {profiles.map((profile) => (
                    <div
                        key={profile.id}
                        className={cn(
                            "group relative flex flex-col sm:flex-row gap-4 p-4 rounded-xl border transition-all",
                            activeProfileId === profile.id
                                ? "bg-golden/5 border-golden shadow-sm"
                                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-golden/50"
                        )}
                    >
                        {/* Active Indicator & content */}
                        <div className="flex items-start gap-4 flex-1">
                            <button
                                type="button"
                                onClick={() => onActiveProfileIdChange(profile.id)}
                                className={cn(
                                    "mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                    activeProfileId === profile.id
                                        ? "bg-golden text-white"
                                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                )}
                                title={activeProfileId === profile.id ? "Đang sử dụng" : "Bấm để chọn"}
                            >
                                {activeProfileId === profile.id && <CheckCircle2 className="w-4 h-4" />}
                            </button>

                            <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                        {profile.name}
                                    </h3>
                                    {activeProfileId === profile.id && (
                                        <Badge className="bg-golden text-white hover:bg-golden/90">Active</Badge>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 font-mono space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="opacity-70">URL:</span>
                                        <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{profile.baseUrl}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="opacity-70">Model:</span>
                                        <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-golden-dark">{profile.model}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="opacity-70">Key:</span>
                                        <div className="flex items-center gap-1">
                                            <span>{visibleKeyId === profile.id ? profile.apiKey : maskKey(profile.apiKey)}</span>
                                            <button
                                                type="button"
                                                onClick={() => setVisibleKeyId(prev => prev === profile.id ? null : profile.id)}
                                                className="hover:text-black opacity-50 hover:opacity-100"
                                            >
                                                {visibleKeyId === profile.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-row sm:flex-col gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => handleEdit(profile)}
                                className="h-8 w-8"
                            >
                                <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(profile.id)}
                                className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {profiles.length === 0 && !isEditing && (
                    <div className="text-center py-8 border-2 border-dashed rounded-xl bg-gray-50/50">
                        <Bot className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">Chưa có hồ sơ AI nào</p>
                        <Button variant="link" onClick={() => setIsEditing(true)}>
                            + Thêm hồ sơ đầu tiên
                        </Button>
                    </div>
                )}
            </div>

            {/* Edit/Add Form */}
            {isEditing ? (
                <div className="bg-gray-50 dark:bg-gray-900/50 border rounded-xl p-4 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">
                            {editingId ? 'Chỉnh sửa hồ sơ' : 'Thêm hồ sơ mới'}
                        </h3>
                        <Button variant="ghost" size="icon" onClick={resetForm} className="h-6 w-6">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium">Tên hiển thị</label>
                            <Input
                                placeholder="Ví dụ: OpenRouter Gemma"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium">Model ID</label>
                            <Input
                                placeholder="google/gemma-2-9b-it:free"
                                value={formData.model}
                                onChange={e => setFormData({ ...formData, model: e.target.value })}
                                className="font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium">Base URL</label>
                            <Input
                                placeholder="https://openrouter.ai/api/v1"
                                value={formData.baseUrl}
                                onChange={e => setFormData({ ...formData, baseUrl: e.target.value })}
                                className="font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium">API Key</label>
                            <div className="relative">
                                <Input
                                    type="password"
                                    placeholder="sk-or-..."
                                    value={formData.apiKey}
                                    onChange={e => setFormData({ ...formData, apiKey: e.target.value })}
                                    className="pr-8"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between w-full pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={handleTestConnection}
                            disabled={isTesting || !formData.apiKey}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
                        >
                            {isTesting ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Đang kiểm tra...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Bot className="w-4 h-4" />
                                    Test kết nối
                                </span>
                            )}
                        </Button>

                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={resetForm}>Hủy</Button>
                            <Button size="sm" onClick={handleSave} className="bg-golden hover:bg-golden-dark text-white">
                                <Save className="w-4 h-4 mr-1" />
                                Lưu cấu hình
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => { resetForm(); setIsEditing(true); }}
                    className="w-full border-dashed"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm cấu hình AI
                </Button>
            )}
        </div>
    );
}
