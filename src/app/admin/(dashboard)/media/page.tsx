import { getMediaFiles } from '@/lib/settings-actions';
import MediaLibrary from '@/components/admin/MediaLibrary';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Thư viện media',
};

export default async function MediaPage() {
    const { files } = await getMediaFiles();

    return <MediaLibrary initialFiles={files} />;
}
