'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, HelpCircle, Monitor, DollarSign, MessageCircle } from 'lucide-react';

interface ContactAIAnalyzerProps {
    message: string;
    subject?: string;
}

const intentConfig = {
    support: {
        label: 'Hỗ trợ kỹ thuật',
        icon: HelpCircle,
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    },
    demo: {
        label: 'Yêu cầu demo',
        icon: Monitor,
        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    },
    quote: {
        label: 'Hỏi báo giá',
        icon: DollarSign,
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    },
    general: {
        label: 'Chung',
        icon: MessageCircle,
        color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    },
};

export default function ContactAIAnalyzer({ message, subject }: ContactAIAnalyzerProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        intent: keyof typeof intentConfig;
        confidence: number;
        suggestedResponse: string;
    } | null>(null);
    const [error, setError] = useState('');

    const analyzeIntent = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/ai/contact-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, subject }),
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error);
            } else {
                setResult({
                    intent: data.intent || 'general',
                    confidence: data.confidence || 0.5,
                    suggestedResponse: data.suggestedResponse || '',
                });
            }
        } catch {
            setError('Không thể phân tích tin nhắn');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-purple-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs">Đang phân tích...</span>
            </div>
        );
    }

    if (result) {
        const config = intentConfig[result.intent];
        const Icon = config.icon;

        return (
            <div className="space-y-2">
                {/* Intent Badge */}
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
                        <Icon className="w-3 h-3" />
                        {config.label}
                    </span>
                    <span className="text-xs text-gray-400">
                        {Math.round(result.confidence * 100)}%
                    </span>
                </div>

                {/* Suggested Response */}
                {result.suggestedResponse && (
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Gợi ý:</span>{' '}
                        {result.suggestedResponse}
                        <button
                            onClick={() => navigator.clipboard.writeText(result.suggestedResponse)}
                            className="ml-2 text-purple-600 hover:underline"
                        >
                            Copy
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (error) {
        return <span className="text-xs text-red-500">{error}</span>;
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={analyzeIntent}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            title="Phân tích AI"
        >
            <Sparkles className="w-4 h-4 mr-1" />
            <span className="text-xs">Phân tích</span>
        </Button>
    );
}
