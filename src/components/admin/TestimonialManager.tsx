'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus, Trash2, Edit2, Star, Eye, EyeOff, Save, X,
    GripVertical, ChevronUp, ChevronDown
} from 'lucide-react';
import {
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    type Testimonial
} from '@/lib/testimonial-actions';

interface TestimonialManagerProps {
    initialTestimonials: Testimonial[];
}

export default function TestimonialManager({ initialTestimonials }: TestimonialManagerProps) {
    const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        author_name: '',
        author_title: '',
        author_avatar: '',
        content: '',
        rating: 5,
        is_active: true,
    });

    const resetForm = () => {
        setFormData({
            author_name: '',
            author_title: '',
            author_avatar: '',
            content: '',
            rating: 5,
            is_active: true,
        });
        setEditingId(null);
        setIsAdding(false);
    };

    const handleAdd = async () => {
        if (!formData.author_name || !formData.content) return;

        setLoading(true);
        const { testimonial, error } = await createTestimonial({
            author_name: formData.author_name,
            author_title: formData.author_title || undefined,
            author_avatar: formData.author_avatar || undefined,
            content: formData.content,
            rating: formData.rating,
            is_active: formData.is_active,
            display_order: testimonials.length,
        });

        if (testimonial) {
            setTestimonials([...testimonials, testimonial]);
            resetForm();
        } else {
            alert('Lỗi: ' + error);
        }
        setLoading(false);
    };

    const handleEdit = (testimonial: Testimonial) => {
        setFormData({
            author_name: testimonial.author_name,
            author_title: testimonial.author_title || '',
            author_avatar: testimonial.author_avatar || '',
            content: testimonial.content,
            rating: testimonial.rating,
            is_active: testimonial.is_active,
        });
        setEditingId(testimonial.id);
        setIsAdding(false);
    };

    const handleUpdate = async () => {
        if (!editingId || !formData.author_name || !formData.content) return;

        setLoading(true);
        const { testimonial, error } = await updateTestimonial(editingId, {
            author_name: formData.author_name,
            author_title: formData.author_title || null,
            author_avatar: formData.author_avatar || null,
            content: formData.content,
            rating: formData.rating,
            is_active: formData.is_active,
        });

        if (testimonial) {
            setTestimonials(testimonials.map(t => t.id === editingId ? testimonial : t));
            resetForm();
        } else {
            alert('Lỗi: ' + error);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa testimonial này?')) return;

        setLoading(true);
        const { success, error } = await deleteTestimonial(id);

        if (success) {
            setTestimonials(testimonials.filter(t => t.id !== id));
        } else {
            alert('Lỗi: ' + error);
        }
        setLoading(false);
    };

    const toggleActive = async (testimonial: Testimonial) => {
        const { testimonial: updated } = await updateTestimonial(testimonial.id, {
            is_active: !testimonial.is_active,
        });

        if (updated) {
            setTestimonials(testimonials.map(t => t.id === testimonial.id ? updated : t));
        }
    };

    const moveItem = async (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === testimonials.length - 1)
        ) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        const updated = [...testimonials];
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

        // Update display_order for both items
        await updateTestimonial(updated[index].id, { display_order: index });
        await updateTestimonial(updated[newIndex].id, { display_order: newIndex });

        setTestimonials(updated);
    };

    return (
        <div className="space-y-6">
            {/* Add/Edit Form */}
            {(isAdding || editingId) && (
                <Card className="border-golden">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {editingId ? 'Chỉnh sửa Testimonial' : 'Thêm Testimonial mới'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tên người đánh giá *</label>
                                <Input
                                    value={formData.author_name}
                                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                                    placeholder="Anh Minh"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Chức danh/Công ty</label>
                                <Input
                                    value={formData.author_title}
                                    onChange={(e) => setFormData({ ...formData, author_title: e.target.value })}
                                    placeholder="Nhân viên XNK, Công ty ABC"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Nội dung đánh giá *</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows={3}
                                placeholder="Phần mềm rất hữu ích, giúp tôi tiết kiệm nhiều thời gian..."
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Avatar URL</label>
                                <Input
                                    value={formData.author_avatar}
                                    onChange={(e) => setFormData({ ...formData, author_avatar: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Đánh giá (sao)</label>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating: star })}
                                            className="p-1"
                                        >
                                            <Star
                                                className={`w-6 h-6 ${star <= formData.rating
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-6">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="rounded"
                                />
                                <label htmlFor="is_active" className="text-sm">Hiển thị trên trang chủ</label>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                onClick={editingId ? handleUpdate : handleAdd}
                                disabled={loading || !formData.author_name || !formData.content}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {loading ? 'Đang lưu...' : 'Lưu'}
                            </Button>
                            <Button variant="outline" onClick={resetForm}>
                                <X className="w-4 h-4 mr-2" />
                                Hủy
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Add Button */}
            {!isAdding && !editingId && (
                <Button onClick={() => setIsAdding(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm Testimonial
                </Button>
            )}

            {/* Testimonials List */}
            <div className="space-y-3">
                {testimonials.map((testimonial, index) => (
                    <Card
                        key={testimonial.id}
                        className={testimonial.is_active ? '' : 'opacity-60'}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => moveItem(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    >
                                        <ChevronUp className="w-4 h-4" />
                                    </button>
                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                    <button
                                        onClick={() => moveItem(index, 'down')}
                                        disabled={index === testimonials.length - 1}
                                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium">{testimonial.author_name}</span>
                                        {testimonial.author_title && (
                                            <span className="text-sm text-gray-500">- {testimonial.author_title}</span>
                                        )}
                                        <div className="flex items-center gap-0.5 ml-auto">
                                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                                                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                        "{testimonial.content}"
                                    </p>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => toggleActive(testimonial)}
                                        className={`p-2 rounded-lg transition-colors ${testimonial.is_active
                                                ? 'text-green-600 hover:bg-green-50'
                                                : 'text-gray-400 hover:bg-gray-100'
                                            }`}
                                        title={testimonial.is_active ? 'Đang hiển thị' : 'Đang ẩn'}
                                    >
                                        {testimonial.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(testimonial)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(testimonial.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {testimonials.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                        Chưa có testimonial nào. Bấm "Thêm Testimonial" để tạo mới.
                    </p>
                )}
            </div>
        </div>
    );
}
