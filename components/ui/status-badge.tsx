import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: 'urgent' | 'today' | 'upcoming' | 'completed';
    days?: number;
    className?: string;
}

const statusStyles = {
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border border-red-200 dark:border-red-800',
    today: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    upcoming: 'bg-secondary text-secondary-foreground border',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border border-green-200 dark:border-green-800',
};

const statusLabels = {
    urgent: (days: number) => `${Math.abs(days)} days overdue`,
    today: 'Today',
    upcoming: (days: number) => `${days} days`,
    completed: 'Completed',
};

export function StatusBadge({ status, days, className }: StatusBadgeProps) {
    const label = typeof statusLabels[status] === 'function'
        ? statusLabels[status](days || 0)
        : statusLabels[status];

    return (
        <span className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0',
            statusStyles[status],
            className
        )}>
            {label}
        </span>
    );
}