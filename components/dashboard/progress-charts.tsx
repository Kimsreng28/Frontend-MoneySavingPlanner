'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, PieChart, Target } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { DashboardData } from '@/types/dashboard';

interface ProgressChartsProps {
    data: DashboardData;
}

export function ProgressCharts({ data }: ProgressChartsProps) {
    const { summary, charts } = data;

    return (
        <>
            {/* Overall Progress */}
            <Card className="flex flex-col h-full">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Overall Progress
                        </span>
                        <Badge variant="outline" className="text-sm">
                            {summary.goals.overallProgress}%
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Goals Completion</span>
                                <span className="font-medium">
                                    {summary.goals.completed}/{summary.goals.total} goals
                                </span>
                            </div>
                            <Progress
                                value={(summary.goals.completed / summary.goals.total) * 100}
                                className="h-2"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Tasks Completion</span>
                                <span className="font-medium">{summary.tasks.completionRate}%</span>
                            </div>
                            <Progress
                                value={summary.tasks.completionRate}
                                className="h-2"
                            />
                        </div>

                        <div className="pt-4 border-t">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Saved</p>
                                    <p className="text-2xl font-bold">{formatCurrency(summary.financial.totalSaved)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Monthly</p>
                                    <p className="text-lg font-semibold text-primary">
                                        +{formatCurrency(summary.financial.monthlyContribution)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Goals Progress */}
            <Card className="lg:col-span-2 flex flex-col h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Top Goals Progress
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="space-y-4">
                        {charts.goalsProgress.slice(0, 4).map((goal) => (
                            <div key={goal.id} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">{goal.name}</span>
                                    <span className="text-sm text-muted-foreground">
                                        {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Progress value={goal.progress} className="h-2 flex-1" />
                                    <span className="text-xs font-medium min-w-[40px] text-right">
                                        {Math.round(goal.progress)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Tasks by Priority */}
            <Card className="flex flex-col h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        Tasks by Priority
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="space-y-3">
                        {charts.tasksByPriority.filter((p: { count: number; }) => p.count > 0).map((item) => (
                            <div key={item.priority} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <span className={cn(
                                            'w-2 h-2 rounded-full',
                                            item.priority === 1 && 'bg-red-500',
                                            item.priority === 2 && 'bg-orange-500',
                                            item.priority === 3 && 'bg-yellow-500',
                                            item.priority === 4 && 'bg-green-500',
                                            item.priority === 5 && 'bg-blue-500'
                                        )} />
                                        Priority {item.priority}
                                    </span>
                                    <span className="font-medium">{item.count} tasks</span>
                                </div>
                                <Progress
                                    value={(item.count / summary.tasks.total) * 100}
                                    className={cn(
                                        'h-1.5',
                                        item.priority === 1 && 'bg-red-100 dark:bg-red-950',
                                        item.priority === 2 && 'bg-orange-100 dark:bg-orange-950',
                                        item.priority === 3 && 'bg-yellow-100 dark:bg-yellow-950',
                                        item.priority === 4 && 'bg-green-100 dark:bg-green-950',
                                        item.priority === 5 && 'bg-blue-100 dark:bg-blue-950'
                                    )}
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}