'use client';

import { motion } from 'framer-motion';
import {
    Trophy,
    CheckCircle2,
    Target,
    Wallet,
    Sparkles,
    Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { RecentActivityTime } from '@/types/dashboard';

interface RecentActivityProps {
    activities: RecentActivityTime[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'goal_completed':
                return Trophy;
            case 'task_completed':
                return CheckCircle2;
            case 'plan_created':
                return Target;
            case 'amount_added':
                return Wallet;
            default:
                return Sparkles;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'goal_completed':
                return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'task_completed':
                return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
            case 'plan_created':
                return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
            case 'amount_added':
                return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
            default:
                return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    if (activities.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="rounded-full bg-muted p-3 mb-3">
                            <Clock className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            No recent activity to show
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
                    <Clock className="h-5 w-5" />
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {activities.map((activity, index) => {
                    const Icon = getActivityIcon(activity.type);
                    const colorClass = getActivityColor(activity.type);

                    return (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3"
                        >
                            <Avatar className="h-9 w-9">
                                <AvatarFallback className={colorClass}>
                                    <Icon className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{activity.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {activity.description}
                                </p>
                                <p className="text-xs text-muted-foreground/70 mt-1">
                                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </CardContent>
        </Card>
    );
}