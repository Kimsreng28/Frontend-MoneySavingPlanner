'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Target,
    Calendar,
    TrendingUp,
    CheckCircle,
    Edit2,
    Trash2,
    Plus,
    Minus,
    AlertCircle,
    Trophy
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { SavingGoal } from '@/types/goal';
import { useToast } from '@/hooks/use-toast';
import { goalService } from '@/api/goals';
import { formatCurrency, formatDate, getDaysRemaining } from '@/lib/utils';

interface GoalCardProps {
    goal: SavingGoal;
    onUpdate: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export function GoalCard({ goal, onUpdate, onEdit, onDelete }: GoalCardProps) {
    const { toast } = useToast();
    const [showAddAmount, setShowAddAmount] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const remaining = goal.targetAmount - goal.currentAmount;
    const daysRemaining = goal.deadline ? getDaysRemaining(goal.deadline) : null;
    const isOverdue = daysRemaining !== null && daysRemaining < 0 && !goal.isCompleted;

    // Default color if none provided
    const goalColor = goal.colorCode || '#3B82F6';

    const handleAddAmount = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast({
                title: 'Invalid amount',
                description: 'Please enter a valid amount greater than 0',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        try {
            await goalService.addAmount(goal.id, parseFloat(amount));
            toast({
                title: 'Success!',
                description: `Added ${formatCurrency(parseFloat(amount))} to your goal`,
            });
            setShowAddAmount(false);
            setAmount('');
            onUpdate();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to add amount',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast({
                title: 'Invalid amount',
                description: 'Please enter a valid amount greater than 0',
                variant: 'destructive',
            });
            return;
        }

        if (parseFloat(amount) > goal.currentAmount) {
            toast({
                title: 'Insufficient funds',
                description: `You can only withdraw up to ${formatCurrency(goal.currentAmount)}`,
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        try {
            await goalService.withdrawAmount(goal.id, parseFloat(amount));
            toast({
                title: 'Success!',
                description: `Withdrawn ${formatCurrency(parseFloat(amount))} from your goal`,
            });
            setShowWithdraw(false);
            setAmount('');
            onUpdate();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to withdraw amount',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <Card className={cn(
                'p-6 relative overflow-hidden group',
                goal.isCompleted && 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20',
                isOverdue && 'border-red-200 dark:border-red-800'
            )}>
                {/* Color Accent - Using hex color from goal */}
                <div
                    className="absolute top-0 left-0 w-1 h-full"
                    style={{ backgroundColor: goalColor }}
                />

                {/* Completed Badge */}
                {goal.isCompleted && (
                    <div className="absolute top-4 right-4">
                        <Badge className="bg-green-500 hover:bg-green-600">
                            <Trophy className="h-3 w-3 mr-1" />
                            Completed
                        </Badge>
                    </div>
                )}

                {/* Overdue Badge */}
                {isOverdue && !goal.isCompleted && (
                    <div className="absolute top-4 right-4">
                        <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Overdue
                        </Badge>
                    </div>
                )}

                <div className="space-y-4">
                    {/* Header with Icon */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{
                                    backgroundColor: `${goalColor}20`, // 20 = 12% opacity in hex
                                }}
                            >
                                {goal.iconUrl ? (
                                    <img src={goal.iconUrl} alt={goal.title} className="w-6 h-6" />
                                ) : (
                                    <Target
                                        className="w-5 h-5"
                                        style={{ color: goalColor }}
                                    />
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{goal.title}</h3>
                                {goal.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                        {goal.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Amounts */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                            <span className="text-2xl font-bold">
                                {formatCurrency(goal.currentAmount)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                of {formatCurrency(goal.targetAmount)}
                            </span>
                        </div>

                        {/* Progress Bar - Using goal color */}
                        <div className="space-y-1">
                            <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="absolute top-0 left-0 h-full transition-all duration-500"
                                    style={{
                                        width: `${Math.min(progress, 100)}%`,
                                        backgroundColor: goal.isCompleted ? '#22c55e' : goalColor
                                    }}
                                />
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">
                                    {Math.round(progress)}% complete
                                </span>
                                <span
                                    className="font-medium"
                                    style={{ color: goal.isCompleted ? '#22c55e' : goalColor }}
                                >
                                    {formatCurrency(remaining)} remaining
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Deadline & Priority */}
                    <div className="flex items-center gap-4 text-sm">
                        {goal.deadline && !goal.isCompleted && (
                            <div className={cn(
                                'flex items-center gap-1',
                                isOverdue ? 'text-destructive' : 'text-muted-foreground'
                            )}>
                                <Calendar className="w-4 h-4" />
                                <span>
                                    {isOverdue
                                        ? `${Math.abs(daysRemaining!)} days overdue`
                                        : `${daysRemaining} days left`
                                    }
                                </span>
                            </div>
                        )}
                        {!goal.isCompleted && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <TrendingUp className="w-4 h-4" />
                                <span>Priority {goal.priority}</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    {!goal.isCompleted && (
                        <div className="flex items-center gap-2 pt-2">
                            <Button
                                size="sm"
                                className="flex-1"
                                style={{
                                    backgroundColor: goalColor,
                                    color: 'white'
                                }}
                                onClick={() => setShowAddAmount(true)}
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowWithdraw(true)}
                                disabled={goal.currentAmount === 0}
                            >
                                <Minus className="w-4 h-4 mr-1" />
                                Withdraw
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9"
                                onClick={onEdit}
                            >
                                <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9 text-destructive hover:text-destructive"
                                onClick={onDelete}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    {/* Completed Actions */}
                    {goal.isCompleted && (
                        <div className="flex items-center gap-2 pt-2">
                            <Badge variant="outline" className="w-full justify-center py-2">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Completed on {formatDate(goal.completedAt!)}
                            </Badge>
                        </div>
                    )}
                </div>
            </Card>

            {/* Add Amount Dialog */}
            <Dialog open={showAddAmount} onOpenChange={setShowAddAmount}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Money to Goal</DialogTitle>
                        <DialogDescription>
                            Add money to "{goal.title}". Current balance: {formatCurrency(goal.currentAmount)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="pl-7"
                                    min="0.01"
                                    step="0.01"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddAmount(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddAmount}
                            disabled={loading}
                            style={{ backgroundColor: goalColor }}
                        >
                            {loading ? 'Adding...' : 'Add Money'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Withdraw Dialog */}
            <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Withdraw Money from Goal</DialogTitle>
                        <DialogDescription>
                            Withdraw money from "{goal.title}". Current balance: {formatCurrency(goal.currentAmount)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="withdraw-amount">Amount</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                <Input
                                    id="withdraw-amount"
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="pl-7"
                                    min="0.01"
                                    max={goal.currentAmount}
                                    step="0.01"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Maximum withdrawal: {formatCurrency(goal.currentAmount)}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowWithdraw(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleWithdraw}
                            disabled={loading}
                            variant="destructive"
                        >
                            {loading ? 'Withdrawing...' : 'Withdraw'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}