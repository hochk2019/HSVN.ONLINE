'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createPost, updatePost, deletePost } from '@/lib/post-actions';
import { postSchema, type PostFormData } from '@/lib/schemas';
import { getPreviewUrl } from '@/lib/preview-utils';
import { Save, ArrowLeft, Loader2, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';
import TagPicker from './TagPicker';
import ImagePicker from './ImagePicker';
import AIWritingAssistant from './AIWritingAssistant';
import AISuggest from './AISuggest';
import SchemaValidator from './SchemaValidator';
import TranslationEditor from './TranslationEditor';

// Dynamic import for TipTap to avoid SSR issues
const TipTapEditor = dynamic(() => import('@/components/editor/TipTapEditor'), {
    ssr: false,
    loading: () => (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center text-gray-500">
            Đang tải editor...
        </div>
    ),
});

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Tag {
    id: string;
    name: string;
    slug: string;
}

interface MediaFile {
    id: string;
    name: string;
    url?: string;
}

interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content_html: string | null;
    content: object | null;
    category_id: string | null;
    status: string;
    meta_title: string | null;
    meta_description: string | null;
    featured_image: string | null;
    tags?: { id: string }[];
    created_at?: string | null;
    translations?: string | null;
}

interface PostFormProps {
    post?: Post | null;
    categories: Category[];
    tags: Tag[];
    mediaFiles: MediaFile[];
    mode: 'create' | 'edit';
}

