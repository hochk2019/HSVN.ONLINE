import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const supabase = await createServerSupabaseClient() as any;

    // Check Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (userData?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30d';

    let startDate = new Date();
    if (period === 'today') startDate.setHours(0, 0, 0, 0);
    else if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === 'year') startDate.setFullYear(startDate.getFullYear() - 1);

    try {
        const { data: visits, error } = await supabase
            .from('analytics_visits')
            .select('created_at, post_id, view_duration, device_type, posts(title)')
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: true })
            .limit(10000);

        if (error) throw error;

        // Aggregate Data
        const trafficMap: Record<string, number> = {};
        const deviceStats: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0, other: 0 };
        const postStats: Record<string, { title: string, views: number, duration: number }> = {};

        // Explicitly cast v to any to avoid TS errors on dynamic join
        (visits as any[]).forEach((v) => {
            // Traffic (Date)
            const date = new Date(v.created_at).toISOString().split('T')[0];
            trafficMap[date] = (trafficMap[date] || 0) + 1;

            // Device
            const dev = v.device_type || 'other';
            if (deviceStats[dev] !== undefined) {
                deviceStats[dev]++;
            } else {
                deviceStats['other']++;
            }

            // Posts
            if (v.post_id && v.posts) {
                const pid = v.post_id;
                const title = v.posts.title || 'Untitled';

                if (!postStats[pid]) {
                    postStats[pid] = { title, views: 0, duration: 0 };
                }
                postStats[pid].views++;
                postStats[pid].duration += (v.view_duration || 0);
            }
        });

        // Format for Chart
        const trafficChart = Object.keys(trafficMap).map(date => ({
            date,
            views: trafficMap[date]
        })).sort((a, b) => a.date.localeCompare(b.date));

        // Format Top Posts
        const topPosts = Object.values(postStats)
            .map(p => ({
                title: p.title,
                views: p.views,
                avgDuration: p.views ? Math.round(p.duration / p.views) : 0
            }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 10);

        return NextResponse.json({
            traffic: trafficChart,
            devices: deviceStats,
            topPosts: topPosts,
            totalViews: visits.length
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
