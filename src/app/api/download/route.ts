import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const versionId = searchParams.get('versionId');
    const softwareId = searchParams.get('softwareId');

    if (!versionId || !softwareId) {
        return NextResponse.json(
            { error: 'Missing required parameters' },
            { status: 400 }
        );
    }

    const supabase = await createServerSupabaseClient();

    // Get version info to find file path
    const { data: version, error: versionError } = await supabase
        .from('software_versions')
        .select('file_url, file_name')
        .eq('id', versionId)
        .single();

    if (versionError || !version?.file_url) {
        return NextResponse.json(
            { error: 'Version not found or no file available' },
            { status: 404 }
        );
    }

    // Get client info from headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    try {
        // Log the download with IP and user agent
        // Note: created_at is auto-set by database default
        await supabase.from('download_logs').insert({
            version_id: versionId,
            software_id: softwareId,
            ip_address: ipAddress,
            user_agent: userAgent.substring(0, 500), // Limit UA length
        });

        // Increment download counter
        const { data: software } = await supabase
            .from('software_products')
            .select('download_count')
            .eq('id', softwareId)
            .single();

        if (software) {
            await supabase
                .from('software_products')
                .update({ download_count: (software.download_count || 0) + 1 })
                .eq('id', softwareId);
        }
    } catch (logError) {
        console.error('Error logging download:', logError);
        // Don't fail the download if logging fails
    }

    // Check if file is in Supabase Storage (starts with storage URL)
    const isSupabaseStorage = version.file_url.includes('supabase.co/storage');

    if (isSupabaseStorage) {
        // Extract path from URL and create signed URL
        const urlParts = version.file_url.split('/storage/v1/object/public/');
        if (urlParts.length === 2) {
            const [bucket, ...pathParts] = urlParts[1].split('/');
            const filePath = pathParts.join('/');

            const { data: signedData, error: signedError } = await supabase.storage
                .from(bucket)
                .createSignedUrl(filePath, 3600); // 1 hour expiry

            if (!signedError && signedData?.signedUrl) {
                return NextResponse.redirect(signedData.signedUrl);
            }
        }
    }

    // Fallback: redirect to direct URL
    return NextResponse.redirect(version.file_url);
}
