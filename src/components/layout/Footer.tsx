import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase-server';

interface SettingItem {
    key: string;
    value: string;
}

async function getContactSettings() {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', [
            'company_name',
            'company_address',
            'contact_email',
            'contact_phone',
            'facebook_url',
            'zalo_id',
            'wechat_id'
        ]);

    const settings: Record<string, string> = {};
    (data as SettingItem[] || []).forEach((item) => {
        settings[item.key] = String(item.value);
    });
    return settings;
}

export default async function Footer() {
    const settings = await getContactSettings();

    return (
        <footer className="bg-slate-900 text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <Image
                                src="/logo.png"
                                alt="Golden Logistics"
                                width={40}
                                height={40}
                            />
                            <span className="font-heading font-bold text-lg text-golden">
                                Golden Logistics
                            </span>
                        </div>
                        <p className="text-slate-400 mb-4 text-sm">
                            {settings.company_name || 'Công ty TNHH Tiếp Vận Hoàng Kim'} - Cung cấp giải pháp
                            logistics và phần mềm hải quan chuyên nghiệp.
                        </p>
                        <div className="space-y-2 text-sm text-slate-400">
                            {settings.company_address && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-golden" />
                                    <span>{settings.company_address}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-golden" />
                                <span>{settings.contact_email || 'hochk2019@gmail.com'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-golden" />
                                <span>{settings.contact_phone || '0868.333.606'}</span>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-4 mt-4">
                            {settings.facebook_url && (
                                <a
                                    href={settings.facebook_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                                >
                                    <Facebook className="w-4 h-4" />
                                </a>
                            )}
                            {settings.zalo_id && (
                                <a
                                    href={`https://zalo.me/${settings.zalo_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-500 transition-colors"
                                    title="Zalo"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-heading font-semibold mb-4 text-slate-100">Phần mềm</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li>
                                <Link href="/phan-mem/customs-extractor-v2" className="hover:text-golden transition-colors">
                                    Customs Extractor V2
                                </Link>
                            </li>
                            <li>
                                <Link href="/phan-mem/customs-barcode-automation" className="hover:text-golden transition-colors">
                                    Customs Barcode Automation
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-heading font-semibold mb-4 text-slate-100">Liên kết</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li>
                                <Link href="/gioi-thieu" className="hover:text-golden transition-colors">
                                    Giới thiệu
                                </Link>
                            </li>
                            <li>
                                <Link href="/lien-he" className="hover:text-golden transition-colors">
                                    Liên hệ
                                </Link>
                            </li>
                            <li>
                                <Link href="/cong-van" className="hover:text-golden transition-colors">
                                    Công văn
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="border-t border-slate-800 mt-8 pt-6">
                    <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                        <p className="text-xs text-slate-400 mb-2">
                            <span className="text-golden font-semibold">⚠️ Tuyên bố miễn trừ trách nhiệm:</span>{' '}
                            Thông tin trên website chỉ mang tính chất tham khảo.
                        </p>
                        <p className="text-xs text-red-400">
                            🚫 NGHIÊM CẤM sử dụng thông tin tại trang web này để thực hiện các hành vi
                            vi phạm pháp luật của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.
                        </p>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
                    <p>© {new Date().getFullYear()} Golden Logistics. All rights reserved.</p>
                    <p>
                        Thiết kế bởi <span className="text-golden">Học HK</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}
