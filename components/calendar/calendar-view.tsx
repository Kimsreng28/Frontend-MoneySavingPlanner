'use client';

import { useState, useEffect } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday,
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Target,
    SquareCheckBig,
    Goal,
    TrendingUp,
    TrendingDown,
    Bell,
    Plus,
    Filter,
    X,
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CalendarEvent, DayEvents, MonthData } from '@/types/calendar';

import { useToast } from '@/hooks/use-toast';
import { calendarService } from '@/api/calendar';
import { QuickAddDialog } from './quick-add-dialog';
import { EventDetails } from './event-details';

interface CalendarViewProps {
    initialDate?: Date;
}

const typeColors = {
    task: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
    goal: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400',
    plan: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
    transaction: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
    reminder: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400',
    milestone: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400',
};

const statusIcons = {
    completed: '✓',
    pending: '○',
    overdue: '!',
    upcoming: '●',
};

export function CalendarView({ initialDate = new Date() }: CalendarViewProps) {
    const { toast } = useToast();
    const [currentDate, setCurrentDate] = useState(initialDate);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [monthData, setMonthData] = useState<MonthData | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<{
        types: Set<string>;
        status: Set<string>;
    }>({
        types: new Set(),
        status: new Set(),
    });

    useEffect(() => {
        fetchMonthData();
    }, [currentDate]);

    const fetchMonthData = async () => {
        setLoading(true);
        try {
            const data = await calendarService.getMonthData(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1,
                {
                    types: filters.types.size ? Array.from(filters.types) as any : undefined,
                    status: filters.status.size ? Array.from(filters.status) as any : undefined,
                }
            );
            setMonthData(data);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to load calendar',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePreviousMonth = () => {
        setCurrentDate(subMonths(currentDate, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1));
    };

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
    };

    const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedEvent(event);
    };

    const handleUpdateStatus = async (eventId: string, type: string, status: string) => {
        try {
            await calendarService.updateEventStatus({
                eventId,
                type: type as any,
                status: status as any,
            });

            // Refresh data
            await fetchMonthData();

            toast({
                title: 'Success',
                description: 'Event status updated',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update status',
                variant: 'destructive',
            });
        }
    };

    const toggleFilter = (type: 'types' | 'status', value: string) => {
        setFilters(prev => {
            const newSet = new Set(prev[type]);
            if (newSet.has(value)) {
                newSet.delete(value);
            } else {
                newSet.add(value);
            }
            return { ...prev, [type]: newSet };
        });
    };

    const clearFilters = () => {
        setFilters({ types: new Set(), status: new Set() });
    };

    const days = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
    });

    const getEventsForDay = (date: Date): DayEvents | undefined => {
        if (!monthData) return undefined;
        const dateStr = format(date, 'yyyy-MM-dd');
        return monthData.days.find(d => d.date === dateStr);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold">
                        {format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleNextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowQuickAdd(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Quick Add
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span className="text-sm font-medium">Filters</span>
                    </div>
                    {(filters.types.size > 0 || filters.status.size > 0) && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            <X className="h-4 w-4 mr-2" />
                            Clear
                        </Button>
                    )}
                </div>

                <div className="space-y-2">
                    <div>
                        <p className="text-xs text-muted-foreground mb-2">Event Types</p>
                        <div className="flex flex-wrap gap-2">
                            {['task', 'goal', 'plan', 'transaction', 'reminder'].map(type => (
                                <Badge
                                    key={type}
                                    variant={filters.types.has(type) ? 'default' : 'outline'}
                                    className={cn(
                                        'cursor-pointer capitalize',
                                        filters.types.has(type) && typeColors[type as keyof typeof typeColors]
                                    )}
                                    onClick={() => toggleFilter('types', type)}
                                >
                                    {type}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground mb-2">Status</p>
                        <div className="flex flex-wrap gap-2">
                            {['pending', 'completed', 'overdue', 'upcoming'].map(status => (
                                <Badge
                                    key={status}
                                    variant={filters.status.has(status) ? 'default' : 'outline'}
                                    className={cn(
                                        'cursor-pointer capitalize',
                                        filters.status.has(status) && {
                                            'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400': status === 'pending',
                                            'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400': status === 'completed',
                                            'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400': status === 'overdue',
                                            'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400': status === 'upcoming',
                                        }[status]
                                    )}
                                    onClick={() => toggleFilter('status', status)}
                                >
                                    {status}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Calendar Grid */}
            <Card className="overflow-hidden">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 bg-muted/50 p-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-sm font-medium">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 divide-x divide-y border-t">
                    {days.map((day, index) => {
                        const dayEvents = getEventsForDay(day);
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isCurrentDay = isToday(day);

                        return (
                            <motion.div
                                key={day.toString()}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.01 }}
                                className={cn(
                                    'min-h-[120px] p-2 cursor-pointer hover:bg-muted/50 transition-colors relative',
                                    !isCurrentMonth && 'bg-muted/30 text-muted-foreground',
                                    isSelected && 'ring-2 ring-primary ring-inset',
                                    isCurrentDay && 'bg-primary/5'
                                )}
                                onClick={() => handleDayClick(day)}
                            >
                                <div className="flex items-start justify-between">
                                    <span className={cn(
                                        'text-sm font-medium',
                                        isCurrentDay && 'text-primary font-bold'
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                    {dayEvents && dayEvents.summary.total > 0 && (
                                        <Badge variant="secondary" className="text-xs">
                                            {dayEvents.summary.total}
                                        </Badge>
                                    )}
                                </div>

                                {/* Event indicators */}
                                {dayEvents && (
                                    <div className="mt-2 space-y-1">
                                        {dayEvents.events.slice(0, 3).map(event => (
                                            <div
                                                key={event.id}
                                                className={cn(
                                                    'text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity',
                                                    typeColors[event.type]
                                                )}
                                                onClick={(e) => handleEventClick(event, e)}
                                            >
                                                <span className="mr-1">{statusIcons[event.status]}</span>
                                                {event.title}
                                            </div>
                                        ))}
                                        {dayEvents.events.length > 3 && (
                                            <div className="text-xs text-muted-foreground">
                                                +{dayEvents.events.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </Card>

            {/* Summary Card */}
            {monthData && (
                <Card className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground">Total Events</p>
                            <p className="text-2xl font-bold">{monthData.summary.totalEvents}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Completed</p>
                            <p className="text-2xl font-bold text-green-600">
                                {monthData.summary.completedEvents}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {monthData.summary.pendingEvents}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Net Savings</p>
                            <p className="text-2xl font-bold text-primary">
                                ${(monthData.summary.totalSaved - monthData.summary.totalSpent).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Event Details Dialog */}
            {selectedEvent && (
                <EventDetails
                    event={selectedEvent}
                    open={!!selectedEvent}
                    onOpenChange={() => setSelectedEvent(null)}
                    onUpdate={handleUpdateStatus}
                />
            )}

            {/* Quick Add Dialog */}
            <QuickAddDialog
                open={showQuickAdd}
                onOpenChange={setShowQuickAdd}
                selectedDate={selectedDate || new Date()}
                onSuccess={fetchMonthData}
            />
        </div>
    );
}