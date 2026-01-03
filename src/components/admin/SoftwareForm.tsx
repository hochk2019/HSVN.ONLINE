'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createSoftware, updateSoftware } from '@/lib/software-actions';
import { Save, ArrowLeft, Loader2, Star, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

const TipTapEditor = dynamic(() => import('@/components/editor/TipTapEditor'), {
    ssr: false,
    loading: () => (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center text-gray-500">
            Đang tải editor...
        </div>
    ),
});

interface Software {
    id: string;
    name: string;
    slug: string;
    summary: string | null;
    description_html: string | null;
    description: object | null;
    highlights?: string[] | null;
    system_requirements?: { os?: string; ram?: string; disk?: string; other?: string } | null;
    faq?: { question: string; answer: string }[] | null;
    status: string;
    is_featured: boolean;
    meta_title: string | null;
    meta_description: string | null;
}

interface MediaFile {
    id?: string;
    url: string;
    name: string;
}

interface SoftwareFormProps {
    software?: Software | null;
    mode: 'create' | 'edit';
    mediaFiles?: MediaFile[];
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

export default function SoftwareForm({ software, mode, mediaFiles = [] }: SoftwareFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Basic fields
    const [name, setName] = useState(software?.name || '');
    const [slug, setSlug] = useState(software?.slug || '');
    const [summary, setSummary] = useState(software?.summary || '');
    const [descriptionHtml, setDescriptionHtml] = useState(software?.description_html || '');
    const [descriptionJson, setDescriptionJson] = useState<object | null>(software?.description || null);
    const [status, setStatus] = useState(software?.status || 'inactive');
    const [isFeatured, setIsFeatured] = useState(software?.is_featured || false);
    const [metaTitle, setMetaTitle] = useState(software?.meta_title || '');
    const [metaDescription, setMetaDescription] = useState(software?.meta_description || '');

    // Extended fields
    const [highlights, setHighlights] = useState<string[]>(software?.highlights || ['']);
    const [requirements, setRequirements] = useState({
        os: software?.system_requirements?.os || '',
        ram: software?.system_requirements?.ram || '',
        disk: software?.system_requirements?.disk || '',
        other: software?.system_requirements?.other || '',
    });
    const [faq, setFaq] = useState<{ question: string; answer: string }[]>(
        software?.faq || [{ question: '', answer: '' }]
    );

    // UI state
    const [showSeoFields, setShowSeoFields] = useState(false);
    const [showRequirements, setShowRequirements] = useState(false);
    const [showFaq, setShowFaq] = useState(false);

    const handleNameChange = (value: string) => {
        setName(value);
        if (mode === 'create') {
            setSlug(generateSlug(value));
        }
    };

    const handleEditorChange = (html: string, json: object) => {
        setDescriptionHtml(html);
        setDescriptionJson(json);
    };

    // Highlights handlers
    const addHighlight = () => setHighlights([...highlights, '']);
    const removeHighlight = (index: number) => {
        if (highlights.length > 1) {
            setHighlights(highlights.filter((_, i) => i !== index));
        }
    };
    const updateHighlight = (index: number, value: string) => {
        const updated = [...highlights];
        updated[index] = value;
        setHighlights(updated);
    };

    // FAQ handlers
    const addFaq = () => setFaq([...faq, { question: '', answer: '' }]);
    const removeFaq = (index: number) => {
        if (faq.length > 1) {
            setFaq(faq.filter((_, i) => i !== index));
        }
    };
    const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
        const updated = [...faq];
        updated[index][field] = value;
        setFaq(updated);
    };

    const handleSubmit = async (submitStatus?: string) => {
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.set('name', name);
        formData.set('slug', slug);
        formData.set('summary', summary);
        formData.set('description_html', descriptionHtml);
        formData.set('description', JSON.stringify(descriptionJson));
        formData.set('status', submitStatus || status);
        formData.set('is_featured', isFeatured.toString());
        formData.set('meta_title', metaTitle || name);
        formData.set('meta_description', metaDescription || summary);

        // Extended fields
        formData.set('highlights', JSON.stringify(highlights.filter(h => h.trim())));
        formData.set('requirements', JSON.stringify(requirements));
        formData.set('faq', JSON.stringify(faq.filter(f => f.question.trim() && f.answer.trim())));

        try {
            let result;
            if (mode === 'edit' && software) {
                result = await updateSoftware(software.id, formData);
            } else {
                result = await createSoftware(formData);
            }

            if (result.error) {
                setError(result.error);
                setLoading(false);
            } else {
                router.push('/admin/software');
            }
        } catch {
            setError('Có lỗi xảy ra');
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/software">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-heading text-2xl font-bold">
                            {mode === 'create' ? 'Thêm phần mềm' : 'Sửa phần mềm'}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handleSubmit('inactive')}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Lưu nháp
                    </Button>
                    <Button
                        onClick={() => handleSubmit('active')}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        <Save className="w-4 h-4 mr-2" />
                        Kích hoạt
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Name & Slug */}
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Tên phần mềm</label>
                                <Input
                                    value={name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="Nhập tên phần mềm..."
                                    className="text-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Slug (URL)</label>
                                <Input
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="duong-dan-phan-mem"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Mô tả ngắn</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <textarea
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                placeholder="Mô tả ngắn về phần mềm (hiển thị ở danh sách)..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm resize-none"
                            />
                        </CardContent>
                    </Card>

                    {/* Highlights */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Điểm nổi bật</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {highlights.map((highlight, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span className="text-golden font-bold">•</span>
                                    <Input
                                        value={highlight}
                                        onChange={(e) => updateHighlight(index, e.target.value)}
                                        placeholder="Nhập điểm nổi bật..."
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeHighlight(index)}
                                        disabled={highlights.length === 1}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={addHighlight}>
                                <Plus className="w-4 h-4 mr-2" />
                                Thêm điểm nổi bật
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Description Editor */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Mô tả chi tiết</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TipTapEditor
                                content={descriptionHtml}
                                onChange={handleEditorChange}
                                placeholder="Mô tả chi tiết về phần mềm, hướng dẫn sử dụng..."
                                mediaFiles={mediaFiles as any}
                            />
                        </CardContent>
                    </Card>

                    {/* System Requirements */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Yêu cầu hệ thống</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowRequirements(!showRequirements)}
                                >
                                    {showRequirements ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </Button>
                            </div>
                        </CardHeader>
                        {showRequirements && (
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Hệ điều hành</label>
                                        <Input
                                            value={requirements.os}
                                            onChange={(e) => setRequirements({ ...requirements, os: e.target.value })}
                                            placeholder="Windows 10/11"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">RAM</label>
                                        <Input
                                            value={requirements.ram}
                                            onChange={(e) => setRequirements({ ...requirements, ram: e.target.value })}
                                            placeholder="4GB trở lên"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Ổ đĩa</label>
                                        <Input
                                            value={requirements.disk}
                                            onChange={(e) => setRequirements({ ...requirements, disk: e.target.value })}
                                            placeholder="500MB trống"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Khác</label>
                                        <Input
                                            value={requirements.other}
                                            onChange={(e) => setRequirements({ ...requirements, other: e.target.value })}
                                            placeholder=".NET Framework 4.7+"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {/* FAQ */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Câu hỏi thường gặp (FAQ)</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowFaq(!showFaq)}
                                >
                                    {showFaq ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </Button>
                            </div>
                        </CardHeader>
                        {showFaq && (
                            <CardContent className="space-y-4">
                                {faq.map((item, index) => (
                                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                                        <div className="flex items-start gap-2">
                                            <span className="text-golden font-bold mt-2">Q:</span>
                                            <Input
                                                value={item.question}
                                                onChange={(e) => updateFaq(index, 'question', e.target.value)}
                                                placeholder="Câu hỏi..."
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeFaq(index)}
                                                disabled={faq.length === 1}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-green-500 font-bold mt-2">A:</span>
                                            <textarea
                                                value={item.answer}
                                                onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                                                placeholder="Câu trả lời..."
                                                rows={2}
                                                className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm resize-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={addFaq}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Thêm FAQ
                                </Button>
                            </CardContent>
                        )}
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Cài đặt</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Trạng thái</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm"
                                >
                                    <option value="inactive">Chưa kích hoạt</option>
                                    <option value="active">Đang hoạt động</option>
                                    <option value="coming_soon">Sắp ra mắt</option>
                                </select>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isFeatured}
                                        onChange={(e) => setIsFeatured(e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <Star className="w-4 h-4 text-golden" />
                                    <span className="text-sm">Hiển thị nổi bật</span>
                                </label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SEO */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>SEO</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowSeoFields(!showSeoFields)}
                                >
                                    {showSeoFields ? 'Ẩn' : 'Hiện'}
                                </Button>
                            </div>
                        </CardHeader>
                        {showSeoFields && (
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Meta Title</label>
                                    <Input
                                        value={metaTitle}
                                        onChange={(e) => setMetaTitle(e.target.value)}
                                        placeholder={name || 'Tiêu đề SEO'}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Meta Description</label>
                                    <textarea
                                        value={metaDescription}
                                        onChange={(e) => setMetaDescription(e.target.value)}
                                        placeholder={summary || 'Mô tả SEO'}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm resize-none"
                                    />
                                </div>
                            </CardContent>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
