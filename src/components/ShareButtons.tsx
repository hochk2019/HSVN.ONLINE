'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check, Twitter, Linkedin } from 'lucide-react';

interface ShareButtonsProps {
    url: string;
    title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);

    const handleFacebookShare = () => {
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    const handleTwitterShare = () => {
        const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    const handleLinkedinShare = () => {
        const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="flex items-center gap-4 mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <span className="text-sm font-medium text-slate-500">Chia sẻ:</span>
            <div className="flex items-center gap-2 flex-wrap">
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
                    onClick={handleFacebookShare}
                    type="button"
                >
                    <Share2 className="w-4 h-4" />
                    Facebook
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600 transition-colors"
                    onClick={handleTwitterShare}
                    type="button"
                >
                    <Twitter className="w-4 h-4" />
                    Twitter
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-colors"
                    onClick={handleLinkedinShare}
                    type="button"
                >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    className={`gap-2 transition-colors ${copied ? 'bg-green-50 border-green-300 text-green-600' : ''}`}
                    onClick={handleCopyLink}
                    type="button"
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4" />
                            Đã copy!
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4" />
                            Copy link
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
