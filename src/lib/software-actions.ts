'use server';

import { createServerSupabaseClient } from './supabase-server';
import { revalidatePath } from 'next/cache';
import type { Json } from '@/types/database.types';
import { logAuditEvent } from './audit-actions';

// Software product type
interface SoftwareData {
    id: string;
    name: string;
    slug: string;
    summary: string | null;
    description_html: string | null;
    description: object | null;
    highlights: string[] | null;
    system_requirements: { os?: string; ram?: string; disk?: string; other?: string } | null;
    faq: { question: string; answer: string }[] | null;
    icon_url: string | null;
    screenshots: string[] | null;
    status: 'active' | 'inactive' | 'coming_soon';
    is_featured: boolean;
    meta_title: string | null;
    meta_description: string | null;
    download_count: number;
    created_at: string;
    updated_at: string;
}

// Version type
interface VersionData {
    id: string;
    software_id: string | null;
    version: string;
    release_notes: string | null;
    file_url: string | null;
    file_name: string | null;
    file_size: number | null;
    is_latest: boolean;
    status: 'active' | 'inactive' | 'beta';
    released_at: string;
    created_at: string;
}

export async function getSoftwareProducts(options?: {
    status?: string;
    limit?: number;
    offset?: number;
    search?: string;
}): Promise<{ products: SoftwareData[]; count: number; error: string | null }> {
    const supabase = await createServerSupabaseClient();

    let query = supabase
        .from('software_products')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

    if (options?.status) {
        query = query.eq('status', options.status);
    }
    if (options?.search) {
        query = query.ilike('name', `%${options.search}%`);
    }
    if (options?.limit) {
        query = query.limit(options.limit);
    }
    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching software:', error);
        return { products: [], count: 0, error: error.message };
    }

    return { products: data as SoftwareData[] || [], count: count || 0, error: null };
}

export async function getSoftwareById(id: string): Promise<{ software: SoftwareData | null; error: string | null }> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('software_products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        return { software: null, error: error.message };
    }

    return { software: data as SoftwareData, error: null };
}

export async function getSoftwareBySlug(slug: string): Promise<{ software: SoftwareData | null; error: string | null }> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('software_products')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        return { software: null, error: error.message };
    }

    return { software: data as SoftwareData, error: null };
}

export async function createSoftware(formData: FormData) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const summary = formData.get('summary') as string;
    const descriptionHtml = formData.get('description_html') as string;
    const descriptionJson = formData.get('description') as string;
    const status = formData.get('status') as string || 'inactive';
    const isFeatured = formData.get('is_featured') === 'true';
    const metaTitle = formData.get('meta_title') as string;
    const metaDescription = formData.get('meta_description') as string;

    // Extended fields
    const highlightsJson = formData.get('highlights') as string;
    const requirementsJson = formData.get('requirements') as string;
    const faqJson = formData.get('faq') as string;

    const { data, error } = await supabase
        .from('software_products')
        .insert({
            name,
            slug,
            summary,
            description_html: descriptionHtml,
            description: descriptionJson ? JSON.parse(descriptionJson) : null,
            highlights: highlightsJson ? JSON.parse(highlightsJson) : null,
            system_requirements: requirementsJson ? JSON.parse(requirementsJson) : null,
            faq: faqJson ? JSON.parse(faqJson) : null,
            status,
            is_featured: isFeatured,
            meta_title: metaTitle || name,
            meta_description: metaDescription || summary,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating software:', error);
        return { error: error.message };
    }

    revalidatePath('/admin/software');

    // Audit log
    await logAuditEvent('create', 'software', data.id, { name, status });

    return { software: data, error: null };
}

export async function updateSoftware(id: string, formData: FormData) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const summary = formData.get('summary') as string;
    const descriptionHtml = formData.get('description_html') as string;
    const descriptionJson = formData.get('description') as string;
    const status = formData.get('status') as string;
    const isFeatured = formData.get('is_featured') === 'true';
    const metaTitle = formData.get('meta_title') as string;
    const metaDescription = formData.get('meta_description') as string;

    // Extended fields
    const highlightsJson = formData.get('highlights') as string;
    const requirementsJson = formData.get('requirements') as string;
    const faqJson = formData.get('faq') as string;

    const { data, error } = await supabase
        .from('software_products')
        .update({
            name,
            slug,
            summary,
            description_html: descriptionHtml,
            description: descriptionJson ? JSON.parse(descriptionJson) : null,
            highlights: highlightsJson ? JSON.parse(highlightsJson) : null,
            system_requirements: requirementsJson ? JSON.parse(requirementsJson) : null,
            faq: faqJson ? JSON.parse(faqJson) : null,
            status,
            is_featured: isFeatured,
            meta_title: metaTitle || name,
            meta_description: metaDescription || summary,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating software:', error);
        return { error: error.message };
    }

    revalidatePath('/admin/software');
    revalidatePath(`/admin/software/${id}`);

    // Audit log
    await logAuditEvent('update', 'software', id, { name: formData.get('name'), status: formData.get('status') });

    return { software: data, error: null };
}

export async function deleteSoftware(id: string) {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
        .from('software_products')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting software:', error);
        return { error: error.message };
    }

    // Audit log
    await logAuditEvent('delete', 'software', id);

    revalidatePath('/admin/software');
    return { error: null };
}

// Version management
export async function getSoftwareVersions(softwareId: string): Promise<{ versions: VersionData[]; error: string | null }> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('software_versions')
        .select('*')
        .eq('software_id', softwareId)
        .order('released_at', { ascending: false });

    if (error) {
        return { versions: [], error: error.message };
    }

    return { versions: data as VersionData[] || [], error: null };
}

export async function createVersion(formData: FormData) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    const softwareId = formData.get('software_id') as string;
    const version = formData.get('version') as string;
    const releaseNotes = formData.get('release_notes') as string;
    const fileUrl = formData.get('file_url') as string;
    const fileName = formData.get('file_name') as string;
    const fileSize = parseInt(formData.get('file_size') as string) || null;
    const isLatest = formData.get('is_latest') === 'true';
    const status = formData.get('status') as string || 'active';

    // If this is set as latest, unset other latest versions
    if (isLatest) {
        await supabase
            .from('software_versions')
            .update({ is_latest: false })
            .eq('software_id', softwareId);
    }

    const { data, error } = await supabase
        .from('software_versions')
        .insert({
            software_id: softwareId,
            version,
            release_notes: releaseNotes,
            file_url: fileUrl,
            file_name: fileName,
            file_size: fileSize,
            is_latest: isLatest,
            status,
            released_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating version:', error);
        return { error: error.message };
    }

    revalidatePath(`/admin/software/${softwareId}`);
    return { version: data, error: null };
}

export async function deleteVersion(id: string, softwareId: string) {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
        .from('software_versions')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting version:', error);
        return { error: error.message };
    }

    revalidatePath(`/admin/software/${softwareId}`);
    return { error: null };
}
