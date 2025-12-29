'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

interface RecommendedPost {
    post_id: string;
    title: string;
    slug: string;
    category_id: string;
    score: number;
}

interface RecommendedPostsProps {
    sessionId?: string;
    limit?: number;
    title?: string;
    className?: string;
}

/**
 * AI-powered Recommended Posts Component
 * Shows personalized recommendations based on user behavior
 */
export default function RecommendedPosts({
    sessionId,
    limit = 5,
    title = 'Đề xuất cho bạn',
    className = ''
}: RecommendedPostsProps) {
    const [posts, setPosts] = useState<RecommendedPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRecommendations() {
            // Get sessionId from storage if not provided
            let sid = sessionId;
            if (!sid && typeof window !== 'undefined') {
                sid = sessionStorage.getItem('tracking_session') || '';
            }

            if (!sid) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `/api/track?sessionId=${sid}&limit=${limit}`
                );
                const data = await response.json();

                if (data.recommendations && data.recommendations.length > 0) {
                    setPosts(data.recommendations);
                }
            } catch (error) {
                console.warn('[Recommendations] Failed to fetch:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchRecommendations();
    }, [sessionId, limit]);

    // Don't render if no recommendations
    if (!loading && posts.length === 0) {
        return null;
    }

    if (loading) {
        return (
            <div className={`${className}`}>
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            </div>

            <ul className="space-y-3">
                {posts.map((post) => (
                    <li key={post.post_id}>
                        <Link
                            href={`/${post.slug}`}
                            className="group flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                        >
                            <ArrowRight className="w-4 h-4 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            <span className="line-clamp-2">{post.title}</span>
                        </Link>
                    </li>
                ))}
            </ul>

            <p className="mt-4 text-xs text-gray-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI đề xuất dựa trên lịch sử đọc
            </p>
        </div>
    );
}
