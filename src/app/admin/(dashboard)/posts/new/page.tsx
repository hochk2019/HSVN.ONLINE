import { getCategories, getTags, getMediaFiles } from '@/lib/post-actions';
import PostForm from '@/components/admin/PostForm';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Bài viết mới',
};

export default async function NewPostPage() {
    const [{ categories }, { tags }, { mediaFiles }] = await Promise.all([
        getCategories(),
        getTags(),
        getMediaFiles(),
    ]);

    return <PostForm categories={categories} tags={tags} mediaFiles={mediaFiles} mode="create" />;
}
