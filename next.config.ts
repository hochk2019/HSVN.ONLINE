import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.supabase.co',
            },
            {
                protocol: 'https',
                hostname: 'github.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            // VnExpress images
            {
                protocol: 'https',
                hostname: '*.vnecdn.net',
            },
            // Common news sites - add more as needed
            {
                protocol: 'https',
                hostname: '*.tuoitre.vn',
            },
            {
                protocol: 'https',
                hostname: '*.nguoiduatin.vn',
            },
            {
                protocol: 'https',
                hostname: '*.dantri.com.vn',
            },
            {
                protocol: 'https',
                hostname: '*.thanhnien.vn',
            },
            // Fallback for any https images
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    // Suppress source map warnings from @supabase packages
    serverExternalPackages: ['@supabase/auth-js', '@supabase/supabase-js'],
};

export default nextConfig;

// Forces server restart to pick up new routes
