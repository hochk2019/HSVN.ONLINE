// Highlight search keyword in text
export function highlightKeyword(text: string, keyword: string): string {
    if (!text || !keyword) return text;
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-700">$1</mark>');
}

// Format date to Vietnamese locale
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('vi-VN', options || { year: 'numeric', month: 'long', day: 'numeric' });
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
}
