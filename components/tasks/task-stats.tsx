'use client';

import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Clock,
    Calendar,
    Target,
    TrendingUp,
    ListChecks,
    AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TaskStat } from '@/types/task';

interface TaskStatsProps {
    stats: TaskStat;
    className?: string;
}

export function TaskStats({ stats, className }: TaskStatsProps) {
    const completionRate = stats.summary.completionRate;
    const isGood = completionRate >= 70;
    const isAverage = completionRate >= 40 && completionRate < 70;
    const isLow = completionRate < 40;

    return (
        <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                            Total Tasks
                        </CardTitle>
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                            <ListChecks className="h-4 w-4 text-primary" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.summary.totalTasks}</div>
                    <div className="flex items-center gap-2 mt-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <p className="text-xs text-muted-foreground">
                            {stats.summary.completedTasks} completed
                        </p>
                    </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 to-primary" />
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                            Pending Tasks
                        </CardTitle>
                        <div className="p-2 bg-amber-500/10 rounded-lg group-hover:scale-110 transition-transform">
                            <Clock className="h-4 w-4 text-amber-500" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.summary.pendingTasks}</div>
                    <div className="flex items-center gap-2 mt-1">
                        <AlertCircle className="h-3 w-3 text-amber-500" />
                        <p className="text-xs text-muted-foreground">
                            Need attention
                        </p>
                    </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/40 to-amber-500" />
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                            Today's Tasks
                        </CardTitle>
                        <div className="p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
                            <Calendar className="h-4 w-4 text-blue-500" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.summary.todayTasks}</div>
                    <div className="flex items-center gap-2 mt-1">
                        <Target className="h-3 w-3 text-blue-500" />
                        <p className="text-xs text-muted-foreground">
                            Due today
                        </p>
                    </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/40 to-blue-500" />
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                            Completion Rate
                        </CardTitle>
                        <div className="p-2 bg-green-500/10 rounded-lg group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{completionRate}%</div>
                    <div className="mt-2">
                        <Progress
                            value={completionRate}
                            className={cn(
                                'h-2',
                                isGood && 'bg-green-100 dark:bg-green-950',
                                isAverage && 'bg-yellow-100 dark:bg-yellow-950',
                                isLow && 'bg-red-100 dark:bg-red-950'
                            )}
                        />
                    </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500/40 to-green-500" />
            </Card>

            {/* Frequency Distribution */}
            {Object.keys(stats.byFrequency).length > 0 && (
                <Card className="md:col-span-2 lg:col-span-4">
                    <CardHeader>
                        <CardTitle className="text-lg">Tasks by Frequency</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {Object.entries(stats.byFrequency).map(([frequency, count]) => {
                                const percentage = (count / stats.summary.totalTasks) * 100;
                                let color = '';
                                switch (frequency) {
                                    case 'daily':
                                        color = 'bg-blue-500';
                                        break;
                                    case 'weekly':
                                        color = 'bg-purple-500';
                                        break;
                                    case 'monthly':
                                        color = 'bg-green-500';
                                        break;
                                    default:
                                        color = 'bg-gray-500';
                                }

                                return (
                                    <div key={frequency} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm capitalize">{frequency}</span>
                                            <Badge variant="secondary">{count} tasks</Badge>
                                        </div>
                                        <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 0.5 }}
                                                className={cn('absolute top-0 left-0 h-full', color)}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {Math.round(percentage)}% of total
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}