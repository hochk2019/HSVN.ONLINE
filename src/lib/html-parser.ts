/**
 * Utility to parse and clean full HTML documents for TipTap editor
 * Handles: DOCTYPE, head/style extraction, figure/figcaption conversion
 */

/**
 * Extracts CSS rules from style tags and converts class-based styles to inline
 */
function extractStyleRules(html: string): Map<string, Record<string, string>> {
    const styleMap = new Map<string, Record<string, string>>();

    // Match all <style> tags
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let match;

    while ((match = styleRegex.exec(html)) !== null) {
        const cssContent = match[1];

        // Parse CSS rules (simple parser for class selectors)
        const ruleRegex = /\.([a-zA-Z0-9_-]+)\s*\{([^}]+)\}/g;
        let ruleMatch;

        while ((ruleMatch = ruleRegex.exec(cssContent)) !== null) {
            const className = ruleMatch[1];
            const cssProperties = ruleMatch[2];

            // Parse individual properties
            const props: Record<string, string> = {};
            const propRegex = /([a-zA-Z-]+)\s*:\s*([^;]+);?/g;
            let propMatch;

            while ((propMatch = propRegex.exec(cssProperties)) !== null) {
                const propName = propMatch[1].trim();
                const propValue = propMatch[2].trim();
                props[propName] = propValue;
            }

            if (Object.keys(props).length > 0) {
                styleMap.set(className, props);
            }
        }
    }

    return styleMap;
}

/**
 * Converts CSS properties object to inline style string
 */
function propsToInlineStyle(props: Record<string, string>): string {
    return Object.entries(props)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ');
}

/**
 * Applies extracted CSS classes as inline styles to elements
 */
function applyInlineStyles(html: string, styleMap: Map<string, Record<string, string>>): string {
    let result = html;

    // For each class in styleMap, find elements with that class and add inline styles
    styleMap.forEach((props, className) => {
        const inlineStyle = propsToInlineStyle(props);

        // Match elements with this class
        const classRegex = new RegExp(`class="([^"]*\\b${className}\\b[^"]*)"`, 'gi');

        result = result.replace(classRegex, (match, classValue) => {
            // Check if element already has style attribute nearby
            return `class="${classValue}" style="${inlineStyle}"`;
        });
    });

    return result;
}

/**
 * Extracts body content from full HTML document
 */
function extractBodyContent(html: string): string {
    // Try to extract content from <body> tag
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
        return bodyMatch[1].trim();
    }

    // Try to extract content from <article> tag
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
        return articleMatch[1].trim();
    }

    // If no body/article found, remove DOCTYPE, html, head tags
    let content = html;
    content = content.replace(/<!DOCTYPE[^>]*>/gi, '');
    content = content.replace(/<html[^>]*>/gi, '');
    content = content.replace(/<\/html>/gi, '');
    content = content.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
    content = content.replace(/<body[^>]*>/gi, '');
    content = content.replace(/<\/body>/gi, '');

    return content.trim();
}

/**
 * Converts <figure>/<figcaption> to TipTap-compatible format
 */
function convertFiguresToImages(html: string): string {
    // Pattern: <figure...><img...><figcaption>...</figcaption></figure>
    const figureRegex = /<figure[^>]*>\s*<img([^>]*)>\s*<figcaption[^>]*>([\s\S]*?)<\/figcaption>\s*<\/figure>/gi;

    let result = html.replace(figureRegex, (match, imgAttrs, caption) => {
        // Extract existing attributes
        const srcMatch = imgAttrs.match(/src="([^"]*)"/);
        const altMatch = imgAttrs.match(/alt="([^"]*)"/);

        const src = srcMatch ? srcMatch[1] : '';
        const alt = altMatch ? altMatch[1] : '';

        // Clean caption (remove em/italic tags for simpler output)
        const cleanCaption = caption.replace(/<[^>]+>/g, '').trim();

        // Return image with caption as paragraph below
        return `<p style="text-align: center;"><img src="${src}" alt="${alt || cleanCaption}"></p>
<p style="text-align: center; font-style: italic; color: #666; font-size: 0.9em;">${cleanCaption}</p>`;
    });

    // Also handle figures without figcaption
    result = result.replace(/<figure[^>]*>\s*<img([^>]*)>\s*<\/figure>/gi, (match, imgAttrs) => {
        return `<p style="text-align: center;"><img${imgAttrs}></p>`;
    });

    return result;
}

/**
 * Removes attributes that TipTap doesn't understand well
 */
function cleanupAttributes(html: string): string {
    let result = html;

    // Remove onerror handlers (security)
    result = result.replace(/\s*onerror="[^"]*"/gi, '');

    // Remove article tags but keep content
    result = result.replace(/<\/?article[^>]*>/gi, '');

    // Keep div but simplify
    result = result.replace(/<div\s+class="contact-box"[^>]*>/gi,
        '<div style="background: #e9ecef; padding: 15px; border-radius: 5px; margin-top: 20px; border-left: 5px solid #0056b3;">');

    return result;
}

/**
 * Main function to parse full HTML document for TipTap
 * @param html - Full HTML document or snippet
 * @returns Cleaned HTML suitable for TipTap editor
 */
export function parseFullHtml(html: string): string {
    if (!html || !html.trim()) {
        return '';
    }

    // Check if this is a full HTML document
    const isFullDocument = html.includes('<!DOCTYPE') ||
        html.includes('<html') ||
        html.includes('<head') ||
        html.includes('<style');

    if (!isFullDocument) {
        // If it's just a snippet, return as-is with basic cleanup
        return cleanupAttributes(html);
    }

    // 1. Extract CSS rules from style tags
    const styleMap = extractStyleRules(html);

    // 2. Extract body content
    let content = extractBodyContent(html);

    // 3. Apply CSS classes as inline styles
    if (styleMap.size > 0) {
        content = applyInlineStyles(content, styleMap);
    }

    // 4. Convert figure/figcaption to TipTap format
    content = convertFiguresToImages(content);

    // 5. Cleanup unsupported attributes
    content = cleanupAttributes(content);

    // 6. Clean up excessive whitespace
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    return content.trim();
}

export default parseFullHtml;
