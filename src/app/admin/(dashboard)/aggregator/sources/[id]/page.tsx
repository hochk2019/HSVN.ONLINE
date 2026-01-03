import { getCategories } from '@/lib/post-actions';
import { getFeedSourceById } from '@/lib/aggregator-actions';
import SourceForm from '@/components/admin/SourceForm';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditSourcePage({ params }: Props) {
    const { id } = await params;

    const [{ source, error }, { categories }] = await Promise.all([
        getFeedSourceById(id),
        getCategories(),
    ]);

    if (error || !source) {
        notFound();
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Chỉnh sửa nguồn tin</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Cập nhật thông tin nguồn RSS
                </p>
            </div>

            <SourceForm source={source as Parameters<typeof SourceForm>[0]['source']} categories={(categories || []).map(c => ({ id: c.id, name: c.name }))} />
        </div>
    );
}
