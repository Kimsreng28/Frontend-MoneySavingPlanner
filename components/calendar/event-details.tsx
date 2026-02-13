'use client';

import { format } from 'date-fns';
import {
    Calendar,
    Clock,
    Target,
    SquareCheckBig,
    Goal,
    TrendingUp,
    TrendingDown,
    Bell,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Edit2,
    Trash2,
    Award,
} from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CalendarEvent } from '@/types/calendar';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface EventDetailsProps {
    event: CalendarEvent;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (eventId: string, type: string, status: string) => void;
}

const typeIcons = {
    task: SquareCheckBig,
    goal: Target,
    plan: Goal,
    transaction: TrendingUp,
    reminder: Bell,
    milestone: Award
};

const typeLabels = {
    task: 'Task',
    goal: 'Goal',
    plan: 'Saving Plan',
    transaction: 'Transaction',
    reminder: 'Reminder',
    milestone: 'Milestone',
};

const statusColors = {
    completed: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
    overdue: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
    upcoming: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
};

export function EventDetails({ event, open, onOpenChange, onUpdate }: EventDetailsProps) {
    const Icon = typeIcons[event.type] || Calendar;

    const handleMarkCompleted = () => {
        onUpdate(event.id, event.type, 'completed');
        onOpenChange(false);
    };

    const handleMarkPending = () => {
        onUpdate(event.id, event.type, 'pending');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            'p-2 rounded-lg',
                            event.type === 'task' && 'bg-blue-100 dark:bg-blue-900/30',
                            event.type === 'goal' && 'bg-green-100 dark:bg-green-900/30',
                            event.type === 'plan' && 'bg-purple-100 dark:bg-purple-900/30',
                            event.type === 'transaction' && 'bg-amber-100 dark:bg-amber-900/30',
                            event.type === 'reminder' && 'bg-gray-100 dark:bg-gray-900/30',
                        )}>
                            <Icon className={cn(
                                'h-5 w-5',
                                event.type === 'task' && 'text-blue-600 dark:text-blue-400',
                                event.type === 'goal' && 'text-green-600 dark:text-green-400',
                                event.type === 'plan' && 'text-purple-600 dark:text-purple-400',
                                event.type === 'transaction' && 'text-amber-600 dark:text-amber-400',
                                event.type === 'reminder' && 'text-gray-600 dark:text-gray-400',
                            )} />
                        </div>
                        <div>
                            <DialogTitle>{event.title}</DialogTitle>
                            <DialogDescription>
                                {typeLabels[event.type]}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    {event.description && (
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Date</p>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span className="text-sm">
                                    {format(new Date(event.date), 'MMM d, yyyy')}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Status</p>
                            <Badge className={statusColors[event.status]}>
                                {event.status}
                            </Badge>
                        </div>
                    </div>

                    {event.priority && (
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Priority</p>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map(level => (
                                    <div
                                        key={level}
                                        className={cn(
                                            'h-2 w-8 rounded-full transition-colors',
                                            level <= event.priority! ? 'bg-primary' : 'bg-muted'
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {event.amount !== undefined && (
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Amount</p>
                            <p className="text-lg font-bold">
                                {formatCurrency(event.amount)}
                            </p>
                        </div>
                    )}

                    {event.progress !== undefined && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">{Math.round(event.progress)}%</span>
                            </div>
                            <Progress value={event.progress} className="h-2" />
                        </div>
                    )}

                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Details</p>
                                {Object.entries(event.metadata).map(([key, value]) => (
                                    <div key={key} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                                        </span>
                                        <span className="font-medium">
                                            {typeof value === 'number' && key.includes('amount')
                                                ? formatCurrency(value)
                                                : String(value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-2">
                    {event.actionable ? (
                        event.status !== 'completed' ? (
                            <Button onClick={handleMarkCompleted}>
                                <CheckCircle2 className="h-4 w-4" />
                                Mark Complete
                            </Button>
                        ) : (
                            <Button variant="outline" onClick={handleMarkPending}>
                                <XCircle className="h-4 w-4" />
                                Mark Pending
                            </Button>
                        )
                    ) : null}

                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}