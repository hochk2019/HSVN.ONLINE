'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { submitContactForm } from '@/lib/contact-actions';

export default function ContactForm() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    async function handleSubmit(formData: FormData) {
        setStatus('loading');
        setErrorMessage('');

        const result = await submitContactForm(formData);

        if (result.success) {
            setStatus('success');
        } else {
            setStatus('error');
            setErrorMessage(result.error || 'Có lỗi xảy ra');
        }
    }

    if (status === 'success') {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="font-heading text-xl font-bold mb-2 text-green-600">
                        Gửi tin nhắn thành công!
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.
                    </p>
                    <Button
                        className="mt-4"
                        variant="outline"
                        onClick={() => setStatus('idle')}
                    >
                        Gửi tin nhắn khác
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-6">
                <h2 className="font-heading text-xl font-bold mb-6 text-slate-900 dark:text-white">
                    Gửi tin nhắn
                </h2>

                {status === 'error' && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertCircle className="w-5 h-5" />
                        {errorMessage}
                    </div>
                )}

                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                            Họ tên <span className="text-red-500">*</span>
                        </label>
                        <Input
                            name="name"
                            placeholder="Nhập họ tên của bạn"
                            required
                            disabled={status === 'loading'}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="email"
                            name="email"
                            placeholder="your@email.com"
                            required
                            disabled={status === 'loading'}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                            Số điện thoại
                        </label>
                        <Input
                            name="phone"
                            placeholder="0999 999 999"
                            disabled={status === 'loading'}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                            Tiêu đề <span className="text-red-500">*</span>
                        </label>
                        <Input
                            name="subject"
                            placeholder="Tiêu đề tin nhắn"
                            required
                            disabled={status === 'loading'}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                            Nội dung <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="message"
                            placeholder="Nhập nội dung tin nhắn..."
                            rows={5}
                            required
                            disabled={status === 'loading'}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm resize-none disabled:opacity-50"
                        />
                    </div>

                    {/* Honeypot field - hidden from users, bots will fill it */}
                    <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
                        <input
                            type="text"
                            name="website_url"
                            tabIndex={-1}
                            autoComplete="off"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full gap-2"
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang gửi...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Gửi tin nhắn
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
