'use server';

import { createServerSupabaseClient } from './supabase-server';

export interface AdminSearchResult {
    type: 'post' | 'contact' | 'software' | 'user';
    id: string;
    title: string;
    subtitle?: string;
    link: string;
}

export async function adminSearch(query: string): Promise<{
    results: AdminSearchResult[];
    error: string | null;
}> {
    if (!query || query.trim().length < 2) {
        return { results: [], error: null };
    }

    const supabase = await createServerSupabaseClient();
    const searchTerm = `%${query.trim()}%`;
    const results: AdminSearchResult[] = [];

    try {
        // Search posts
        const { data: posts } = await supabase
            .from('posts')
            .select('id, title, slug, status')
            .ilike('title', searchTerm)
            .limit(5);

        if (posts) {
            results.push(...posts.map(p => ({
                type: 'post' as const,
                id: p.id,
                title: p.title,
                subtitle: p.status || undefined,
                link: `/admin/posts/${p.id}`,
            })));
        }

        // Search contacts
        const { data: contacts } = await supabase
            .from('contact_messages')
            .select('id, name, email, subject')
            .or(`name.ilike.${searchTerm},email.ilike.${searchTerm},subject.ilike.${searchTerm}`)
            .limit(5);

        if (contacts) {
            results.push(...contacts.map(c => ({
                type: 'contact' as const,
                id: c.id,
                title: c.name,
                subtitle: c.subject || c.email,
                link: `/admin/contacts?search=${encodeURIComponent(c.name)}`,
            })));
        }

        // Search software
        const { data: software } = await supabase
            .from('software_products')
            .select('id, name, slug, status')
            .ilike('name', searchTerm)
            .limit(5);

        if (software) {
            results.push(...software.map(s => ({
                type: 'software' as const,
                id: s.id,
                title: s.name,
                subtitle: s.status || undefined,
                link: `/admin/software/${s.id}`,
            })));
        }

        // Search users
        const { data: users } = await supabase
            .from('profiles')
            .select('id, full_name, email, role')
            .or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
            .limit(3);

        if (users) {
            results.push(...users.map(u => ({
                type: 'user' as const,
                id: u.id,
                title: u.full_name || u.email || 'Unknown',
                subtitle: u.role || 'user',
                link: `/admin/users`,
            })));
        }

        return { results, error: null };
    } catch (err) {
        console.error('Admin search error:', err);
        return { results: [], error: 'Search failed' };
    }
}
