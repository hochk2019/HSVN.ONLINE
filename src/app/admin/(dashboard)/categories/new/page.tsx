import CategoryForm from '@/components/admin/CategoryForm';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const metadata = {
    title: 'Thêm chuyên mục mới',
};

export default async function NewCategoryPage() {
    const supabase = await createServerSupabaseClient();

    // Fetch all categories for parent selection
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name, slug, description, sort_order, parent_id')
        .order('name');

    return (
        <CategoryForm
            mode="create"
            allCategories={categories || []}
        />
    );
}
