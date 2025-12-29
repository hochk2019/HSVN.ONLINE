import TagForm from '@/components/admin/TagForm';

export const metadata = {
    title: 'Thêm tag mới',
};

export default function NewTagPage() {
    return <TagForm mode="create" />;
}
