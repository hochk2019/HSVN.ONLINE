import { NextRequest, NextResponse } from 'next/server';
import { validateArticleSchema, validateSoftwareSchema } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { schema, type } = body;

        if (!schema || typeof schema !== 'object') {
            return NextResponse.json(
                { error: 'Vui lòng cung cấp dữ liệu schema hợp lệ' },
                { status: 400 }
            );
        }

        let result;

        if (type === 'software' || schema['@type'] === 'SoftwareApplication') {
            result = validateSoftwareSchema(schema);
        } else {
            result = validateArticleSchema(schema);
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('[Schema Validate Error]:', error);
        return NextResponse.json(
            { error: 'Lỗi xử lý yêu cầu. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}
