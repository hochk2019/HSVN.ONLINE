import { NextRequest, NextResponse } from 'next/server';
import { recommendCategory, suggestTags } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, title, content, categories, tags } = body;

        if (!title || !content) {
            return NextResponse.json(
                { error: 'Cần có tiêu đề và nội dung để phân tích' },
                { status: 400 }
            );
        }

        if (action === 'category') {
            if (!categories || !Array.isArray(categories)) {
                return NextResponse.json(
                    { error: 'Cần danh sách categories' },
                    { status: 400 }
                );
            }

            const result = await recommendCategory(title, content, categories.map((c: { id: string; name: string }) => ({
                ...c,
                slug: c.name.toLowerCase().replace(/\s+/g, '-')
            })));

            if (!result.recommendedId && !result.error) {
                return NextResponse.json({
                    error: 'AI không tìm thấy danh mục phù hợp',
                    recommendedId: null,
                    confidence: 0,
                    reason: ''
                });
            }

            return NextResponse.json({
                recommendedId: result.recommendedId,
                confidence: result.confidence,
                reason: result.reason,
                error: result.error
            });
        }

        if (action === 'tags') {
            if (!tags || !Array.isArray(tags)) {
                return NextResponse.json(
                    { error: 'Cần danh sách tags' },
                    { status: 400 }
                );
            }

            const result = await suggestTags(title, content, tags.map((t: { id: string; name: string }) => ({
                ...t,
                slug: t.name.toLowerCase().replace(/\s+/g, '-')
            })));

            if (result.suggestedTagIds.length === 0 && result.newTagSuggestions.length === 0 && !result.error) {
                return NextResponse.json({
                    error: 'AI không tìm thấy tags phù hợp. Thử nhập nội dung dài hơn.',
                    suggestedTagIds: [],
                    newTagSuggestions: []
                });
            }

            return NextResponse.json({
                suggestedTagIds: result.suggestedTagIds,
                newTagSuggestions: result.newTagSuggestions,
                error: result.error
            });
        }

        return NextResponse.json(
            { error: 'Action không hợp lệ. Sử dụng: category hoặc tags' },
            { status: 400 }
        );

    } catch (error) {
        console.error('[AI Classify Error]:', error);
        return NextResponse.json(
            { error: 'Lỗi xử lý yêu cầu. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}
