'use server';

import { createServerSupabaseClient } from './supabase-server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function login(formData: FormData) {
    const supabase = await createServerSupabaseClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Email và mật khẩu là bắt buộc' };
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: 'Email hoặc mật khẩu không đúng' };
    }

    revalidatePath('/admin', 'layout');

    const redirectTo = formData.get('redirectTo') as string || '/admin/dashboard';
    redirect(redirectTo);
}

export async function logout() {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    revalidatePath('/admin', 'layout');
    redirect('/admin/login');
}

export async function getSession() {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

export async function getUser() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function getUserProfile() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return profile as {
        id: string;
        email: string | null;
        full_name: string | null;
        avatar_url: string | null;
        role: 'admin' | 'editor';
        created_at: string;
        updated_at: string;
    } | null;
}

export async function requireAuth() {
    const user = await getUser();
    if (!user) {
        redirect('/admin/login');
    }
    return user;
}

export async function requireAdmin() {
    const profile = await getUserProfile();
    if (!profile || profile.role !== 'admin') {
        redirect('/admin/dashboard?error=unauthorized');
    }
    return profile;
}
