'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target,
    Calendar,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Clock,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GoalProgressReport } from '@/types/report';
import { formatCurrency, formatDate } from '@/lib/utils';
import React from 'react';

interface GoalProgressTableProps {
    goals: GoalProgressReport[];
}

const statusColors = {
    on_track: {
        badge: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400',
        progress: 'bg-green-500',
    },
    behind: {
        badge: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
        progress: 'bg-yellow-500',
    },
    completed: {
        badge: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
        progress: 'bg-blue-500',
    },
    overdue: {
        badge: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
        progress: 'bg-red-500',
    },
};

const statusLabels = {
    on_track: 'On Track',
    behind: 'Behind',
    completed: 'Completed',
    overdue: 'Overdue',
};

export function GoalProgressTable({ goals }: GoalProgressTableProps) {
    const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Goal</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Current / Target</TableHead>
                        <TableHead>Monthly Avg</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {goals.map((goal) => (
                        // FIX: Add key to the fragment
                        <React.Fragment key={goal.goalId}>
                            <TableRow
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => setExpandedGoal(expandedGoal === goal.goalId ? null : goal.goalId)}
                            >
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-muted-foreground" />
                                        {goal.goalName}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={cn('border', statusColors[goal.status].badge)}>
                                        {statusLabels[goal.status]}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Progress value={goal.progress} className={cn('h-2 w-20', statusColors[goal.status].progress)} />
                                        <span className="text-sm font-medium">{Math.round(goal.progress)}%</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <span className="font-medium">{formatCurrency(goal.currentAmount)}</span>
                                        <span className="text-muted-foreground"> / {formatCurrency(goal.targetAmount)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm">{formatCurrency(goal.monthlyContribution)}</span>
                                </TableCell>
                                <TableCell>
                                    {goal.deadline ? (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-sm">{formatDate(goal.deadline)}</span>
                                            {goal.daysRemaining !== undefined && goal.daysRemaining > 0 && (
                                                <Badge variant="outline" className="ml-2 text-xs">
                                                    {goal.daysRemaining} days
                                                </Badge>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">No deadline</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        {expandedGoal === goal.goalId ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </Button>
                                </TableCell>
                            </TableRow>
                            <AnimatePresence>
                                {expandedGoal === goal.goalId && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="bg-muted/30 p-0">
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="p-4 space-y-3">
                                                    <h4 className="text-sm font-medium">Goal Details</h4>
                                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-muted-foreground">Monthly Contribution</p>
                                                            <p className="font-medium">{formatCurrency(goal.monthlyContribution)}</p>
                                                        </div>
                                                        {goal.projectedCompletionDate && (
                                                            <div>
                                                                <p className="text-muted-foreground">Projected Completion</p>
                                                                <p className="font-medium">{formatDate(goal.projectedCompletionDate)}</p>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-muted-foreground">Remaining</p>
                                                            <p className="font-medium">{formatCurrency(goal.targetAmount - goal.currentAmount)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </AnimatePresence>
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}