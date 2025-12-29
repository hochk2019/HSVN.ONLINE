'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createVersion, deleteVersion } from '@/lib/software-actions';
import {
    Plus, Trash2, Download, Package, Check, Loader2,
    Upload, Link as LinkIcon, FileUp, ExternalLink
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface Version {
    id: string;
    software_id: string | null;
    version: string;
    release_notes: string | null;
    file_url: string | null;
    file_name: string | null;
    file_size: number | null;
    is_latest: boolean;
    status: string;
    released_at: string;
}

interface VersionManagerProps {
    softwareId: string;
    softwareName: string;
    versions: Version[];
}

function formatFileSize(bytes: number | null): string {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

type UploadMode = 'upload' | 'url';

export default function VersionManager({ softwareId, softwareName, versions }: VersionManagerProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Upload mode: 'upload' = upload file to storage, 'url' = paste external URL
    const [uploadMode, setUploadMode] = useState<UploadMode>('upload');

    // Form states
    const [version, setVersion] = useState('');
    const [releaseNotes, setReleaseNotes] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [fileName, setFileName] = useState('');
    const [fileSize, setFileSize] = useState('');
    const [isLatest, setIsLatest] = useState(true);

    // Upload states
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setFileName(file.name);
            setFileSize(file.size.toString());
            setError(null);
        }
    };

    const uploadFile = async (): Promise<string | null> => {
        if (!selectedFile) return null;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Create Supabase client for upload
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
            const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
            const supabase = createClient(supabaseUrl, supabaseAnonKey);

            // Generate unique file path
            const timestamp = Date.now();
            const safeName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filePath = `software/${softwareId}/${timestamp}_${safeName}`;

            // Upload file
            const { data, error: uploadError } = await supabase.storage
                .from('downloads')
                .upload(filePath, selectedFile, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) {
                throw new Error(uploadError.message);
            }

            setUploadProgress(100);

            // Get public URL
            const { data: publicUrlData } = supabase.storage
                .from('downloads')
                .getPublicUrl(filePath);

            return publicUrlData.publicUrl;
        } catch (err) {
            console.error('Upload error:', err);
            throw err;
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddVersion = async () => {
        setLoading(true);
        setError(null);

        try {
            let finalFileUrl = fileUrl;

            // If upload mode and file selected, upload first
            if (uploadMode === 'upload' && selectedFile) {
                const uploadedUrl = await uploadFile();
                if (!uploadedUrl) {
                    setError('Không thể upload file');
                    setLoading(false);
                    return;
                }
                finalFileUrl = uploadedUrl;
            }

            const formData = new FormData();
            formData.set('software_id', softwareId);
            formData.set('version', version);
            formData.set('release_notes', releaseNotes);
            formData.set('file_url', finalFileUrl);
            formData.set('file_name', fileName);
            formData.set('file_size', fileSize);
            formData.set('is_latest', isLatest.toString());
            formData.set('status', 'active');

            const result = await createVersion(formData);

            if (result.error) {
                setError(result.error);
                setLoading(false);
            } else {
                // Reset form
                resetForm();
                router.refresh();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
            setLoading(false);
        }
    };

    const resetForm = () => {
        setVersion('');
        setReleaseNotes('');
        setFileUrl('');
        setFileName('');
        setFileSize('');
        setIsLatest(true);
        setSelectedFile(null);
        setUploadProgress(0);
        setShowAddForm(false);
        setLoading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDeleteVersion = async (versionId: string) => {
        if (!confirm('Bạn có chắc muốn xóa phiên bản này?')) return;

        const result = await deleteVersion(versionId, softwareId);
        if (result.error) {
            alert(result.error);
        } else {
            router.refresh();
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Phiên bản - {softwareName}
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm phiên bản
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Add Version Form */}
                {showAddForm && (
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-4">
                        <h4 className="font-medium">Thêm phiên bản mới</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Số phiên bản *</label>
                                <Input
                                    value={version}
                                    onChange={(e) => setVersion(e.target.value)}
                                    placeholder="v1.0.0"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isLatest"
                                    checked={isLatest}
                                    onChange={(e) => setIsLatest(e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <label htmlFor="isLatest" className="text-sm">
                                    Đánh dấu là phiên bản mới nhất
                                </label>
                            </div>
                        </div>

                        {/* Upload Mode Selector */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Phương thức tải file</label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={uploadMode === 'upload' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setUploadMode('upload')}
                                    className="flex-1"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload file
                                </Button>
                                <Button
                                    type="button"
                                    variant={uploadMode === 'url' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setUploadMode('url')}
                                    className="flex-1"
                                >
                                    <LinkIcon className="w-4 h-4 mr-2" />
                                    Nhập URL (GitHub, etc.)
                                </Button>
                            </div>
                        </div>

                        {/* Upload Mode: File Upload */}
                        {uploadMode === 'upload' && (
                            <div className="space-y-3">
                                <div
                                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-golden transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        accept=".zip,.rar,.7z,.exe,.msi,.dmg,.pkg,.deb,.rpm"
                                    />
                                    {selectedFile ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <FileUp className="w-8 h-8 text-golden" />
                                            <div className="text-left">
                                                <p className="font-medium">{selectedFile.name}</p>
                                                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                                            <p className="text-gray-500">Click để chọn file</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Hỗ trợ: .zip, .rar, .7z, .exe, .msi, .dmg, .pkg
                                            </p>
                                        </>
                                    )}
                                </div>

                                {isUploading && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Đang upload...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-golden h-2 rounded-full transition-all"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* URL Mode: External URL */}
                        {uploadMode === 'url' && (
                            <div className="space-y-3">
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        💡 <strong>Tip:</strong> Bạn có thể upload file lên GitHub Releases và dán URL ở đây để tiết kiệm dung lượng hosting.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">URL file</label>
                                    <Input
                                        value={fileUrl}
                                        onChange={(e) => setFileUrl(e.target.value)}
                                        placeholder="https://github.com/user/repo/releases/download/v1.0.0/file.zip"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Tên file</label>
                                        <Input
                                            value={fileName}
                                            onChange={(e) => setFileName(e.target.value)}
                                            placeholder="software-v1.0.0.zip"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Kích thước (bytes)</label>
                                        <Input
                                            type="number"
                                            value={fileSize}
                                            onChange={(e) => setFileSize(e.target.value)}
                                            placeholder="1048576"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Release Notes */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Ghi chú phát hành</label>
                            <textarea
                                value={releaseNotes}
                                onChange={(e) => setReleaseNotes(e.target.value)}
                                placeholder="Những thay đổi trong phiên bản này..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm resize-none"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                onClick={resetForm}
                                disabled={loading || isUploading}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleAddVersion}
                                disabled={
                                    loading ||
                                    isUploading ||
                                    !version ||
                                    (uploadMode === 'upload' && !selectedFile) ||
                                    (uploadMode === 'url' && !fileUrl)
                                }
                            >
                                {(loading || isUploading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Thêm phiên bản
                            </Button>
                        </div>
                    </div>
                )}

                {/* Versions List */}
                {versions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Chưa có phiên bản nào
                    </div>
                ) : (
                    <div className="space-y-3">
                        {versions.map((ver) => (
                            <div
                                key={ver.id}
                                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-golden/10 rounded-lg flex items-center justify-center">
                                        <Download className="w-5 h-5 text-golden" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{ver.version}</span>
                                            {ver.is_latest && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                                    <Check className="w-3 h-3" />
                                                    Mới nhất
                                                </span>
                                            )}
                                            {ver.file_url?.includes('github.com') && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full">
                                                    <ExternalLink className="w-3 h-3" />
                                                    GitHub
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {ver.file_name || 'Chưa có file'} • {formatFileSize(ver.file_size)}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {new Date(ver.released_at).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {ver.file_url && (
                                        <a
                                            href={ver.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                            title="Tải xuống"
                                        >
                                            <Download className="w-4 h-4 text-gray-500" />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleDeleteVersion(ver.id)}
                                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-500"
                                        title="Xóa"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
