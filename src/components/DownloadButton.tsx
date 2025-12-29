'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, AlertCircle } from 'lucide-react';

interface DownloadButtonProps {
    versionId: string;
    softwareId: string;
    fileName?: string;
}

export default function DownloadButton({
    versionId,
    softwareId,
    fileName = 'Download'
}: DownloadButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleDownload() {
        setIsLoading(true);
        setError(null);

        try {
            // Build download URL with params
            const downloadUrl = `/api/download?versionId=${encodeURIComponent(versionId)}&softwareId=${encodeURIComponent(softwareId)}`;

            // Open in new tab - API will redirect to signed URL
            window.open(downloadUrl, '_blank');
        } catch (err) {
            console.error('Download error:', err);
            setError('Không thể tải xuống. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-2">
            <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleDownload}
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang xử lý...
                    </>
                ) : (
                    <>
                        <Download className="w-5 h-5" />
                        Tải xuống ngay
                    </>
                )}
            </Button>

            {error && (
                <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
        </div>
    );
}
