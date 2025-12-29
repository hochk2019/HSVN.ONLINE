'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, UserPlus, Mail, Shield, User, Loader2 } from 'lucide-react';
import { inviteUser } from '@/lib/user-actions';

interface InviteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InviteUserModal({ isOpen, onClose }: InviteUserModalProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'admin' | 'editor'>('editor');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await inviteUser(email, role);

            if (result.error) {
                setError(result.error);
            } else {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    setEmail('');
                    setRole('editor');
                    router.refresh();
                }, 2000);
            }
        } catch (err) {
            setError('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-golden/10 rounded-lg flex items-center justify-center">
                            <UserPlus className="w-5 h-5 text-golden" />
                        </div>
                        <h2 className="font-heading text-xl font-bold">Thêm người dùng</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {success ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserPlus className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="font-medium text-lg mb-2">Đã gửi lời mời!</h3>
                        <p className="text-gray-500 text-sm">
                            Người dùng sẽ nhận được email để tạo tài khoản.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Vai trò
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('editor')}
                                    className={`p-4 rounded-lg border-2 transition-all ${role === 'editor'
                                            ? 'border-golden bg-golden/5'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-golden/50'
                                        }`}
                                >
                                    <User className={`w-6 h-6 mx-auto mb-2 ${role === 'editor' ? 'text-golden' : 'text-gray-400'}`} />
                                    <div className="font-medium text-sm">Biên tập viên</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Quản lý bài viết, media
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('admin')}
                                    className={`p-4 rounded-lg border-2 transition-all ${role === 'admin'
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-red-300'
                                        }`}
                                >
                                    <Shield className={`w-6 h-6 mx-auto mb-2 ${role === 'admin' ? 'text-red-600' : 'text-gray-400'}`} />
                                    <div className="font-medium text-sm">Quản trị viên</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Toàn quyền hệ thống
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-300">
                            <strong>Lưu ý:</strong> Người dùng sẽ nhận email mời và tự tạo mật khẩu.
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg p-3 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || !email}
                                className="flex-1"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Gửi lời mời
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
