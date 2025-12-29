'use server';

import { createServerSupabaseClient } from './supabase-server';
import { revalidatePath } from 'next/cache';
import type { Json } from '@/types/database.types';
import { logAuditEvent } from './audit-actions';

interface SettingRecord {
    key: string;
    value: Json;
}

interface MediaFile {
    name: string;
    id: string;
    created_at: string;
    updated_at: string;
    metadata: {
        size?: number;
        mimetype?: string;
        [key: string]: unknown;
    };
    url?: string;
    folder?: string;
}

export async function getSettings(): Promise<{ settings: Record<string, string>; error: string | null }> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
        .from('settings')
        .select('*');

    if (error) return { settings: {}, error: error.message };

    const settingsObj: Record<string, string> = {};
    ((data || []) as SettingRecord[]).forEach((s) => {
        if (typeof s.value === 'string') {
            settingsObj[s.key] = s.value;
        } else if (s.value !== null && s.value !== undefined) {
            settingsObj[s.key] = String(s.value);
        }
    });

    return { settings: settingsObj, error: null };
}

export async function updateSettings(formData: FormData): Promise<{ error: string | null }> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const updates: { key: string; value: Json }[] = [];

    // Extract all form fields
    formData.forEach((value, key) => {
        if (typeof value === 'string') {
            // Convert to appropriate JSONB format
            let jsonValue: Json = value;
            if (value === 'true') jsonValue = true;
            else if (value === 'false') jsonValue = false;
            else if (!isNaN(Number(value)) && value.trim() !== '' && !value.includes(' ')) {
                // Only convert to number if it's purely numeric (no spaces)
                if (/^\d+$/.test(value) && value.length <= 10) {
                    jsonValue = Number(value);
                }
            }
            updates.push({ key, value: jsonValue });
        }
    });

    // Upsert each setting
    for (const { key, value } of updates) {
        const { error } = await supabase
            .from('settings')
            .upsert({ key, value }, { onConflict: 'key' });

        if (error) {
            console.error(`Error updating setting ${key}:`, error);
        }
    }

    // Revalidate paths that use settings
    revalidatePath('/admin/settings');
    revalidatePath('/');
    revalidatePath('/gioi-thieu');
    revalidatePath('/lien-he');

    // Audit log
    await logAuditEvent('update', 'settings', null, { updates: updates.map(u => u.key) });

    return { error: null };
}

// Media actions - enhanced with folder support
export async function getMediaFiles(options?: {
    folder?: string;
    limit?: number;
    type?: 'image' | 'video' | 'document' | 'all';
}): Promise<{ files: MediaFile[]; error: string | null }> {
    const supabase = await createServerSupabaseClient();

    const folder = options?.folder || 'uploads';
    const limit = options?.limit || 100;

    const { data, error } = await supabase.storage
        .from('media')
        .list(folder, {
            limit,
            sortBy: { column: 'created_at', order: 'desc' },
        });

    if (error) {
        console.error('Error listing media:', error);
        return { files: [], error: error.message };
    }

    // Get public URLs for each file
    const filesWithUrls: MediaFile[] = (data || [])
        .filter(file => !file.name.startsWith('.')) // Exclude hidden files
        .map((file) => {
            const { data: urlData } = supabase.storage
                .from('media')
                .getPublicUrl(`${folder}/${file.name}`);

            return {
                ...file,
                url: urlData.publicUrl,
                folder,
                metadata: file.metadata || {},
            };
        });

    // Filter by type if specified
    if (options?.type && options.type !== 'all') {
        const typeFilters: Record<string, string[]> = {
            image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
            video: ['mp4', 'webm', 'mov', 'avi'],
            document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
        };

        const extensions = typeFilters[options.type] || [];
        return {
            files: filesWithUrls.filter(f => {
                const ext = f.name.split('.').pop()?.toLowerCase() || '';
                return extensions.includes(ext);
            }),
            error: null
        };
    }

    return { files: filesWithUrls, error: null };
}

export async function uploadMedia(formData: FormData): Promise<{ url?: string; path?: string; error: string | null }> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const file = formData.get('file') as File;
    if (!file) return { error: 'No file provided' };

    // Generate unique filename
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const { data, error } = await supabase.storage
        .from('media')
        .upload(`uploads/${filename}`, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        console.error('Error uploading:', error);
        return { error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(`uploads/${filename}`);

    revalidatePath('/admin/media');
    return { url: urlData.publicUrl, path: data.path, error: null };
}

export async function deleteMedia(path: string): Promise<{ error: string | null }> {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.storage
        .from('media')
        .remove([path]);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin/media');
    return { error: null };
}

// Download counter
export async function incrementDownloadCount(softwareId: string, versionId: string): Promise<{ success: boolean }> {
    const supabase = await createServerSupabaseClient();

    // Log the download
    await supabase.from('download_logs').insert({
        version_id: versionId,
    });

    // Increment software download count using direct update
    // First get current count, then increment
    const { data: currentData } = await supabase
        .from('software_products')
        .select('download_count')
        .eq('id', softwareId)
        .single();

    if (currentData) {
        const newCount = (currentData.download_count || 0) + 1;
        await supabase
            .from('software_products')
            .update({ download_count: newCount })
            .eq('id', softwareId);
    }

    return { success: true };
}
