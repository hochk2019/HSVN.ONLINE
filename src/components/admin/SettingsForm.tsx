'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Settings, Globe, Facebook, Save, Shield, Palette, Check, Menu,
    MousePointerClick, BarChart3, AlertCircle, Building, Bot, Sparkles,
    ChevronRight, PanelLeft, PanelLeftClose, FileText
} from 'lucide-react';
import { updateSettings } from '@/lib/settings-actions';
import MenuEditor from './MenuEditor';
import AIModelsEditor from './AIModelsEditor';
import VoyageKeyManager from './VoyageKeyManager';
import AIProfileManager from './AIProfileManager';
import type { NavItem } from '@/types/settings';
import { cn } from '@/lib/utils';

interface SettingsFormProps {
    initialSettings: Record<string, string>;
}

const defaultMenuItems: NavItem[] = [
    { href: '/phan-mem', label: 'Phần mềm' },
    { href: '/cong-van', label: 'Công văn' },
    { href: '/hs-code', label: 'HS Code' },
    { href: '/thu-tuc-hai-quan', label: 'Thủ tục HQ' },
    { href: '/gioi-thieu', label: 'Giới thiệu' },
    { href: '/lien-he', label: 'Liên hệ' },
];

// Tab configuration
const tabs = [
    { id: 'general', label: 'Thông tin chung', icon: Building },
    { id: 'homepage', label: 'Trang chủ', icon: Globe },
    { id: 'ai', label: 'Cấu hình AI', icon: Bot },
    { id: 'seo', label: 'SEO & Analytics', icon: Shield },
    { id: 'appearance', label: 'Giao diện', icon: Palette },
    { id: 'static', label: 'Nội dung tĩnh', icon: FileText },
];

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
    const [settings, setSettings] = useState(initialSettings);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const router = useRouter();

    const [menuItems, setMenuItems] = useState<NavItem[]>(() => {
        try {
            if (initialSettings.menu_items) {
                return JSON.parse(initialSettings.menu_items);
            }
        } catch {
            // Use default
        }
        return defaultMenuItems;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formData = new FormData();

            Object.entries(settings).forEach(([key, value]) => {
                if (key !== 'menu_items') {
                    formData.append(key, value);
                }
            });

            formData.append('menu_items', JSON.stringify(menuItems));

            const result = await updateSettings(formData);
            if (result.error) {
                alert('Lỗi: ' + result.error);
            } else {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
                router.refresh();
            }
        } catch {
            alert('Lỗi lưu cài đặt');
        } finally {
            setSaving(false);
        }
    };

    const updateField = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="min-h-[calc(100vh-120px)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-heading text-2xl font-bold">Cài đặt</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Quản lý cấu hình hệ thống
                    </p>
                </div>
                <Button type="submit" disabled={saving} size="lg">
                    {saved ? (
                        <>
                            <Check className="w-4 h-4 mr-2" />
                            Đã lưu
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </>
                    )}
                </Button>
            </div>

            <div className="flex gap-6">
                {/* Sidebar Navigation */}
                <div className={cn(
                    "shrink-0 transition-all duration-300",
                    sidebarCollapsed ? "w-14" : "w-56"
                )}>
                    <nav className="sticky top-6 space-y-1">
                        {/* Collapse Toggle Button */}
                        <button
                            type="button"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 mb-3 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-dashed border-gray-300 dark:border-gray-700"
                            title={sidebarCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
                        >
                            {sidebarCollapsed ? (
                                <PanelLeft className="w-4 h-4" />
                            ) : (
                                <>
                                    <PanelLeftClose className="w-4 h-4" />
                                    <span>Thu gọn</span>
                                </>
                            )}
                        </button>

                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                title={sidebarCollapsed ? tab.label : undefined}
                                className={cn(
                                    "w-full flex items-center rounded-lg text-sm font-medium transition-all",
                                    sidebarCollapsed ? "justify-center px-3 py-3" : "gap-3 px-4 py-3 text-left",
                                    activeTab === tab.id
                                        ? "bg-golden text-white shadow-lg shadow-golden/20"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                )}
                            >
                                <tab.icon className="w-5 h-5 shrink-0" />
                                {!sidebarCollapsed && (
                                    <>
                                        <span className="flex-1">{tab.label}</span>
                                        {activeTab === tab.id && <ChevronRight className="w-4 h-4" />}
                                    </>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    {/* Tab: General */}
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="w-5 h-5 text-golden" />
                                        Thông tin công ty
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Tên website</label>
                                        <Input
                                            value={settings.site_name || ''}
                                            onChange={(e) => updateField('site_name', e.target.value)}
                                            placeholder="Golden Logistics"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Tên công ty</label>
                                        <Input
                                            value={settings.company_name || ''}
                                            onChange={(e) => updateField('company_name', e.target.value)}
                                            placeholder="Công ty TNHH Tiếp Vận Hoàng Kim"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Tên công ty (EN)</label>
                                        <Input
                                            value={settings.company_name_en || ''}
                                            onChange={(e) => updateField('company_name_en', e.target.value)}
                                            placeholder="Golden Logistics Co., Ltd"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Email liên hệ</label>
                                        <Input
                                            type="email"
                                            value={settings.contact_email || ''}
                                            onChange={(e) => updateField('contact_email', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Số điện thoại</label>
                                        <Input
                                            value={settings.contact_phone || ''}
                                            onChange={(e) => updateField('contact_phone', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Facebook URL</label>
                                        <Input
                                            value={settings.facebook_url || ''}
                                            onChange={(e) => updateField('facebook_url', e.target.value)}
                                            placeholder="https://facebook.com/yourpage"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">Địa chỉ</label>
                                        <Input
                                            value={settings.contact_address || ''}
                                            onChange={(e) => updateField('contact_address', e.target.value)}
                                            placeholder="TP. Hồ Chí Minh, Việt Nam"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">Mô tả website</label>
                                        <textarea
                                            value={settings.site_description || ''}
                                            onChange={(e) => updateField('site_description', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm resize-none"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">Giờ làm việc</label>
                                        <textarea
                                            value={settings.working_hours || ''}
                                            onChange={(e) => updateField('working_hours', e.target.value)}
                                            rows={2}
                                            placeholder="Thứ 2 - Thứ 6: 8:00 - 17:30&#10;Thứ 7: 8:00 - 12:00"
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm resize-none"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Tab: Homepage */}
                    {activeTab === 'homepage' && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-golden" />
                                        Hero Section
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">Tiêu đề Hero</label>
                                        <Input
                                            value={settings.hero_title || ''}
                                            onChange={(e) => updateField('hero_title', e.target.value)}
                                            placeholder="Golden Logistics..."
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">Tiêu đề Hero (EN)</label>
                                        <Input
                                            value={settings.hero_title_en || ''}
                                            onChange={(e) => updateField('hero_title_en', e.target.value)}
                                            placeholder="Golden Logistics..."
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">Phụ đề Hero</label>
                                        <textarea
                                            value={settings.hero_subtitle || ''}
                                            onChange={(e) => updateField('hero_subtitle', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm resize-none"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">Phụ đề Hero (EN)</label>
                                        <textarea
                                            value={settings.hero_subtitle_en || ''}
                                            onChange={(e) => updateField('hero_subtitle_en', e.target.value)}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm resize-none"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MousePointerClick className="w-5 h-5 text-golden" />
                                        Nút CTA
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-4">
                                        <h4 className="font-medium text-sm text-golden">Nút chính (Primary)</h4>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Text</label>
                                            <Input
                                                value={settings.cta_primary_text || ''}
                                                onChange={(e) => updateField('cta_primary_text', e.target.value)}
                                                placeholder="Xem phần mềm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Text (EN)</label>
                                            <Input
                                                value={settings.cta_primary_text_en || ''}
                                                onChange={(e) => updateField('cta_primary_text_en', e.target.value)}
                                                placeholder="View Software"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">URL</label>
                                            <Input
                                                value={settings.cta_primary_url || ''}
                                                onChange={(e) => updateField('cta_primary_url', e.target.value)}
                                                placeholder="/phan-mem"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-4">
                                        <h4 className="font-medium text-sm">Nút phụ (Secondary)</h4>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Text</label>
                                            <Input
                                                value={settings.cta_secondary_text || ''}
                                                onChange={(e) => updateField('cta_secondary_text', e.target.value)}
                                                placeholder="Liên hệ tư vấn"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Text (EN)</label>
                                            <Input
                                                value={settings.cta_secondary_text_en || ''}
                                                onChange={(e) => updateField('cta_secondary_text_en', e.target.value)}
                                                placeholder="Contact Us"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">URL</label>
                                            <Input
                                                value={settings.cta_secondary_url || ''}
                                                onChange={(e) => updateField('cta_secondary_url', e.target.value)}
                                                placeholder="/lien-he"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-golden" />
                                        Số liệu thống kê
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Khách hàng</label>
                                        <Input
                                            value={settings.stat_customers || ''}
                                            onChange={(e) => updateField('stat_customers', e.target.value)}
                                            placeholder="500+"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Lượt tải</label>
                                        <Input
                                            value={settings.stat_downloads || ''}
                                            onChange={(e) => updateField('stat_downloads', e.target.value)}
                                            placeholder="10,000+"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Đánh giá</label>
                                        <Input
                                            value={settings.stat_rating || ''}
                                            onChange={(e) => updateField('stat_rating', e.target.value)}
                                            placeholder="4.9"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Năm KN</label>
                                        <Input
                                            value={settings.stat_years || ''}
                                            onChange={(e) => updateField('stat_years', e.target.value)}
                                            placeholder="5+"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Menu className="w-5 h-5 text-golden" />
                                        Menu điều hướng
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Tự động thêm chuyên mục mới</p>
                                            <p className="text-xs text-gray-500">Khi tạo chuyên mục mới, tự động thêm vào menu header</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.menu_auto_categories === 'true'}
                                                onChange={(e) => updateField('menu_auto_categories', e.target.checked ? 'true' : 'false')}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-golden/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-golden"></div>
                                        </label>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Kéo thả để sắp xếp thứ tự menu trên header. Hỗ trợ menu dropdown cho chuyên mục con.
                                    </p>
                                    <MenuEditor items={menuItems} onChange={setMenuItems} />
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Tab: AI */}
                    {activeTab === 'ai' && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bot className="w-5 h-5 text-golden" />
                                        AI Profiles
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Quản lý các cấu hình AI (OpenRouter, OpenAI, Local LLM...)
                                    </p>
                                    <AIProfileManager
                                        profilesJson={settings.ai_profiles ||
                                            ((settings.ai_base_url || settings.ai_model) ? JSON.stringify([{
                                                id: 'default',
                                                name: 'Mặc định (OpenRouter)',
                                                baseUrl: settings.ai_base_url || 'https://openrouter.ai/api/v1',
                                                apiKey: '',
                                                model: settings.ai_model || 'google/gemma-2-9b-it:free',
                                                updatedAt: new Date().toISOString()
                                            }]) : '[]')
                                        }
                                        activeProfileId={settings.ai_active_profile_id || (settings.ai_base_url ? 'default' : '')}
                                        onProfilesChange={(json) => updateField('ai_profiles', json)}
                                        onActiveProfileIdChange={(id) => updateField('ai_active_profile_id', id)}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Models Fallback</span>
                                        <a
                                            href="https://openrouter.ai/models?max_price=0"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-500 hover:underline font-normal"
                                        >
                                            Xem models miễn phí →
                                        </a>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-gray-500 mb-3">
                                        Khi model chính không phản hồi, hệ thống sẽ thử lần lượt các model bên dưới.
                                    </p>
                                    <AIModelsEditor
                                        value={settings.ai_fallback_models || ''}
                                        onChange={(value) => updateField('ai_fallback_models', value)}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            🚀 Voyage AI (RAG)
                                        </span>
                                        <a
                                            href="https://dashboard.voyageai.com/api-keys"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-500 hover:underline font-normal"
                                        >
                                            Lấy API key →
                                        </a>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <VoyageKeyManager
                                        keysJson={settings.voyage_api_keys ||
                                            (settings.voyage_api_key ? JSON.stringify([{
                                                id: 'migrated-1',
                                                label: 'Key hiện tại',
                                                key: settings.voyage_api_key,
                                                addedAt: new Date().toISOString()
                                            }]) : '[]')
                                        }
                                        activeKey={settings.voyage_api_key || ''}
                                        onKeysChange={(json) => updateField('voyage_api_keys', json)}
                                        onActiveKeyChange={(key) => updateField('voyage_api_key', key)}
                                    />

                                    <div className="pt-4 border-t">
                                        <label className="block text-sm font-medium mb-2">Voyage Model</label>
                                        <select
                                            value={settings.voyage_model || 'voyage-3.5-lite'}
                                            onChange={(e) => updateField('voyage_model', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm"
                                        >
                                            {(settings.voyage_models_list || 'voyage-3.5-lite').split('\n').map((js: string) => {
                                                const m = js.trim();
                                                return m ? <option key={m} value={m}>{m}</option> : null;
                                            })}
                                            {!settings.voyage_models_list?.includes('voyage-3.5-lite') && (
                                                <option value="voyage-3.5-lite">voyage-3.5-lite (Mặc định)</option>
                                            )}
                                        </select>
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            Nếu đổi model, bạn PHẢI Re-Index lại dữ liệu.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Tab: SEO */}
                    {activeTab === 'seo' && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-golden" />
                                        SEO mặc định
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Meta Title</label>
                                        <Input
                                            value={settings.default_meta_title || ''}
                                            onChange={(e) => updateField('default_meta_title', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Meta Description</label>
                                        <textarea
                                            value={settings.default_meta_description || ''}
                                            onChange={(e) => updateField('default_meta_description', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Google Analytics ID</label>
                                        <Input
                                            value={settings.google_analytics || ''}
                                            onChange={(e) => updateField('google_analytics', e.target.value)}
                                            placeholder="G-XXXXXXXXXX"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Lấy từ Google Analytics 4</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Microsoft Clarity ID</label>
                                        <Input
                                            value={settings.microsoft_clarity || ''}
                                            onChange={(e) => updateField('microsoft_clarity', e.target.value)}
                                            placeholder="xxxxxxxxxx"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Miễn phí. Heatmaps, session recordings. <a href="https://clarity.microsoft.com" target="_blank" rel="noopener" className="text-golden hover:underline">Đăng ký tại clarity.microsoft.com</a></p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Google Search Console Verification</label>
                                        <Input
                                            value={settings.google_site_verification || ''}
                                            onChange={(e) => updateField('google_site_verification', e.target.value)}
                                            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Meta tag content từ Search Console (HTML tag method)</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Facebook className="w-5 h-5 text-golden" />
                                        Facebook
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">App ID</label>
                                            <Input
                                                value={settings.facebook_app_id || ''}
                                                onChange={(e) => updateField('facebook_app_id', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Page URL</label>
                                            <Input
                                                value={settings.facebook_page || ''}
                                                onChange={(e) => updateField('facebook_page', e.target.value)}
                                                placeholder="https://facebook.com/yourpage"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Facebook Pixel ID</label>
                                        <Input
                                            value={settings.facebook_pixel_id || ''}
                                            onChange={(e) => updateField('facebook_pixel_id', e.target.value)}
                                            placeholder="XXXXXXXXXXXXXXX"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Dùng cho Facebook Ads tracking. Lấy từ Facebook Business Manager</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="fb_comments"
                                            checked={settings.enable_facebook_comments === 'true'}
                                            onChange={(e) => updateField('enable_facebook_comments', e.target.checked ? 'true' : 'false')}
                                            className="rounded border-gray-300"
                                        />
                                        <label htmlFor="fb_comments" className="text-sm">
                                            Bật bình luận Facebook
                                        </label>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Tab: Appearance */}
                    {activeTab === 'appearance' && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Palette className="w-5 h-5 text-golden" />
                                        Giao diện
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Màu chủ đạo (nút, liên kết, icon...)</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={settings.primary_color || '#d4a54a'}
                                                onChange={(e) => updateField('primary_color', e.target.value)}
                                                className="w-12 h-12 rounded-lg border-0 cursor-pointer shadow-md"
                                            />
                                            <Input
                                                value={settings.primary_color || '#d4a54a'}
                                                onChange={(e) => updateField('primary_color', e.target.value)}
                                                className="flex-1 max-w-[200px]"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Áp dụng cho: nút CTA, liên kết, icon, border, hover effects...</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Màu tiêu đề (heading)</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={settings.heading_color || '#0F172A'}
                                                onChange={(e) => updateField('heading_color', e.target.value)}
                                                className="w-12 h-12 rounded-lg border-0 cursor-pointer shadow-md"
                                            />
                                            <Input
                                                value={settings.heading_color || '#0F172A'}
                                                onChange={(e) => updateField('heading_color', e.target.value)}
                                                className="flex-1 max-w-[200px]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => updateField('heading_color', '')}
                                                className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Áp dụng cho: tiêu đề h1, h2, h3 của các trang, chuyên mục, bài viết...</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Logo URL</label>
                                            <Input
                                                value={settings.logo_url || ''}
                                                onChange={(e) => updateField('logo_url', e.target.value)}
                                                placeholder="/logo.png"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Favicon URL</label>
                                            <Input
                                                value={settings.favicon_url || ''}
                                                onChange={(e) => updateField('favicon_url', e.target.value)}
                                                placeholder="/favicon.ico"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Tab: Static Content */}
                    {activeTab === 'static' && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-golden" />
                                        Trang Chính sách & Điều khoản
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <p className="text-sm text-gray-500">
                                        Nội dung sẽ hiển thị trên trang <a href="/chinh-sach" target="_blank" className="text-golden hover:underline">/chinh-sach</a>. Sử dụng HTML cơ bản (p, ul, li, strong, em).
                                    </p>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">1. Chính sách bảo mật</label>
                                        <textarea
                                            value={settings.policy_privacy || ''}
                                            onChange={(e) => updateField('policy_privacy', e.target.value)}
                                            rows={6}
                                            placeholder="Nội dung về chính sách bảo mật, thu thập và sử dụng thông tin..."
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm font-mono resize-y"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">2. Điều khoản sử dụng</label>
                                        <textarea
                                            value={settings.policy_terms || ''}
                                            onChange={(e) => updateField('policy_terms', e.target.value)}
                                            rows={6}
                                            placeholder="Nội dung về điều khoản sử dụng website và phần mềm..."
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm font-mono resize-y"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">3. Tuyên bố miễn trừ trách nhiệm</label>
                                        <textarea
                                            value={settings.policy_disclaimer || ''}
                                            onChange={(e) => updateField('policy_disclaimer', e.target.value)}
                                            rows={4}
                                            placeholder="Nội dung tuyên bố miễn trừ trách nhiệm..."
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm font-mono resize-y"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Trang Giới thiệu */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="w-5 h-5 text-golden" />
                                        Trang Giới thiệu
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <p className="text-sm text-gray-500">
                                        Nội dung sẽ hiển thị trên trang <a href="/gioi-thieu" target="_blank" className="text-golden hover:underline">/gioi-thieu</a>.
                                    </p>

                                    {/* Mô tả công ty */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Mô tả công ty (đoạn 1)</label>
                                        <textarea
                                            value={settings.about_description_1 || ''}
                                            onChange={(e) => updateField('about_description_1', e.target.value)}
                                            rows={3}
                                            placeholder="Golden Logistics là công ty chuyên cung cấp các giải pháp về logistics..."
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm resize-y"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Mô tả công ty (đoạn 2)</label>
                                        <textarea
                                            value={settings.about_description_2 || ''}
                                            onChange={(e) => updateField('about_description_2', e.target.value)}
                                            rows={3}
                                            placeholder="Với đội ngũ nhân viên giàu kinh nghiệm và am hiểu sâu về nghiệp vụ hải quan..."
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm resize-y"
                                        />
                                    </div>

                                    {/* Số liệu thống kê */}
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                        <h4 className="font-medium text-sm mb-3">Số liệu thống kê</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Số liệu 1</label>
                                                <Input
                                                    value={settings.about_stat_1_value || ''}
                                                    onChange={(e) => updateField('about_stat_1_value', e.target.value)}
                                                    placeholder="5+"
                                                    className="mb-1"
                                                />
                                                <Input
                                                    value={settings.about_stat_1_label || ''}
                                                    onChange={(e) => updateField('about_stat_1_label', e.target.value)}
                                                    placeholder="Năm kinh nghiệm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Số liệu 2</label>
                                                <Input
                                                    value={settings.about_stat_2_value || ''}
                                                    onChange={(e) => updateField('about_stat_2_value', e.target.value)}
                                                    placeholder="100+"
                                                    className="mb-1"
                                                />
                                                <Input
                                                    value={settings.about_stat_2_label || ''}
                                                    onChange={(e) => updateField('about_stat_2_label', e.target.value)}
                                                    placeholder="Khách hàng"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Số liệu 3</label>
                                                <Input
                                                    value={settings.about_stat_3_value || ''}
                                                    onChange={(e) => updateField('about_stat_3_value', e.target.value)}
                                                    placeholder="1000+"
                                                    className="mb-1"
                                                />
                                                <Input
                                                    value={settings.about_stat_3_label || ''}
                                                    onChange={(e) => updateField('about_stat_3_label', e.target.value)}
                                                    placeholder="Tờ khai xử lý"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Số liệu 4</label>
                                                <Input
                                                    value={settings.about_stat_4_value || ''}
                                                    onChange={(e) => updateField('about_stat_4_value', e.target.value)}
                                                    placeholder="3+"
                                                    className="mb-1"
                                                />
                                                <Input
                                                    value={settings.about_stat_4_label || ''}
                                                    onChange={(e) => updateField('about_stat_4_label', e.target.value)}
                                                    placeholder="Phần mềm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Giá trị cốt lõi */}
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                        <h4 className="font-medium text-sm mb-3">Giá trị cốt lõi (3 giá trị)</h4>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2">
                                                <label className="block text-xs text-gray-500">Giá trị 1</label>
                                                <Input
                                                    value={settings.about_value_1_title || ''}
                                                    onChange={(e) => updateField('about_value_1_title', e.target.value)}
                                                    placeholder="Chuyên nghiệp"
                                                />
                                                <textarea
                                                    value={settings.about_value_1_desc || ''}
                                                    onChange={(e) => updateField('about_value_1_desc', e.target.value)}
                                                    rows={2}
                                                    placeholder="Đội ngũ am hiểu sâu về nghiệp vụ..."
                                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm resize-none"
                                                />
                                            </div>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2">
                                                <label className="block text-xs text-gray-500">Giá trị 2</label>
                                                <Input
                                                    value={settings.about_value_2_title || ''}
                                                    onChange={(e) => updateField('about_value_2_title', e.target.value)}
                                                    placeholder="Uy tín"
                                                />
                                                <textarea
                                                    value={settings.about_value_2_desc || ''}
                                                    onChange={(e) => updateField('about_value_2_desc', e.target.value)}
                                                    rows={2}
                                                    placeholder="Cam kết bảo mật thông tin..."
                                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm resize-none"
                                                />
                                            </div>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2">
                                                <label className="block text-xs text-gray-500">Giá trị 3</label>
                                                <Input
                                                    value={settings.about_value_3_title || ''}
                                                    onChange={(e) => updateField('about_value_3_title', e.target.value)}
                                                    placeholder="Chất lượng"
                                                />
                                                <textarea
                                                    value={settings.about_value_3_desc || ''}
                                                    onChange={(e) => updateField('about_value_3_desc', e.target.value)}
                                                    rows={2}
                                                    placeholder="Phần mềm và dịch vụ được phát triển..."
                                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}
