'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, Eye, Clock, Tag } from 'lucide-react';
import { useTranslatedContent } from '@/hooks/useTranslatedContent';
import ShareButtons from '@/components/ShareButtons';
import FacebookComments from '@/components/FacebookComments';

interface ArticleViewerProps {
    post: {
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        content_html: string | null;
        published_at: string | null;
        featured_image: string | null;
        view_count?: number;
        category: { name: string; slug: string } | null;
        author: { full_name: string | null } | null;
        translations?: string | null;
        updated_at?: string | null;
    };
    siteUrl: string;
    enableComments: boolean;
}

export default function ArticleViewer({ post: initialPost, siteUrl, enableComments }: ArticleViewerProps) {
    const [currentPostData, setCurrentPostData] = useState(initialPost);
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationError, setTranslationError] = useState<string | null>(null);

    const post = useTranslatedContent(
        currentPostData,
        currentPostData.translations,
        ['title', 'excerpt', 'content_html']
    );

    const categorySlug = currentPostData.category?.slug || 'bai-viet';
    const wordCount = post.content_html?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0;
    const readTime = Math.ceil(wordCount / 200);

    // Auto-translate effect
    useEffect(() => {
        const checkAndTranslate = async () => {
            const savedLang = localStorage.getItem('preferred_language') || 'vi';
            if (savedLang !== 'en') return;

            // Check if translation exists
            const translations = currentPostData.translations
                ? (typeof currentPostData.translations === 'string' ? JSON.parse(currentPostData.translations) : currentPostData.translations)
                : {};

            if (translations.en) return;

            // Trigger translation
            if (isTranslating) return;
            setIsTranslating(true);

            setTranslationError(null);

            try {
                const res = await fetch('/api/ai/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ postId: currentPostData.id, language: 'en' })
                });

                const data = await res.json();

                if (res.ok && data.translated) {
                    // Merge new translation
                    const updatedTranslations = { ...translations, en: data.translated };
                    setCurrentPostData(prev => ({
                        ...prev,
                        translations: JSON.stringify(updatedTranslations)
                    }));
                } else {
                    console.error('Translation error:', data.error);
                    setTranslationError(data.error || 'Translation failed');
                }
            } catch (error) {
                console.error('Auto-translation failed:', error);
                setTranslationError('Connection failed');
            } finally {
                setIsTranslating(false);
            }
        };

        const handleLanguageChange = () => checkAndTranslate();

        // Listen for language changes
        window.addEventListener('languageChange', handleLanguageChange);

        // Initial check
        checkAndTranslate();

        return () => window.removeEventListener('languageChange', handleLanguageChange);
    }, [currentPostData.translations, currentPostData.id]);

    return (
        <article className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden relative ${isTranslating ? 'opacity-80' : ''}`}>
            {isTranslating && (
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 overflow-hidden z-10">
                    <div className="w-full h-full bg-golden origin-left animate-pulse"></div>
                </div>
            )}

            {translationError && (
                <div className="bg-red-50 text-red-600 px-4 py-2 text-sm border-b border-red-100">
                    Unable to auto-translate: {translationError}
                </div>
            )}

            {post.featured_image && (
                <div className="aspect-video relative">
                    <Image
                        src={post.featured_image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            )}

            <div className="p-6 lg:p-8">
                <header className="mb-6">
                    <h1 className="font-heading text-2xl md:text-3xl font-bold mb-4 leading-tight text-slate-900 dark:text-white">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {post.published_at ? new Date(post.published_at).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            }) : ''}
                        </span>
                        {post.author?.full_name && (
                            <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {post.author.full_name}
                            </span>
                        )}
                        <span className="flex items-center gap-1" title="Lượt xem">
                            <Eye className="w-4 h-4" />
                            {post.view_count || 0}
                        </span>
                        <span className="flex items-center gap-1" title="Thời gian đọc">
                            <Clock className="w-4 h-4" />
                            {readTime} phút
                        </span>
                        {post.category && (
                            <Link
                                href={`/${post.category.slug}`}
                                className="px-2 py-1 bg-golden/10 text-golden rounded-full text-xs font-medium hover:bg-golden/20 transition-colors"
                            >
                                {post.category.name}
                            </Link>
                        )}
                    </div>

                    {post.excerpt && (
                        <div className="text-slate-600 dark:text-slate-400 italic border-l-4 border-golden pl-4 bg-slate-50 dark:bg-slate-800 py-3 rounded-r-lg">
                            {post.excerpt}
                        </div>
                    )}
                </header>

                {/* Article Content */}
                <div
                    className="prose prose-lg dark:prose-invert max-w-none
                    prose-headings:font-heading prose-headings:text-slate-900 dark:prose-headings:text-white
                    prose-p:text-slate-700 dark:prose-p:text-slate-300
                    prose-a:text-golden prose-a:no-underline hover:prose-a:underline
                    prose-img:rounded-lg
                    prose-pre:bg-slate-900
                    prose-blockquote:border-l-golden"
                    dangerouslySetInnerHTML={{ __html: post.content_html || '' }}
                />

                {/* Share Buttons */}
                <ShareButtons url={`${siteUrl}/${categorySlug}/${post.slug}`} title={post.title} />

                {/* Facebook Comments */}
                {enableComments && (
                    <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                        <h3 className="font-heading text-xl font-bold mb-4 text-slate-900 dark:text-white">Bình luận</h3>
                        <FacebookComments
                            url={`${siteUrl}/${categorySlug}/${post.slug}`}
                            numPosts={10}
                        />
                    </div>
                )}


            </div>
        </article>
    );
}
