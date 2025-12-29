import Parser from 'rss-parser';

export interface FeedItem {
    title: string;
    link: string;
    content: string;
    contentSnippet?: string;
    pubDate?: string;
    creator?: string;
    categories?: string[];
    enclosure?: {
        url: string;
        type?: string;
    };
    'media:content'?: {
        $: {
            url: string;
        };
    };
}

export interface ParsedFeed {
    title?: string;
    link?: string;
    items: FeedItem[];
}

const parser = new Parser({
    customFields: {
        item: [
            ['media:content', 'media:content'],
            ['content:encoded', 'content'],
        ],
    },
});

/**
 * Parse an RSS/Atom feed URL and return structured items
 */
export async function parseFeed(url: string): Promise<ParsedFeed> {
    try {
        const feed = await parser.parseURL(url);

        return {
            title: feed.title,
            link: feed.link,
            items: (feed.items || []).map((item) => ({
                title: item.title || '',
                link: item.link || '',
                content: item['content:encoded'] || item.content || item.contentSnippet || '',
                contentSnippet: item.contentSnippet,
                pubDate: item.pubDate,
                creator: item.creator,
                categories: item.categories,
                enclosure: item.enclosure,
                'media:content': item['media:content'],
            })),
        };
    } catch (error) {
        console.error('Error parsing feed:', url, error);
        throw error;
    }
}

/**
 * Extract the best available image from a feed item
 */
export function extractFeaturedImage(item: FeedItem): string | null {
    // Check enclosure
    if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
        return item.enclosure.url;
    }

    // Check media:content
    if (item['media:content']?.$?.url) {
        return item['media:content'].$.url;
    }

    // Try to extract from content HTML
    const imgMatch = item.content?.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch?.[1]) {
        return imgMatch[1];
    }

    return null;
}

/**
 * Clean HTML content - remove scripts, styles, and unwanted tags
 */
export function cleanContent(html: string): string {
    if (!html) return '';

    return html
        // Remove scripts
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove styles
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        // Remove comments
        .replace(/<!--[\s\S]*?-->/g, '')
        // Remove inline event handlers
        .replace(/\s+on\w+="[^"]*"/gi, '')
        // Fix relative URLs (basic)
        .replace(/src="\//g, 'src="')
        .replace(/href="\//g, 'href="')
        // Clean extra whitespace
        .replace(/\s+/g, ' ')
        .trim();
}
