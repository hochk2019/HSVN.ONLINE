import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock, Facebook } from 'lucide-react';
import ContactForm from '@/components/ContactForm';
import { getSettings } from '@/lib/settings-actions';

export const metadata: Metadata = {
    title: 'Liên hệ | Golden Logistics',
    description: 'Liên hệ với Công ty TNHH Tiếp Vận Hoàng Kim. Chúng tôi luôn sẵn sàng hỗ trợ bạn.',
};

export default async function ContactPage() {
    const { settings } = await getSettings();

    const companyName = settings['company_name'] || 'Công ty TNHH Tiếp Vận Hoàng Kim';
    const contactEmail = settings['contact_email'] || 'hochk2019@gmail.com';
    const contactPhone = settings['contact_phone'] || '0868.333.606';
    const contactAddress = settings['contact_address'] || 'TP. Hồ Chí Minh, Việt Nam';
    const workingHours = settings['working_hours'] || 'Thứ 2 - Thứ 6: 8:00 - 17:30\nThứ 7: 8:00 - 12:00';
    const facebookUrl = settings['facebook_url'] || '';

    return (
        <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">Liên hệ</h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Chúng tôi luôn sẵn sàng hỗ trợ bạn
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Contact Info */}
                        <div className="space-y-6">
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="font-heading text-xl font-bold mb-6 text-slate-900 dark:text-white">Thông tin liên hệ</h2>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-golden/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <MapPin className="w-5 h-5 text-golden" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-slate-900 dark:text-white">Địa chỉ</h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {contactAddress}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-golden/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Phone className="w-5 h-5 text-golden" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-slate-900 dark:text-white">Điện thoại</h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {contactPhone}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-golden/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Mail className="w-5 h-5 text-golden" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-slate-900 dark:text-white">Email</h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {contactEmail}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-golden/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Clock className="w-5 h-5 text-golden" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-slate-900 dark:text-white">Giờ làm việc</h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
                                                    {workingHours}
                                                </p>
                                            </div>
                                        </div>
                                        {facebookUrl && (
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 bg-golden/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Facebook className="w-5 h-5 text-golden" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-slate-900 dark:text-white">Facebook</h3>
                                                    <a
                                                        href={facebookUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-golden hover:underline"
                                                    >
                                                        Theo dõi trang Facebook →
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Company Info Card */}
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="font-heading text-xl font-bold mb-4 text-slate-900 dark:text-white">{companyName}</h2>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Cung cấp giải pháp logistics và phần mềm hải quan chuyên nghiệp, giúp doanh nghiệp tối ưu hóa quy trình xuất nhập khẩu.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Contact Form */}
                        <ContactForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
