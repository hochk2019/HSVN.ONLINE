import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/settings-actions";
import { getPublicSoftware, getLatestPostsByCategory } from "@/lib/public-actions";
import { Package, Calendar, Users, Download, Star } from 'lucide-react';
import Testimonials from "@/components/home/Testimonials";
import LocalizedText from "@/components/LocalizedText";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function Home() {
    const { settings } = await getSettings();
    const { products: softwareProducts } = await getPublicSoftware();
    const { categories: latestPosts } = await getLatestPostsByCategory(3);

    // Get featured software (max 4)
    const featuredSoftware = softwareProducts
        .filter((p: any) => p.is_featured)
        .slice(0, 4);

    // Get dynamic content with fallbacks
    const heroTitle = settings.hero_title || "Golden Logistics Cung Cấp Giải Pháp Vận Chuyển và Thủ Tục Hải Quan Chuyên Nghiệp - Giá Rẻ";
    const heroSubtitle = settings.hero_subtitle || "Cung cấp phần mềm hỗ trợ nghiệp vụ hải quan, tự động hóa quy trình xuất nhập khẩu, kiến thức và cập nhật văn bản pháp luật mới nhất.";

    // CTA settings
    const ctaPrimaryText = settings.cta_primary_text || "Khám phá phần mềm";
    const ctaPrimaryUrl = settings.cta_primary_url || "/phan-mem";
    const ctaSecondaryText = settings.cta_secondary_text || "Về chúng tôi";
    const ctaSecondaryUrl = settings.cta_secondary_url || "/gioi-thieu";

    // Testimonials/Stats settings
    const statCustomers = settings.stat_customers || "500+";
    const statDownloads = settings.stat_downloads || "10,000+";
    const statRating = settings.stat_rating || "4.9";
    const statYears = settings.stat_years || "5+";

    return (
        <div className="bg-slate-50 dark:bg-slate-950">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-12 lg:py-20 bg-gradient-to-b from-white to-slate-100 dark:from-slate-900 dark:to-slate-950">
                {/* Background Pattern */}
                <div className="absolute inset-0 hero-pattern" />
                <div className="absolute inset-0 hero-dots opacity-30" />

                {/* Floating Decorative Elements */}
                <div className="absolute top-20 left-10 w-20 h-20 bg-golden/10 rounded-full blur-2xl animate-float" />
                <div className="absolute bottom-20 right-10 w-32 h-32 bg-golden/10 rounded-full blur-3xl animate-float-slow" />
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-golden/5 rounded-full blur-xl animate-float-delayed" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-6 animate-fadeIn text-slate-900 dark:text-white">
                            <LocalizedText vi={heroTitle} en={settings.hero_title_en} />
                        </h1>
                        <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 mb-8 animate-fadeIn" style={{ animationDelay: "0.1s" }}>
                            <LocalizedText vi={heroSubtitle} en={settings.hero_subtitle_en} />
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn" style={{ animationDelay: "0.2s" }}>
                            <Link
                                href={ctaPrimaryUrl}
                                className="px-8 py-3 bg-golden hover:bg-golden-dark text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-golden/30 hover:-translate-y-1"
                            >
                                <LocalizedText vi={ctaPrimaryText} en={settings.cta_primary_text_en} />
                            </Link>
                            <Link
                                href={ctaSecondaryUrl}
                                className="px-8 py-3 border-2 border-golden text-golden hover:bg-golden hover:text-white font-semibold rounded-full transition-all duration-300 hover:-translate-y-1"
                            >
                                <LocalizedText vi={ctaSecondaryText} en={settings.cta_secondary_text_en} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Software */}
            <section className="py-16 bg-white dark:bg-slate-900">
                <div className="container mx-auto px-4">
                    <h2 className="font-heading text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">
                        <LocalizedText vi="Phần mềm" en="Featured" /> <span className="text-shine"><LocalizedText vi="nổi bật" en="Software" /></span>
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {featuredSoftware.length > 0 ? (
                            featuredSoftware.map((software: any) => (
                                <div key={software.id} className="premium-card p-6">
                                    <div className="card-icon-container mb-4">
                                        {software.icon_url ? (
                                            <Image
                                                src={software.icon_url}
                                                alt={software.name}
                                                width={32}
                                                height={32}
                                                className="w-8 h-8"
                                            />
                                        ) : (
                                            <Package className="w-8 h-8 text-golden" />
                                        )}
                                    </div>
                                    <h3 className="font-heading text-xl font-bold mb-2 text-slate-900 dark:text-white">
                                        {software.name}
                                    </h3>
                                    <p className="text-slate-700 dark:text-slate-300 mb-4 line-clamp-2">
                                        {software.summary}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <Link
                                            href={`/phan-mem/${software.slug}`}
                                            className="text-golden hover:text-golden-dark font-medium inline-flex items-center gap-1 group"
                                        >
                                            <LocalizedText vi="Xem chi tiết" en="View Details" />
                                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                        <span className="text-sm text-slate-500">
                                            {software.download_count?.toLocaleString() || 0} lượt tải
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 text-center py-8 text-slate-500">
                                Chưa có phần mềm nổi bật nào.
                            </div>
                        )}
                    </div>

                    {/* View All Link */}
                    <div className="text-center mt-8">
                        <Link
                            href="/phan-mem"
                            className="inline-flex items-center gap-2 text-golden hover:text-golden-dark font-medium"
                        >
                            <LocalizedText vi="Xem tất cả phần mềm" en="View All Software" />
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-16 bg-slate-100 dark:bg-slate-950">
                <div className="container mx-auto px-4">
                    <h2 className="font-heading text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">
                        <LocalizedText vi="Chuyên mục" en="Article" /> <span className="text-golden-gradient"><LocalizedText vi="bài viết" en="Categories" /></span>
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        <Link href="/cong-van" className="card-hover group block bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="font-heading text-lg font-bold mb-2 text-slate-900 dark:text-white">Công văn / Thông tư</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Văn bản pháp luật, nghị định, thông tư liên quan hải quan
                            </p>
                        </Link>

                        <Link href="/hs-code" className="card-hover group block bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                            <h3 className="font-heading text-lg font-bold mb-2 text-slate-900 dark:text-white">HS Code</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Phân loại hàng hóa, xác định trước mã số
                            </p>
                        </Link>

                        <Link href="/thu-tuc-hai-quan" className="card-hover group block bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
                            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <h3 className="font-heading text-lg font-bold mb-2 text-slate-900 dark:text-white">Thủ tục hải quan</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Hướng dẫn quy trình xuất nhập khẩu
                            </p>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <Testimonials />

            {/* Stats Section */}
            <section className="py-8 bg-gradient-to-r from-golden to-golden-dark">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
                        <div className="text-white">
                            <Users className="w-7 h-7 mx-auto mb-2 opacity-80" />
                            <div className="text-2xl font-bold mb-0.5">{statCustomers}</div>
                            <div className="text-xs opacity-80">Khách hàng</div>
                        </div>
                        <div className="text-white">
                            <Download className="w-7 h-7 mx-auto mb-2 opacity-80" />
                            <div className="text-2xl font-bold mb-0.5">{statDownloads}</div>
                            <div className="text-xs opacity-80">Lượt tải</div>
                        </div>
                        <div className="text-white">
                            <Star className="w-7 h-7 mx-auto mb-2 opacity-80" />
                            <div className="text-2xl font-bold mb-0.5">{statRating}</div>
                            <div className="text-xs opacity-80">Đánh giá</div>
                        </div>
                        <div className="text-white">
                            <Calendar className="w-7 h-7 mx-auto mb-2 opacity-80" />
                            <div className="text-2xl font-bold mb-0.5">{statYears}</div>
                            <div className="text-xs opacity-80">Năm kinh nghiệm</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Latest Posts Section */}
            {latestPosts.length > 0 && (
                <section className="py-16 bg-white dark:bg-slate-900">
                    <div className="container mx-auto px-4">
                        <h2 className="font-heading text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">
                            <LocalizedText vi="Bài viết" en="Latest" /> <span className="text-golden-gradient"><LocalizedText vi="mới nhất" en="Posts" /></span>
                        </h2>

                        {latestPosts.map((cat) => (
                            <div key={cat.categorySlug} className="mb-12 last:mb-0">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                                        {cat.categoryName}
                                    </h3>
                                    <Link
                                        href={`/${cat.categorySlug}`}
                                        className="text-golden hover:text-golden-dark text-sm font-medium"
                                    >
                                        <LocalizedText vi="Xem tất cả" en="View All" /> →
                                    </Link>
                                </div>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {cat.posts.map((post) => (
                                        <Link
                                            key={post.id}
                                            href={`/${cat.categorySlug}/${post.slug}`}
                                            className="group block bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                                        >
                                            {post.featured_image ? (
                                                <div className="relative h-40 overflow-hidden">
                                                    <Image
                                                        src={post.featured_image}
                                                        alt={post.title}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-40 bg-gradient-to-br from-golden/20 to-golden/5 flex items-center justify-center">
                                                    <Package className="w-12 h-12 text-golden/50" />
                                                </div>
                                            )}
                                            <div className="p-4">
                                                <h4 className="font-medium text-slate-900 dark:text-white line-clamp-2 group-hover:text-golden transition-colors">
                                                    {post.title}
                                                </h4>
                                                {post.published_at && (
                                                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(post.published_at).toLocaleDateString('vi-VN')}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Final CTA Section */}
            <section className="py-20 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-golden/10 via-transparent to-golden/10" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
                        <LocalizedText vi="Bắt đầu sử dụng ngay hôm nay" en="Start using today" />
                    </h2>
                    <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                        <LocalizedText
                            vi="Tải phần mềm miễn phí hoặc liên hệ để được tư vấn giải pháp phù hợp với nhu cầu của bạn."
                            en="Download free software or contact us for a solution tailored to your needs."
                        />
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href={ctaPrimaryUrl}
                            className="px-8 py-3 bg-golden hover:bg-golden-dark text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-golden/30"
                        >
                            <LocalizedText vi={ctaPrimaryText} en={settings.cta_primary_text_en} />
                        </Link>
                        <Link
                            href="/lien-he"
                            className="px-8 py-3 border-2 border-white/30 text-white hover:bg-white/10 font-semibold rounded-full transition-all duration-300"
                        >
                            <LocalizedText vi="Liên hệ tư vấn" en="Contact Us" />
                        </Link>
                    </div>
                </div>
            </section>
        </div >
    );
}
