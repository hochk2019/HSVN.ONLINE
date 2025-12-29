import { z } from 'zod';

// Post form schema
export const postSchema = z.object({
    title: z.string().min(1, 'Tiêu đề không được để trống'),
    slug: z.string().min(1, 'Slug không được để trống'),
    excerpt: z.string().optional(),
    content_html: z.string().optional(),
    content: z.any().optional(),
    category_id: z.string().optional(),
    status: z.enum(['draft', 'published', 'scheduled', 'archived']),
    scheduled_at: z.string().optional().nullable(),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
    featured_image: z.string().optional(),
    tag_ids: z.array(z.string()),
});

export type PostFormData = z.infer<typeof postSchema>;

// Contact form schema
export const contactSchema = z.object({
    name: z.string().min(1, 'Vui lòng nhập họ tên'),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().optional(),
    subject: z.string().min(1, 'Vui lòng nhập tiêu đề'),
    message: z.string().min(10, 'Nội dung tin nhắn quá ngắn'),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// Software form schema
export const softwareSchema = z.object({
    name: z.string().min(1, 'Tên phần mềm không được để trống'),
    slug: z.string().min(1, 'Slug không được để trống'),
    summary: z.string().optional(),
    description_html: z.string().optional(),
    description: z.any().optional(),
    highlights: z.any().optional(),
    requirements: z.any().optional(),
    category: z.string().optional(),
    icon_url: z.string().optional(),
    screenshots: z.any().optional(),
    status: z.enum(['active', 'inactive', 'coming_soon']).default('active'),
    is_featured: z.boolean().default(false),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
});

export type SoftwareFormData = z.infer<typeof softwareSchema>;

// Category schema
export const categorySchema = z.object({
    name: z.string().min(1, 'Tên chuyên mục không được để trống'),
    slug: z.string().min(1, 'Slug không được để trống'),
    description: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// Tag schema
export const tagSchema = z.object({
    name: z.string().min(1, 'Tên thẻ không được để trống'),
    slug: z.string().min(1, 'Slug không được để trống'),
});

export type TagFormData = z.infer<typeof tagSchema>;
