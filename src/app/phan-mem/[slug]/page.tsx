import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicSoftwareBySlug } from '@/lib/public-actions';
import { getSettings } from '@/lib/settings-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Check, ArrowLeft, Calendar, FileArchive } from 'lucide-react';
import DownloadButton from '@/components/DownloadButton';
import TrackSoftwareView from '@/components/tracking/TrackSoftwareView';
import SoftwareDetailClient from '@/components/software/SoftwareDetailClient';

export const revalidate = 60; // ISR: revalidate every 60 seconds

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const { software } = await getPublicSoftwareBySlug(slug);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hsvn.online';

    if (!software) {
        return { title: 'Không tìm thấy' };
    }

    return {
        title: software.meta_title || software.name,
        description: software.meta_description || software.summary,
        alternates: {
            canonical: `${baseUrl}/phan-mem/${slug}`,
        },
        openGraph: {
            title: software.meta_title || software.name,
            description: software.meta_description || software.summary || '',
            images: software.icon_url ? [software.icon_url] : undefined,
            url: `${baseUrl}/phan-mem/${slug}`,
            type: 'website',
        },
    };
}

function formatFileSize(bytes: number | null): string {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default async function SoftwareDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const { software, versions, error } = await getPublicSoftwareBySlug(slug);
    const settings = await getSettings();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hsvn.online';

    if (error || !software) {
        notFound();
    }

    const latestVersion = versions.find((v: any) => v.is_latest) || versions[0];
    const enableComments = settings?.settings?.enable_comments !== 'false';

    // JSON-LD SoftwareApplication Schema
    const softwareSchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: software.name,
        description: software.summary || software.description_html?.replace(/<[^>]*>/g, ''),
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Windows',
        softwareVersion: latestVersion?.version || '1.0',
        downloadUrl: latestVersion?.file_url || `${baseUrl}/phan-mem/${slug}`,
        fileSize: latestVersion?.file_size ? formatFileSize(latestVersion.file_size) : undefined,
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'VND',
        },
        aggregateRating: (software.download_count || 0) > 0 ? {
            '@type': 'AggregateRating',
            ratingValue: '5',
            ratingCount: software.download_count || 0,
        } : undefined,
    };

    return (
        <>
            {/* JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
            />

            {/* Tracking */}
            <TrackSoftwareView softwareId={software.id} slug={slug} />

            <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
                <div className="container mx-auto px-4 py-8">
                    {/* Breadcrumb */}
                    <nav className="text-sm text-gray-500 mb-6">
                        <Link href="/" className="hover:text-golden">Trang chủ</Link>
                        <span className="mx-2">/</span>
                        <Link href="/phan-mem" className="hover:text-golden">Phần mềm</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 dark:text-gray-100">{software.name}</span>
                    </nav>

                    {/* Software Header */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                        <div className="lg:col-span-2">
                            {/* Client Component with Share/Comments/Translation */}
                            <SoftwareDetailClient
                                software={{
                                    id: software.id,
                                    name: software.name,
                                    summary: software.summary,
                                    description_html: software.description_html,
                                    icon_url: software.icon_url
                                }}
                                siteUrl={baseUrl}
                                slug={slug}
                                enableComments={enableComments}
                            />
                        </div>

                        {/* Download Card */}
                        <div>
                            <Card className="sticky top-24">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Download className="w-5 h-5 text-golden" />
                                        Tải xuống
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {latestVersion ? (
                                        <>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Phiên bản</span>
                                                <span className="font-medium">{latestVersion.version}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Kích thước</span>
                                                <span>{formatFileSize(latestVersion.file_size)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Cập nhật</span>
                                                <span>{latestVersion.released_at ? new Date(latestVersion.released_at).toLocaleDateString('vi-VN') : ''}</span>
                                            </div>

                                            {latestVersion.file_url && (
                                                <DownloadButton
                                                    versionId={latestVersion.id}
                                                    softwareId={software.id}
                                                    fileName={latestVersion.file_name || 'về máy'}
                                                />
                                            )}

                                            <div className="text-center text-sm text-gray-500">
                                                <Download className="w-4 h-4 inline mr-1" />
                                                {(software.download_count || 0).toLocaleString()} lượt tải
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-gray-500 text-sm text-center py-4">
                                            Chưa có phiên bản nào
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Version History */}
                    {versions.length > 1 && (
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Lịch sử phiên bản
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {versions.map((version: any) => (
                                        <div
                                            key={version.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-golden/10 rounded-lg flex items-center justify-center">
                                                    <FileArchive className="w-5 h-5 text-golden" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{version.version}</span>
                                                        {version.is_latest && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                                                <Check className="w-3 h-3" />
                                                                Mới nhất
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(version.released_at).toLocaleDateString('vi-VN')} • {formatFileSize(version.file_size)}
                                                    </p>
                                                </div>
                                            </div>
                                            {version.file_url && (
                                                <a href={version.file_url} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="outline" size="sm">
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Back Link */}
                    <Link
                        href="/phan-mem"
                        className="inline-flex items-center gap-2 text-golden hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Tất cả phần mềm
                    </Link>
                </div>
            </div>
        </>
    );
}
