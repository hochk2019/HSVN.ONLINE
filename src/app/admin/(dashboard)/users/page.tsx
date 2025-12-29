import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getUsers, getCurrentUserRole } from '@/lib/user-actions';
import UsersPageClient from '@/components/admin/UsersPageClient';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Quản lý người dùng',
};

export default async function UsersPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { users } = await getUsers();
    const { role } = await getCurrentUserRole();

    return (
        <UsersPageClient
            users={users}
            currentUserId={user?.id || ''}
            isAdmin={role === 'admin'}
        />
    );
}
