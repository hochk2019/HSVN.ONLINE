'use server';

import { createServerSupabaseClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notification-actions';

export interface ContactFormData {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
}

export interface ContactFormResult {
    success: boolean;
    error?: string;
}

// Rate limit: max 3 submissions per hour per email
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function submitContactForm(formData: FormData): Promise<ContactFormResult> {
    try {
        const supabase = await createServerSupabaseClient();

        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string | null;
        const subject = formData.get('subject') as string;
        const message = formData.get('message') as string;
        const honeypot = formData.get('website_url') as string;

        // Honeypot check - if filled, it's a bot
        if (honeypot) {
            // Silently reject but return success to not alert the bot
            console.log('Honeypot trap triggered - bot submission rejected');
            return { success: true };
        }

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return { success: false, error: 'Vui lòng điền đầy đủ thông tin bắt buộc' };
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { success: false, error: 'Email không hợp lệ' };
        }

        // Rate limiting: check recent submissions from this email
        const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
        const { count } = await supabase
            .from('contact_messages')
            .select('id', { count: 'exact', head: true })
            .eq('email', email)
            .gte('created_at', oneHourAgo);

        if (count && count >= RATE_LIMIT_MAX) {
            return {
                success: false,
                error: 'Bạn đã gửi quá nhiều tin nhắn. Vui lòng thử lại sau 1 giờ.'
            };
        }

        // Insert into database
        const { error } = await supabase
            .from('contact_messages')
            .insert({
                name,
                email,
                phone: phone || null,
                subject,
                message,
                status: 'new',
                created_at: new Date().toISOString(),
            });

        if (error) {
            console.error('Contact form error:', error);
            return { success: false, error: 'Có lỗi xảy ra, vui lòng thử lại sau' };
        }

        // Revalidate admin contacts page
        revalidatePath('/admin/contacts');

        // Create notification for admin
        await createNotification({
            type: 'contact',
            title: 'Liên hệ mới',
            message: `${name} đã gửi tin nhắn: ${subject}`,
            link: '/admin/contacts',
        });

        // Auto-analyze contact intent with AI (background, non-blocking)
        try {
            // Fire and forget - don't wait for response
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
            fetch(`${baseUrl}/api/ai/contact-intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    subject,
                    autoSave: true,
                    email, // Used to find and update the contact
                }),
            }).catch(() => {
                // Silently ignore errors - this is a background enhancement
            });
        } catch {
            // Silent fail - don't affect main flow
        }

        return { success: true };
    } catch (err) {
        console.error('Contact form exception:', err);
        return { success: false, error: 'Có lỗi xảy ra, vui lòng thử lại sau' };
    }
}

