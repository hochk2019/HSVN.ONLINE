import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPostById } from '@/lib/post-actions';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ token?: string }>;
}

// Simple token validation - in production, use a more secure method
function validatePreviewToken(postId: string, token: string): boolean {
    // Token format: base64(postId + ':' + timestamp)
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [tokenPostId, timestamp] = decoded.split(':');
        const tokenTime = parseInt(timestamp);
        const now = Date.now();
        // Token valid for 24 hours
        const isValidTime = now - tokenTime < 24 * 60 * 60 * 1000;
        return tokenPostId === postId && isValidTime;
    } catch {
        return false;
    }
}

export function generatePreviewToken(postId: string): string {
    const payload = `${postId}:${Date.now()}`;
    return Buffer.from(payload).toString('base64');
}

export default async function PreviewPostPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { token } = await searchParams;

    // Validate token
    if (!token || !validatePreviewToken(id, token)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Link xem trước không hợp lệ</h1>
                    <p className="text-slate-500 mb-4">Link đã hết hạn hoặc không đúng.</p>
                    <Link href="/admin/posts">
                        <Button>Quay lại quản lý bài viết</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const { post, error } = await getPostById(id);

    if (error || !post) {
        notFound();
    }

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
            {/* Preview Banner */}
            <div className="bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium sticky top-0 z-50">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Chế độ xem trước - Bài viết chưa được xuất bản
                <Link href={`/admin/posts/${id}`} className="ml-4 underline hover:no-underline">
                    Quay lại chỉnh sửa
                </Link>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-golden">Trang chủ</Link>
                    <span className="mx-2">/</span>
                    <span className="text-slate-700 dark:text-slate-300">Xem trước</span>
                </nav>

                <article className="bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden max-w-4xl mx-auto">
                    {post.featured_image && (
                        <div className="aspect-video relative">
                            <Image
                                src={post.featured_image}
                                alt={post.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}

                    <div className="p-6 md:p-8">
                        <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            {post.title}
                        </h1>

                        {post.excerpt && (
                            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                                {post.excerpt}
                            </p>
                        )}

                        {/* Content */}
                        <div
                            className="prose prose-lg dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: post.content_html || '' }}
                        />
                    </div>
                </article>

                {/* Back Button */}
                <div className="text-center mt-8">
                    <Link href={`/admin/posts/${id}`}>
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại chỉnh sửa
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
