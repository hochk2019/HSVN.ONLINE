'use client';

import { useEffect, useCallback, useMemo } from 'react';

// Generate or get session ID
function getSessionId(): string {
    if (typeof window === 'undefined') return '';

    let id = sessionStorage.getItem('tracking_session');
    if (!id) {
        id = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('tracking_session', id);
    }
    return id;
}

interface TrackEventOptions {
    eventType: string;
    targetType?: 'post' | 'software' | 'category' | 'page';
    targetId?: string;
    targetSlug?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Hook for tracking user events
 * Used for recommendation engine
 */
export function useTracking() {
    const sessionId = useMemo(() => getSessionId(), []);

    const trackEvent = useCallback(async (options: TrackEventOptions) => {
        if (!sessionId) return;

        try {
            await fetch('/api/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    ...options
                })
            });
        } catch (error) {
            console.warn('[Tracking] Failed:', error);
        }
    }, [sessionId]);

    // Track page view on mount
    const trackPageView = useCallback((path: string) => {
        trackEvent({
            eventType: 'page_view',
            targetType: 'page',
            targetSlug: path
        });
    }, [trackEvent]);

    // Track post view
    const trackPostView = useCallback((postId: string, slug: string) => {
        trackEvent({
            eventType: 'post_view',
            targetType: 'post',
            targetId: postId,
            targetSlug: slug
        });
    }, [trackEvent]);

    // Track software view
    const trackSoftwareView = useCallback((softwareId: string, slug: string) => {
        trackEvent({
            eventType: 'software_view',
            targetType: 'software',
            targetId: softwareId,
            targetSlug: slug
        });
    }, [trackEvent]);

    // Track download
    const trackDownload = useCallback((softwareId: string, versionId?: string) => {
        trackEvent({
            eventType: 'download',
            targetType: 'software',
            targetId: softwareId,
            metadata: { versionId }
        });
    }, [trackEvent]);

    // Track CTA click
    const trackCTAClick = useCallback((ctaId: string, ctaText: string) => {
        trackEvent({
            eventType: 'cta_click',
            metadata: { ctaId, ctaText }
        });
    }, [trackEvent]);

    // Track search
    const trackSearch = useCallback((query: string, resultsCount: number) => {
        trackEvent({
            eventType: 'search',
            metadata: { query, resultsCount }
        });
    }, [trackEvent]);

    return {
        sessionId,
        trackEvent,
        trackPageView,
        trackPostView,
        trackSoftwareView,
        trackDownload,
        trackCTAClick,
        trackSearch
    };
}

/**
 * Auto-track page views
 */
export function useAutoTrack() {
    const { trackPageView } = useTracking();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            trackPageView(window.location.pathname);
        }
    }, [trackPageView]);
}
