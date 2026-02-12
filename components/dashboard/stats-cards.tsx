'use client';

import { motion } from 'framer-motion';
import {
    Wallet,
    Target,
    Flame,
    TrendingUp,
    Calendar,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';

import { formatCurrency } from '@/lib/utils';
import { DashboardSummary } from '@/types/dashboard';
import { StatsCard } from './statCard';

interface StatsCardsProps {
    summary: DashboardSummary;
}

export function StatsCards({ summary }: StatsCardsProps) {
    // Determine variant based on tasks due today
    const getTasksDueVariant = () => {
        if (summary.tasks.todayDue === 0) return 'success' as const;
        if (summary.tasks.todayDue <= 2) return 'accent' as const;
        return 'primary' as const; // Use primary for higher counts
    };

    const stats = [
        {
            title: 'Total Saved',
            value: formatCurrency(summary.financial.totalSaved),
            subtitle: `of ${formatCurrency(summary.financial.totalTarget)}`,
            icon: Wallet,
            variant: 'primary' as const,
            trend: {
                value: summary.financial.monthlyChange,
                isPositive: summary.financial.monthlyChange > 0,
            },
        },
        {
            title: 'Active Goals',
            value: summary.goals.active.toString(),
            subtitle: `${summary.goals.completed} completed`,
            icon: Target,
            variant: 'default' as const,
        },
        {
            title: 'Current Streak',
            value: summary.financial.streak.current.toString(),
            subtitle: `Best: ${summary.financial.streak.best} days`,
            icon: Flame,
            variant: 'accent' as const,
        },
        {
            title: 'Tasks Due Today',
            value: summary.tasks.todayDue.toString(),
            subtitle: summary.tasks.todayDue === 0
                ? 'All caught up!'
                : `${summary.tasks.overdue} overdue`,
            icon: summary.tasks.todayDue === 0 ? CheckCircle2 : Calendar,
            variant: getTasksDueVariant(),
        },
    ];

    return (
        <>
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <StatsCard {...stat} />
                </motion.div>
            ))}
        </>
    );
}