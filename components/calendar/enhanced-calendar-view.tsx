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
    isPast,
    isFuture,
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
    GripVertical,
    MoreVertical,
    Edit,
    Trash2,
    CheckCircle,
    AlertCircle,
    Clock,
    Award,
    Sparkles,
    CalendarDays,
    ListTodo,
    PiggyBank,
    Wallet,
    Eye,
} from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    useDroppable,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CalendarEvent, DayEvents, MonthData } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';
import { calendarService } from '@/api/calendar';
import { QuickAddDialog } from './quick-add-dialog';
import { EventDetails } from './event-details';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

interface CalendarViewProps {
    initialDate?: Date;
}

// Enhanced type colors with gradients and icons
const typeStyles = {
    task: {
        bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
        light: 'bg-blue-50 dark:bg-blue-950/30',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-700 dark:text-blue-300',
        icon: SquareCheckBig,
        gradient: 'from-blue-500 to-blue-600',
    },
    goal: {
        bg: 'bg-gradient-to-r from-green-500 to-green-600',
        light: 'bg-green-50 dark:bg-green-950/30',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-700 dark:text-green-300',
        icon: Target,
        gradient: 'from-green-500 to-green-600',
    },
    plan: {
        bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
        light: 'bg-purple-50 dark:bg-purple-950/30',
        border: 'border-purple-200 dark:border-purple-800',
        text: 'text-purple-700 dark:text-purple-300',
        icon: Goal,
        gradient: 'from-purple-500 to-purple-600',
    },
    transaction: {
        bg: 'bg-gradient-to-r from-amber-500 to-amber-600',
        light: 'bg-amber-50 dark:bg-amber-950/30',
        border: 'border-amber-200 dark:border-amber-800',
        text: 'text-amber-700 dark:text-amber-300',
        icon: TrendingUp,
        gradient: 'from-amber-500 to-amber-600',
    },
    reminder: {
        bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
        light: 'bg-gray-50 dark:bg-gray-950/30',
        border: 'border-gray-200 dark:border-gray-800',
        text: 'text-gray-700 dark:text-gray-300',
        icon: Bell,
        gradient: 'from-gray-500 to-gray-600',
    },
    milestone: {
        bg: 'bg-gradient-to-r from-pink-500 to-pink-600',
        light: 'bg-pink-50 dark:bg-pink-950/30',
        border: 'border-pink-200 dark:border-pink-800',
        text: 'text-pink-700 dark:text-pink-300',
        icon: Award,
        gradient: 'from-pink-500 to-pink-600',
    },
};

const statusIcons = {
    completed: CheckCircle,
    pending: Clock,
    overdue: AlertCircle,
    upcoming: Sparkles,
};

const statusColors = {
    completed: 'text-green-600 dark:text-green-400',
    pending: 'text-yellow-600 dark:text-yellow-400',
    overdue: 'text-red-600 dark:text-red-400',
    upcoming: 'text-blue-600 dark:text-blue-400',
};

// Droppable Day Component
interface DroppableDayProps {
    date: Date;
    children: React.ReactNode;
    isCurrentMonth: boolean;
    isSelected: boolean | null;
    isCurrentDay: boolean;
    isPastDay: boolean;
}

function DroppableDay({ date, children, isCurrentMonth, isSelected, isCurrentDay, isPastDay }: DroppableDayProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: date.toISOString(),
        data: {
            date: date,
        },
    });

    return (
        <div
            ref={setNodeRef}
            data-date={date.toISOString()}
            className={cn(
                'min-h-[180px] p-2 transition-all relative group',
                !isCurrentMonth && 'bg-muted/30',
                isSelected && 'ring-2 ring-primary ring-inset',
                isCurrentDay && 'bg-primary/5',
                isPastDay && 'opacity-70',
                isOver && 'bg-primary/10 ring-2 ring-primary ring-inset scale-[1.02] shadow-lg',
                'hover:bg-accent/5'
            )}
        >
            {children}
        </div>
    );
}

// Sortable Event Item Component
interface SortableEventItemProps {
    event: CalendarEvent;
    onClick: (event: CalendarEvent, e: React.MouseEvent) => void;
}

