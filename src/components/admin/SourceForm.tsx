'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createFeedSource, updateFeedSource, FeedSource } from '@/lib/aggregator-actions';
import { Loader2, Save, ArrowLeft, Rss } from 'lucide-react';

interface Category {
    id: string;
    name: string;
}

interface SourceFormProps {
    source?: FeedSource | null;
    categories: Category[];
}

export default function SourceForm({ source, categories }: SourceFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        try {
            let result;
            if (source) {
                result = await updateFeedSource(source.id, formData);
            } else {
                result = await createFeedSource(formData);
            }

            if (result.success) {
                router.push('/admin/aggregator/sources');
            } else {
                setError(result.error || 'Có lỗi xảy ra');
            }
        } catch (err) {
            setError('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-golden/10 rounded-lg">
                        <Rss className="w-5 h-5 text-golden" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Thông tin nguồn tin</h2>
                </div>

                <div className="grid gap-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Tên nguồn <span className="text-red-500">*</span>
                        </label>
                        <Input
                            name="name"
                            defaultValue={source?.name || ''}
                            placeholder="VD: VnExpress, TechCrunch..."
                            required
                        />
                    </div>

                    {/* URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            URL RSS Feed <span className="text-red-500">*</span>
                        </label>
                        <Input
                            name="url"
                            type="url"
                            defaultValue={source?.url || ''}
                            placeholder="https://example.com/rss"
                            required
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Nhập URL của RSS/Atom feed
                        </p>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Chuyên mục mặc định
                        </label>
                        <select
                            name="category_id"
                            defaultValue={source?.category_id || ''}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-golden focus:border-golden"
                        >
                            <option value="">-- Chọn chuyên mục --</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Fetch Interval */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Tần suất lấy bài (phút)
                        </label>
                        <Input
                            name="fetch_interval"
                            type="number"
                            min="15"
                            defaultValue={source?.fetch_interval || 60}
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Thời gian giữa mỗi lần kiểm tra bài mới (tối thiểu 15 phút)
                        </p>
                    </div>

                    {/* Is Active */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="is_active"
                            id="is_active"
                            value="true"
                            defaultChecked={source?.is_active ?? true}
                            className="w-4 h-4 text-golden focus:ring-golden border-gray-300 rounded"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Kích hoạt nguồn tin này
                        </label>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>

                <Button type="submit" disabled={loading}>
                    {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    {source ? 'Cập nhật' : 'Thêm nguồn'}
                </Button>
            </div>
        </form>
    );
}
