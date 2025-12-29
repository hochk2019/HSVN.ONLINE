'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to console (in production, send to error reporting service)
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full text-center">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Đã xảy ra lỗi
                </h1>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Xin lỗi, có lỗi xảy ra trong quá trình xử lý yêu cầu của bạn.
                    Vui lòng thử lại hoặc quay về trang chủ.
                </p>

                {error.digest && (
                    <p className="text-xs text-gray-400 mb-6">
                        Mã lỗi: {error.digest}
                    </p>
                )}

                <div className="flex gap-3 justify-center">
                    <Button onClick={reset} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Thử lại
                    </Button>
                    <Link href="/">
                        <Button>
                            <Home className="w-4 h-4 mr-2" />
                            Trang chủ
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
