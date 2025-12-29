import { notFound } from 'next/navigation';
import { getPostById, getCategories, getTags, getMediaFiles } from '@/lib/post-actions';
import PostForm from '@/components/admin/PostForm';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Sửa bài viết',
};

export default async function EditPostPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const [{ post, error }, { categories }, { tags }, { mediaFiles }] = await Promise.all([
        getPostById(id),
        getCategories(),
        getTags(),
        getMediaFiles(),
    ]);

    if (error || !post) {
        notFound();
    }

    return <PostForm post={post} categories={categories} tags={tags} mediaFiles={mediaFiles} mode="edit" />;
}
