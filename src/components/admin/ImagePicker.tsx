'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ImageIcon, X, Upload } from 'lucide-react';

interface MediaFile {
    name: string;
    id: string;
    url?: string;
}

interface ImagePickerProps {
    value: string;
    onChange: (url: string) => void;
    mediaFiles: MediaFile[];
}

export default function ImagePicker({ value, onChange, mediaFiles }: ImagePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Filter only image files
    const imageFiles = mediaFiles.filter(file =>
        /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name)
    );

    const handleSelect = (url: string) => {
        onChange(url);
        setIsOpen(false);
    };

    const handleRemove = () => {
        onChange('');
    };

    return (
        <div className="space-y-3">
            {/* Current Image Preview */}
            {value ? (
                <div className="relative group">
                    <div className="relative w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center" style={{ minHeight: '150px', maxHeight: '300px' }}>
                        <Image
                            src={value}
                            alt="Featured image"
                            width={400}
                            height={300}
                            className="max-w-full max-h-[300px] w-auto h-auto object-contain"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => setIsOpen(true)}
                    className="aspect-video rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-golden transition-colors"
                >
                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Chọn ảnh đại diện</span>
                </div>
            )}

            {/* Select Button */}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="w-full"
            >
                <Upload className="w-4 h-4 mr-2" />
                {value ? 'Đổi ảnh' : 'Chọn từ thư viện'}
            </Button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-lg">Chọn ảnh từ thư viện</h3>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="p-4 overflow-y-auto max-h-[60vh]">
                            {imageFiles.length > 0 ? (
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                    {imageFiles.map((file) => (
                                        <button
                                            key={file.id}
                                            type="button"
                                            onClick={() => file.url && handleSelect(file.url)}
                                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${value === file.url
                                                ? 'border-golden ring-2 ring-golden/30'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-golden'
                                                }`}
                                        >
                                            {file.url && (
                                                <Image
                                                    src={file.url}
                                                    alt={file.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Chưa có ảnh nào trong thư viện</p>
                                    <p className="text-sm mt-1">
                                        Vui lòng upload ảnh tại <a href="/admin/media" className="text-golden hover:underline">Quản lý media</a>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
