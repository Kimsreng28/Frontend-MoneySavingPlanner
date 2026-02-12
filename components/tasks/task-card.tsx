'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Circle,
    Calendar,
    Clock,
    Flag,
    Repeat,
    Edit2,
    Trash2,
    AlertCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ChecklistTask, TaskFrequency } from '@/types/task';
import { formatDate, getDaysRemaining } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { taskService } from '@/api/tasks';

interface TaskCardProps {
    task: ChecklistTask;
    onUpdate: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const frequencyColors = {
    [TaskFrequency.DAILY]: 'bg-blue-500',
    [TaskFrequency.WEEKLY]: 'bg-purple-500',
    [TaskFrequency.MONTHLY]: 'bg-green-500',
    [TaskFrequency.ONE_TIME]: 'bg-gray-500',
};

const frequencyLabels = {
    [TaskFrequency.DAILY]: 'Daily',
    [TaskFrequency.WEEKLY]: 'Weekly',
    [TaskFrequency.MONTHLY]: 'Monthly',
    [TaskFrequency.ONE_TIME]: 'One-time',
};

export function TaskCard({ task, onUpdate, onEdit, onDelete }: TaskCardProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const dueDate = new Date(task.dueDate);
    const daysRemaining = getDaysRemaining(dueDate);
    const isOverdue = daysRemaining < 0 && !task.isCompleted;
    const isToday = daysRemaining === 0;
    const isTomorrow = daysRemaining === 1;

    const handleToggleComplete = async () => {
        setLoading(true);
        try {
            if (task.isCompleted) {
                await taskService.uncompleteTask(task.id);
                toast({
                    title: 'Task uncompleted',
                    description: 'Task has been marked as incomplete.',
                });
            } else {
                await taskService.completeTask(task.id);
                toast({
                    title: 'Task completed!',
                    description: 'Great job! Keep up the good work.',
                });
            }
            onUpdate();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update task',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await taskService.deleteTask(task.id);
            toast({
                title: 'Task deleted',
                description: 'Task has been removed.',
            });
            setShowDeleteDialog(false);
            onDelete();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete task',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const getDueDateText = () => {
        if (task.isCompleted) return 'Completed';
        if (isOverdue) return `${Math.abs(daysRemaining)} days overdue`;
        if (isToday) return 'Today';
        if (isTomorrow) return 'Tomorrow';
        return `Due in ${daysRemaining} days`;
    };

    const getDueDateColor = () => {
        if (task.isCompleted) return 'text-green-600 dark:text-green-400';
        if (isOverdue) return 'text-destructive';
        if (isToday) return 'text-amber-600 dark:text-amber-400';
        return 'text-muted-foreground';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
        >
            <Card className={cn(
                'p-4 hover:shadow-md transition-all',
                task.isCompleted && 'bg-muted/30',
                isOverdue && !task.isCompleted && 'border-destructive/50'
            )}>
                <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div className="pt-1">
                        <Checkbox
                            checked={task.isCompleted}
                            onCheckedChange={handleToggleComplete}
                            disabled={loading}
                            className={cn(
                                'h-5 w-5',
                                task.isCompleted && 'bg-primary border-primary'
                            )}
                        />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className={cn(
                                        'font-medium',
                                        task.isCompleted && 'line-through text-muted-foreground'
                                    )}>
                                        {task.title}
                                    </h3>

                                    {/* Priority Badge */}
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'px-1.5 py-0 text-xs',
                                            task.priority === 1 && 'border-red-200 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
                                            task.priority === 2 && 'border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
                                            task.priority === 3 && 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
                                            task.priority === 4 && 'border-green-200 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
                                            task.priority === 5 && 'border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
                                        )}
                                    >
                                        <Flag className="h-3 w-3 mr-1" />
                                        P{task.priority}
                                    </Badge>
                                </div>

                                {/* Description (expandable) */}
                                {task.description && (
                                    <>
                                        {expanded ? (
                                            <p className="text-sm text-muted-foreground mt-2">
                                                {task.description}
                                            </p>
                                        ) : (
                                            task.description.length > 100 && (
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                    {task.description}
                                                </p>
                                            )
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Expand button (if description is long) */}
                            {task.description && task.description.length > 100 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setExpanded(!expanded)}
                                >
                                    {expanded ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </Button>
                            )}
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                            {/* Due Date */}
                            <div className={cn(
                                'flex items-center gap-1 text-xs',
                                getDueDateColor()
                            )}>
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(dueDate)}</span>
                                <span className="font-medium">({getDueDateText()})</span>
                            </div>

                            {/* Frequency */}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <div className={cn('w-2 h-2 rounded-full', frequencyColors[task.frequency])} />
                                <span>{frequencyLabels[task.frequency]}</span>
                                {task.isRecurring && (
                                    <Repeat className="h-3 w-3 ml-1" />
                                )}
                            </div>

                            {/* Plan */}
                            {task.plan && (
                                <Badge variant="secondary" className="text-xs">
                                    {task.plan.name}
                                </Badge>
                            )}
                        </div>

                        {/* Completed Timestamp */}
                        {task.isCompleted && task.completedAt && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Completed {formatDate(task.completedAt)}</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={onEdit}
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setShowDeleteDialog(true)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Task</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{task.title}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            {loading ? 'Deleting...' : 'Delete Task'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}