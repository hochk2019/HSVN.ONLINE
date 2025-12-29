'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
    Database,
    RefreshCw,
    Search,
    Play,
    AlertCircle,
    CheckCircle2,
    Loader2,
    HardDrive
} from 'lucide-react';
import { getAllPublishedPostIds } from '@/lib/post-actions';

// Stats interface
interface RAGStats {
    totalChunks: number;
    indexedPosts: number;
    lastUpdated?: string;
}

export default function RAGManager() {
    console.log('Rendering RAGManager...');
    // State
    const [stats, setStats] = useState<RAGStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(false);

    // Ingestion state
    const [ingesting, setIngesting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [totalPosts, setTotalPosts] = useState(0);
    const [currentPost, setCurrentPost] = useState('');
    const [ingestLogs, setIngestLogs] = useState<string[]>([]);

    // Search test state
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);

    // Load stats on mount
    useEffect(() => {
        console.log('RAGManager mounted, fetching stats...');
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const res = await fetch('/api/embeddings/ingest');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
                console.log('Stats fetched:', data);
            } else {
                console.error('Failed to fetch stats:', res.status);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const addToLog = (msg: string) => {
        setIngestLogs(prev => [msg, ...prev].slice(0, 50)); // Keep last 50 logs
    };

    const handleIngestAll = async () => {
        if (!confirm('Bạn có chắc muốn index lại toàn bộ bài viết? Việc này có thể mất vài phút.')) return;

        setIngesting(true);
        setProgress(0);
        setIngestLogs([]);
        addToLog('🚀 Bắt đầu quá trình ingestion...');

        try {
            // Get all published post IDs
            const { postIds, error } = await getAllPublishedPostIds();

            if (error || !postIds) {
                addToLog(`❌ Lỗi lấy danh sách bài viết: ${error}`);
                setIngesting(false);
                return;
            }

            setTotalPosts(postIds.length);
            addToLog(`📋 Tìm thấy ${postIds.length} bài viết đã xuất bản.`);

            let successCount = 0;
            let failCount = 0;

            // Process sequentially
            for (let i = 0; i < postIds.length; i++) {
                const post = postIds[i];
                setCurrentPost(`${post.title} (Thử lần 1)`);

                let retries = 0;
                let success = false;

                while (!success && retries < 3) {
                    try {
                        const res = await fetch('/api/embeddings/ingest', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ postId: post.id, force: true }),
                        });

                        const data = await res.json();

                        if (res.ok) {
                            successCount++;
                            addToLog(`✅ [${i + 1}/${postIds.length}] Indexed: ${post.title} (${data.chunks} chunks)`);
                            success = true;
                        } else {
                            // Check for Rate Limit (429) or Service Unavailable (503)
                            if (res.status === 429 || res.status === 503) {
                                retries++;

                                // Countdown visual
                                for (let seconds = 60; seconds > 0; seconds--) {
                                    addToLog(`⏳ [${i + 1}/${postIds.length}] Rate Limit (429). Đang đợi ${seconds}s... (Thử lại ${retries}/3)`);
                                    // Remove previous log to avoid spamming (optional, but here we just append)
                                    // Actually, let's just update the status text instead of spamming logs
                                    setCurrentPost(`${post.title} (Đợi ${seconds}s - Thử lại ${retries}/3)`);
                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                }

                                continue; // Retry loop
                            }

                            failCount++;
                            addToLog(`⚠️ [${i + 1}/${postIds.length}] Failed: ${post.title} - ${data.error}`);
                            break; // Stop retrying for other errors
                        }
                    } catch (err) {
                        failCount++;
                        addToLog(`❌ [${i + 1}/${postIds.length}] Error: ${post.title}`);
                        break;
                    }
                }

                // Update progress
                setProgress(Math.round(((i + 1) / postIds.length) * 100));

                // Increased delay to 5 seconds to be safer
                if (i < postIds.length - 1) {
                    setCurrentPost(`Đang nghỉ 5 giây...`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }

            addToLog(`🎉 Hoàn tất! Thành công: ${successCount}, Thất bại: ${failCount}`);
            fetchStats(); // Refresh stats

        } catch (error) {
            addToLog(`❌ Lỗi không xác định: ${error}`);
        } finally {
            setIngesting(false);
            setCurrentPost('');
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearching(true);
        setSearchResults([]);

        try {
            const res = await fetch('/api/embeddings/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery }),
            });

            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.results || []);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Bài viết đã Index
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-golden" />
                            <span className="text-2xl font-bold">
                                {stats?.indexedPosts || 0}
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Tổng số Chunks
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <HardDrive className="w-5 h-5 text-blue-500" />
                            <span className="text-2xl font-bold">
                                {stats?.totalChunks || 0}
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Trạng thái API
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <span className="font-bold text-green-600">Sẵn sàng</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ingestion Control */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="w-5 h-5" />
                            Quản lý Dữ liệu Embedding
                        </CardTitle>
                        <CardDescription>
                            Đồng bộ nội dung bài viết vào vector database để chatbot có thể tìm kiếm.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Button
                                onClick={handleIngestAll}
                                disabled={ingesting}
                                className="w-full"
                            >
                                {ingesting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 mr-2" />
                                        Index Tất Cả Bài Viết
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={fetchStats}
                                disabled={loadingStats || ingesting}
                                title="Làm mới trạng thái"
                            >
                                <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>

                        {ingesting && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Tiến độ</span>
                                    <span>{progress}%</span>
                                </div>
                                <Progress value={progress} />
                                <p className="text-xs text-gray-500 truncate">
                                    Đang xử lý: {currentPost}
                                </p>
                            </div>
                        )}

                        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-3 h-64 overflow-y-auto text-xs font-mono border border-gray-200 dark:border-gray-800">
                            {ingestLogs.length === 0 ? (
                                <p className="text-gray-400 italic text-center mt-20">Nhật ký xử lý sẽ hiện ở đây...</p>
                            ) : (
                                ingestLogs.map((log, i) => (
                                    <div key={i} className="mb-1 border-b border-gray-200/10 pb-1 last:border-0">
                                        {log}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Test Search */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="w-5 h-5" />
                            Kiểm tra RAG Search
                        </CardTitle>
                        <CardDescription>
                            Thử tìm kiếm để kiểm tra xem hệ thống có trả về đúng ngữ cảnh bài viết không.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                placeholder="Nhập câu hỏi hoặc từ khóa..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button type="submit" disabled={searching}>
                                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tìm'}
                            </Button>
                        </form>

                        <div className="space-y-4 mt-4 h-80 overflow-y-auto pr-2">
                            {searchResults.length > 0 ? (
                                searchResults.map((result: any, i) => (
                                    <div key={i} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border text-sm">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-golden line-clamp-1">{result.title}</h4>
                                            <Badge variant="outline" className="text-xs">
                                                {Math.round(result.similarity * 100)}% Match
                                            </Badge>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 line-clamp-3 text-xs mb-2">
                                            {result.chunk}
                                        </p>
                                        <div className="text-xs text-gray-400">
                                            Post ID: {result.postId}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-400 py-10">
                                    <Database className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                    <p>Kết quả tìm kiếm sẽ hiện ở đây</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
