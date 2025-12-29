/**
 * Generate a preview token for unpublished posts
 * Token is valid for 24 hours
 */
export function generatePreviewToken(postId: string): string {
    const payload = `${postId}:${Date.now()}`;
    // Use btoa for browser compatibility, or Buffer in Node
    if (typeof window !== 'undefined') {
        return btoa(payload);
    }
    return Buffer.from(payload).toString('base64');
}

/**
 * Get preview URL for a post
 */
export function getPreviewUrl(postId: string): string {
    const token = generatePreviewToken(postId);
    return `/admin/posts/${postId}/preview?token=${encodeURIComponent(token)}`;
}
