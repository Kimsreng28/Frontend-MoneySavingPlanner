'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Filter,
    ArrowUpDown,
    Calendar,
    CheckCircle2,
    Circle,
    Clock,
    ListChecks,
    Search,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/dashboard/header';
import { TaskCard } from '@/components/tasks/task-card';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import { EditTaskDialog } from '@/components/tasks/edit-task-dialog';
import { TaskStats } from '@/components/tasks/task-stats';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { taskService } from '@/api/tasks';
import { ChecklistTask, TaskStat as ITaskStats, TaskFrequency } from '@/types/task';
import { cn } from '@/lib/utils';

export default function TasksPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [tasks, setTasks] = useState<ChecklistTask[]>([]);
    const [stats, setStats] = useState<ITaskStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedTask, setSelectedTask] = useState<ChecklistTask | null>(null);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('priority');
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterFrequency, setFilterFrequency] = useState('all');

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tasksData, statsData] = await Promise.all([
                taskService.getAllTasks(),
                taskService.getTaskStats()
            ]);
            setTasks(tasksData);
            setStats(statsData);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to fetch tasks',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (task: ChecklistTask) => {
        setSelectedTask(task);
        setShowEditDialog(true);
    };

    const handleDelete = async (id: string) => {
        // The TaskCard component handles deletion, we just refresh
        fetchData();
    };

    // Filter and sort tasks
    const filteredTasks = tasks
        .filter(task => {
            // Filter by tab
            if (activeTab === 'pending') return !task.isCompleted;
            if (activeTab === 'completed') return task.isCompleted;
            if (activeTab === 'today') {
                const today = new Date();
                const taskDate = new Date(task.dueDate);
                return taskDate.toDateString() === today.toDateString() && !task.isCompleted;
            }
            return true;
        })
        .filter(task => {
            // Filter by search query
            if (!searchQuery) return true;
            return task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchQuery.toLowerCase());
        })
        .filter(task => {
            // Filter by priority
            if (filterPriority === 'all') return true;
            return task.priority === parseInt(filterPriority);
        })
        .filter(task => {
            // Filter by frequency
            if (filterFrequency === 'all') return true;
            return task.frequency === filterFrequency;
        })
        .sort((a, b) => {
            // Sort
            if (sortBy === 'priority') return a.priority - b.priority;
            if (sortBy === 'dueDate') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            if (sortBy === 'status') return (a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1);
            return 0;
        });

    const pendingTasksCount = tasks.filter(t => !t.isCompleted).length;
    const todayTasksCount = tasks.filter(t => {
        const today = new Date();
        const taskDate = new Date(t.dueDate);
        return taskDate.toDateString() === today.toDateString() && !t.isCompleted;
    }).length;

    const breadcrumb = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Tasks', href: '/tasks' },
    ];

    return (
        <ProtectedRoute>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <Header
                        title="Tasks"
                        subtitle="Manage your daily tasks and stay productive"
                    />

                    <Separator />

                    <div className="p-6 space-y-6">
                        {/* Stats Cards */}
                        {stats && <TaskStats stats={stats} />}

                        {/* Main Tasks Section */}
                        <Card className="border-t-4 border-t-primary">
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <ListChecks className="h-6 w-6 text-primary" />
                                            </div>
                                            Your Tasks
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2">
                                            <Clock className="h-3 w-3" />
                                            {pendingTasksCount} pending • {todayTasksCount} due today
                                        </CardDescription>
                                    </div>
                                    <Button
                                        onClick={() => setShowCreateDialog(true)}
                                        className="gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        New Task
                                    </Button>
                                </div>

                                {/* Filters */}
                                <div className="flex flex-col md:flex-row gap-4 mt-4">
                                    <Tabs
                                        value={activeTab}
                                        onValueChange={setActiveTab}
                                        className="flex-1"
                                    >
                                        <TabsList className="w-full">
                                            <TabsTrigger value="all" className="flex-1 gap-2">
                                                <ListChecks className="h-4 w-4" />
                                                All
                                            </TabsTrigger>
                                            <TabsTrigger value="today" className="flex-1 gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Today
                                                {todayTasksCount > 0 && (
                                                    <Badge variant="secondary" className="ml-2">
                                                        {todayTasksCount}
                                                    </Badge>
                                                )}
                                            </TabsTrigger>
                                            <TabsTrigger value="pending" className="flex-1 gap-2">
                                                <Circle className="h-4 w-4" />
                                                Pending
                                                {pendingTasksCount > 0 && (
                                                    <Badge variant="secondary" className="ml-2">
                                                        {pendingTasksCount}
                                                    </Badge>
                                                )}
                                            </TabsTrigger>
                                            <TabsTrigger value="completed" className="flex-1 gap-2">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Completed
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>

                                    <div className="flex gap-2">
                                        <div className="relative flex-1 md:w-64">
                                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search tasks..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-8"
                                            />
                                        </div>

                                        <Select value={sortBy} onValueChange={setSortBy}>
                                            <SelectTrigger className="w-[140px]">
                                                <ArrowUpDown className="mr-2 h-4 w-4" />
                                                <SelectValue placeholder="Sort by" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="priority">Priority</SelectItem>
                                                <SelectItem value="dueDate">Due Date</SelectItem>
                                                <SelectItem value="title">Title</SelectItem>
                                                <SelectItem value="status">Status</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={filterPriority} onValueChange={setFilterPriority}>
                                            <SelectTrigger className="w-[140px]">
                                                <Filter className="mr-2 h-4 w-4" />
                                                <SelectValue placeholder="Priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Priorities</SelectItem>
                                                <SelectItem value="1">Priority 1</SelectItem>
                                                <SelectItem value="2">Priority 2</SelectItem>
                                                <SelectItem value="3">Priority 3</SelectItem>
                                                <SelectItem value="4">Priority 4</SelectItem>
                                                <SelectItem value="5">Priority 5</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={filterFrequency} onValueChange={setFilterFrequency}>
                                            <SelectTrigger className="w-[140px]">
                                                <Filter className="mr-2 h-4 w-4" />
                                                <SelectValue placeholder="Frequency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Frequencies</SelectItem>
                                                <SelectItem value={TaskFrequency.DAILY}>Daily</SelectItem>
                                                <SelectItem value={TaskFrequency.WEEKLY}>Weekly</SelectItem>
                                                <SelectItem value={TaskFrequency.MONTHLY}>Monthly</SelectItem>
                                                <SelectItem value={TaskFrequency.ONE_TIME}>One-time</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                {loading ? (
                                    <div className="space-y-4">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Card key={i} className="p-4">
                                                <div className="flex items-start gap-4">
                                                    <Skeleton className="h-5 w-5 rounded" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-5 w-1/4" />
                                                        <Skeleton className="h-4 w-2/3" />
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : filteredTasks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="rounded-full bg-muted p-4 mb-4">
                                            <ListChecks className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-semibold">No tasks found</h3>
                                        <p className="text-sm text-muted-foreground mt-2 mb-6">
                                            {searchQuery || filterPriority !== 'all' || filterFrequency !== 'all'
                                                ? "Try adjusting your filters"
                                                : "You haven't created any tasks yet"}
                                        </p>
                                        {!searchQuery && filterPriority === 'all' && filterFrequency === 'all' && (
                                            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                                                <Plus className="h-4 w-4" />
                                                Create Your First Task
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <AnimatePresence mode="popLayout">
                                            <div className="space-y-3">
                                                {filteredTasks.map((task) => (
                                                    <TaskCard
                                                        key={task.id}
                                                        task={task}
                                                        onUpdate={fetchData}
                                                        onEdit={() => handleEdit(task)}
                                                        onDelete={() => handleDelete(task.id)}
                                                    />
                                                ))}
                                            </div>
                                        </AnimatePresence>

                                        {/* Pagination (if needed) */}
                                        {filteredTasks.length > 20 && (
                                            <div className="flex items-center justify-between mt-6 pt-6 border-t">
                                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <ListChecks className="h-4 w-4" />
                                                    Showing {filteredTasks.length} of {tasks.length} tasks
                                                </p>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" className="gap-1">
                                                        <ChevronLeft className="h-4 w-4" />
                                                        Previous
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="gap-1">
                                                        Next
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </SidebarInset>
            </SidebarProvider>

            {/* Dialogs */}
            <CreateTaskDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSuccess={fetchData}
            />

            <EditTaskDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                task={selectedTask}
                onSuccess={fetchData}
            />
        </ProtectedRoute>
    );
}