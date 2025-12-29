'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Clock, Smartphone, Monitor, Tablet, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AnalyticsDashboard() {
    const [period, setPeriod] = useState('30d');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/analytics?period=${period}`);
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error('Analytics fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [period]);

    if (loading) return <div className="h-64 flex items-center justify-center text-gray-400">Đang tải dữ liệu...</div>;
    if (!data || data.error) return <div className="h-64 flex items-center justify-center text-red-500">Không thể tải dữ liệu: {data?.error || 'Unknown error'}</div>;

    const traffic = data.traffic || [];
    const devices = data.devices || { mobile: 0, desktop: 0, tablet: 0, other: 0 };
    const topPosts = data.topPosts || [];
    const totalViews = data.totalViews || 0;

    // Prepare Pie Data
    const deviceData = [
        { name: 'Desktop', value: devices.desktop || 0, color: '#3B82F6', icon: Monitor },
        { name: 'Mobile', value: devices.mobile || 0, color: '#A855F7', icon: Smartphone },
        { name: 'Tablet', value: devices.tablet || 0, color: '#F97316', icon: Tablet },
        { name: 'Khác', value: devices.other || 0, color: '#9CA3AF', icon: Globe },
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Globe className="w-5 h-5 text-golden" />
                    Thống kê truy cập
                </h2>
                {/* Filter */}
                <div className="flex bg-white dark:bg-gray-800 p-1 rounded-lg border shadow-sm">
                    {['today', '7d', '30d', 'year'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={cn(
                                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                period === p
                                    ? "bg-golden text-white shadow-sm"
                                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                            )}
                        >
                            {p === 'today' ? 'Hôm nay' : p === '7d' ? '7 ngày' : p === '30d' ? '30 ngày' : 'Năm nay'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Traffic Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Lưu lượng ({totalViews} lượt xem)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] pl-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={traffic} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => {
                                        const d = new Date(str);
                                        return `${d.getDate()}/${d.getMonth() + 1}`;
                                    }}
                                    stroke="#9CA3AF"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="views"
                                    stroke="#D4AF37" // Golden
                                    strokeWidth={3}
                                    dot={{ fill: '#D4AF37', strokeWidth: 2 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Device & Top Posts Container */}
                <div className="space-y-6">
                    {/* Device Pie */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Thiết bị</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[140px] flex items-center justify-between">
                            <div className="h-full w-[100px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={deviceData}
                                            innerRadius={30}
                                            outerRadius={45}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {deviceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex-1 pl-4 space-y-2">
                                {deviceData.map((d) => (
                                    <div key={d.name} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                            <span className="text-gray-600 dark:text-gray-400">{d.name}</span>
                                        </div>
                                        <span className="font-bold">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Posts */}
                    <Card className="flex-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Top Bài Viết</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {topPosts.slice(0, 3).map((post: any, idx: number) => (
                                    <div key={idx} className="flex items-start gap-3 group">
                                        <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500 mt-0.5">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate group-hover:text-golden transition-colors" title={post.title}>
                                                {post.title}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-3 h-3" /> {post.views}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {post.avgDuration}s
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {topPosts.length === 0 && <p className="text-xs text-gray-500">Chưa có dữ liệu</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
