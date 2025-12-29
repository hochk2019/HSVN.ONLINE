import { getSettings } from '@/lib/settings-actions';
import ThemeProvider from './ThemeProvider';
import DynamicFavicon from './DynamicFavicon';
import GoogleAnalytics from './analytics/GoogleAnalytics';
import MicrosoftClarity from './analytics/MicrosoftClarity';
import FacebookPixel from './analytics/FacebookPixel';

interface ThemeWrapperProps {
    children: React.ReactNode;
}

export default async function ThemeWrapper({ children }: ThemeWrapperProps) {
    const { settings } = await getSettings();

    // Theme colors
    const primaryColor = settings['primary_color'] || '#d4a54a';
    const headingColor = settings['heading_color'] || '';

    // Favicon
    const faviconUrl = settings['favicon_url'] || '';
    const logoUrl = settings['logo_url'] || '/logo.png';

    // Analytics
    const gaId = settings['google_analytics'] || '';
    const clarityId = settings['microsoft_clarity'] || '';
    const fbPixelId = settings['facebook_pixel_id'] || '';

    return (
        <ThemeProvider primaryColor={primaryColor} headingColor={headingColor}>
            {/* Analytics Scripts */}
            <GoogleAnalytics gaId={gaId} />
            <MicrosoftClarity clarityId={clarityId} />
            <FacebookPixel pixelId={fbPixelId} />

            {/* Dynamic Favicon */}
            <DynamicFavicon faviconUrl={faviconUrl} logoUrl={logoUrl} />

            {children}
        </ThemeProvider>
    );
}
