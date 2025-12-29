'use server';

import { createServerSupabaseClient } from './supabase-server';
import { revalidatePath } from 'next/cache';
import type { ContactMessage } from '@/types/database.types';
import { logAuditEvent } from './audit-actions';

export type ContactStatus = 'new' | 'read' | 'replied' | 'archived';

interface ActionResult {
    success: boolean;
    error?: string;
}

// Update contact message status
export async function updateContactStatus(id: string, status: ContactStatus): Promise<ActionResult> {
    const supabase = await createServerSupabaseClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
        .from('contact_messages')
        .update({
            status,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) {
        console.error('Error updating contact status:', error);
        return { success: false, error: error.message };
    }

    // Audit log
    await logAuditEvent('status_change', 'contact', id, { status });

    revalidatePath('/admin/contacts');
    return { success: true };
}

// Delete contact message
export async function deleteContact(id: string): Promise<ActionResult> {
    const supabase = await createServerSupabaseClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting contact:', error);
        return { success: false, error: error.message };
    }

    // Audit log
    await logAuditEvent('delete', 'contact', id);

    revalidatePath('/admin/contacts');
    return { success: true };
}

// Get contact messages with filtering and pagination
export async function getContacts(options?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
}): Promise<{ contacts: ContactMessage[]; total: number; error: string | null }> {
    const supabase = await createServerSupabaseClient();

    let query = supabase
        .from('contact_messages')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

    // Filter by status
    if (options?.status && options.status !== 'all') {
        query = query.eq('status', options.status);
    }

    // Search by name or email
    if (options?.search) {
        query = query.or(`name.ilike.%${options.search}%,email.ilike.%${options.search}%`);
    }

    // Pagination
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching contacts:', error);
        return { contacts: [], total: 0, error: error.message };
    }

    return { contacts: data || [], total: count || 0, error: null };
}

// Get contact stats using SQL aggregate (efficient, no need to fetch all records)
export async function getContactStats(): Promise<{
    new: number;
    read: number;
    replied: number;
    archived: number;
    total: number;
}> {
    const supabase = await createServerSupabaseClient();

    // Use individual count queries which are more efficient than fetching all records
    const [newCount, readCount, repliedCount, archivedCount] = await Promise.all([
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'read'),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'replied'),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'archived'),
    ]);

    return {
        new: newCount.count || 0,
        read: readCount.count || 0,
        replied: repliedCount.count || 0,
        archived: archivedCount.count || 0,
        total: (newCount.count || 0) + (readCount.count || 0) + (repliedCount.count || 0) + (archivedCount.count || 0),
    };
}

