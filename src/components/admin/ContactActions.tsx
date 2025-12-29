'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Eye, CheckCircle, Archive, Loader2 } from 'lucide-react';
import { updateContactStatus, deleteContact, ContactStatus } from '@/lib/admin-contact-actions';

interface ContactActionsProps {
    contactId: string;
    currentStatus: ContactStatus;
}

export default function ContactActions({ contactId, currentStatus }: ContactActionsProps) {
    const [isLoading, setIsLoading] = useState(false);

    async function handleStatusChange(status: ContactStatus) {
        setIsLoading(true);
        await updateContactStatus(contactId, status);
        setIsLoading(false);
    }

    async function handleDelete() {
        if (!confirm('Bạn có chắc muốn xóa tin nhắn này?')) return;

        setIsLoading(true);
        await deleteContact(contactId);
        setIsLoading(false);
    }

    if (isLoading) {
        return <Loader2 className="w-4 h-4 animate-spin" />;
    }

    return (
        <div className="flex items-center gap-1">
            {currentStatus === 'new' && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusChange('read')}
                    title="Đánh dấu đã đọc"
                >
                    <Eye className="w-4 h-4 text-blue-500" />
                </Button>
            )}

            {(currentStatus === 'new' || currentStatus === 'read') && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusChange('replied')}
                    title="Đánh dấu đã trả lời"
                >
                    <CheckCircle className="w-4 h-4 text-green-500" />
                </Button>
            )}

            {currentStatus !== 'archived' && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusChange('archived')}
                    title="Lưu trữ"
                >
                    <Archive className="w-4 h-4 text-gray-500" />
                </Button>
            )}

            <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                title="Xóa"
            >
                <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
        </div>
    );
}
