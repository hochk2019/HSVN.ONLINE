/**
 * Voyage AI Embeddings Service
 * 
 * Uses voyage-3.5-lite model (1024 dimensions)
 * Free tier: 200M tokens/month
 * 
 * Reads API key from:
 * 1. Database settings (voyage_api_key)
 * 2. Environment variable (VOYAGE_API_KEY)
 * 
 * @see https://docs.voyageai.com/
 */

import { createClient } from '@supabase/supabase-js';

const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings';
const VOYAGE_MODEL = 'voyage-3.5-lite'; // 1024 dimensions, best for general use
const EMBEDDING_DIMENSION = 1024;

// Cache for API key and Model
let voyageConfigCache: { key: string | null; model: string; timestamp: number } | null = null;
const CACHE_TTL = 60000; // 1 minute

async function getVoyageConfig(): Promise<{ key: string | null; model: string }> {
    // Check cache first
    if (voyageConfigCache && Date.now() - voyageConfigCache.timestamp < CACHE_TTL) {
        return { key: voyageConfigCache.key, model: voyageConfigCache.model };
    }

    let key: string | null = null;
    let model = VOYAGE_MODEL;

    // Try to read from database
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey);
            const { data } = await supabase
                .from('settings')
                .select('key, value')
                .in('key', ['voyage_api_key', 'voyage_model']);

            if (data) {
                const keyRecord = data.find(d => d.key === 'voyage_api_key');
                const modelRecord = data.find(d => d.key === 'voyage_model');

                if (keyRecord?.value) key = String(keyRecord.value);
                if (modelRecord?.value) model = String(modelRecord.value);
            }
        }
    } catch (error) {
        console.warn('[Voyage] Failed to load config from DB:', error);
    }

    // Fallback key to environment variable
    if (!key) {
        key = process.env.VOYAGE_API_KEY || null;
    }

    voyageConfigCache = { key, model, timestamp: Date.now() };
    return { key, model };
}

interface VoyageResponse {
    object: string;
    data: Array<{
        object: string;
        embedding: number[];
        index: number;
    }>;
    model: string;
    usage: {
        total_tokens: number;
    };
}

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<{
    embedding: number[] | null;
    tokens: number;
    error: string | null;
}> {
    const result = await generateEmbeddings([text]);
    return {
        embedding: result.embeddings[0] || null,
        tokens: result.tokens,
        error: result.error,
    };
}

/**
 * Generate embeddings for multiple texts (batch)
 * Voyage supports up to 128 texts per request
 */
export async function generateEmbeddings(texts: string[]): Promise<{
    embeddings: (number[] | null)[];
    tokens: number;
    error: string | null;
}> {
    const { key: apiKey, model } = await getVoyageConfig();

    if (!apiKey) {
        console.error('[Voyage] API key not configured');
        return {
            embeddings: texts.map(() => null),
            tokens: 0,
            error: 'Voyage API Key chưa được cấu hình. Vui lòng vào Cài đặt > Cấu hình AI để thêm.',
        };
    }

    try {
        console.log(`[Voyage] Generating embeddings using model: ${model}`);
        const response = await fetch(VOYAGE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                input: texts,
                model: model,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Voyage] API error:', response.status, errorText);
            return {
                embeddings: texts.map(() => null),
                tokens: 0,
                error: `Voyage API error: ${response.status}`,
            };
        }

        const data: VoyageResponse = await response.json();

        // Sort by index to maintain order
        const sortedData = [...data.data].sort((a, b) => a.index - b.index);
        const embeddings = sortedData.map(d => d.embedding);

        console.log(`[Voyage] Generated ${embeddings.length} embeddings, used ${data.usage.total_tokens} tokens`);

        return {
            embeddings,
            tokens: data.usage.total_tokens,
            error: null,
        };
    } catch (error) {
        console.error('[Voyage] Network error:', error);
        return {
            embeddings: texts.map(() => null),
            tokens: 0,
            error: 'Không thể kết nối đến Voyage AI',
        };
    }
}

/**
 * Chunk text into smaller pieces for embedding
 * Target: 500-1000 tokens per chunk
 */
export function chunkText(
    text: string,
    options: {
        maxTokens?: number;
        overlap?: number;
    } = {}
): string[] {
    const maxTokens = options.maxTokens || 500;
    const overlap = options.overlap || 50;

    // Simple approximation: 1 token ≈ 4 characters for Vietnamese
    const charsPerToken = 4;
    const maxChars = maxTokens * charsPerToken;
    const overlapChars = overlap * charsPerToken;

    // Split by sentences first
    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxChars && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            // Keep overlap from end of previous chunk
            const words = currentChunk.split(/\s+/);
            const overlapWords = words.slice(-Math.floor(overlapChars / 5)); // Approx 5 chars per word
            currentChunk = overlapWords.join(' ') + ' ' + sentence;
        } else {
            currentChunk += (currentChunk ? ' ' : '') + sentence;
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

/**
 * Get the embedding dimension for the model
 */
export function getEmbeddingDimension(): number {
    return EMBEDDING_DIMENSION;
}

/**
 * Estimate token count for text (Vietnamese)
 * Rough approximation: 1 token ≈ 4 characters
 */
export function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}