function SortableEventItem({ event, onClick }: SortableEventItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: event.id,
        data: {
            type: event.type,
            event: event,
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
    };

    const Icon = typeStyles[event.type].icon;
    const StatusIcon = statusIcons[event.status];

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="group relative touch-none"
        >
            <div
                className={cn(
                    'flex items-center gap-1 p-1.5 rounded-md cursor-pointer',
                    'hover:shadow-md transition-all duration-200',
                    'border-l-2',
                    typeStyles[event.type].light,
                    typeStyles[event.type].border,
                    isDragging && 'shadow-xl scale-105 rotate-1'
                )}
                onClick={(e) => onClick(event, e)}
            >
                {/* Drag Handle */}
                <div
                    {...listeners}
                    className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none"
                >
                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                </div>

                {/* Status Icon */}
                <StatusIcon className={cn('h-3 w-3', statusColors[event.status])} />

                {/* Type Icon */}
                <Icon className={cn('h-3 w-3', typeStyles[event.type].text)} />

                {/* Title */}
                <span className="text-xs font-medium truncate flex-1">
                    {event.title}
                </span>

                {/* Amount Badge */}
                {event.amount && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                        ${event.amount.toLocaleString()}
                    </Badge>
                )}

                {/* More Actions */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreVertical className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onClick(event, e);
                        }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Progress Bar for Goals/Plans */}
            {event.progress !== undefined && event.progress < 100 && (
                <Progress
                    value={event.progress}
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-none"
                />
            )}
        </div>
    );
}

