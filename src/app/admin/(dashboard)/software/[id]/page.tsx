import { notFound } from 'next/navigation';
import { getSoftwareById, getSoftwareVersions } from '@/lib/software-actions';
import { getMediaFiles } from '@/lib/post-actions';
import SoftwareForm from '@/components/admin/SoftwareForm';
import VersionManager from '@/components/admin/VersionManager';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Sửa phần mềm',
};

export default async function EditSoftwarePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const [{ software, error }, { versions }, { mediaFiles }] = await Promise.all([
        getSoftwareById(id),
        getSoftwareVersions(id),
        getMediaFiles(),
    ]);

    if (error || !software) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <SoftwareForm software={software} mode="edit" mediaFiles={mediaFiles} />

            <VersionManager
                softwareId={software.id}
                softwareName={software.name}
                versions={versions}
            />
        </div>
    );
}

