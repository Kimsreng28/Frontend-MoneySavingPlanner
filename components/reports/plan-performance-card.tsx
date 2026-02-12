'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { PlanPerformanceReport } from '@/types/report';
import { formatCurrency } from '@/lib/utils';

interface PlanPerformanceCardProps {
    plans: PlanPerformanceReport[];
}

export function PlanPerformanceCard({ plans }: PlanPerformanceCardProps) {
    const onTrackPlans = plans.filter(p => p.isOnTrack);
    const offTrackPlans = plans.filter(p => !p.isOnTrack);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Plan Performance
                </CardTitle>
                <CardDescription>
                    {onTrackPlans.length} on track, {offTrackPlans.length} off track
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {plans.slice(0, 5).map((plan) => (
                    <motion.div
                        key={plan.planId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{plan.planName}</span>
                                <Badge
                                    variant={plan.isOnTrack ? 'outline' : 'destructive'}
                                    className={cn(
                                        'text-xs',
                                        plan.isOnTrack && 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400'
                                    )}
                                >
                                    {plan.isOnTrack ? 'On Track' : 'Off Track'}
                                </Badge>
                            </div>
                            <span className="text-sm font-medium">{Math.round(plan.progress)}%</span>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Actual</span>
                                <span className="font-medium">{formatCurrency(plan.currentAmount)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Expected</span>
                                <span className="font-medium">{formatCurrency(plan.targetAmount * (plan.expectedProgress / 100))}</span>
                            </div>
                            <Progress
                                value={plan.progress}
                                className={cn(
                                    'h-1.5',
                                    plan.isOnTrack ? 'bg-green-100 dark:bg-green-950' : 'bg-red-100 dark:bg-red-950'
                                )}
                            />
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Variance</span>
                                <span className={cn(
                                    'font-medium',
                                    plan.variance >= 0 ? 'text-green-600' : 'text-red-600'
                                )}>
                                    {plan.variance > 0 ? '+' : ''}{plan.variance.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </CardContent>
        </Card>
    );
}