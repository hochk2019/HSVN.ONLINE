import { notFound } from 'next/navigation';
import CategoryForm from '@/components/admin/CategoryForm';
import { getCategoryById } from '@/lib/taxonomy-actions';
import { createServerSupabaseClient } from '@/lib/supabase-server';

interface PageProps {
    params: Promise<{ id: string }>;
}

export const metadata = {
    title: 'Sửa chuyên mục',
};

export default async function EditCategoryPage({ params }: PageProps) {
    const { id } = await params;
    const { category, postCount, error } = await getCategoryById(id);

    if (error || !category) {
        notFound();
    }

    // Fetch all categories for parent selection
    const supabase = await createServerSupabaseClient();
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name, slug, description, sort_order, parent_id')
        .order('name');

    return (
        <CategoryForm
            category={category}
            mode="edit"
            postCount={postCount}
            allCategories={categories || []}
        />
    );
}
