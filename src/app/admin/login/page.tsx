'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { login } from '@/lib/auth-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function LoginForm() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirectTo') || '/admin/dashboard';

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        formData.append('redirectTo', redirectTo);

        const result = await login(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                    Email
                </label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@example.com"
                    required
                    autoComplete="email"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                    Mật khẩu
                </label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                />
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            <Button
                type="submit"
                className="w-full"
                disabled={loading}
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Đang đăng nhập...
                    </>
                ) : (
                    'Đăng nhập'
                )}
            </Button>
        </form>
    );
}

function LoginFormFallback() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="space-y-2">
                <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
            <div className="space-y-2">
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/logo.png"
                            alt="Golden Logistics"
                            width={60}
                            height={60}
                            className="w-16 h-16"
                        />
                    </div>
                    <CardTitle className="text-golden-gradient">Đăng nhập Admin</CardTitle>
                    <CardDescription>
                        Nhập thông tin đăng nhập để truy cập khu vực quản trị
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<LoginFormFallback />}>
                        <LoginForm />
                    </Suspense>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        <a href="/" className="hover:text-golden transition-colors">
                            ← Quay về trang chủ
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
