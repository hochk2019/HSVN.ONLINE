'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

// Get session ID for experiments
function getSessionId(): string {
    if (typeof window === 'undefined') return '';

    let id = sessionStorage.getItem('experiment_session');
    if (!id) {
        id = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('experiment_session', id);
    }
    return id;
}

interface ExperimentConfig {
    slug: string;
    variants: {
        control: React.ReactNode;
        variant: React.ReactNode;
        [key: string]: React.ReactNode;
    };
    onVariantAssigned?: (variant: string) => void;
}

/**
 * Hook to get experiment variant
 */
export function useExperiment(experimentSlug: string) {
    const [variant, setVariant] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const sessionId = useMemo(() => getSessionId(), []);

    useEffect(() => {
        async function getVariant() {
            if (!sessionId || !experimentSlug) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `/api/experiment?slug=${experimentSlug}&sessionId=${sessionId}`
                );
                const data = await response.json();
                setVariant(data.variant);
            } catch (error) {
                console.warn('[Experiment] Failed to get variant:', error);
            } finally {
                setLoading(false);
            }
        }

        getVariant();
    }, [experimentSlug, sessionId]);

    // Record conversion
    const recordConversion = useCallback(async (
        conversionType: string = 'conversion',
        value: number = 0,
        metadata?: Record<string, unknown>
    ) => {
        if (!sessionId || !variant) return;

        try {
            await fetch('/api/experiment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    experimentSlug,
                    sessionId,
                    conversionType,
                    conversionValue: value,
                    metadata
                })
            });
        } catch (error) {
            console.warn('[Experiment] Failed to record conversion:', error);
        }
    }, [experimentSlug, sessionId, variant]);

    return {
        variant,
        loading,
        isControl: variant === 'control',
        isVariant: variant === 'variant',
        recordConversion,
        sessionId
    };
}

/**
 * A/B Test Component
 * Usage:
 * <ABTest slug="hero-cta">
 *   {{
 *     control: <Button>Option A</Button>,
 *     variant: <Button>Option B</Button>
 *   }}
 * </ABTest>
 */
export function ABTest({
    slug,
    children,
    fallback = null,
    onVariant
}: {
    slug: string;
    children: {
        control: React.ReactNode;
        variant: React.ReactNode;
        [key: string]: React.ReactNode;
    };
    fallback?: React.ReactNode;
    onVariant?: (variant: string) => void;
}) {
    const { variant, loading } = useExperiment(slug);

    useEffect(() => {
        if (variant && onVariant) {
            onVariant(variant);
        }
    }, [variant, onVariant]);

    if (loading) {
        return fallback || children.control;
    }

    if (!variant) {
        return children.control;
    }

    return children[variant] || children.control;
}

/**
 * Wrapper to track CTA clicks in experiments
 */
export function ExperimentCTA({
    experimentSlug,
    children,
    onClick,
    className
}: {
    experimentSlug: string;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}) {
    const { recordConversion } = useExperiment(experimentSlug);

    const handleClick = async () => {
        await recordConversion('click');
        onClick?.();
    };

    return (
        <div onClick={handleClick} className={className}>
            {children}
        </div>
    );
}
