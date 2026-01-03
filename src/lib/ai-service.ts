// Server-side only - AI Service for OpenAI-compatible APIs

import { createClient } from '@supabase/supabase-js';

/**
 * AI Service - OpenAI-compatible API with Auto-Fallback
 * Supports: OpenRouter, OpenAI, Azure, or any OpenAI-compatible endpoint
 * 
 * Features:
 * - Auto-fallback to next free model when primary fails
 * - Dynamic model configuration from admin settings
 * - Rate limit handling
 * - Empty response detection
 * 
 * Environment variables:
 * - AI_API_KEY: API key for the provider
 * - AI_BASE_URL: Base URL (default: https://openrouter.ai/api/v1)
 * - AI_MODEL: Primary model to use
 */

// Default configuration
const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';

// Default free models on OpenRouter (used if no settings configured)
// Source: https://openrouter.ai/models?max_price=0
const DEFAULT_FREE_MODELS = [
    'google/gemma-2-9b-it:free',           // Best quality free model
    'meta-llama/llama-3.2-3b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
    'huggingfaceh4/zephyr-7b-beta:free',
    'openchat/openchat-7b:free',
    'nousresearch/nous-capybara-7b:free',
];

const DEFAULT_MODEL = DEFAULT_FREE_MODELS[0];

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface ChatCompletionOptions {
    messages: ChatMessage[];
    model?: string;
    temperature?: number;
    max_tokens?: number;
    skipFallback?: boolean; // Skip fallback for specific calls
}

interface ChatCompletionResponse {
    content: string;
    error: string | null;
    modelUsed?: string; // Track which model was used
}

// Cache for settings to avoid repeated DB calls
let settingsCache: {
    models: string[];
    baseUrl: string;
    primaryModel: string;
    apiKey?: string;
    profileName?: string;
    timestamp: number;
    companyInfo?: {
        name: string;
        phone: string;
        email: string;
    };
} | null = null;
const CACHE_TTL = 5000; // 5 seconds

interface AIProfile {
    id: string;
    name: string;
    baseUrl: string;
    apiKey: string;
    model: string;
}

// Get AI configuration from database settings or environment
async function getAIConfig(): Promise<{
    apiKey: string | undefined;
    baseUrl: string;
    model: string;
    fallbackModels: string[];
    profileName?: string;
    companyInfo: {
        name: string;
        phone: string;
        email: string;
    };
}> {
    const envApiKey = process.env.AI_API_KEY || process.env.OPENROUTER_API_KEY;

    // Check cache first
    if (settingsCache && (Date.now() - settingsCache.timestamp < CACHE_TTL)) {
        return {
            apiKey: settingsCache.apiKey || envApiKey,
            baseUrl: settingsCache.baseUrl,
            model: settingsCache.primaryModel,
            fallbackModels: settingsCache.models,
            profileName: settingsCache.profileName,
            companyInfo: settingsCache.companyInfo || { name: 'Golden Logistics', phone: '', email: '' }
        };
    }

    // Try to read from database
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey);

            const { data } = await supabase
                .from('settings')
                .select('key, value')
                .in('key', [
                    'ai_base_url', 'ai_model', 'ai_fallback_models',
                    'ai_profiles', 'ai_active_profile_id',
                    'company_name', 'contact_phone', 'contact_email'
                ]);

            if (data && data.length > 0) {
                const settings: Record<string, string> = {};
                data.forEach((s: { key: string; value: unknown }) => {
                    settings[s.key] = String(s.value);
                });

                let baseUrl = settings.ai_base_url || process.env.AI_BASE_URL || DEFAULT_BASE_URL;
                let primaryModel = settings.ai_model || process.env.AI_MODEL || DEFAULT_MODEL;
                let activeApiKey = envApiKey;
                let profileName = 'Legacy Settings';

                // Check for Active Profile
                if (settings.ai_active_profile_id && settings.ai_profiles) {
                    try {
                        const profiles: AIProfile[] = JSON.parse(settings.ai_profiles);
                        const activeProfile = profiles.find(p => p.id === settings.ai_active_profile_id);

                        if (activeProfile) {
                            baseUrl = activeProfile.baseUrl || baseUrl;
                            primaryModel = activeProfile.model || primaryModel;
                            // If profile has API Key, use it. Otherwise fallback to ENV
                            if (activeProfile.apiKey && activeProfile.apiKey.trim()) {
                                activeApiKey = activeProfile.apiKey;
                            }
                            profileName = activeProfile.name;
                            console.log(`[AI Config] Using Profile: ${activeProfile.name}`);
                        }
                    } catch (e) {
                        console.error('[AI Config] Failed to parse profiles:', e);
                    }
                }

                // Parse fallbacks
                let fallbackModels = DEFAULT_FREE_MODELS;
                if (settings.ai_fallback_models) {
                    try {
                        const parsed = JSON.parse(settings.ai_fallback_models);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            fallbackModels = parsed;
                        }
                    } catch {
                        // Use defaults
                    }
                }

                const companyInfo = {
                    name: settings.company_name || 'Golden Logistics',
                    phone: settings.contact_phone || '1900-xxx-xxx',
                    email: settings.contact_email || 'contact@hsvn.online'
                };

                // Update cache
                settingsCache = {
                    baseUrl,
                    primaryModel,
                    apiKey: activeApiKey,
                    models: fallbackModels,
                    profileName,
                    companyInfo,
                    timestamp: Date.now()
                };

                return {
                    apiKey: activeApiKey,
                    baseUrl,
                    model: primaryModel,

                    fallbackModels,
                    profileName,
                    companyInfo
                };
            }
        }
    } catch (error) {
        console.warn('[AI Config] Failed to load from DB, using defaults:', error);
    }

    // Fallback to environment variables
    return {
        apiKey: envApiKey,
        baseUrl: process.env.AI_BASE_URL || DEFAULT_BASE_URL,
        model: process.env.AI_MODEL || DEFAULT_MODEL,

        fallbackModels: DEFAULT_FREE_MODELS,
        companyInfo: { name: 'Golden Logistics', phone: '1900-xxx-xxx', email: 'contact@hsvn.online' }
    };
}

