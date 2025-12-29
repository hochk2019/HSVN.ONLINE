/**
 * Privacy utilities for masking sensitive information
 */

/**
 * Mask email address: example@domain.com → e***le@domain.com
 */
export function maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email;

    const [local, domain] = email.split('@');
    if (local.length <= 2) {
        return `${local[0]}***@${domain}`;
    }
    return `${local[0]}***${local.slice(-1)}@${domain}`;
}

/**
 * Mask phone number: 0912345678 → 091****678
 */
export function maskPhone(phone: string): string {
    if (!phone || phone.length < 6) return phone;

    // Remove non-digits for processing
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 6) return phone;

    const first = digits.slice(0, 3);
    const last = digits.slice(-3);
    return `${first}****${last}`;
}

/**
 * Format phone for display (with obfuscation)
 */
export function formatPhoneForDisplay(phone: string, mask: boolean = true): string {
    if (!phone) return '';
    return mask ? maskPhone(phone) : phone;
}

/**
 * Format email for display (with optional obfuscation)
 */
export function formatEmailForDisplay(email: string, mask: boolean = true): string {
    if (!email) return '';
    return mask ? maskEmail(email) : email;
}
