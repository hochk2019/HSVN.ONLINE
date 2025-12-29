import { requireAdmin } from '@/lib/auth-actions';
import RAGManager from '@/components/admin/RAGManager';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'RAG Chatbot Manager',
};

export default async function RAGPage() {
    // Only admins allowed
    console.log('Rendering RAG Page on Server...');
    await requireAdmin();
    console.log('RAG Page: Admin Verified');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-heading text-2xl font-bold">RAG Chatbot Management</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Quản lý dữ liệu knowledge base cho Golden Copilot
                </p>
            </div>

            <RAGManager />
        </div>
    );
}