function generateSlug(title: string): string {
    return title
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

export default function PostForm({ post, categories, tags, mediaFiles, mode }: PostFormProps) {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);
    const [showSeoFields, setShowSeoFields] = useState(false);
    const [translations, setTranslations] = useState<string>(post?.translations || '{}');
    const [isDeleting, setIsDeleting] = useState(false);

    // React Hook Form with Zod validation
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<PostFormData>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            title: post?.title || '',
            slug: post?.slug || '',
            excerpt: post?.excerpt || '',
            content_html: post?.content_html || '',
            content: post?.content || null,
            category_id: post?.category_id || '',
            status: (['draft', 'published', 'scheduled', 'archived'].includes(post?.status || '')
                ? post?.status as 'draft' | 'published' | 'scheduled' | 'archived'
                : 'draft'),
            scheduled_at: (post as any)?.scheduled_at || null,
            meta_title: post?.meta_title || '',
            meta_description: post?.meta_description || '',
            featured_image: post?.featured_image || '',
            tag_ids: post?.tags?.map(t => t.id) || [],
        },
    });

    // Watch values for controlled components
    const title = watch('title');
    const slug = watch('slug');
    const excerpt = watch('excerpt');
    const contentHtml = watch('content_html');
    const featuredImage = watch('featured_image');
    const selectedTagIds = watch('tag_ids');

    const handleTitleChange = (value: string) => {
        setValue('title', value);
        if (mode === 'create' && !post) {
            setValue('slug', generateSlug(value));
        }
    };

    const handleEditorChange = (html: string, json: object) => {
        setValue('content_html', html);
        setValue('content', json);
    };

    const onSubmit = async (data: PostFormData, submitStatus?: string) => {
        setServerError(null);

        const formData = new FormData();
        formData.set('title', data.title);
        formData.set('slug', data.slug);
        formData.set('excerpt', data.excerpt || '');
        formData.set('content_html', data.content_html || '');
        formData.set('content', JSON.stringify(data.content));
        formData.set('category_id', data.category_id || '');
        formData.set('status', submitStatus || data.status);
        formData.set('meta_title', data.meta_title || data.title);
        formData.set('meta_description', data.meta_description || data.excerpt || '');
        formData.set('featured_image', data.featured_image || '');
        formData.set('tag_ids', JSON.stringify(data.tag_ids));
        formData.set('translations', translations);

        try {
            let result;
            if (mode === 'edit' && post) {
                result = await updatePost(post.id, formData);
            } else {
                result = await createPost(formData);
            }

            if (result.error) {
                setServerError(result.error);
            } else {
                router.push('/admin/posts');
            }
        } catch {
            setServerError('Có lỗi xảy ra');
        }
    };

    const handleDelete = async () => {
        if (!post?.id) return;

        const confirmed = window.confirm('Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.');
        if (!confirmed) return;

        setIsDeleting(true);
        try {
            const result = await deletePost(post.id);
            if (result.error) {
                setServerError(result.error);
            } else {
                router.push('/admin/posts');
            }
        } catch {
            setServerError('Không thể xóa bài viết');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/posts">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-heading text-2xl font-bold">
                            {mode === 'create' ? 'Bài viết mới' : 'Sửa bài viết'}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Preview Button - only in edit mode for unpublished posts */}
                    {mode === 'edit' && post && post.status !== 'published' && (
                        <a
                            href={getPreviewUrl(post.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline" type="button">
                                <Eye className="w-4 h-4 mr-2" />
                                Xem trước
                            </Button>
                        </a>
                    )}
                    <Button
                        variant="outline"
                        onClick={handleSubmit((data) => onSubmit(data, 'draft'))}
                        disabled={isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Lưu nháp
                    </Button>
                    <Button
                        onClick={handleSubmit((data) => onSubmit(data, 'published'))}
                        disabled={isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        <Save className="w-4 h-4 mr-2" />
                        Xuất bản
                    </Button>
                    {/* Delete Button - only in edit mode */}
                    {mode === 'edit' && post && (
                        <Button
                            variant="outline"
                            onClick={handleDelete}
                            disabled={isDeleting || isSubmitting}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4 mr-2" />
                            )}
                            Xóa
                        </Button>
                    )}
                </div>
            </div>

            {/* Errors */}
            {(serverError || Object.keys(errors).length > 0) && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
                    {serverError || Object.values(errors).map(e => e?.message).filter(Boolean).join(', ')}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title & Slug */}
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Tiêu đề</label>
                                <Input
                                    value={title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    placeholder="Nhập tiêu đề bài viết..."
                                    className="text-lg"
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Slug (URL)</label>
                                <Input
                                    {...register('slug')}
                                    value={slug}
                                    placeholder="duong-dan-bai-viet"
                                />
                                {errors.slug && (
                                    <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Content Editor */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Nội dung</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TipTapEditor
                                content={contentHtml || ''}
                                onChange={handleEditorChange}
                                placeholder="Bắt đầu viết nội dung bài viết..."
                                mediaFiles={mediaFiles}
                            />
                        </CardContent>
                    </Card>

                    {/* English Translation */}
                    <TranslationEditor
                        translations={translations}
                        onTranslationsChange={setTranslations}
                        fields={[
                            { key: 'title', label: 'Title', type: 'text' },
                            { key: 'excerpt', label: 'Excerpt', type: 'textarea' },
                            { key: 'content_html', label: 'Content (HTML)', type: 'richtext' },
                        ]}
                        language="en"
                        languageLabel="English"
                    />

                    {/* AI Writing Assistant */}
                    <AIWritingAssistant
                        title={title}
                        content={contentHtml || ''}
                        metaDescription={watch('meta_description') || ''}
                        excerpt={excerpt || ''}
                        onExcerptGenerated={(excerpt) => setValue('excerpt', excerpt)}
                        onMetaGenerated={(meta) => setValue('meta_description', meta)}
                    />

                    {/* Excerpt */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tóm tắt</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <textarea
                                {...register('excerpt')}
                                value={excerpt}
                                placeholder="Mô tả ngắn về bài viết (hiển thị ở danh sách bài viết)..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm resize-none"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status & Category */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Cài đặt</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Trạng thái</label>
                                <select
                                    {...register('status')}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm"
                                >
                                    <option value="draft">Nháp</option>
                                    <option value="published">Đã xuất bản</option>
                                    <option value="scheduled">Lên lịch</option>
                                    <option value="archived">Lưu trữ</option>
                                </select>
                            </div>

                            {/* Scheduled Date/Time - only show when status is 'scheduled' */}
                            {watch('status') === 'scheduled' && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Ngày giờ xuất bản
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        {...register('scheduled_at')}
                                        min={new Date().toISOString().slice(0, 16)}
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Bài viết sẽ tự động xuất bản vào thời điểm này
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-2">Chuyên mục</label>
                                <select
                                    {...register('category_id')}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm"
                                >
                                    <option value="">Chọn chuyên mục</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Featured Image */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ảnh đại diện</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ImagePicker
                                value={featuredImage || ''}
                                onChange={(url) => setValue('featured_image', url)}
                                mediaFiles={mediaFiles}
                            />
                        </CardContent>
                    </Card>

                    {/* Tags */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tags</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TagPicker
                                availableTags={tags}
                                selectedTagIds={selectedTagIds}
                                onChange={(ids) => setValue('tag_ids', ids)}
                            />
                        </CardContent>
                    </Card>

                    {/* AI Suggest */}
                    <AISuggest
                        title={title}
                        content={contentHtml || ''}
                        categories={categories}
                        tags={tags}
                        currentCategoryId={watch('category_id')}
                        currentTagIds={selectedTagIds}
                        onCategorySuggested={(categoryId) => setValue('category_id', categoryId)}
                        onTagsSuggested={(tagIds) => {
                            const mergedIds = [...new Set([...selectedTagIds, ...tagIds])];
                            setValue('tag_ids', mergedIds);
                        }}
                    />

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
                                        {...register('meta_title')}
                                        placeholder={title || 'Tiêu đề SEO'}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Meta Description</label>
                                    <textarea
                                        {...register('meta_description')}
                                        placeholder={excerpt || 'Mô tả SEO (150-160 ký tự)'}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm resize-none"
                                    />
                                </div>

                                {/* Schema Validator */}
                                <div className="pt-4 border-t">
                                    <SchemaValidator
                                        type="article"
                                        data={{
                                            title: watch('meta_title') || title,
                                            description: watch('meta_description') || excerpt,
                                            image: featuredImage || undefined,
                                            datePublished: post?.created_at || undefined,
                                        }}
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
