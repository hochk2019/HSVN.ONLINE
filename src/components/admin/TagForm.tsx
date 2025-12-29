'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createTag, updateTag, deleteTag } from '@/lib/taxonomy-actions';
import { tagSchema, type TagFormData } from '@/lib/schemas';
import { Save, ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Tag {
    id: string;
    name: string;
    slug: string;
}

interface TagFormProps {
    tag?: Tag | null;
    mode: 'create' | 'edit';
    postCount?: number;
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

export default function TagForm({ tag, mode, postCount = 0 }: TagFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<TagFormData>({
        resolver: zodResolver(tagSchema),
        defaultValues: {
            name: tag?.name || '',
            slug: tag?.slug || '',
        },
    });

    const onSubmit = async (data: TagFormData) => {
        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.set('name', data.name);
        formData.set('slug', data.slug);

        try {
            let result;
            if (mode === 'edit' && tag) {
                result = await updateTag(tag.id, formData);
            } else {
                result = await createTag(formData);
            }

            if (result.error) {
                setError(result.error);
            } else {
                router.push('/admin/tags');
            }
        } catch {
            setError('Có lỗi xảy ra');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!tag) return;
        if (!confirm('Bạn có chắc muốn xóa tag này?')) return;

        setIsLoading(true);
        const result = await deleteTag(tag.id);

        if (result.error) {
            setError(result.error);
            setIsLoading(false);
        } else {
            router.push('/admin/tags');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/tags">
                        <Button variant="ghost" size="icon" type="button">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-heading text-2xl font-bold">
                            {mode === 'create' ? 'Thêm tag' : 'Sửa tag'}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {mode === 'edit' && tag && (
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
                    <CardTitle>Thông tin tag</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Tên tag <span className="text-red-500">*</span>
                        </label>
                        <Input
                            {...register('name')}
                            placeholder="Ví dụ: Hướng dẫn"
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
                            Slug <span className="text-red-500">*</span>
                        </label>
                        <Input
                            {...register('slug')}
                            placeholder="huong-dan"
                        />
                        {errors.slug && (
                            <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
                        )}
                    </div>

                    {mode === 'edit' && postCount > 0 && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-500">
                                Số bài viết sử dụng tag này: <strong>{postCount}</strong>
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </form>
    );
}
