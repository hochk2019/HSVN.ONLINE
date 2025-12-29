import { cache } from 'react';
import { getSettings } from './settings-actions';

/**
 * Cached settings getter using React cache()
 * This ensures settings are only fetched once per request
 */
export const getCachedSettings = cache(async () => {
    const { settings, error } = await getSettings();
    if (error) {
        console.error('Error fetching cached settings:', error);
    }
    return settings;
});

/**
 * Get a specific setting value with fallback
 */
export async function getSetting(key: string, fallback: string = ''): Promise<string> {
    const settings = await getCachedSettings();
    return settings[key] || fallback;
}

/**
 * Get multiple settings at once
 */
export async function getSettingsMultiple(keys: string[]): Promise<Record<string, string>> {
    const settings = await getCachedSettings();
    const result: Record<string, string> = {};
    for (const key of keys) {
        result[key] = settings[key] || '';
    }
    return result;
}
