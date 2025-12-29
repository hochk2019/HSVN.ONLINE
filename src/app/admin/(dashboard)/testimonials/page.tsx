import { requireAdmin } from '@/lib/auth-actions';
import { getTestimonials } from '@/lib/testimonial-actions';
import TestimonialManager from '@/components/admin/TestimonialManager';

export const dynamic = 'force-dynamic';

export default async function TestimonialsPage() {
    await requireAdmin();

    const { testimonials, error } = await getTestimonials(true);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-heading text-2xl font-bold">Khách hàng nói gì</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Quản lý testimonials hiển thị trên trang chủ
                </p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                    Lỗi: {error}
                </div>
            )}

            <TestimonialManager initialTestimonials={testimonials} />
        </div>
    );
}
