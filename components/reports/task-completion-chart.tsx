'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare } from 'lucide-react';
import { TaskCompletionReport } from '@/types/report';
import { useState } from 'react';

interface TaskCompletionChartProps {
    data: TaskCompletionReport[];
}

export function TaskCompletionChart({ data }: TaskCompletionChartProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [hoveredBar, setHoveredBar] = useState<string | null>(null);

    const chartData = data.map(item => ({
        name: `Week ${item.period.split('-')[1]}`,
        Completed: item.completed,
        Pending: item.pending,
        Overdue: item.overdue,
        completionRate: item.completionRate,
        fullPeriod: item.period,
    }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                    <p className="font-medium mb-2">{label}</p>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="text-sm">Completed: </span>
                            <span className="text-sm font-medium ml-auto">{data.Completed}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <span className="text-sm">Pending: </span>
                            <span className="text-sm font-medium ml-auto">{data.Pending}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <span className="text-sm">Overdue: </span>
                            <span className="text-sm font-medium ml-auto">{data.Overdue}</span>
                        </div>
                        <div className="border-t border-border my-1.5 pt-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Completion Rate: </span>
                                <span className="text-sm font-medium">{data.completionRate}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const CustomLegend = ({ payload }: any) => {
        return (
            <div className="flex justify-center gap-6 mt-4">
                {payload.map((entry: any, index: number) => {
                    const color = entry.color;
                    const isHovered = hoveredBar === entry.dataKey;
                    return (
                        <div
                            key={`legend-${index}`}
                            className={`
                                flex items-center gap-2 cursor-pointer transition-all duration-200
                                ${isHovered ? 'opacity-100 scale-105' : 'opacity-70 hover:opacity-100'}
                            `}
                            onMouseEnter={() => setHoveredBar(entry.dataKey)}
                            onMouseLeave={() => setHoveredBar(null)}
                        >
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-sm font-medium">{entry.value}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5" />
                    Task Completion Trends
                </CardTitle>
                <CardDescription>Weekly task completion overview</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            onMouseLeave={() => setActiveIndex(null)}
                        >
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="name"
                                className="text-xs text-muted-foreground"
                                tick={{ fill: 'currentColor' }}
                                axisLine={{ stroke: 'hsl(var(--border))' }}
                                tickLine={{ stroke: 'hsl(var(--border))' }}
                            />
                            <YAxis
                                className="text-xs text-muted-foreground"
                                tick={{ fill: 'currentColor' }}
                                axisLine={{ stroke: 'hsl(var(--border))' }}
                                tickLine={{ stroke: 'hsl(var(--border))' }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
                            <Legend content={<CustomLegend />} />

                            <Bar
                                dataKey="Completed"
                                fill="#22c55e"
                                radius={[4, 4, 0, 0]}
                                onMouseEnter={(_, index) => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                                isAnimationActive={true}
                                animationDuration={1000}
                                animationEasing="ease-in-out"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-completed-${index}`}
                                        fill={activeIndex === index ? '#16a34a' : '#22c55e'}
                                        style={{
                                            filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                                            transition: 'fill 0.2s ease, filter 0.2s ease',
                                            cursor: 'pointer',
                                        }}
                                    />
                                ))}
                            </Bar>

                            <Bar
                                dataKey="Pending"
                                fill="#eab308"
                                radius={[4, 4, 0, 0]}
                                onMouseEnter={(_, index) => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                                isAnimationActive={true}
                                animationDuration={1000}
                                animationEasing="ease-in-out"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-pending-${index}`}
                                        fill={activeIndex === index ? '#ca8a04' : '#eab308'}
                                        style={{
                                            filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                                            transition: 'fill 0.2s ease, filter 0.2s ease',
                                            cursor: 'pointer',
                                        }}
                                    />
                                ))}
                            </Bar>

                            <Bar
                                dataKey="Overdue"
                                fill="#ef4444"
                                radius={[4, 4, 0, 0]}
                                onMouseEnter={(_, index) => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                                isAnimationActive={true}
                                animationDuration={1000}
                                animationEasing="ease-in-out"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-overdue-${index}`}
                                        fill={activeIndex === index ? '#dc2626' : '#ef4444'}
                                        style={{
                                            filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                                            transition: 'fill 0.2s ease, filter 0.2s ease',
                                            cursor: 'pointer',
                                        }}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}