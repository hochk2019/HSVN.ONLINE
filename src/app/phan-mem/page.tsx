import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getPublicSoftware } from '@/lib/public-actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Package, Star, ArrowRight } from 'lucide-react';
import SharedFooter from '@/components/layout/SharedFooter';
import SearchBox from '@/components/SearchBox';

export const revalidate = 60; // ISR: revalidate every 60 seconds

export const metadata: Metadata = {
    title: 'Phần mềm hỗ trợ | Golden Logistics',
    description: 'Các phần mềm hỗ trợ nghiệp vụ hải quan, xuất nhập khẩu từ Golden Logistics',
    openGraph: {
        title: 'Phần mềm hỗ trợ | Golden Logistics',
        description: 'Các phần mềm hỗ trợ nghiệp vụ hải quan, xuất nhập khẩu từ Golden Logistics',
    },
};

export default async function SoftwareListPage() {
    const { products } = await getPublicSoftware();

    return (
        <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
            <div className="container mx-auto px-4 py-12">
                {/* Page Header */}
                <div className="text-center mb-12">
                    <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
                        Phần mềm hỗ trợ
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Các công cụ được phát triển bởi Golden Logistics giúp tối ưu hóa quy trình nghiệp vụ hải quan và xuất nhập khẩu
                    </p>
                </div>

                {/* Software Grid */}
                {products.length === 0 ? (
                    <div className="text-center py-16">
                        <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">Chưa có phần mềm nào</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((software: any) => (
                            <Card key={software.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                                {/* Card Header with Icon */}
                                <div className="h-32 bg-gradient-to-br from-golden/20 to-golden/5 flex items-center justify-center relative">
                                    {software.is_featured && (
                                        <div className="absolute top-3 right-3">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-golden text-white text-xs font-medium rounded-full">
                                                <Star className="w-3 h-3 fill-current" />
                                                Nổi bật
                                            </span>
                                        </div>
                                    )}
                                    {software.icon_url ? (
                                        <Image
                                            src={software.icon_url}
                                            alt={software.name}
                                            width={64}
                                            height={64}
                                            className="rounded-xl"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-golden/20 rounded-xl flex items-center justify-center">
                                            <Package className="w-8 h-8 text-golden" />
                                        </div>
                                    )}
                                </div>

                                <CardContent className="p-6">
                                    <h2 className="font-heading text-xl font-bold mb-2 group-hover:text-golden transition-colors">
                                        {software.name}
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                                        {software.summary || 'Chưa có mô tả'}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <Download className="w-4 h-4" />
                                            <span>{software.download_count.toLocaleString()} lượt tải</span>
                                        </div>
                                        <Link href={`/phan-mem/${software.slug}`}>
                                            <Button variant="ghost" size="sm" className="gap-1 text-golden">
                                                Chi tiết
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
