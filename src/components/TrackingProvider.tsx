'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Tracking Provider Component
 * Add to layout.tsx to auto-track page views
 */
export default function TrackingProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    useEffect(() => {
        // Get or create session ID
        let sessionId = sessionStorage.getItem('tracking_session');
        if (!sessionId) {
            sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            sessionStorage.setItem('tracking_session', sessionId);
        }

        // Track page view
        const trackPageView = async () => {
            try {
                await fetch('/api/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId,
                        eventType: 'page_view',
                        targetType: 'page',
                        targetSlug: pathname
                    })
                });
            } catch (error) {
                // Silent fail - tracking should not break the app
            }
        };

        // Slight delay to not block rendering
        const timer = setTimeout(trackPageView, 100);
        return () => clearTimeout(timer);
    }, [pathname]);

    return <>{children}</>;
}
