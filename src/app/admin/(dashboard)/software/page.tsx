import Link from 'next/link';
import { getSoftwareProducts } from '@/lib/software-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Download, Search, Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Quản lý phần mềm',
};

export default async function SoftwarePage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
    const params = await searchParams;
    const currentPage = parseInt(params.page || '1');
    const limit = 20;
    const offset = (currentPage - 1) * limit;

    const { products, count } = await getSoftwareProducts({
        status: params.status,
        search: params.search,
        limit,
        offset,
    });

    const totalPages = Math.ceil((count || 0) / limit);

    const statusColors: Record<string, string> = {
        inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        coming_soon: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };

    const statusLabels: Record<string, string> = {
        inactive: 'Chưa kích hoạt',
        active: 'Đang hoạt động',
        coming_soon: 'Sắp ra mắt',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-bold">Phần mềm</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Quản lý sản phẩm phần mềm và phiên bản
                    </p>
                </div>
                <Link href="/admin/software/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm phần mềm
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <form className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Tìm kiếm phần mềm..."
                                    defaultValue={params.search}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                                />
                            </div>
                        </div>
                        <select
                            name="status"
                            defaultValue={params.status}
                            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Chưa kích hoạt</option>
                            <option value="coming_soon">Sắp ra mắt</option>
                        </select>
                        <Button type="submit" variant="secondary">
                            Lọc
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Software Grid */}
            {products.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Chưa có phần mềm nào</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((software) => (
                        <Card key={software.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-golden/10 rounded-lg flex items-center justify-center">
                                            <Package className="w-6 h-6 text-golden" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{software.name}</h3>
                                            <p className="text-sm text-gray-500">/{software.slug}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[software.status]}`}>
                                        {statusLabels[software.status]}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                                    {software.summary || 'Chưa có mô tả'}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <Download className="w-4 h-4" />
                                        <span>{software.download_count} lượt tải</span>
                                    </div>
                                    <Link
                                        href={`/admin/software/${software.id}`}
                                        className="flex items-center gap-1 text-sm text-golden hover:underline"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Chỉnh sửa
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Link
                            key={page}
                            href={`/admin/software?page=${page}${params.status ? `&status=${params.status}` : ''}${params.search ? `&search=${params.search}` : ''}`}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${page === currentPage
                                ? 'bg-golden text-white'
                                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            {page}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
