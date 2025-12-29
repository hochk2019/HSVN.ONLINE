import Script from 'next/script';

interface OrganizationSchemaProps {
    name: string;
    url: string;
    logo?: string;
    description?: string;
    email?: string;
    phone?: string;
    address?: string;
}

interface WebSiteSchemaProps {
    name: string;
    url: string;
    description?: string;
}

interface ArticleSchemaProps {
    title: string;
    description: string;
    url: string;
    image?: string;
    datePublished: string;
    dateModified: string;
    author?: string;
}

interface SoftwareSchemaProps {
    name: string;
    description: string;
    url: string;
    image?: string;
    downloadCount?: number;
    version?: string;
}

interface BreadcrumbItem {
    name: string;
    url: string;
}

// Organization Schema
export function OrganizationSchema({
    name,
    url,
    logo,
    description,
    email,
    phone,
    address,
}: OrganizationSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name,
        url,
        ...(logo && { logo }),
        ...(description && { description }),
        ...(email && { email }),
        ...(phone && { telephone: phone }),
        ...(address && {
            address: {
                '@type': 'PostalAddress',
                streetAddress: address,
            },
        }),
    };

    return (
        <Script
            id="organization-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// WebSite Schema with SearchAction
export function WebSiteSchema({ name, url, description }: WebSiteSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name,
        url,
        ...(description && { description }),
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${url}/tim-kiem?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };

    return (
        <Script
            id="website-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// Article Schema
export function ArticleSchema({
    title,
    description,
    url,
    image,
    datePublished,
    dateModified,
    author,
}: ArticleSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description,
        url,
        ...(image && { image }),
        datePublished,
        dateModified,
        author: {
            '@type': 'Person',
            name: author || 'Golden Logistics',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Golden Logistics',
            logo: {
                '@type': 'ImageObject',
                url: `${new URL(url).origin}/logo.png`,
            },
        },
    };

    return (
        <Script
            id="article-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// Software Application Schema
export function SoftwareSchema({
    name,
    description,
    url,
    image,
    downloadCount,
    version,
}: SoftwareSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name,
        description,
        url,
        ...(image && { image }),
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Windows',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'VND',
        },
        ...(downloadCount && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '5',
                ratingCount: downloadCount,
            },
        }),
        ...(version && { softwareVersion: version }),
    };

    return (
        <Script
            id="software-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// Breadcrumb Schema
export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return (
        <Script
            id="breadcrumb-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
