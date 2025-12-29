import Link from 'next/link';
import { getAdminTags } from '@/lib/taxonomy-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Tag as TagIcon } from 'lucide-react';
import type { Tag } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Quản lý thẻ',
};

export default async function TagsPage() {
    const { tags } = await getAdminTags();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-bold">Thẻ (Tags)</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Quản lý các thẻ gắn cho bài viết
                    </p>
                </div>
                <Link href="/admin/tags/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm thẻ
                    </Button>
                </Link>
            </div>

            {/* Tags Grid */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách thẻ ({tags.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {tags.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <TagIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Chưa có thẻ nào</p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag: Tag) => (
                                <Link
                                    key={tag.id}
                                    href={`/admin/tags/${tag.id}`}
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
                                >
                                    <TagIcon className="w-4 h-4 text-golden" />
                                    <span className="font-medium">{tag.name}</span>
                                    <span className="text-xs text-gray-500">({tag.slug})</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
