import { getSettings } from '@/lib/settings-actions';
import { OrganizationSchema, WebSiteSchema } from './seo/StructuredData';

interface SEOWrapperProps {
    children: React.ReactNode;
}

export default async function SEOWrapper({ children }: SEOWrapperProps) {
    const { settings } = await getSettings();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hsvn.online';
    const siteName = settings['site_name'] || 'Golden Logistics';
    const siteDescription = settings['site_description'] || 'Cung cấp giải pháp logistics và phần mềm hải quan';
    const companyName = settings['company_name'] || 'Công ty TNHH Tiếp Vận Hoàng Kim';
    const contactEmail = settings['contact_email'] || '';
    const contactPhone = settings['contact_phone'] || '';
    const companyAddress = settings['company_address'] || '';
    const logoUrl = settings['logo_url'] || '/logo.png';
    const verificationCode = settings['google_site_verification'] || '';

    return (
        <>
            {/* Google Search Console Verification */}
            {verificationCode && (
                <meta name="google-site-verification" content={verificationCode} />
            )}

            {/* Structured Data - Organization */}
            <OrganizationSchema
                name={companyName}
                url={siteUrl}
                logo={`${siteUrl}${logoUrl}`}
                description={siteDescription}
                email={contactEmail}
                phone={contactPhone}
                address={companyAddress}
            />

            {/* Structured Data - WebSite with SearchAction */}
            <WebSiteSchema
                name={siteName}
                url={siteUrl}
                description={siteDescription}
            />

            {children}
        </>
    );
}
