'use client';

import { useEffect, useRef } from 'react';

interface TrackPostViewProps {
    postId: string;
    slug: string; // Keep for compatibility if needed, though path handles it
}

export default function TrackPostView({ postId, slug }: TrackPostViewProps) {
    const visitIdRef = useRef<string | null>(null);

    useEffect(() => {
        // Init visit
        const initVisit = async () => {
            try {
                const res = await fetch('/api/track/view', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        postId,
                        path: window.location.pathname,
                        referrer: document.referrer,
                        userAgent: navigator.userAgent,
                        type: 'init'
                    })
                });
                const data = await res.json();
                if (data.visitId) {
                    visitIdRef.current = data.visitId;
                }
            } catch (e) {
                console.error('Track init failed', e);
            }
        };

        // Delay 2s to ensure page is viewed
        const timer = setTimeout(() => {
            if (!visitIdRef.current) {
                initVisit();
            }
        }, 2000);

        // Heartbeat every 30s
        const interval = setInterval(async () => {
            if (visitIdRef.current) {
                try {
                    await fetch('/api/track/view', {
                        method: 'POST',
                        body: JSON.stringify({
                            type: 'heartbeat',
                            visitId: visitIdRef.current
                        })
                    });
                } catch { }
            }
        }, 30000);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [postId, slug]);

    return null;
}