export function EnhancedCalendarView({ initialDate = new Date() }: CalendarViewProps) {
    const { toast } = useToast();
    const [currentDate, setCurrentDate] = useState(initialDate);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [monthData, setMonthData] = useState<MonthData | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const [filters, setFilters] = useState<{
        types: Set<string>;
        status: Set<string>;
    }>({
        types: new Set(),
        status: new Set(),
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchMonthData();
    }, [currentDate, filters]);

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

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragId(null);

        if (!over || active.id === over.id) return;

        // Get the target date from the over element's data
        const targetDate = over.data.current?.date as Date;
        if (!targetDate) return;

        try {
            // Update event date via API
            const eventId = active.id as string;
            await calendarService.updateEventDate(eventId, targetDate);

            // Refresh data
            await fetchMonthData();

            toast({
                title: 'Event Moved',
                description: `Event moved to ${format(targetDate, 'MMM d, yyyy')}`,
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to move event',
                variant: 'destructive',
            });
        }
    };

    const handlePreviousMonth = () => {
        setCurrentDate(subMonths(currentDate, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        setShowQuickAdd(true);
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

    // Get all event IDs for SortableContext
    const allEventIds = monthData?.days.flatMap(day => day.events.map(e => e.id)) || [];

    return (
        <TooltipProvider>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="space-y-6">
                    {/* Header with enhanced controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-6 w-6 text-primary" />
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                    {format(currentDate, 'MMMM yyyy')}
                                </h2>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handlePreviousMonth}
                                    className="h-8 w-8"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleNextMonth}
                                    className="h-8 w-8"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleToday}
                                    className="ml-2"
                                >
                                    Today
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => setShowQuickAdd(true)}
                                className="bg-gradient-to-r from-primary to-primary/90"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Quick Add
                            </Button>
                        </div>
                    </div>

                    {/* Enhanced Filters with better UI */}
                    <Card className="p-4 border-2 border-primary/10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-primary" />
                                <span className="text-sm font-semibold">Filters</span>
                            </div>
                            {(filters.types.size > 0 || filters.status.size > 0) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="h-7 px-2 text-xs"
                                >
                                    <X className="h-3 w-3 mr-1" />
                                    Clear All
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                    <ListTodo className="h-3 w-3" />
                                    Event Types
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(typeStyles).map(([type, style]) => (
                                        <Badge
                                            key={type}
                                            variant={filters.types.has(type) ? 'default' : 'outline'}
                                            className={cn(
                                                'cursor-pointer capitalize transition-all',
                                                filters.types.has(type) && style.bg + ' text-white border-0'
                                            )}
                                            onClick={() => toggleFilter('types', type)}
                                        >
                                            {type}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Status
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {['pending', 'completed', 'overdue', 'upcoming'].map(status => (
                                        <Badge
                                            key={status}
                                            variant={filters.status.has(status) ? 'default' : 'outline'}
                                            className={cn(
                                                'cursor-pointer capitalize transition-all',
                                                filters.status.has(status) && {
                                                    'bg-yellow-500 text-white border-0': status === 'pending',
                                                    'bg-green-500 text-white border-0': status === 'completed',
                                                    'bg-red-500 text-white border-0': status === 'overdue',
                                                    'bg-blue-500 text-white border-0': status === 'upcoming',
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

                    {/* Calendar Grid with DnD */}
                    <Card className="overflow-hidden border-2">
                        {/* Weekday headers with enhanced styling */}
                        <div className="grid grid-cols-7 bg-gradient-to-r from-primary/5 to-primary/10 p-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                                <div
                                    key={day}
                                    className={cn(
                                        'text-center text-sm font-semibold',
                                        (i === 0 || i === 6) && 'text-primary'
                                    )}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar days */}
                        <div className="grid grid-cols-7 divide-x divide-y">
                            {days.map((day) => {
                                const dayEvents = getEventsForDay(day);
                                const isCurrentMonth = isSameMonth(day, currentDate);
                                const isSelected = selectedDate && isSameDay(day, selectedDate);
                                const isCurrentDay = isToday(day);
                                const isPastDay = isPast(day) && !isToday(day);

                                return (
                                    <DroppableDay
                                        key={day.toString()}
                                        date={day}
                                        isCurrentMonth={isCurrentMonth}
                                        isSelected={isSelected}
                                        isCurrentDay={isCurrentDay}
                                        isPastDay={isPastDay}
                                    >
                                        {/* Day header */}
                                        <div className="flex items-start justify-between mb-2">
                                            <span
                                                className={cn(
                                                    'inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium',
                                                    isCurrentDay && 'bg-primary text-primary-foreground font-bold'
                                                )}
                                            >
                                                {format(day, 'd')}
                                            </span>
                                            {dayEvents && dayEvents.summary.total > 0 && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs px-1.5"
                                                >
                                                    {dayEvents.summary.total}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Events container with DnD */}
                                        <SortableContext
                                            items={dayEvents?.events.map(e => e.id) || []}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <div className="space-y-1 max-h-[140px] overflow-y-auto scrollbar-thin scrollbar-thumb-rounded">
                                                {dayEvents?.events.map(event => (
                                                    <SortableEventItem
                                                        key={event.id}
                                                        event={event}
                                                        onClick={handleEventClick}
                                                    />
                                                ))}
                                            </div>
                                        </SortableContext>

                                        {/* Quick add button on hover */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute bottom-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedDate(day);
                                                setShowQuickAdd(true);
                                            }}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </DroppableDay>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Enhanced Summary Cards */}
                    {monthData && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="p-4 border-l-4 border-l-blue-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total Events</p>
                                        <p className="text-2xl font-bold">{monthData.summary.totalEvents}</p>
                                    </div>
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4 border-l-4 border-l-green-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Completed</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {monthData.summary.completedEvents}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                                <Progress
                                    value={(monthData.summary.completedEvents / monthData.summary.totalEvents) * 100}
                                    className="mt-2 h-1"
                                />
                            </Card>

                            <Card className="p-4 border-l-4 border-l-amber-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Pending</p>
                                        <p className="text-2xl font-bold text-amber-600">
                                            {monthData.summary.pendingEvents}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4 border-l-4 border-l-purple-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Net Savings</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            ${(monthData.summary.totalSaved - monthData.summary.totalSpent).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <Wallet className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Saved: ${monthData.summary.totalSaved.toLocaleString()} |
                                    Spent: ${monthData.summary.totalSpent.toLocaleString()}
                                </p>
                            </Card>
                        </div>
                    )}

                    {/* Quick Stats */}
                    {monthData && (
                        <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-primary" />
                                        <span className="text-sm">
                                            <span className="font-bold">{monthData.summary.activeGoals}</span> Active Goals
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <PiggyBank className="h-4 w-4 text-primary" />
                                        <span className="text-sm">
                                            <span className="font-bold">{monthData.summary.activePlans}</span> Active Plans
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ListTodo className="h-4 w-4 text-primary" />
                                        <span className="text-sm">
                                            <span className="font-bold">{monthData.summary.pendingTasks}</span> Pending Tasks
                                        </span>
                                    </div>
                                </div>
                                <Badge variant="outline" className="bg-background">
                                    <Sparkles className="h-3 w-3 mr-1 text-yellow-500" />
                                    {monthData.summary.completedEvents} completed this month
                                </Badge>
                            </div>
                        </Card>
                    )}

                    {/* Dialogs */}
                    {selectedEvent && (
                        <EventDetails
                            event={selectedEvent}
                            open={!!selectedEvent}
                            onOpenChange={() => setSelectedEvent(null)}
                            onUpdate={handleUpdateStatus}
                        />
                    )}

                    <QuickAddDialog
                        open={showQuickAdd}
                        onOpenChange={setShowQuickAdd}
                        selectedDate={selectedDate || new Date()}
                        onSuccess={fetchMonthData}
                    />
                </div>
            </DndContext>
        </TooltipProvider>
    );
}