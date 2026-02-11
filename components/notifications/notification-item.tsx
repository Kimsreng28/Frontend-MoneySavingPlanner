'use client';

import { Notification, NotificationType } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import {
    Bell,
    CheckCircle,
    AlertCircle,
    Info,
    AlertTriangle,
    Goal,
    Trophy,
    Clock,
    Wallet,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
}

const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case NotificationType.SUCCESS:
            return CheckCircle;
        case NotificationType.ERROR:
            return AlertCircle;
        case NotificationType.WARNING:
            return AlertTriangle;
        case NotificationType.GOAL_ACHIEVED:
            return Trophy;
        case NotificationType.PLAN_COMPLETED:
            return Goal;
        case NotificationType.TASK_REMINDER:
            return Clock;
        case NotificationType.SAVING_MILESTONE:
            return Wallet;
        default:
            return Info;
    }
};

const getNotificationColors = (type: NotificationType, isRead: boolean) => {
    const baseClasses = isRead ? 'opacity-60' : '';

    switch (type) {
        case NotificationType.SUCCESS:
            return cn(baseClasses, 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800');
        case NotificationType.ERROR:
            return cn(baseClasses, 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800');
        case NotificationType.WARNING:
            return cn(baseClasses, 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800');
        case NotificationType.GOAL_ACHIEVED:
        case NotificationType.PLAN_COMPLETED:
            return cn(baseClasses, 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800');
        case NotificationType.SAVING_MILESTONE:
            return cn(baseClasses, 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800');
        default:
            return cn(baseClasses, 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800');
    }
};

const getIconColor = (type: NotificationType) => {
    switch (type) {
        case NotificationType.SUCCESS:
            return 'text-green-600 dark:text-green-400';
        case NotificationType.ERROR:
            return 'text-red-600 dark:text-red-400';
        case NotificationType.WARNING:
            return 'text-yellow-600 dark:text-yellow-400';
        case NotificationType.GOAL_ACHIEVED:
        case NotificationType.PLAN_COMPLETED:
            return 'text-purple-600 dark:text-purple-400';
        case NotificationType.SAVING_MILESTONE:
            return 'text-blue-600 dark:text-blue-400';
        default:
            return 'text-gray-600 dark:text-gray-400';
    }
};

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
    const Icon = getNotificationIcon(notification.type);
    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
        >
            <Card
                className={cn(
                    'p-4 mb-2 border-l-4 hover:shadow-md transition-all cursor-pointer',
                    getNotificationColors(notification.type, notification.isRead),
                    !notification.isRead && 'border-l-primary'
                )}
                onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
            >
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn('shrink-0', getIconColor(notification.type))}>
                        <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <h4 className={cn(
                                'text-sm font-medium',
                                !notification.isRead && 'font-semibold'
                            )}>
                                {notification.title}
                            </h4>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {timeAgo}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                        </p>

                        {/* Metadata badges */}
                        {notification.metadata && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {Object.entries(notification.metadata).map(([key, value]) => (
                                    <span
                                        key={key}
                                        className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-background border"
                                    >
                                        {key}: {String(value)}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex gap-1">
                        {!notification.isRead && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMarkAsRead(notification.id);
                                }}
                            >
                                <CheckCircle className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(notification.id);
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}