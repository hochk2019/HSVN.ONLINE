'use client';

import { useEffect } from 'react';

interface ThemeProviderProps {
    primaryColor?: string;
    headingColor?: string;
    children: React.ReactNode;
}

// Convert hex to HSL for better color manipulation
function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
    // Remove # if present
    hex = hex.replace('#', '');

    if (hex.length !== 6) return null;

    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Generate darker/lighter variations
function adjustLightness(hex: string, amount: number): string {
    const hsl = hexToHsl(hex);
    if (!hsl) return hex;

    const newL = Math.max(0, Math.min(100, hsl.l + amount));
    return `hsl(${hsl.h}, ${hsl.s}%, ${newL}%)`;
}

export default function ThemeProvider({ primaryColor, headingColor, children }: ThemeProviderProps) {
    useEffect(() => {
        const root = document.documentElement;

        // Apply primary color
        if (primaryColor && primaryColor !== '#d4a54a') {
            const hsl = hexToHsl(primaryColor);
            if (hsl) {
                // Set CSS variables
                root.style.setProperty('--color-golden', primaryColor);
                root.style.setProperty('--color-golden-dark', adjustLightness(primaryColor, -15));
                root.style.setProperty('--color-golden-light', adjustLightness(primaryColor, 15));
                root.style.setProperty('--color-golden-hsl', `${hsl.h} ${hsl.s}% ${hsl.l}%`);

                // Update Tailwind-compatible classes
                root.style.setProperty('--golden', primaryColor);
                root.style.setProperty('--golden-dark', adjustLightness(primaryColor, -15));
            }
        } else {
            // Reset to default
            root.style.removeProperty('--color-golden');
            root.style.removeProperty('--color-golden-dark');
            root.style.removeProperty('--color-golden-light');
            root.style.removeProperty('--color-golden-hsl');
            root.style.removeProperty('--golden');
            root.style.removeProperty('--golden-dark');
        }

        // Apply heading color
        if (headingColor) {
            root.style.setProperty('--color-heading', headingColor);
        } else {
            root.style.removeProperty('--color-heading');
        }

        // Cleanup on unmount
        return () => {
            root.style.removeProperty('--color-golden');
            root.style.removeProperty('--color-golden-dark');
            root.style.removeProperty('--color-golden-light');
            root.style.removeProperty('--color-golden-hsl');
            root.style.removeProperty('--golden');
            root.style.removeProperty('--golden-dark');
            root.style.removeProperty('--color-heading');
        };
    }, [primaryColor, headingColor]);

    return <>{children}</>;
}
