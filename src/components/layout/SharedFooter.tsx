import Link from 'next/link';
import Image from 'next/image';
import { getCachedSettings } from '@/lib/cached-settings';
import { createServerSupabaseClient } from '@/lib/supabase-server';

interface SharedFooterProps {
    showDisclaimer?: boolean;
}

async function getSoftwareProducts() {
    const supabase = await createServerSupabaseClient();
    const { data: products } = await supabase
        .from('software_products')
        .select('name, slug')
        .eq('status', 'active')
        .order('name')
        .limit(5);
    return products || [];
}

export default async function SharedFooter({ showDisclaimer = true }: SharedFooterProps) {
    const settings = await getCachedSettings();
    const softwareProducts = await getSoftwareProducts();

    const companyName = settings['company_name'] || 'Công ty TNHH Tiếp Vận Hoàng Kim';
    const contactEmail = settings['contact_email'] || 'hochk2019@gmail.com';
    const contactPhone = settings['contact_phone'] || '0868.333.606';
    const contactAddress = settings['contact_address'] || 'TP. Hồ Chí Minh, Việt Nam';
    const facebookUrl = settings['facebook_url'] || '';

    return (
        <footer className="bg-slate-900 text-white mt-auto">
            <div className="container mx-auto px-4 py-12">
                {/* 3-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Column 1: Logo & Contact */}
                    <div>
                        <Link href="/" className="flex items-center gap-3 mb-4">
                            <Image src="/logo.png" alt="Logo" width={40} height={40} />
                            <span className="font-heading font-bold text-lg text-golden-gradient">
                                Golden Logistics
                            </span>
                        </Link>
                        <p className="text-sm text-slate-400 mb-4">
                            {companyName} - Cung cấp giải pháp logistics và phần mềm hải quan chuyên nghiệp.
                        </p>
                        <div className="space-y-2 text-sm text-slate-400">
                            <p>📍 {contactAddress}</p>
                            <p>📧 Email: {contactEmail}</p>
                            <p>📞 Điện thoại: {contactPhone}</p>
                            {facebookUrl && (
                                <p>
                                    <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-golden transition-colors">
                                        📘 Facebook →
                                    </a>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Column 2: Phần mềm - Dynamic from DB */}
                    <div>
                        <h3 className="font-heading font-bold text-lg mb-4 text-white">Phần mềm</h3>
                        <ul className="space-y-2 text-sm text-slate-400">
                            {softwareProducts.length > 0 ? (
                                <>
                                    {softwareProducts.map((product) => (
                                        <li key={product.slug}>
                                            <Link href={`/phan-mem/${product.slug}`} className="hover:text-golden transition-colors">
                                                {product.name}
                                            </Link>
                                        </li>
                                    ))}
                                </>
                            ) : (
                                <li>
                                    <Link href="/phan-mem" className="hover:text-golden transition-colors">
                                        Xem danh sách phần mềm
                                    </Link>
                                </li>
                            )}
                            <li>
                                <Link href="/phan-mem" className="hover:text-golden transition-colors">
                                    Xem tất cả →
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Liên kết */}
                    <div>
                        <h3 className="font-heading font-bold text-lg mb-4 text-white">Liên kết</h3>
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
                                    Công văn / Thông tư
                                </Link>
                            </li>
                            <li>
                                <Link href="/thu-tuc-hai-quan" className="hover:text-golden transition-colors">
                                    Thủ tục hải quan
                                </Link>
                            </li>
                            <li>
                                <Link href="/chinh-sach" className="hover:text-golden transition-colors">
                                    Chính sách & Điều khoản
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Legal Disclaimer - Conditional */}
                {showDisclaimer && (
                    <div className="border-t border-slate-800 pt-6">
                        <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                            <p className="text-xs text-slate-400 mb-2">
                                <span className="text-golden font-semibold">⚠️ Tuyên bố miễn trừ trách nhiệm:</span> Thông tin trên website chỉ mang tính chất tham khảo.
                            </p>
                            <p className="text-xs text-red-400">
                                🚫 NGHIÊM CẤM sử dụng thông tin tại trang web này để thực hiện các hành vi
                                vi phạm pháp luật của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.
                            </p>
                        </div>
                    </div>
                )}

                {/* Copyright */}
                <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 gap-2">
                    <p>© {new Date().getFullYear()} {companyName}. All rights reserved.</p>
                    <p>
                        Thiết kế bởi <span className="text-golden">Học HK</span> — {contactEmail} — {contactPhone}
                    </p>
                </div>
            </div>
        </footer>
    );
}
