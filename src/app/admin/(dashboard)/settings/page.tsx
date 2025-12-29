import { getSettings } from '@/lib/settings-actions';
import { requireAdmin } from '@/lib/auth-actions';
import SettingsForm from '@/components/admin/SettingsForm';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Cài đặt',
};

export default async function SettingsPage() {
    // Only admins can access settings
    await requireAdmin();

    const { settings } = await getSettings();

    return <SettingsForm initialSettings={settings} />;
}

