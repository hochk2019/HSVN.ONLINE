import Header from './Header';
import { getSettings } from '@/lib/settings-actions';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Default menu items if not configured in settings
const defaultNavItems = [
    { href: '/phan-mem', label: 'Phần mềm' },
    { href: '/cong-van', label: 'Công văn' },
    { href: '/hs-code', label: 'HS Code' },
    { href: '/thu-tuc-hai-quan', label: 'Thủ tục HQ' },
    { href: '/gioi-thieu', label: 'Giới thiệu' },
    { href: '/lien-he', label: 'Liên hệ' },
];

import type { NavItem } from '@/types/settings';

interface CategoryRow {
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
}

export default async function HeaderWrapper() {
    const { settings } = await getSettings();
    const supabase = await createServerSupabaseClient();

    // Fetch categories from database to build menu with dropdowns
    let categoriesWithChildren: Map<string, NavItem> = new Map();

    try {
        const { data: categories } = await supabase
            .from('categories')
            .select('id, name, slug, parent_id')
            .order('sort_order');

        if (categories && categories.length > 0) {
            const typedCategories = categories as CategoryRow[];

            // First pass: create all parent items
            const parentCategories = typedCategories.filter(c => !c.parent_id);
            parentCategories.forEach(parent => {
                categoriesWithChildren.set(parent.id, {
                    href: `/${parent.slug}`,
                    label: parent.name,
                    children: []
                });
            });

            // Second pass: add children to parents
            const childCategories = typedCategories.filter(c => c.parent_id);
            childCategories.forEach(child => {
                const parentItem = categoriesWithChildren.get(child.parent_id!);
                if (parentItem && parentItem.children) {
                    parentItem.children.push({
                        href: `/${child.slug}`,
                        label: child.name
                    });
                }
            });

            // Remove empty children arrays
            categoriesWithChildren.forEach((item, key) => {
                if (item.children && item.children.length === 0) {
                    delete item.children;
                }
            });
        }
    } catch {
        // Ignore errors
    }

    // Try to parse menu_items from settings, fallback to default
    let navItems: NavItem[] = defaultNavItems;

    if (settings.menu_items) {
        try {
            const parsed = JSON.parse(settings.menu_items);
            if (Array.isArray(parsed) && parsed.length > 0) {
                navItems = parsed;
            }
        } catch {
            // Use default if parsing fails
        }
    }

    // Enhance menu items with children from categories database
    // This adds dropdown support even for manually configured menus
    navItems = navItems.map(item => {
        // Find matching category by slug
        const matchingCategory = Array.from(categoriesWithChildren.values())
            .find(cat => cat.href === item.href);

        if (matchingCategory && matchingCategory.children && matchingCategory.children.length > 0) {
            return {
                ...item,
                children: matchingCategory.children
            };
        }
        return item;
    });

    // Check if auto-add categories is enabled
    if (settings.menu_auto_categories === 'true') {
        const existingHrefs = new Set(navItems.map(item => item.href));
        const newCategories = Array.from(categoriesWithChildren.values())
            .filter(cat => !existingHrefs.has(cat.href));

        // Insert new categories after first item
        if (newCategories.length > 0) {
            navItems = [...navItems.slice(0, 1), ...newCategories, ...navItems.slice(1)];
        }
    }

    const siteName = settings.site_name || 'Golden Logistics';

    return <Header navItems={navItems} siteName={siteName} />;
}
