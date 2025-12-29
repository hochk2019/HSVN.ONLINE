import { getCategories } from '@/lib/post-actions';
import SourceForm from '@/components/admin/SourceForm';

export default async function NewSourcePage() {
    const { categories } = await getCategories();

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Thêm nguồn tin mới</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Thêm nguồn RSS feed để lấy bài viết tự động
                </p>
            </div>

            <SourceForm categories={categories || []} />
        </div>
    );
}
