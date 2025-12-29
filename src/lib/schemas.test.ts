import { describe, it, expect } from 'vitest';
import { postSchema, contactSchema } from '@/lib/schemas';

describe('postSchema', () => {
    it('should validate a valid post', () => {
        const validPost = {
            title: 'Test Post',
            slug: 'test-post',
            status: 'draft' as const,
            tag_ids: [],
        };

        const result = postSchema.safeParse(validPost);
        expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
        const invalidPost = {
            title: '',
            slug: 'test-post',
            status: 'draft' as const,
            tag_ids: [],
        };

        const result = postSchema.safeParse(invalidPost);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Tiêu đề không được để trống');
        }
    });

    it('should reject empty slug', () => {
        const invalidPost = {
            title: 'Test',
            slug: '',
            status: 'draft' as const,
            tag_ids: [],
        };

        const result = postSchema.safeParse(invalidPost);
        expect(result.success).toBe(false);
    });

    it('should reject invalid status', () => {
        const invalidPost = {
            title: 'Test',
            slug: 'test',
            status: 'invalid' as const,
            tag_ids: [],
        };

        const result = postSchema.safeParse(invalidPost);
        expect(result.success).toBe(false);
    });
});

describe('contactSchema', () => {
    it('should validate a valid contact form', () => {
        const validContact = {
            name: 'John Doe',
            email: 'john@example.com',
            subject: 'Test Subject',
            message: 'This is a test message with more than 10 characters',
        };

        const result = contactSchema.safeParse(validContact);
        expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
        const invalidContact = {
            name: 'John Doe',
            email: 'invalid-email',
            subject: 'Test',
            message: 'This is a test message',
        };

        const result = contactSchema.safeParse(invalidContact);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Email không hợp lệ');
        }
    });

    it('should reject short message', () => {
        const invalidContact = {
            name: 'John',
            email: 'john@example.com',
            subject: 'Test',
            message: 'Short',
        };

        const result = contactSchema.safeParse(invalidContact);
        expect(result.success).toBe(false);
    });
});
