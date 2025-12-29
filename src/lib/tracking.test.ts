import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Copy of the schema from route.ts for testing
const TrackSchema = z.object({
    sessionId: z.string().max(100),
    eventType: z.string().max(50),
    targetType: z.string().max(50).optional().nullable(),
    targetId: z.string().max(100).optional().nullable(),
    targetSlug: z.string().max(200).optional().nullable(),
    metadata: z.record(z.string(), z.unknown()).optional().nullable()
});

describe('Tracking Payload Validation', () => {
    it('should accept valid minimal payload', () => {
        const payload = {
            sessionId: 'sess_123456',
            eventType: 'page_view'
        };

        const result = TrackSchema.safeParse(payload);
        expect(result.success).toBe(true);
    });

    it('should accept valid full payload', () => {
        const payload = {
            sessionId: 'sess_123456',
            eventType: 'page_view',
            targetType: 'page',
            targetId: 'uuid-123',
            targetSlug: '/bai-viet/test',
            metadata: { source: 'header' }
        };

        const result = TrackSchema.safeParse(payload);
        expect(result.success).toBe(true);
    });

    it('should reject missing sessionId', () => {
        const payload = {
            eventType: 'page_view'
        };

        const result = TrackSchema.safeParse(payload);
        expect(result.success).toBe(false);
    });

    it('should reject missing eventType', () => {
        const payload = {
            sessionId: 'sess_123456'
        };

        const result = TrackSchema.safeParse(payload);
        expect(result.success).toBe(false);
    });

    it('should reject overly long sessionId', () => {
        const payload = {
            sessionId: 'a'.repeat(101),
            eventType: 'page_view'
        };

        const result = TrackSchema.safeParse(payload);
        expect(result.success).toBe(false);
    });

    it('should reject overly long eventType', () => {
        const payload = {
            sessionId: 'sess_123',
            eventType: 'x'.repeat(51)
        };

        const result = TrackSchema.safeParse(payload);
        expect(result.success).toBe(false);
    });

    it('should handle null optional fields', () => {
        const payload = {
            sessionId: 'sess_123',
            eventType: 'click',
            targetType: null,
            targetId: null,
            targetSlug: null,
            metadata: null
        };

        const result = TrackSchema.safeParse(payload);
        expect(result.success).toBe(true);
    });
});