/**
 * Strip thinking tags from AI response
 * Some AI models (like DeepSeek, Claude) include <think>...</think> tags
 * with their internal reasoning. We need to remove these from the final output.
 */
function stripThinkingTags(content: string): string {
    // Remove <think>...</think> blocks (including newlines inside)
    let result = content.replace(/<think>[\s\S]*?<\/think>/gi, '');

    // Also handle unclosed think tags (if AI was cut off)
    result = result.replace(/<think>[\s\S]*/gi, '');

    // Clean up any leftover whitespace at start
    result = result.trim();

    return result;
}

/**
 * Call a single model API
 */
async function callSingleModel(
    baseUrl: string,
    apiKey: string,
    model: string,
    messages: ChatMessage[],
    temperature: number,
    max_tokens: number
): Promise<{ content: string; error: string | null }> {
    try {
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const response = await fetch(`${cleanBaseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
                'X-Title': 'Golden Logistics CMS',
            },
            body: JSON.stringify({
                model,
                messages,
                temperature,
                max_tokens,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.warn(`[AI] Model ${model} error:`, response.status, errorText.substring(0, 100));
            return { content: '', error: `${response.status} - ${errorText}` };
        }

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content || '';

        if (!content) {
            console.warn(`[AI] Model ${model} returned empty content`);
            return { content: '', error: 'Response content is empty. Details: ' + JSON.stringify(data) };
        }

        // Strip thinking tags from response
        content = stripThinkingTags(content);

        if (!content) {
            console.warn(`[AI] Model ${model} content empty after stripping think tags`);
            return { content: '', error: 'Response only contained thinking, no actual content' };
        }

        return { content, error: null };
    } catch (error: any) {
        console.error(`[AI] Model ${model} fetch error:`, error);
        return { content: '', error: `Network error: ${error.message}` };
    }
}

/**
 * Test AI Connection
 */
export async function testAIConnection(baseUrl: string, apiKey: string, model: string): Promise<{ success: boolean; message: string }> {
    try {
        const result = await callSingleModel(
            baseUrl,
            apiKey,
            model,
            [{ role: 'user', content: 'Ping' } as ChatMessage],
            0.7,
            100
        );

        if (result.error) {
            return { success: false, message: result.error };
        }

        return { success: true, message: 'Connection successful! Response: ' + result.content };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

/**
 * Call OpenAI-compatible chat completion API with auto-fallback
 * Tries multiple free models if primary fails
 */
export async function chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    const config = await getAIConfig();

    if (!config.apiKey) {
        return {
            content: '',
            error: 'AI API key chưa được cấu hình. Vui lòng thêm AI_API_KEY hoặc OPENROUTER_API_KEY vào environment variables.'
        };
    }

    const temperature = options.temperature ?? 0.7;
    const max_tokens = options.max_tokens ?? 1000;

    // Build list of models to try
    const modelsToTry: string[] = [];

    // Add specified model first (if provided and not in free list)
    if (options.model) {
        modelsToTry.push(options.model);
    }

    // Add configured model
    if (config.model && !modelsToTry.includes(config.model)) {
        modelsToTry.push(config.model);
    }

    // Add free models for fallback (unless skipFallback is true)
    if (!options.skipFallback) {
        for (const freeModel of config.fallbackModels) {
            if (!modelsToTry.includes(freeModel)) {
                modelsToTry.push(freeModel);
            }
        }
    }

    console.log('[AI] Will try models:', modelsToTry.slice(0, 3).join(', '), '...');

    const errors: string[] = [];

    // Try each model until one succeeds
    for (const model of modelsToTry) {
        console.log(`[AI] Trying model: ${model}`);

        const result = await callSingleModel(
            config.baseUrl,
            config.apiKey,
            model,
            options.messages,
            temperature,
            max_tokens
        );

        if (result.content) {
            console.log(`[AI] Success with model: ${model}`);
            return {
                content: result.content,
                error: null,
                modelUsed: model
            };
        }

        // Log and continue to next model
        console.log(`[AI] Model ${model} failed, trying next...`);
        errors.push(`[${model}]: ${result.error}`);
    }

    // All models failed
    console.error('[AI] All models failed');
    return {
        content: '',
        error: `Tất cả AI models đều không phản hồi.
Cấu hình hiện tại:
- Model: ${config.model}
- URL: ${config.baseUrl}

Chi tiết lỗi:\n${errors.join('\n')}`,
        modelUsed: undefined
    };
}

/**
 * Generate excerpt from content
 */
export async function generateExcerpt(content: string, title: string): Promise<ChatCompletionResponse> {
    const messages: ChatMessage[] = [
        {
            role: 'system',
            content: 'Bạn là trợ lý viết nội dung chuyên nghiệp. Viết tóm tắt ngắn gọn bằng tiếng Việt, tối đa 160 ký tự, thu hút người đọc. Chỉ trả về văn bản tóm tắt, không có giải thích.'
        },
        {
            role: 'user',
            content: `Tiêu đề: ${title}\n\nNội dung:\n${content.substring(0, 2000)}\n\nViết đoạn tóm tắt SEO-friendly:`
        }
    ];

    return chatCompletion({ messages, max_tokens: 500 });
}

/**
 * Generate meta description for SEO
 */
export async function generateMetaDescription(content: string, title: string): Promise<ChatCompletionResponse> {
    const messages: ChatMessage[] = [
        {
            role: 'system',
            content: 'Bạn là chuyên gia SEO. Viết meta description tối ưu bằng tiếng Việt, 120-155 ký tự, có từ khóa chính, kêu gọi hành động. Chỉ trả về meta description.'
        },
        {
            role: 'user',
            content: `Tiêu đề: ${title}\n\nNội dung:\n${content.substring(0, 1500)}\n\nMeta description:`
        }
    ];

    return chatCompletion({ messages, max_tokens: 500 });
}

/**
 * Generate content outline
 */
export async function generateOutline(topic: string, keywords?: string): Promise<ChatCompletionResponse> {
    const messages: ChatMessage[] = [
        {
            role: 'system',
            content: 'Bạn là biên tập viên chuyên về logistics và hải quan. Tạo dàn ý bài viết chi tiết bằng tiếng Việt với các heading H2, H3.'
        },
        {
            role: 'user',
            content: `Tạo dàn ý cho bài viết về: ${topic}${keywords ? `\nTừ khóa cần đề cập: ${keywords}` : ''}`
        }
    ];

    return chatCompletion({ messages, max_tokens: 2000 });
}

/**
 * Suggest title improvements
 */
export async function suggestTitle(currentTitle: string, content?: string): Promise<ChatCompletionResponse> {
    const messages: ChatMessage[] = [
        {
            role: 'system',
            content: 'Bạn là chuyên gia copywriting. Đề xuất 3 tiêu đề hấp dẫn, SEO-friendly bằng tiếng Việt. Mỗi tiêu đề một dòng, đánh số 1-3.'
        },
        {
            role: 'user',
            content: `Tiêu đề hiện tại: ${currentTitle}${content ? `\n\nNội dung:\n${content.substring(0, 1000)}` : ''}\n\nĐề xuất 3 tiêu đề tốt hơn:`
        }
    ];

    return chatCompletion({ messages, max_tokens: 500 });
}

/**
 * Analyze contact form intent
 */
export async function analyzeContactIntent(message: string): Promise<{
    intent: 'support' | 'demo' | 'quote' | 'general';
    confidence: number;
    suggestedResponse: string;
    error: string | null;
}> {
    const messages: ChatMessage[] = [
        {
            role: 'system',
            content: `Phân tích intent của tin nhắn khách hàng. Trả về JSON với format:
{"intent": "support|demo|quote|general", "confidence": 0.0-1.0, "suggestedResponse": "câu trả lời mẫu"}
- support: yêu cầu hỗ trợ kỹ thuật
- demo: muốn xem demo phần mềm
- quote: hỏi báo giá
- general: câu hỏi chung`
        },
        {
            role: 'user',
            content: message
        }
    ];

    const result = await chatCompletion({ messages, max_tokens: 300 });

    if (result.error) {
        return { intent: 'general', confidence: 0, suggestedResponse: '', error: result.error };
    }

    try {
        // Extract JSON from response
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                intent: parsed.intent || 'general',
                confidence: parsed.confidence || 0.5,
                suggestedResponse: parsed.suggestedResponse || '',
                error: null
            };
        }
    } catch {
        // Parse error, return default
    }

    return { intent: 'general', confidence: 0.5, suggestedResponse: '', error: null };
}

/**
 * Expand a section of text
 */
export async function expandContent(text: string, context?: string): Promise<ChatCompletionResponse> {
    const messages: ChatMessage[] = [
        {
            role: 'system',
            content: 'Bạn là biên tập viên. Mở rộng đoạn văn thành nội dung chi tiết hơn, giữ nguyên ý chính. Viết bằng tiếng Việt.'
        },
        {
            role: 'user',
            content: `${context ? `Ngữ cảnh: ${context}\n\n` : ''}Mở rộng đoạn sau:\n${text}`
        }
    ];

    return chatCompletion({ messages, max_tokens: 800 });
}

/**
 * Generate alt text for an image based on context
 */
export async function generateAltText(
    imageUrl: string,
    context?: { title?: string; content?: string }
): Promise<ChatCompletionResponse> {
    const messages: ChatMessage[] = [
        {
            role: 'system',
            content: 'Bạn là chuyên gia SEO và accessibility. Tạo alt text cho ảnh bằng tiếng Việt, mô tả ngắn gọn và có ý nghĩa (50-100 ký tự). Chỉ trả về alt text, không giải thích.'
        },
        {
            role: 'user',
            content: `Tạo alt text cho ảnh${context?.title ? ` trong bài viết: "${context.title}"` : ''}${context?.content ? `\n\nNội dung liên quan:\n${context.content.substring(0, 500)}` : ''}\n\nURL ảnh: ${imageUrl}\n\nAlt text:`
        }
    ];

    return chatCompletion({ messages, max_tokens: 100 });
}

/**
 * Find related content based on title/content similarity
 */
export async function findRelatedContent(
    currentTitle: string,
    currentContent: string,
    availablePosts: Array<{ id: string; title: string; excerpt?: string }>
): Promise<{
    relatedIds: string[];
    error: string | null;
}> {
    if (availablePosts.length === 0) {
        return { relatedIds: [], error: null };
    }

    const postList = availablePosts
        .slice(0, 20) // Limit to first 20 for context length
        .map((p, i) => `${i + 1}. [${p.id}] ${p.title}`)
        .join('\n');

    const messages: ChatMessage[] = [
        {
            role: 'system',
            content: `Bạn là hệ thống gợi ý nội dung. Từ danh sách bài viết, chọn 3-5 bài liên quan nhất đến bài hiện tại.
Trả về JSON format: {"ids": ["id1", "id2", "id3"]}
Chỉ trả về JSON, không giải thích.`
        },
        {
            role: 'user',
            content: `Bài viết hiện tại:
Tiêu đề: ${currentTitle}
Nội dung: ${currentContent.substring(0, 500)}

Danh sách bài viết có sẵn:
${postList}

Chọn các bài liên quan nhất:`
        }
    ];

    const result = await chatCompletion({ messages, max_tokens: 200 });

    if (result.error) {
        return { relatedIds: [], error: result.error };
    }

    try {
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return { relatedIds: parsed.ids || [], error: null };
        }
    } catch {
        // Parse error
    }

    return { relatedIds: [], error: null };
}

/**
 * Improve/rewrite content with AI
 */
export async function improveContent(
    text: string,
    style: 'professional' | 'friendly' | 'concise' = 'professional'
): Promise<ChatCompletionResponse> {
    const stylePrompts = {
        professional: 'chuyên nghiệp, trang trọng',
        friendly: 'thân thiện, dễ hiểu',
        concise: 'ngắn gọn, súc tích'
    };

    const messages: ChatMessage[] = [
        {
            role: 'system',
            content: `Bạn là biên tập viên chuyên nghiệp. Viết lại nội dung theo phong cách ${stylePrompts[style]}. Giữ nguyên ý chính, cải thiện văn phong. Viết bằng tiếng Việt.`
        },
        {
            role: 'user',
            content: `Viết lại đoạn sau:\n\n${text}`
        }
    ];

    return chatCompletion({ messages, max_tokens: 1000 });
}

/**
 * SEO Checker - Check title and content for SEO best practices
 */
export interface SEOCheckResult {
    score: number; // 0-100
    warnings: Array<{
        type: 'error' | 'warning' | 'info';
        field: string;
        message: string;
    }>;
    suggestions: string[];
}

export function checkSEO(params: {
    title?: string;
    metaDescription?: string;
    content?: string;
    excerpt?: string;
}): SEOCheckResult {
    const warnings: SEOCheckResult['warnings'] = [];
    const suggestions: string[] = [];
    let score = 100;

    const { title, metaDescription, content, excerpt } = params;

    // Title checks
    if (title) {
        const titleLength = title.length;
        if (titleLength < 30) {
            warnings.push({
                type: 'warning',
                field: 'title',
                message: `Tiêu đề quá ngắn (${titleLength} ký tự). Nên từ 30-60 ký tự.`
            });
            score -= 15;
            suggestions.push('Mở rộng tiêu đề để bao gồm từ khóa và thu hút hơn');
        } else if (titleLength > 60) {
            warnings.push({
                type: 'error',
                field: 'title',
                message: `Tiêu đề quá dài (${titleLength} ký tự). Nên tối đa 60 ký tự để hiển thị tốt trên Google.`
            });
            score -= 20;
            suggestions.push('Rút gọn tiêu đề, giữ lại từ khóa chính');
        }

        // Check for common SEO issues
        if (!/[0-9]/.test(title) && !/hướng dẫn|cách|mẹo|top/i.test(title)) {
            suggestions.push('Cân nhắc thêm số hoặc từ power words (Hướng dẫn, Top, Cách...)');
        }
    } else {
        warnings.push({
            type: 'error',
            field: 'title',
            message: 'Chưa có tiêu đề'
        });
        score -= 30;
    }

    // Meta description checks
    if (metaDescription) {
        const metaLength = metaDescription.length;
        if (metaLength < 120) {
            warnings.push({
                type: 'warning',
                field: 'meta_description',
                message: `Meta description ngắn (${metaLength} ký tự). Nên từ 120-160 ký tự.`
            });
            score -= 10;
        } else if (metaLength > 160) {
            warnings.push({
                type: 'error',
                field: 'meta_description',
                message: `Meta description quá dài (${metaLength} ký tự). Sẽ bị cắt trên Google.`
            });
            score -= 15;
        }
    } else {
        warnings.push({
            type: 'warning',
            field: 'meta_description',
            message: 'Chưa có meta description. Google có thể tự động tạo.'
        });
        score -= 10;
        suggestions.push('Thêm meta description để kiểm soát nội dung hiển thị trên Google');
    }

    // Content checks
    if (content) {
        const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
        if (wordCount < 300) {
            warnings.push({
                type: 'warning',
                field: 'content',
                message: `Nội dung ngắn (${wordCount} từ). Bài dài >1000 từ thường xếp hạng tốt hơn.`
            });
            score -= 10;
        }
    }

    // Excerpt checks
    if (!excerpt) {
        warnings.push({
            type: 'info',
            field: 'excerpt',
            message: 'Chưa có excerpt. Nên thêm để hiển thị tốt hơn.'
        });
        score -= 5;
    }

    return {
        score: Math.max(0, score),
        warnings,
        suggestions
    };
}

/**
 * AI Category Recommendation - Analyze content to suggest best category
 */
export async function recommendCategory(
    title: string,
    content: string,
    categories: Array<{ id: string; name: string; slug: string; description?: string | null }>
): Promise<{
    recommendedId: string | null;
    confidence: number;
    reason: string;
    error: string | null;
}> {
    if (categories.length === 0) {
        return { recommendedId: null, confidence: 0, reason: '', error: 'Không có danh mục nào' };
    }

    const categoryList = categories
        .map(c => `- ${c.name} (ID: ${c.id})${c.description ? `: ${c.description}` : ''}`)
        .join('\n');

    const messages: ChatMessage[] = [
        {
            role: 'system',
            content: `Bạn là hệ thống phân loại nội dung. Phân tích tiêu đề và nội dung bài viết để gợi ý danh mục phù hợp nhất.
Trả về JSON: {"categoryId": "id", "confidence": 0.0-1.0, "reason": "lý do ngắn gọn"}
Chỉ trả về JSON, không giải thích thêm.`
        },
        {
            role: 'user',
            content: `Tiêu đề: ${title}

Nội dung: ${content.substring(0, 1500)}

Danh sách danh mục:
${categoryList}

Chọn danh mục phù hợp nhất:`
        }
    ];

    const result = await chatCompletion({ messages, max_tokens: 500 });

    if (result.error) {
        return { recommendedId: null, confidence: 0, reason: '', error: result.error };
    }

    try {
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                recommendedId: parsed.categoryId || null,
                confidence: parsed.confidence || 0.5,
                reason: parsed.reason || '',
                error: null
            };
        }
    } catch {
        // Parse error
    }

    return { recommendedId: null, confidence: 0, reason: '', error: 'Không thể phân tích kết quả' };
}

/**
 * AI Tag Suggestion - Suggest tags based on content
 */
export async function suggestTags(
    title: string,
    content: string,
    existingTags: Array<{ id: string; name: string; slug: string }>
): Promise<{
    suggestedTagIds: string[];
    newTagSuggestions: string[];
    error: string | null;
}> {
    if (existingTags.length === 0) {
        return { suggestedTagIds: [], newTagSuggestions: [], error: null };
    }

    const tagList = existingTags
        .slice(0, 50)
        .map(t => `${t.name} (ID: ${t.id})`)
        .join(', ');

    const messages: ChatMessage[] = [
        {
            role: 'system',
            content: `Bạn là hệ thống gắn tag tự động. Phân tích nội dung và gợi ý tags phù hợp.
Trả về JSON: {"existingTagIds": ["id1", "id2"], "newTags": ["tag mới 1", "tag mới 2"]}
- existingTagIds: IDs của tags có sẵn phù hợp (tối đa 5)
- newTags: gợi ý tags mới nếu cần (tối đa 3)
Chỉ trả về JSON.`
        },
        {
            role: 'user',
            content: `Tiêu đề: ${title}

Nội dung: ${content.substring(0, 1000)}

Tags có sẵn: ${tagList}

Gợi ý tags:`
        }
    ];

    const result = await chatCompletion({ messages, max_tokens: 500 });

    if (result.error) {
        return { suggestedTagIds: [], newTagSuggestions: [], error: result.error };
    }

    try {
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                suggestedTagIds: parsed.existingTagIds || [],
                newTagSuggestions: parsed.newTags || [],
                error: null
            };
        }
    } catch {
        // Parse error
    }

    return { suggestedTagIds: [], newTagSuggestions: [], error: null };
}

/**
 * Chat with Golden Copilot - Customs assistant chatbot with RAG
 * 
 * Uses Voyage AI for embeddings and pgvector for semantic search
 * to provide context-aware responses based on website content.
 */
export async function chatWithCopilot(
    message: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
    options: { useRAG?: boolean; sessionId?: string } = {}
): Promise<ChatCompletionResponse & { sources?: Array<{ title: string; url: string }> }> {
    const useRAG = options.useRAG !== false; // Default true

    let contextText = '';
    let sources: Array<{ title: string; url: string }> = [];

    // Try to get relevant context from RAG
    if (useRAG) {
        try {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
            const searchResponse = await fetch(`${siteUrl}/api/embeddings/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: message, limit: 3, threshold: 0.4 }),
            });

            if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                if (searchData.results && searchData.results.length > 0) {
                    // Build context from search results
                    contextText = searchData.results
                        .map((r: { title: string; chunk: string }, i: number) =>
                            `[${i + 1}] ${r.title}:\n${r.chunk.substring(0, 500)}`
                        )
                        .join('\n\n');

                    // Collect sources for citation
                    sources = searchData.results
                        .filter((r: { url: string | null }) => r.url)
                        .map((r: { title: string; url: string }) => ({
                            title: r.title,
                            url: r.url,
                        }));
                }
            }
        } catch (error) {
            console.warn('[Copilot] RAG search failed, continuing without context:', error);
        }
    }

    const config = await getAIConfig();
    const { companyInfo } = config;

    const baseSystemPrompt = `Bạn là Golden Copilot - trợ lý AI của ${companyInfo.name}.

Chuyên môn của bạn:
- Thủ tục hải quan xuất nhập khẩu
- Tra cứu mã HS (Harmonized System)
- Quy định và công văn hải quan mới nhất
- Phần mềm khai báo hải quan (ECUS5, V5, VNACCS)
- Logistics và vận chuyển quốc tế

Hướng dẫn trả lời:
1. Trả lời ngắn gọn, chính xác, dễ hiểu
2. Nếu không chắc chắn, nói rõ và đề xuất liên hệ hotline
3. Nếu có thông tin từ bài viết trên website, hãy sử dụng và trích dẫn
4. Luôn lịch sự và chuyên nghiệp
5. Có thể trả lời bằng tiếng Anh nếu khách hỏi tiếng Anh

Liên hệ: hotline ${companyInfo.phone}, email: ${companyInfo.email}`;

    const systemPrompt = contextText
        ? `${baseSystemPrompt}\n\n--- THÔNG TIN TỪ BÀI VIẾT TRÊN WEBSITE ---\n${contextText}\n\nHãy sử dụng thông tin trên nếu liên quan để trả lời câu hỏi.`
        : baseSystemPrompt;

    const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-10).map(h => ({
            role: h.role as 'user' | 'assistant',
            content: h.content
        })),
        { role: 'user', content: message }
    ];

    const result = await chatCompletion({ messages, max_tokens: 1500, temperature: 0.7 });

    return {
        ...result,
        sources: sources.length > 0 ? sources : undefined,
    };
}

