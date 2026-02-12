'use client';

import { motion } from 'framer-motion';
import { Calendar, Target, CheckSquare, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

import { formatDate, getDaysRemaining } from '@/lib/utils';
import { UpcomingItem } from '@/types/dashboard';
import { StatusBadge } from '../ui/status-badge';

interface UpcomingItemsProps {
    items: UpcomingItem[];
}

export function UpcomingItems({ items }: UpcomingItemsProps) {
    if (items.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Upcoming Deadlines
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="rounded-full bg-muted p-3 mb-3">
                            <Calendar className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            No upcoming deadlines in the next 7 days
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Deadlines
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {items.map((item, index) => {
                    const daysRemaining = getDaysRemaining(item.dueDate);
                    const isUrgent = daysRemaining <= 2;
                    const isToday = daysRemaining === 0;

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                'flex items-start gap-3 p-3 rounded-lg border transition-all',
                                isUrgent && 'border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-800',
                                isToday && 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800'
                            )}
                        >
                            <div className={cn(
                                'p-2 rounded-full',
                                item.type === 'goal' && 'bg-blue-100 dark:bg-blue-900/30',
                                item.type === 'task' && 'bg-purple-100 dark:bg-purple-900/30'
                            )}>
                                {item.type === 'goal' ? (
                                    <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                ) : (
                                    <CheckSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="font-medium truncate">{item.title}</h4>
                                    <StatusBadge
                                        status={isUrgent ? 'urgent' : isToday ? 'today' : 'upcoming'}
                                        days={daysRemaining}
                                    />
                                </div>

                                {item.type === 'goal' && item.progress !== undefined && (
                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-muted-foreground">Progress</span>
                                            <span className="font-medium">{Math.round(item.progress)}%</span>
                                        </div>
                                        <Progress value={item.progress} className="h-1.5" />
                                    </div>
                                )}

                                {item.type === 'task' && item.priority && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={cn(
                                            'w-1.5 h-1.5 rounded-full',
                                            item.priority === 1 && 'bg-red-500',
                                            item.priority === 2 && 'bg-orange-500',
                                            item.priority === 3 && 'bg-yellow-500',
                                            item.priority === 4 && 'bg-green-500',
                                            item.priority === 5 && 'bg-blue-500'
                                        )} />
                                        <span className="text-xs text-muted-foreground">
                                            Priority {item.priority}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </CardContent>
        </Card>
    );
}