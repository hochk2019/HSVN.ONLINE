import Link from 'next/link';
import { getAdminCategories } from '@/lib/taxonomy-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Folder, GripVertical } from 'lucide-react';
import type { Category } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Quản lý chuyên mục',
};

export default async function CategoriesPage() {
    const { categories } = await getAdminCategories();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-bold">Chuyên mục</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Quản lý các chuyên mục bài viết
                    </p>
                </div>
                <Link href="/admin/categories/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm chuyên mục
                    </Button>
                </Link>
            </div>

            {/* Categories List */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách chuyên mục ({categories.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {categories.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Chưa có chuyên mục nào</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {categories.map((category: Category) => (
                                <div
                                    key={category.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                                        <div className="w-10 h-10 bg-golden/10 rounded-lg flex items-center justify-center">
                                            <Folder className="w-5 h-5 text-golden" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{category.name}</div>
                                            <div className="text-sm text-gray-500">/{category.slug}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 px-2">
                                            #{category.sort_order}
                                        </span>
                                        <Link href={`/admin/categories/${category.id}`}>
                                            <Button variant="ghost" size="sm">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
