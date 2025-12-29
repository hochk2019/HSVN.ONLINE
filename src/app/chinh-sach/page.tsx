import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSettings } from '@/lib/settings-actions';

export const metadata: Metadata = {
    title: 'Chính sách - Golden Logistics',
    description: 'Chính sách bảo mật và điều khoản sử dụng website Golden Logistics',
};

// Default content for each section (used when no custom content in Settings)
const defaultPrivacy = `<p>Công ty cam kết bảo vệ quyền riêng tư của người dùng. Chúng tôi thu thập và sử dụng thông tin cá nhân chỉ với mục đích cung cấp dịch vụ tốt nhất cho bạn.</p>
<h4>Thông tin thu thập</h4>
<ul>
<li>Thông tin liên hệ (họ tên, email, số điện thoại) khi bạn gửi form liên hệ</li>
<li>Thông tin kỹ thuật (địa chỉ IP, trình duyệt) khi bạn tải phần mềm</li>
<li>Cookie để cải thiện trải nghiệm người dùng</li>
</ul>
<h4>Sử dụng thông tin</h4>
<ul>
<li>Phản hồi yêu cầu hỗ trợ của bạn</li>
<li>Cải thiện sản phẩm và dịch vụ</li>
<li>Gửi thông báo về cập nhật phần mềm (nếu bạn đồng ý)</li>
</ul>
<p>Chúng tôi <strong>không bán</strong> hoặc chia sẻ thông tin cá nhân cho bên thứ ba vì mục đích thương mại.</p>`;

const defaultTerms = `<h4>Quyền sở hữu trí tuệ</h4>
<p>Tất cả nội dung trên website bao gồm văn bản, hình ảnh, logo, phần mềm đều thuộc quyền sở hữu của công ty hoặc được cấp phép sử dụng hợp pháp.</p>
<h4>Sử dụng phần mềm</h4>
<ul>
<li>Phần mềm được cung cấp miễn phí cho mục đích cá nhân và doanh nghiệp</li>
<li>Bạn không được sao chép, phân phối lại hoặc bán phần mềm</li>
<li>Bạn không được đảo ngược, dịch ngược hoặc sửa đổi mã nguồn</li>
</ul>
<h4>Giới hạn trách nhiệm</h4>
<p>Phần mềm được cung cấp "nguyên trạng" (as-is). Chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại trực tiếp hoặc gián tiếp nào phát sinh từ việc sử dụng phần mềm.</p>`;

const defaultDisclaimer = `<p>Thông tin trên website này chỉ mang tính chất tham khảo. Công ty không chịu trách nhiệm về tính chính xác, đầy đủ hoặc cập nhật của thông tin.</p>
<p class="text-red-600 dark:text-red-400 font-semibold">⚠️ NGHIÊM CẤM sử dụng thông tin, phần mềm hoặc dịch vụ tại website này để thực hiện các hành vi vi phạm pháp luật của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.</p>`;

export default async function ChinhSachPage() {
    const { settings } = await getSettings();
    const companyName = settings['company_name'] || 'Công ty TNHH Tiếp Vận Hoàng Kim';
    const contactEmail = settings['contact_email'] || 'hochk2019@gmail.com';

    // Get policy content from settings or use defaults
    const privacyContent = settings['policy_privacy'] || defaultPrivacy;
    const termsContent = settings['policy_terms'] || defaultTerms;
    const disclaimerContent = settings['policy_disclaimer'] || defaultDisclaimer;

    return (
        <main className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-center mb-8 text-slate-900 dark:text-white">
                Chính sách & Điều khoản
            </h1>

            <div className="space-y-8">
                {/* Chính sách bảo mật */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">1. Chính sách bảo mật</CardTitle>
                    </CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: privacyContent.replace(/\{companyName\}/g, companyName) }} />
                    </CardContent>
                </Card>

                {/* Điều khoản sử dụng */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">2. Điều khoản sử dụng</CardTitle>
                    </CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: termsContent.replace(/\{companyName\}/g, companyName) }} />
                    </CardContent>
                </Card>

                {/* Tuyên bố miễn trừ */}
                <Card className="border-yellow-200 dark:border-yellow-900">
                    <CardHeader>
                        <CardTitle className="text-xl text-yellow-600 dark:text-yellow-400">
                            3. Tuyên bố miễn trừ trách nhiệm
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: disclaimerContent.replace(/\{companyName\}/g, companyName) }} />
                    </CardContent>
                </Card>

                {/* Liên hệ */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">4. Liên hệ</CardTitle>
                    </CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none">
                        <p>
                            Nếu bạn có bất kỳ câu hỏi nào về chính sách này, vui lòng liên hệ:
                        </p>
                        <ul>
                            <li>Email: <a href={`mailto:${contactEmail}`} className="text-golden">{contactEmail}</a></li>
                            <li>Hoặc thông qua <a href="/lien-he" className="text-golden">form liên hệ</a></li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <p className="text-center text-sm text-gray-500 mt-8">
                Cập nhật lần cuối: Tháng 12/2024
            </p>
        </main>
    );
}
