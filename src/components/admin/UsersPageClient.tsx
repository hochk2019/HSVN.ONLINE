'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Shield, UserPlus, User, Mail, Calendar } from 'lucide-react';
import InviteUserModal from './InviteUserModal';
import UserRoleDropdown from './UserRoleDropdown';
import type { Profile } from '@/types/database.types';

const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    editor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const roleLabels: Record<string, string> = {
    admin: 'Admin',
    editor: 'Biên tập viên',
    viewer: 'Xem',
};

interface UsersPageClientProps {
    users: Profile[];
    currentUserId: string;
    isAdmin: boolean;
}

export default function UsersPageClient({ users, currentUserId, isAdmin }: UsersPageClientProps) {
    const [inviteModalOpen, setInviteModalOpen] = useState(false);

    const admins = users.filter((u) => u.role === 'admin').length;
    const editors = users.filter((u) => u.role === 'editor').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-bold">Người dùng</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Quản lý tài khoản và phân quyền
                    </p>
                </div>
                {isAdmin && (
                    <Button onClick={() => setInviteModalOpen(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Thêm người dùng
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-golden/20 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-golden" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{users.length}</div>
                            <div className="text-sm text-gray-500">Tổng người dùng</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{admins}</div>
                            <div className="text-sm text-gray-500">Quản trị viên</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{editors}</div>
                            <div className="text-sm text-gray-500">Biên tập viên</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Users List */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách người dùng</CardTitle>
                </CardHeader>
                <CardContent>
                    {users.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Chưa có người dùng nào</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Người dùng</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Vai trò</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Ngày tạo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-golden/10 rounded-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-golden" />
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">{user.full_name || 'Chưa đặt tên'}</span>
                                                        {user.id === currentUserId && (
                                                            <span className="ml-2 text-xs text-golden">(bạn)</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Mail className="w-4 h-4" />
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                {isAdmin ? (
                                                    <UserRoleDropdown
                                                        userId={user.id}
                                                        currentRole={user.role || 'editor'}
                                                        currentUserId={currentUserId}
                                                    />
                                                ) : (
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${roleColors[user.role || 'viewer']}`}>
                                                        {roleLabels[user.role || 'viewer'] || user.role}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : ''}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Role Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Mô tả vai trò</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-5 h-5 text-red-600" />
                                <span className="font-medium">Quản trị viên (Admin)</span>
                            </div>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• Toàn quyền quản lý hệ thống</li>
                                <li>• Quản lý người dùng và phân quyền</li>
                                <li>• Thay đổi cài đặt website</li>
                                <li>• Xem audit log</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <User className="w-5 h-5 text-blue-600" />
                                <span className="font-medium">Biên tập viên (Editor)</span>
                            </div>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• Quản lý bài viết (CRUD)</li>
                                <li>• Quản lý phần mềm</li>
                                <li>• Upload media</li>
                                <li>• Không truy cập được Settings</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Invite Modal */}
            <InviteUserModal
                isOpen={inviteModalOpen}
                onClose={() => setInviteModalOpen(false)}
            />
        </div>
    );
}
