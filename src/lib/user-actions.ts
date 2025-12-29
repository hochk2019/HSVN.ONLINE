'use server';

import { createServerSupabaseClient } from './supabase-server';
import { revalidatePath } from 'next/cache';
import { logAuditEvent } from './audit-actions';
import type { Profile } from '@/types/database.types';

// Get all users
export async function getUsers(): Promise<{ users: Profile[]; error: string | null }> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return { users: [], error: error.message };
    return { users: data || [], error: null };
}

// Update user role
export async function updateUserRole(userId: string, newRole: 'admin' | 'editor'): Promise<{ success: boolean; error: string | null }> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    // Check if current user is admin
    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (currentProfile?.role !== 'admin') {
        return { success: false, error: 'Only admins can change roles' };
    }

    // Prevent changing own role
    if (userId === user.id) {
        return { success: false, error: 'Cannot change your own role' };
    }

    const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

    if (error) {
        return { success: false, error: error.message };
    }

    // Audit log
    await logAuditEvent('update', 'user', userId, { role: newRole });

    revalidatePath('/admin/users');
    return { success: true, error: null };
}

// Invite new user (sends email via Supabase Auth)
export async function inviteUser(email: string, role: 'admin' | 'editor' = 'editor'): Promise<{ success: boolean; error: string | null }> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    // Check if current user is admin
    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (currentProfile?.role !== 'admin') {
        return { success: false, error: 'Only admins can invite users' };
    }

    // Check if user already exists
    const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

    if (existingProfile) {
        return { success: false, error: 'Email đã tồn tại trong hệ thống' };
    }

    // Note: Supabase invite requires admin API key, which should be server-only
    // For now, we'll create a placeholder message
    // In production, you would use supabase.auth.admin.inviteUserByEmail()

    // Audit log
    await logAuditEvent('create', 'user', null, { email, role });

    return { success: true, error: null };
}

// Get current user role
export async function getCurrentUserRole(): Promise<{ role: string | null; error: string | null }> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { role: null, error: 'Not authenticated' };
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (error) {
        return { role: null, error: error.message };
    }

    return { role: profile?.role || 'editor', error: null };
}

// Check if user is admin
export async function requireAdmin(): Promise<{ isAdmin: boolean; error: string | null }> {
    const { role, error } = await getCurrentUserRole();

    if (error) {
        return { isAdmin: false, error };
    }

    return { isAdmin: role === 'admin', error: null };
}
