'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createCategory, updateCategory, deleteCategory } from '@/lib/taxonomy-actions';
import { categorySchema, type CategoryFormData } from '@/lib/schemas';
import { Save, ArrowLeft, Loader2, Trash2, FolderTree } from 'lucide-react';
import Link from 'next/link';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sort_order: number | null;
    parent_id: string | null;
}

interface CategoryFormProps {
    category?: Category | null;
    mode: 'create' | 'edit';
    postCount?: number;
    allCategories?: Category[]; // List of all categories for parent selection
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

export default function CategoryForm({ category, mode, postCount = 0, allCategories = [] }: CategoryFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [parentId, setParentId] = useState<string>(category?.parent_id || '');

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: category?.name || '',
            slug: category?.slug || '',
            description: category?.description || '',
        },
    });

    const name = watch('name');

    // Filter out current category and its children from parent options
    const availableParents = allCategories.filter(c => {
        if (!category) return true;
        // Can't be parent of itself
        if (c.id === category.id) return false;
        // Can't select a child as parent (would create circular reference)
        if (c.parent_id === category.id) return false;
        return true;
    });

    const onSubmit = async (data: CategoryFormData) => {
        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.set('name', data.name);
        formData.set('slug', data.slug);
        formData.set('description', data.description || '');
        formData.set('sort_order', (category?.sort_order || 0).toString());
        formData.set('parent_id', parentId || '');

        try {
            let result;
            if (mode === 'edit' && category) {
                result = await updateCategory(category.id, formData);
            } else {
                result = await createCategory(formData);
            }

            if (result.error) {
                setError(result.error);
            } else {
                router.push('/admin/categories');
            }
        } catch {
            setError('Có lỗi xảy ra');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!category) return;

        if (postCount > 0) {
            setError(`Không thể xóa chuyên mục này vì đang có ${postCount} bài viết. Vui lòng chuyển bài viết sang chuyên mục khác trước.`);
            return;
        }

        if (!confirm('Bạn có chắc muốn xóa chuyên mục này?')) return;

        setIsLoading(true);
        const result = await deleteCategory(category.id);

        if (result.error) {
            setError(result.error);
            setIsLoading(false);
        } else {
            router.push('/admin/categories');
        }
    };

    // Get parent category name for display
    const parentCategory = availableParents.find(c => c.id === parentId);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/categories">
                        <Button variant="ghost" size="icon" type="button">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-heading text-2xl font-bold">
                            {mode === 'create' ? 'Thêm chuyên mục' : 'Sửa chuyên mục'}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {mode === 'edit' && category && (
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isLoading}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa
                        </Button>
                    )}
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        <Save className="w-4 h-4 mr-2" />
                        Lưu
                    </Button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin chuyên mục</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Tên chuyên mục <span className="text-red-500">*</span>
                        </label>
                        <Input
                            {...register('name')}
                            placeholder="Ví dụ: Tin tức"
                            onChange={(e) => {
                                setValue('name', e.target.value);
                                if (mode === 'create') {
                                    setValue('slug', generateSlug(e.target.value));
                                }
                            }}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Slug (URL) <span className="text-red-500">*</span>
                        </label>
                        <Input
                            {...register('slug')}
                            placeholder="tin-tuc"
                        />
                        {errors.slug && (
                            <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
                        )}
                    </div>

                    {/* Parent Category Selector */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            <FolderTree className="w-4 h-4 inline mr-1" />
                            Chuyên mục cha
                        </label>
                        <select
                            value={parentId}
                            onChange={(e) => setParentId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm"
                        >
                            <option value="">-- Không có (Chuyên mục gốc) --</option>
                            {availableParents.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.parent_id ? '└─ ' : ''}{cat.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Chọn chuyên mục cha để tạo menu dropdown trong Header
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Mô tả</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            placeholder="Mô tả ngắn về chuyên mục..."
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm"
                        />
                    </div>

                    {mode === 'edit' && category && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-500">
                                Thứ tự hiển thị: <strong>#{category.sort_order}</strong>
                            </p>
                            {parentCategory && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Thuộc chuyên mục: <strong className="text-golden">{parentCategory.name}</strong>
                                </p>
                            )}
                            {postCount > 0 && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Số bài viết: <strong>{postCount}</strong>
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </form>
    );
}
