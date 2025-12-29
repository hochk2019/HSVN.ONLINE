import type { Metadata } from "next";
import "./globals.css";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import SharedFooter from "@/components/layout/SharedFooter";
import ChatWidget from "@/components/ChatWidget";
import TrackingProvider from "@/components/TrackingProvider";
import ThemeWrapper from "@/components/ThemeWrapper";
import SEOWrapper from "@/components/SEOWrapper";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hsvn.online';

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "Công ty TNHH Tiếp Vận Hoàng Kim | Golden Logistics",
        template: "%s | Golden Logistics",
    },
    description: "Cung cấp giải pháp logistics và phần mềm hải quan chuyên nghiệp. Phần mềm Customs Extractor, Customs Barcode Automation.",
    keywords: ["logistics", "hải quan", "xuất nhập khẩu", "phần mềm hải quan", "customs", "HS code", "Golden Logistics"],
    authors: [{ name: "Golden Logistics" }],
    creator: "Học HK",
    publisher: "Golden Logistics",
    openGraph: {
        type: "website",
        locale: "vi_VN",
        siteName: "Golden Logistics",
        title: "Công ty TNHH Tiếp Vận Hoàng Kim | Golden Logistics",
        description: "Cung cấp giải pháp logistics và phần mềm hải quan chuyên nghiệp",
        images: [
            {
                url: "/logo.png",
                width: 512,
                height: 512,
                alt: "Golden Logistics Logo",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Công ty TNHH Tiếp Vận Hoàng Kim | Golden Logistics",
        description: "Cung cấp giải pháp logistics và phần mềm hải quan chuyên nghiệp",
        images: ["/logo.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    alternates: {
        canonical: siteUrl,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <head>
                {/* Favicons */}
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/site.webmanifest" />
            </head>
            <body className="antialiased min-h-screen bg-white dark:bg-gray-950 flex flex-col">
                <SEOWrapper>
                    <ThemeWrapper>
                        <TrackingProvider>
                            <HeaderWrapper />
                            <main className="flex-1">{children}</main>
                            <SharedFooter />
                            {/* Golden Copilot AI Chatbot */}
                            <ChatWidget />
                        </TrackingProvider>
                    </ThemeWrapper>
                </SEOWrapper>
            </body>
        </html>
    );
}



