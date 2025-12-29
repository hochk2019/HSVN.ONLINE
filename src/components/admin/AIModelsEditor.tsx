'use client';

import { useState, useEffect } from 'react';
import { Plus, X, GripVertical, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AIModelsEditorProps {
    value: string; // JSON string of model array
    onChange: (value: string) => void;
}

const DEFAULT_FREE_MODELS = [
    'google/gemma-2-9b-it:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
    'huggingfaceh4/zephyr-7b-beta:free',
    'openchat/openchat-7b:free',
    'nousresearch/nous-capybara-7b:free',
];

const SUGGESTED_MODELS = [
    { id: 'google/gemma-2-9b-it:free', name: 'Google Gemma 2 9B (Free)', quality: 'Best' },
    { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B (Free)', quality: 'Good' },
    { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)', quality: 'Good' },
    { id: 'qwen/qwen-2-7b-instruct:free', name: 'Qwen 2 7B (Free)', quality: 'Good' },
    { id: 'microsoft/phi-3-mini-128k-instruct:free', name: 'Phi-3 Mini (Free)', quality: 'Fast' },
    { id: 'huggingfaceh4/zephyr-7b-beta:free', name: 'Zephyr 7B (Free)', quality: 'Good' },
    { id: 'openchat/openchat-7b:free', name: 'OpenChat 7B (Free)', quality: 'Good' },
    { id: 'nousresearch/nous-capybara-7b:free', name: 'Nous Capybara 7B (Free)', quality: 'Good' },
];

export default function AIModelsEditor({ value, onChange }: AIModelsEditorProps) {
    const [models, setModels] = useState<string[]>([]);
    const [newModel, setNewModel] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Parse value on mount
    useEffect(() => {
        try {
            if (value) {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    setModels(parsed);
                    return;
                }
            }
        } catch {
            // Use defaults
        }
        setModels(DEFAULT_FREE_MODELS);
    }, []);

    // Update parent when models change
    useEffect(() => {
        onChange(JSON.stringify(models));
    }, [models, onChange]);

    const addModel = (modelId: string) => {
        const trimmed = modelId.trim();
        if (trimmed && !models.includes(trimmed)) {
            setModels([...models, trimmed]);
            setNewModel('');
            setShowSuggestions(false);
        }
    };

    const removeModel = (index: number) => {
        setModels(models.filter((_, i) => i !== index));
    };

    const moveModel = (from: number, to: number) => {
        if (to < 0 || to >= models.length) return;
        const newModels = [...models];
        const [moved] = newModels.splice(from, 1);
        newModels.splice(to, 0, moved);
        setModels(newModels);
    };

    const resetToDefaults = () => {
        setModels(DEFAULT_FREE_MODELS);
    };

    return (
        <div className="space-y-3">
            {/* Models list */}
            <div className="space-y-2">
                {models.map((model, index) => (
                    <div
                        key={model}
                        className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg group"
                    >
                        <div className="flex flex-col gap-0.5">
                            <button
                                type="button"
                                onClick={() => moveModel(index, index - 1)}
                                disabled={index === 0}
                                className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Di chuyển lên"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => moveModel(index, index + 1)}
                                disabled={index === models.length - 1}
                                className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Di chuyển xuống"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                        <span className="text-xs text-gray-400 w-5">{index + 1}</span>

                        <code className="flex-1 text-sm text-gray-700 dark:text-gray-300 font-mono truncate">
                            {model}
                        </code>

                        <button
                            type="button"
                            onClick={() => removeModel(index)}
                            className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Xóa model"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add new model */}
            <div className="relative">
                <div className="flex gap-2">
                    <Input
                        value={newModel}
                        onChange={(e) => setNewModel(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="provider/model-name:free"
                        className="font-mono text-sm"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addModel(newModel);
                            }
                        }}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addModel(newModel)}
                        disabled={!newModel.trim()}
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-500">Gợi ý models miễn phí:</p>
                        </div>
                        {SUGGESTED_MODELS.filter(s => !models.includes(s.id)).map(suggestion => (
                            <button
                                key={suggestion.id}
                                type="button"
                                onClick={() => addModel(suggestion.id)}
                                className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                            >
                                <div>
                                    <p className="text-sm font-medium">{suggestion.name}</p>
                                    <code className="text-xs text-gray-500">{suggestion.id}</code>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded ${suggestion.quality === 'Best'
                                        ? 'bg-green-100 text-green-700'
                                        : suggestion.quality === 'Fast'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {suggestion.quality}
                                </span>
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => setShowSuggestions(false)}
                            className="w-full p-2 text-center text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700"
                        >
                            Đóng
                        </button>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetToDefaults}
                    className="text-xs"
                >
                    Khôi phục mặc định
                </Button>
                <p className="text-xs text-gray-500">
                    {models.length} models
                </p>
            </div>
        </div>
    );
}
