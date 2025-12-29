'use client';

import { ArrowRight, Download, Phone, Play, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface SmartCTAProps {
    pageType: 'article' | 'software' | 'home' | 'contact';
    category?: string;
    softwareSlug?: string;
    className?: string;
}

interface CTAConfig {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    icon: React.ReactNode;
    gradient: string;
}

const ctaConfigs: Record<string, CTAConfig> = {
    software_download: {
        title: 'Dùng thử miễn phí',
        description: 'Tải phần mềm và trải nghiệm ngay hôm nay',
        buttonText: 'Tải xuống',
        buttonLink: '/phan-mem',
        icon: <Download className="w-5 h-5" />,
        gradient: 'from-blue-500 to-cyan-500'
    },
    demo: {
        title: 'Yêu cầu Demo',
        description: 'Để chúng tôi hướng dẫn bạn chi tiết về phần mềm',
        buttonText: 'Đặt lịch demo',
        buttonLink: '/lien-he?type=demo',
        icon: <Play className="w-5 h-5" />,
        gradient: 'from-purple-500 to-pink-500'
    },
    contact: {
        title: 'Cần hỗ trợ?',
        description: 'Liên hệ với chúng tôi để được tư vấn miễn phí',
        buttonText: 'Liên hệ ngay',
        buttonLink: '/lien-he',
        icon: <Phone className="w-5 h-5" />,
        gradient: 'from-amber-500 to-orange-500'
    },
    ai_assistant: {
        title: 'Hỏi Golden Copilot',
        description: 'Trợ lý AI giúp bạn tra cứu thủ tục hải quan',
        buttonText: 'Chat ngay',
        buttonLink: '#',
        icon: <Sparkles className="w-5 h-5" />,
        gradient: 'from-emerald-500 to-teal-500'
    },
    read_more: {
        title: 'Khám phá thêm',
        description: 'Xem các bài viết và tài liệu hữu ích khác',
        buttonText: 'Xem thêm',
        buttonLink: '/',
        icon: <ArrowRight className="w-5 h-5" />,
        gradient: 'from-gray-600 to-gray-800'
    }
};

function getCTAForPage(pageType: string, category?: string): CTAConfig {
    // Logic to determine best CTA based on context
    if (pageType === 'software') {
        return ctaConfigs.software_download;
    }

    if (pageType === 'article') {
        // If article about software, show demo CTA
        if (category?.toLowerCase().includes('phần mềm') ||
            category?.toLowerCase().includes('software')) {
            return ctaConfigs.demo;
        }
        // For other articles, show contact
        return ctaConfigs.contact;
    }

    if (pageType === 'contact') {
        return ctaConfigs.ai_assistant;
    }

    // Default for home
    return ctaConfigs.demo;
}

export default function SmartCTA({
    pageType,
    category,
    softwareSlug,
    className = ''
}: SmartCTAProps) {
    const cta = getCTAForPage(pageType, category);

    // Special handling for software pages with specific slug
    if (pageType === 'software' && softwareSlug) {
        cta.buttonLink = `/phan-mem/${softwareSlug}`;
    }

    const handleClick = (e: React.MouseEvent) => {
        // If it's the AI assistant CTA, trigger the chat widget instead
        if (cta.buttonLink === '#') {
            e.preventDefault();
            // Find and click the chat widget button
            const chatButton = document.querySelector('[aria-label="Mở Golden Copilot"]') as HTMLButtonElement;
            if (chatButton) {
                chatButton.click();
            }
        }
    };

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${cta.gradient} p-[2px] ${className}`}>
            <div className="relative bg-white dark:bg-gray-900 rounded-[14px] p-6">
                {/* Background decoration */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cta.gradient} opacity-5`} />

                <div className="relative flex flex-col sm:flex-row items-center gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${cta.gradient} flex items-center justify-center text-white shadow-lg`}>
                        {cta.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            {cta.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {cta.description}
                        </p>
                    </div>

                    {/* Button */}
                    <Link
                        href={cta.buttonLink}
                        onClick={handleClick}
                        className={`flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${cta.gradient} text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300`}
                    >
                        {cta.buttonText}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

// Compact version for sidebars
export function SmartCTACompact({
    pageType,
    category,
    className = ''
}: Omit<SmartCTAProps, 'softwareSlug'>) {
    const cta = getCTAForPage(pageType, category);

    return (
        <Link
            href={cta.buttonLink}
            className={`block p-4 rounded-xl bg-gradient-to-r ${cta.gradient} text-white hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ${className}`}
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    {cta.icon}
                </div>
                <div className="flex-1">
                    <p className="font-semibold">{cta.title}</p>
                    <p className="text-xs opacity-90">{cta.description}</p>
                </div>
            </div>
        </Link>
    );
}