/**
 * Validate JSON-LD structured data schema
 */
export interface SchemaValidationResult {
    isValid: boolean;
    score: number;
    errors: string[];
    warnings: string[];
    suggestions: string[];
    schemaType: string;
}

export function validateArticleSchema(data: Record<string, unknown>): SchemaValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Required fields for Article schema
    const requiredFields = ['@context', '@type', 'headline', 'author', 'datePublished'];

    for (const field of requiredFields) {
        if (!data[field]) {
            errors.push(`Thiếu trường bắt buộc: ${field}`);
            score -= 15;
        }
    }

    // Check @type
    if (data['@type'] && data['@type'] !== 'Article' && data['@type'] !== 'NewsArticle' && data['@type'] !== 'BlogPosting') {
        errors.push('@type phải là Article, NewsArticle, hoặc BlogPosting');
        score -= 10;
    }

    // Recommended fields
    const recommendedFields = ['image', 'description', 'dateModified', 'publisher'];
    for (const field of recommendedFields) {
        if (!data[field]) {
            warnings.push(`Nên thêm trường: ${field}`);
            score -= 5;
        }
    }

    // Validate headline length
    if (typeof data.headline === 'string' && data.headline.length > 110) {
        warnings.push('headline nên dưới 110 ký tự');
        score -= 5;
    }

    // Add suggestions based on errors
    if (errors.length > 0) {
        suggestions.push('Thêm các trường bắt buộc để cải thiện SEO');
    }
    if (!data.author) {
        suggestions.push('Thêm thông tin tác giả để tăng độ uy tín');
    }
    if (!data.image) {
        suggestions.push('Thêm ảnh đại diện để hiển thị tốt trên mạng xã hội');
    }

    return {
        isValid: errors.length === 0,
        score: Math.max(0, score),
        errors,
        warnings,
        suggestions,
        schemaType: String(data['@type'] || 'Unknown')
    };
}

