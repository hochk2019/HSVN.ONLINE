import { getTestimonials } from '@/lib/testimonial-actions';
import TestimonialsClient from './TestimonialsClient';

// Default testimonials in case DB is empty or error
const defaultTestimonials = [
    {
        id: 'default-1',
        author_name: 'Nguyễn Văn A',
        author_title: 'Giám đốc XNK, Công ty TNHH ABC',
        author_avatar: null,
        content: 'Phần mềm Customs Extractor giúp chúng tôi tiết kiệm hàng giờ làm việc mỗi ngày. Việc trích xuất dữ liệu tờ khai giờ chỉ mất vài giây thay vì hàng chục phút như trước.',
        rating: 5,
        is_active: true,
        display_order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: 'default-2',
        author_name: 'Trần Thị B',
        author_title: 'Trưởng phòng Hải quan, Tập đoàn XYZ',
        author_avatar: null,
        content: 'Dịch vụ tư vấn của Golden Logistics rất chuyên nghiệp. Đội ngũ am hiểu sâu về quy định hải quan và luôn cập nhật các văn bản mới nhất.',
        rating: 5,
        is_active: true,
        display_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: 'default-3',
        author_name: 'Lê Văn C',
        author_title: 'Chuyên viên, Công ty DEF',
        author_avatar: null,
        content: 'Barcode Automation đã cải thiện đáng kể quy trình làm việc của chúng tôi. Giảm sai sót, tăng tốc độ xử lý hồ sơ.',
        rating: 5,
        is_active: true,
        display_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
];

export default async function Testimonials() {
    let testimonials = defaultTestimonials;

    try {
        const { testimonials: dbTestimonials, error } = await getTestimonials();
        if (!error && dbTestimonials && dbTestimonials.length > 0) {
            testimonials = dbTestimonials as typeof defaultTestimonials;
        }
    } catch {
        // Use default testimonials on error
    }

    return <TestimonialsClient testimonials={testimonials} />;
}
