'use client';

import { useEffect, useRef } from 'react';

interface FacebookCommentsProps {
    url: string;
    numPosts?: number;
    width?: string;
    colorScheme?: 'light' | 'dark';
}

declare global {
    interface Window {
        FB?: {
            XFBML: {
                parse: (element?: HTMLElement) => void;
            };
        };
        fbAsyncInit?: () => void;
    }
}

export default function FacebookComments({
    url,
    numPosts = 10,
    width = '100%',
    colorScheme = 'light',
}: FacebookCommentsProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load Facebook SDK
        const loadFacebookSDK = () => {
            if (document.getElementById('facebook-jssdk')) {
                // SDK already loaded, just parse
                if (window.FB) {
                    window.FB.XFBML.parse(containerRef.current || undefined);
                }
                return;
            }

            window.fbAsyncInit = function () {
                window.FB?.XFBML.parse(containerRef.current || undefined);
            };

            const script = document.createElement('script');
            script.id = 'facebook-jssdk';
            script.src = 'https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v18.0';
            script.async = true;
            script.defer = true;
            script.crossOrigin = 'anonymous';
            document.body.appendChild(script);
        };

        loadFacebookSDK();

        // Re-parse when url changes
        return () => {
            if (window.FB) {
                window.FB.XFBML.parse(containerRef.current || undefined);
            }
        };
    }, [url]);

    return (
        <div ref={containerRef} className="facebook-comments-container">
            <div
                className="fb-comments"
                data-href={url}
                data-width={width}
                data-numposts={numPosts}
                data-colorscheme={colorScheme}
                data-order-by="reverse_time"
            />
        </div>
    );
}