export function validateSoftwareSchema(data: Record<string, unknown>): SchemaValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Required fields for SoftwareApplication
    const requiredFields = ['@context', '@type', 'name', 'operatingSystem'];

    for (const field of requiredFields) {
        if (!data[field]) {
            errors.push(`Thiếu trường bắt buộc: ${field}`);
            score -= 15;
        }
    }

    if (data['@type'] && data['@type'] !== 'SoftwareApplication') {
        errors.push('@type phải là SoftwareApplication');
        score -= 10;
    }

    // Recommended fields
    const recommendedFields = ['applicationCategory', 'offers', 'aggregateRating', 'description'];
    for (const field of recommendedFields) {
        if (!data[field]) {
            warnings.push(`Nên thêm trường: ${field}`);
            score -= 5;
        }
    }

    // Add suggestions
    if (errors.length > 0) {
        suggestions.push('Thêm các trường bắt buộc để schema hợp lệ');
    }
    if (!data.description) {
        suggestions.push('Thêm mô tả chi tiết về phần mềm');
    }

    return {
        isValid: errors.length === 0,
        score: Math.max(0, score),
        errors,
        warnings,
        suggestions,
        schemaType: String(data['@type'] || 'Unknown')
    };
}

/**
 * Translate post content using AI
 */
