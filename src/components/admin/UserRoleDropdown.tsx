'use client';

import { useState } from 'react';
import { updateUserRole } from '@/lib/user-actions';
import { Check, ChevronDown, Shield, User } from 'lucide-react';

interface UserRoleDropdownProps {
    userId: string;
    currentRole: string;
    currentUserId: string;
    disabled?: boolean;
}

const roles = [
    { value: 'admin', label: 'Admin', icon: Shield, color: 'text-red-600' },
    { value: 'editor', label: 'Biên tập viên', icon: User, color: 'text-blue-600' },
];

export default function UserRoleDropdown({ userId, currentRole, currentUserId, disabled }: UserRoleDropdownProps) {
    const [open, setOpen] = useState(false);
    const [role, setRole] = useState(currentRole);
    const [loading, setLoading] = useState(false);

    const isOwnAccount = userId === currentUserId;

    const handleRoleChange = async (newRole: 'admin' | 'editor') => {
        if (newRole === role || isOwnAccount) return;

        setLoading(true);
        const result = await updateUserRole(userId, newRole);

        if (result.success) {
            setRole(newRole);
        } else {
            alert(result.error || 'Lỗi khi thay đổi vai trò');
        }

        setLoading(false);
        setOpen(false);
    };

    const currentRoleData = roles.find(r => r.value === role) || roles[1];
    const Icon = currentRoleData.icon;

    if (disabled || isOwnAccount) {
        return (
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Icon className={`w-4 h-4 ${currentRoleData.color}`} />
                <span>{currentRoleData.label}</span>
                {isOwnAccount && <span className="text-xs text-gray-400">(bạn)</span>}
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
                <Icon className={`w-4 h-4 ${currentRoleData.color}`} />
                <span className="text-sm">{currentRoleData.label}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                    {roles.map((r) => {
                        const RoleIcon = r.icon;
                        const isActive = r.value === role;
                        return (
                            <button
                                key={r.value}
                                onClick={() => handleRoleChange(r.value as 'admin' | 'editor')}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                            >
                                <RoleIcon className={`w-4 h-4 ${r.color}`} />
                                <span>{r.label}</span>
                                {isActive && <Check className="w-4 h-4 ml-auto text-green-500" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
