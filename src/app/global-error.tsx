'use client';

import { Button } from '@/components/ui/button';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
                    <div className="max-w-md w-full text-center">
                        <div className="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertOctagon className="w-10 h-10 text-red-400" />
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2">
                            Lỗi nghiêm trọng
                        </h1>

                        <p className="text-gray-400 mb-6">
                            Đã xảy ra lỗi không mong muốn. Vui lòng tải lại trang.
                        </p>

                        {error.digest && (
                            <p className="text-xs text-gray-500 mb-6">
                                Mã lỗi: {error.digest}
                            </p>
                        )}

                        <Button
                            onClick={reset}
                            className="bg-golden hover:bg-golden-dark text-white"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Tải lại trang
                        </Button>
                    </div>
                </div>
            </body>
        </html>
    );
}
