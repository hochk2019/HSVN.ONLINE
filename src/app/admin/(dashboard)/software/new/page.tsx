import SoftwareForm from '@/components/admin/SoftwareForm';
import { getMediaFiles } from '@/lib/post-actions';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Thêm phần mềm',
};

export default async function NewSoftwarePage() {
    const { mediaFiles } = await getMediaFiles();
    return <SoftwareForm mode="create" mediaFiles={mediaFiles} />;
}
