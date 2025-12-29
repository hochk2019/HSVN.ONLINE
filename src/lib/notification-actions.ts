'use server';

import { createServerSupabaseClient } from './supabase-server';
import { revalidatePath } from 'next/cache';

export interface Notification {
    id: string;
    type: 'info' | 'contact' | 'post' | 'system';
    title: string;
    message: string | null;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

// Get notifications (unread first, then recent)
export async function getNotifications(limit: number = 10): Promise<{
    notifications: Notification[];
    unreadCount: number;
    error: string | null
}> {
    const supabase = await createServerSupabaseClient();

    // Use any to bypass TypeScript until types are regenerated
    const { data, error } = await (supabase as any)
        .from('admin_notifications')
        .select('*')
        .order('is_read', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching notifications:', error);
        return { notifications: [], unreadCount: 0, error: error.message };
    }

    // Count unread
    const notifications = (data || []) as Notification[];
    const unreadCount = notifications.filter(n => !n.is_read).length;

    return { notifications, unreadCount, error: null };
}

// Mark single notification as read
export async function markAsRead(id: string): Promise<{ success: boolean; error: string | null }> {
    const supabase = await createServerSupabaseClient();

    const { error } = await (supabase as any)
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin', 'layout');
    return { success: true, error: null };
}

// Mark all notifications as read
export async function markAllAsRead(): Promise<{ success: boolean; error: string | null }> {
    const supabase = await createServerSupabaseClient();

    const { error } = await (supabase as any)
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('is_read', false);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin', 'layout');
    return { success: true, error: null };
}

// Create a new notification
export async function createNotification(data: {
    type: 'info' | 'contact' | 'post' | 'system';
    title: string;
    message?: string;
    link?: string;
}): Promise<{ success: boolean; error: string | null }> {
    const supabase = await createServerSupabaseClient();

    const { error } = await (supabase as any)
        .from('admin_notifications')
        .insert({
            type: data.type,
            title: data.title,
            message: data.message || null,
            link: data.link || null,
        });

    if (error) {
        console.error('Error creating notification:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin', 'layout');
    return { success: true, error: null };
}

// Delete old read notifications (cleanup)
export async function cleanupOldNotifications(daysOld: number = 30): Promise<void> {
    const supabase = await createServerSupabaseClient();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await (supabase as any)
        .from('admin_notifications')
        .delete()
        .eq('is_read', true)
        .lt('created_at', cutoffDate.toISOString());
}
