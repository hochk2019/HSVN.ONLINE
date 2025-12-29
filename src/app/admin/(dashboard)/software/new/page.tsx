import SoftwareForm from '@/components/admin/SoftwareForm';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Thêm phần mềm',
};

export default function NewSoftwarePage() {
    return <SoftwareForm mode="create" />;
}
