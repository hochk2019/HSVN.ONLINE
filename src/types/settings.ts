// Settings type definitions

export interface NavItem {
    href: string;
    label: string;
    label_en?: string; // English label
    children?: NavItem[]; // Support for dropdown sub-items
}

export interface CTAButton {
    text: string;
    url: string;
    variant?: 'primary' | 'secondary';
}

export interface SiteSettings {
    // General
    site_name: string;
    site_description: string;
    contact_email: string;
    contact_phone: string;

    // Homepage
    hero_title: string;
    hero_title_en: string; // English
    hero_subtitle: string;
    hero_subtitle_en: string; // English
    company_name: string;
    company_name_en: string;
    company_address: string;
    company_address_en: string; // English

    // SEO
    default_meta_title: string;
    default_meta_description: string;
    google_analytics: string;
    microsoft_clarity: string;
    google_site_verification: string;

    // Facebook
    facebook_app_id: string;
    facebook_page: string;
    facebook_pixel_id: string;
    enable_facebook_comments: boolean;

    // Appearance
    primary_color: string;
    heading_color: string;
    logo_url: string;
    favicon_url: string;

    // Navigation Menu (stored as JSON string)
    menu_items: NavItem[];

    // CTA Buttons
    cta_primary_text: string;
    cta_primary_text_en: string; // English
    cta_primary_url: string;
    cta_secondary_text: string;
    cta_secondary_text_en: string; // English
    cta_secondary_url: string;
}

// Default values
export const defaultSettings: SiteSettings = {
    site_name: 'Golden Logistics',
    site_description: 'Cung cấp phần mềm hỗ trợ nghiệp vụ hải quan',
    contact_email: 'hochk2019@gmail.com',
    contact_phone: '0868.333.606',
    hero_title: 'Golden Logistics Cung Cấp Giải Pháp Vận Chuyển và Thủ Tục Hải Quan Chuyên Nghiệp',
    hero_title_en: 'Golden Logistics - Professional Customs Procedures & Shipping Solutions',
    hero_subtitle: 'Cung cấp phần mềm hỗ trợ nghiệp vụ hải quan, tự động hóa quy trình xuất nhập khẩu',
    hero_subtitle_en: 'Providing customs software, automating import-export processes, and latest legal updates.',
    company_name: 'Công ty TNHH Tiếp Vận Hoàng Kim',
    company_name_en: 'Golden Logistics Co., Ltd',
    company_address: 'TP. Hồ Chí Minh, Việt Nam',
    company_address_en: 'Ho Chi Minh City, Vietnam',
    default_meta_title: 'Golden Logistics',
    default_meta_description: 'Cung cấp giải pháp logistics và phần mềm hải quan',
    google_analytics: '',
    microsoft_clarity: '',
    google_site_verification: '',
    facebook_app_id: '',
    facebook_page: '',
    facebook_pixel_id: '',
    enable_facebook_comments: true,
    primary_color: '#d4a54a',
    heading_color: '',
    logo_url: '/logo.png',
    favicon_url: '/favicon.ico',
    menu_items: [
        { href: '/phan-mem', label: 'Phần mềm', label_en: 'Software' },
        { href: '/cong-van', label: 'Công văn', label_en: 'Regulations' },
        { href: '/hs-code', label: 'HS Code', label_en: 'HS Code' },
        { href: '/thu-tuc-hai-quan', label: 'Thủ tục HQ', label_en: 'Customs Procedures' },
        { href: '/gioi-thieu', label: 'Giới thiệu', label_en: 'About Us' },
        { href: '/lien-he', label: 'Liên hệ', label_en: 'Contact' },
    ],
    cta_primary_text: 'Xem phần mềm',
    cta_primary_text_en: 'View Software',
    cta_primary_url: '/phan-mem',
    cta_secondary_text: 'Liên hệ tư vấn',
    cta_secondary_text_en: 'Contact Us',
    cta_secondary_url: '/lien-he',
};

// Helper to parse raw settings to typed settings
export function parseSettings(raw: Record<string, string>): Partial<SiteSettings> {
    const settings: Partial<SiteSettings> = {};

    // String fields - direct copy
    const stringFields: (keyof SiteSettings)[] = [
        'site_name', 'site_description', 'contact_email', 'contact_phone',
        'hero_title', 'hero_subtitle', 'company_name', 'company_address',
        'hero_title_en', 'hero_subtitle_en', 'company_name_en', 'company_address_en',
        'default_meta_title', 'default_meta_description', 'google_analytics',
        'microsoft_clarity', 'google_site_verification',
        'facebook_app_id', 'facebook_page', 'facebook_pixel_id',
        'primary_color', 'heading_color', 'logo_url', 'favicon_url',
        'cta_primary_text', 'cta_primary_url', 'cta_secondary_text', 'cta_secondary_url',
        'cta_primary_text_en', 'cta_secondary_text_en',
    ];

    stringFields.forEach((key) => {
        if (raw[key]) {
            (settings as Record<string, string>)[key] = raw[key];
        }
    });

    // Boolean fields
    if (raw.enable_facebook_comments !== undefined) {
        settings.enable_facebook_comments = raw.enable_facebook_comments === 'true';
    }

    // JSON fields
    if (raw.menu_items) {
        try {
            settings.menu_items = JSON.parse(raw.menu_items);
        } catch {
            // Keep undefined, will use default
        }
    }

    return settings;
}

// Merge with defaults
export function getTypedSettings(raw: Record<string, string>): SiteSettings {
    const parsed = parseSettings(raw);
    return { ...defaultSettings, ...parsed };
}
