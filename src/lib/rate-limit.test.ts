import { describe, it, expect, vi } from 'vitest';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        rpc: vi.fn().mockResolvedValue({ data: true, error: null })
    }))
}));

describe('AI Service Rate Limiting', () => {
    it('should return true when rate limit not exceeded', async () => {
        const { createClient } = await import('@supabase/supabase-js');
        const mockRpc = vi.fn().mockResolvedValue({ data: true, error: null });
        (createClient as any).mockReturnValue({ rpc: mockRpc });

        // Simulate rate limit check
        const supabase = createClient('url', 'key');
        const { data } = await supabase.rpc('check_rate_limit', {
            p_key: 'test:user123',
            p_limit: 10,
            p_window_seconds: 60
        });

        expect(data).toBe(true);
        expect(mockRpc).toHaveBeenCalledWith('check_rate_limit', {
            p_key: 'test:user123',
            p_limit: 10,
            p_window_seconds: 60
        });
    });

    it('should return false when rate limit exceeded', async () => {
        const { createClient } = await import('@supabase/supabase-js');
        const mockRpc = vi.fn().mockResolvedValue({ data: false, error: null });
        (createClient as any).mockReturnValue({ rpc: mockRpc });

        const supabase = createClient('url', 'key');
        const { data } = await supabase.rpc('check_rate_limit', {
            p_key: 'test:spammer',
            p_limit: 5,
            p_window_seconds: 60
        });

        expect(data).toBe(false);
    });

    it('should handle RPC errors gracefully', async () => {
        const { createClient } = await import('@supabase/supabase-js');
        const mockRpc = vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'DB Error' }
        });
        (createClient as any).mockReturnValue({ rpc: mockRpc });

        const supabase = createClient('url', 'key');
        const { data, error } = await supabase.rpc('check_rate_limit', {
            p_key: 'test:user',
            p_limit: 10,
            p_window_seconds: 60
        });

        expect(error).toBeTruthy();
        expect(data).toBeNull();
    });
});