export async function translatePost(
    title: string,
    excerpt: string | null,
    contentHtml: string | null,
    targetLanguage: string = 'en'
): Promise<{
    translated: {
        title: string;
        excerpt: string;
        content_html: string;
    };
    error: string | null;
}> {
    const messages: ChatMessage[] = [
        {
            role: 'system',
            content: `Bạn là dịch giả chuyên nghiệp. Dịch nội dung bài viết sang tiếng Anh.
Giữ nguyên định dạng HTML, các thẻ, class, và structure. Chỉ dịch nội dung text.
Trả về JSON format:
{
  "title": "Translated Title",
  "excerpt": "Translated Excerpt",
  "content_html": "Translated HTML content"
}
Chỉ trả về JSON hợp lệ, không giải thích thêm.`
        },
        {
            role: 'user',
            content: `Dịch sang tiếng Anh:

Tiêu đề: ${title}

Tóm tắt: ${excerpt || ''}

Nội dung HTML:
${contentHtml || ''}`
        }
    ];

    // Increase max tokens for content translation
    const result = await chatCompletion({ messages, max_tokens: 3000 });

    if (result.error) {
        return {
            translated: { title: '', excerpt: '', content_html: '' },
            error: result.error
        };
    }

    try {
        // Extract JSON
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                translated: {
                    title: parsed.title || title,
                    excerpt: parsed.excerpt || excerpt || '',
                    content_html: parsed.content_html || contentHtml || ''
                },
                error: null
            };
        }
    } catch {
        // Parse error
    }

    return {
        translated: { title: '', excerpt: '', content_html: '' },
        error: "Failed to parse translation response"
    };
}

