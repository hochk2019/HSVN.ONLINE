import { Metadata } from 'next';
import { Building2, Target, Shield, Award, MapPin, Mail, Phone } from 'lucide-react';
import { getSettings } from '@/lib/settings-actions';

export async function generateMetadata(): Promise<Metadata> {
    const { settings } = await getSettings();
    const siteName = settings['site_name'] || 'Golden Logistics';
    const companyName = settings['company_name'] || 'Công ty TNHH Tiếp Vận Hoàng Kim';

    return {
        title: `Giới thiệu | ${siteName}`,
        description: `${companyName} - Chuyên cung cấp giải pháp logistics và phần mềm hỗ trợ nghiệp vụ hải quan`,
    };
}

export default async function AboutPage() {
    const { settings } = await getSettings();

    // Contact info (from settings)
    const companyName = settings['company_name'] || 'Công ty TNHH Tiếp Vận Hoàng Kim';
    const companyNameEn = settings['company_name_en'] || 'Golden Logistics Co., Ltd';
    const contactAddress = settings['company_address'] || 'TP. Hồ Chí Minh, Việt Nam';
    const contactEmail = settings['contact_email'] || 'hochk2019@gmail.com';
    const contactPhone = settings['contact_phone'] || '0868.333.606';

    // About content (from settings with fallbacks)
    const description1 = settings['about_description_1'] ||
        'Golden Logistics là công ty chuyên cung cấp các giải pháp về logistics, dịch vụ hải quan và phần mềm hỗ trợ nghiệp vụ xuất nhập khẩu.';
    const description2 = settings['about_description_2'] ||
        'Với đội ngũ nhân viên giàu kinh nghiệm và am hiểu sâu về nghiệp vụ hải quan, chúng tôi cam kết mang đến cho khách hàng những giải pháp tối ưu nhất.';

    // Statistics (from settings with fallbacks)
    const stats = [
        {
            value: settings['about_stat_1_value'] || '5+',
            label: settings['about_stat_1_label'] || 'Năm kinh nghiệm'
        },
        {
            value: settings['about_stat_2_value'] || '100+',
            label: settings['about_stat_2_label'] || 'Khách hàng'
        },
        {
            value: settings['about_stat_3_value'] || '1000+',
            label: settings['about_stat_3_label'] || 'Tờ khai xử lý'
        },
        {
            value: settings['about_stat_4_value'] || '3+',
            label: settings['about_stat_4_label'] || 'Phần mềm'
        },
    ];

    // Core values (from settings with fallbacks)
    const coreValues = [
        {
            icon: Target,
            title: settings['about_value_1_title'] || 'Chuyên nghiệp',
            description: settings['about_value_1_desc'] || 'Đội ngũ am hiểu sâu về nghiệp vụ hải quan và xuất nhập khẩu',
        },
        {
            icon: Shield,
            title: settings['about_value_2_title'] || 'Uy tín',
            description: settings['about_value_2_desc'] || 'Cam kết bảo mật thông tin và tuân thủ pháp luật Việt Nam',
        },
        {
            icon: Award,
            title: settings['about_value_3_title'] || 'Chất lượng',
            description: settings['about_value_3_desc'] || 'Phần mềm và dịch vụ được phát triển với tiêu chuẩn cao nhất',
        },
    ];

    return (
        <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
            {/* Hero Section */}
            <section className="py-16 lg:py-24 bg-gradient-to-br from-golden/5 to-golden/10">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">
                            Về <span className="text-golden-gradient">Golden Logistics</span>
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-300">
                            {companyName} - Đối tác tin cậy trong lĩnh vực logistics và nghiệp vụ hải quan
                        </p>
                    </div>
                </div>
            </section>

            {/* Company Info */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-golden/10 rounded-lg flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-golden" />
                                </div>
                                <h2 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">Về chúng tôi</h2>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 mb-4">
                                {description1}
                            </p>
                            <p className="text-slate-700 dark:text-slate-300 mb-4">
                                {description2}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-6 text-center shadow-sm">
                                    <div className="text-3xl font-bold text-golden mb-2">{stat.value}</div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
                <div className="container mx-auto px-4">
                    <h2 className="font-heading text-2xl font-bold text-center mb-12 text-slate-900 dark:text-white">Giá trị cốt lõi</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {coreValues.map((value, index) => (
                            <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-6 text-center">
                                <div className="w-14 h-14 bg-golden/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <value.icon className="w-7 h-7 text-golden" />
                                </div>
                                <h3 className="font-heading font-bold mb-2 text-slate-900 dark:text-white">{value.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Info */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="font-heading text-2xl font-bold text-center mb-12 text-slate-900 dark:text-white">Thông tin liên hệ</h2>
                    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-golden/10 rounded-lg flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-golden" />
                                </div>
                                <div>
                                    <div className="font-medium text-slate-900 dark:text-white">{companyName}</div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">{companyNameEn}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-golden/10 rounded-lg flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-golden" />
                                </div>
                                <div className="text-slate-700 dark:text-slate-300">
                                    {contactAddress}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-golden/10 rounded-lg flex items-center justify-center">
                                    <Phone className="w-5 h-5 text-golden" />
                                </div>
                                <div className="text-slate-700 dark:text-slate-300">
                                    {contactPhone}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-golden/10 rounded-lg flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-golden" />
                                </div>
                                <div className="text-slate-700 dark:text-slate-300">
                                    {contactEmail}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
