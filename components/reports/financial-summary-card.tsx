'use client';

import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    PiggyBank,
    Target,
    Calendar,
    Award,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FinancialSummary } from '@/types/report';
import { formatCurrency } from '@/lib/utils';

interface FinancialSummaryCardProps {
    financial: FinancialSummary;
}

export function FinancialSummaryCard({ financial }: FinancialSummaryCardProps) {
    const progress = financial.totalTarget > 0
        ? (financial.totalSaved / financial.totalTarget) * 100
        : 0;

    return (
        <Card className="relative overflow-hidden">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PiggyBank className="h-5 w-5" />
                    Financial Summary
                </CardTitle>
                <CardDescription>Your savings performance overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Overall Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">
                            {formatCurrency(financial.totalSaved)} / {formatCurrency(financial.totalTarget)}
                        </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{Math.round(progress)}% complete</span>
                        <span>{formatCurrency(financial.totalTarget - financial.totalSaved)} remaining</span>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Net Savings</p>
                        <p className="text-lg font-bold">{formatCurrency(financial.netSavings)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Total Withdrawn</p>
                        <p className="text-lg font-bold text-destructive">
                            {formatCurrency(financial.totalWithdrawn)}
                        </p>
                    </div>
                </div>

                {/* Monthly Average */}
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Average Monthly Savings</p>
                    <p className="text-xl font-bold text-primary">
                        {formatCurrency(financial.averageMonthlySavings)}
                    </p>
                </div>

                {/* Best/Worst Months */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <ArrowUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Best Month</p>
                            <p className="text-sm font-semibold">{financial.bestMonth.month}</p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                                {formatCurrency(financial.bestMonth.amount)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <ArrowDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Worst Month</p>
                            <p className="text-sm font-semibold">{financial.worstMonth.month}</p>
                            <p className="text-xs text-red-600 dark:text-red-400">
                                {formatCurrency(financial.worstMonth.amount)}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}