import { notFound } from 'next/navigation';
import TagForm from '@/components/admin/TagForm';
import { getTagById } from '@/lib/taxonomy-actions';

interface PageProps {
    params: Promise<{ id: string }>;
}

export const metadata = {
    title: 'Sửa tag',
};

export default async function EditTagPage({ params }: PageProps) {
    const { id } = await params;
    const { tag, postCount, error } = await getTagById(id);

    if (error || !tag) {
        notFound();
    }

    return <TagForm tag={tag} mode="edit" postCount={postCount} />;
}
