import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, User, FileText, Settings, LogIn, Edit, Trash2, Plus, LucideIcon } from 'lucide-react';
import type { AuditLog } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Nhật ký hệ thống',
};

interface AuditLogWithUser extends AuditLog {
    user: { id: string; full_name: string | null; email: string | null } | null;
}

async function getAuditLogs(): Promise<{ logs: AuditLogWithUser[]; error: string | null }> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
        .from('audit_logs')
        .select(`
            *,
            user:profiles(id, full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) return { logs: [], error: error.message };
    return { logs: (data as unknown as AuditLogWithUser[]) || [], error: null };
}

const actionIcons: Record<string, LucideIcon> = {
    login: LogIn,
    create: Plus,
    update: Edit,
    delete: Trash2,
};

const actionColors: Record<string, string> = {
    login: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
    create: 'bg-green-100 text-green-600 dark:bg-green-900/30',
    update: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30',
    delete: 'bg-red-100 text-red-600 dark:bg-red-900/30',
};

export default async function AuditLogPage() {
    const { logs } = await getAuditLogs();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-heading text-2xl font-bold">Nhật ký hệ thống</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Theo dõi các hoạt động trong hệ thống
                </p>
            </div>

            {/* Logs List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Hoạt động gần đây ({logs.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {logs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Chưa có hoạt động nào được ghi lại</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {logs.map((log) => {
                                const Icon = actionIcons[log.action] || Activity;
                                const colorClass = actionColors[log.action] || 'bg-gray-100 text-gray-600';

                                return (
                                    <div
                                        key={log.id}
                                        className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {log.user?.full_name || log.user?.email || 'System'}
                                                </span>
                                                <span className="text-gray-500">
                                                    {log.action} {log.entity_type}
                                                </span>
                                            </div>
                                            {log.entity_id && (
                                                <p className="text-sm text-gray-500 truncate">
                                                    ID: {log.entity_id}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1">
                                                {log.created_at ? new Date(log.created_at).toLocaleString('vi-VN') : ''}
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
