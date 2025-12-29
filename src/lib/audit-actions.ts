'use server';

import { createServerSupabaseClient } from './supabase-server';
import type { AuditLog, Json } from '@/types/database.types';

export type AuditAction =
    | 'create'
    | 'update'
    | 'delete'
    | 'login'
    | 'logout'
    | 'status_change'
    | 'bulk_update'
    | 'bulk_delete';

export type AuditEntity =
    | 'post'
    | 'software'
    | 'category'
    | 'tag'
    | 'settings'
    | 'contact'
    | 'user'
    | 'media';

interface AuditLogWithUser extends AuditLog {
    user: { id: string; full_name: string | null; email: string | null } | null;
}

/**
 * Log an audit event to the audit_logs table
 */
export async function logAuditEvent(
    action: AuditAction,
    entity: AuditEntity,
    entityId: string | null = null,
    newValues?: Record<string, unknown>,
    oldValues?: Record<string, unknown>
): Promise<{ success: boolean }> {
    try {
        const supabase = await createServerSupabaseClient();

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('audit_logs')
            .insert({
                action,
                entity_type: entity,
                entity_id: entityId,
                user_id: user?.id || null,
                new_values: (newValues || null) as Json,
                old_values: (oldValues || null) as Json,
                created_at: new Date().toISOString(),
            });

        if (error) {
            console.error('Audit log error:', error);
            // Don't throw - audit logging should not break main operations
        }

        return { success: !error };
    } catch (err) {
        console.error('Audit log exception:', err);
        return { success: false };
    }
}

/**
 * Get recent audit logs
 */
export async function getAuditLogs(limit: number = 50): Promise<{ logs: AuditLogWithUser[]; error: string | null }> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('audit_logs')
        .select(`
            *,
            user:profiles(id, full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching audit logs:', error);
        return { logs: [], error: error.message };
    }

    return { logs: (data as unknown as AuditLogWithUser[]) || [], error: null };
}
