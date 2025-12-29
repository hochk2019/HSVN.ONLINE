'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon, FileArchive, Film, Folder, X, Copy, Check, Trash2 } from 'lucide-react';
import { uploadMedia, deleteMedia } from '@/lib/settings-actions';

interface MediaFile {
    name: string;
    id: string;
    created_at: string;
    updated_at: string;
    metadata: Record<string, unknown>;
    url?: string;
}

interface MediaLibraryProps {
    initialFiles: MediaFile[];
}

export default function MediaLibrary({ initialFiles }: MediaLibraryProps) {
    const [files, setFiles] = useState<MediaFile[]>(initialFiles);
    const [uploading, setUploading] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // Optimize image before upload (resize + compress)
            let fileToUpload = file;
            if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
                const { optimizeImage } = await import('@/lib/image-optimizer');
                fileToUpload = await optimizeImage(file, {
                    maxWidth: 1200,
                    maxHeight: 1200,
                    quality: 0.85,
                    format: 'webp',
                });
            }

            const formData = new FormData();
            formData.append('file', fileToUpload);
            const result = await uploadMedia(formData);

            if (result.error) {
                alert('Lỗi: ' + result.error);
            } else {
                router.refresh();
            }
        } catch (error) {
            alert('Lỗi upload');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = async (path: string, name: string) => {
        if (!confirm(`Xóa file "${name}"?`)) return;

        const result = await deleteMedia(`uploads/${name}`);
        if (result.error) {
            alert('Lỗi: ' + result.error);
        } else {
            setFiles(files.filter(f => f.name !== name));
            router.refresh();
        }
    };

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    const getFileIcon = (name: string) => {
        const ext = name.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
            return ImageIcon;
        }
        if (['mp4', 'webm', 'mov'].includes(ext || '')) {
            return Film;
        }
        return FileArchive;
    };

    const isImage = (name: string) => {
        const ext = name.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
    };

    const images = files.filter(f => isImage(f.name));
    const docs = files.filter(f => !isImage(f.name));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-bold">Thư viện Media</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Quản lý hình ảnh và tệp tin
                    </p>
                </div>
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleUpload}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
                    />
                    <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? 'Đang tải...' : 'Tải lên'}
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{images.length}</div>
                            <div className="text-sm text-gray-500">Hình ảnh</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <FileArchive className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{docs.length}</div>
                            <div className="text-sm text-gray-500">Tài liệu</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-golden/20 rounded-lg flex items-center justify-center">
                            <Folder className="w-6 h-6 text-golden" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{files.length}</div>
                            <div className="text-sm text-gray-500">Tổng file</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Files Grid */}
            <Card>
                <CardHeader>
                    <CardTitle>Tất cả tệp tin</CardTitle>
                </CardHeader>
                <CardContent>
                    {files.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ImageIcon className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">Chưa có tệp tin nào</h3>
                            <p className="text-gray-500 mb-4">
                                Tải lên hình ảnh, tài liệu để sử dụng trong bài viết
                            </p>
                            <Button onClick={() => fileInputRef.current?.click()}>
                                <Upload className="w-4 h-4 mr-2" />
                                Tải lên ngay
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {files.map((file) => {
                                const Icon = getFileIcon(file.name);
                                const isImg = isImage(file.name);

                                return (
                                    <div
                                        key={file.name}
                                        className="group relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-golden transition-colors"
                                    >
                                        {/* Preview */}
                                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                            {isImg ? (
                                                <img
                                                    src={file.url}
                                                    alt={file.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Icon className="w-12 h-12 text-gray-400" />
                                            )}
                                        </div>

                                        {/* Actions Overlay */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => file.url && copyUrl(file.url)}
                                                className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                                                title="Copy URL"
                                            >
                                                {copiedUrl === file.url ? (
                                                    <Check className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => file.url && handleDelete(file.url, file.name)}
                                                className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
                                                title="Xóa"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>

                                        {/* Filename */}
                                        <div className="p-2">
                                            <p className="text-xs truncate" title={file.name}>
                                                {file.name}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
