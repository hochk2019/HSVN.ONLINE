'use client';

import { useEffect, useRef } from 'react';
import { useTracking } from '@/hooks/useTracking';

interface TrackSoftwareViewProps {
    softwareId: string;
    slug: string;
}

/**
 * Client component to track software views
 * Mount this on server-rendered software pages
 */
export default function TrackSoftwareView({ softwareId, slug }: TrackSoftwareViewProps) {
    const { trackSoftwareView } = useTracking();
    const tracked = useRef(false);

    useEffect(() => {
        if (tracked.current) return;
        tracked.current = true;
        trackSoftwareView(softwareId, slug);
    }, [softwareId, slug, trackSoftwareView]);

    return null; // This component renders nothing
}
