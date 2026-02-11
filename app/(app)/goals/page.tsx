'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Target,
    Calendar,
    TrendingUp,
    Filter,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    PiggyBank,
    Flag,
    Wallet,
    Percent,
    Clock,
    Trophy,
    Sparkles,
    ListChecks,
    AlertCircle,
    CheckCircle2,
    CircleDollarSign,
    ArrowUp,
    ArrowDown,
    Search
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
import { Progress } from '@/components/ui/progress';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/dashboard/header';
import { GoalCard } from '@/components/goals/goal-card';
import { CreateGoalDialog } from '@/components/goals/create-goal-dialog';
import { EditGoalDialog } from '@/components/goals/edit-goal-dialog';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { goalService } from '@/api/goals';
import { SavingGoal, DashboardGoalsData } from '@/types/goal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function GoalsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [goals, setGoals] = useState<SavingGoal[]>([]);
    const [dashboardData, setDashboardData] = useState<DashboardGoalsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('priority');
    const [filterPriority, setFilterPriority] = useState('all');

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [goalsData, dashboard] = await Promise.all([
                goalService.getAllGoals(),
                goalService.getDashboardData()
            ]);
            setGoals(goalsData);
            setDashboardData(dashboard);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to fetch goals',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await goalService.deleteGoal(id);
            toast({
                title: 'Success!',
                description: 'Goal has been deleted.',
            });
            fetchData();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete goal',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (goal: SavingGoal) => {
        setSelectedGoal(goal);
        setShowEditDialog(true);
    };

    // Filter and sort goals
    const filteredGoals = goals
        .filter(goal => {
            // Filter by tab
            if (activeTab === 'active') return !goal.isCompleted;
            if (activeTab === 'completed') return goal.isCompleted;
            return true;
        })
        .filter(goal => {
            // Filter by search query
            if (!searchQuery) return true;
            return goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                goal.description?.toLowerCase().includes(searchQuery.toLowerCase());
        })
        .filter(goal => {
            // Filter by priority
            if (filterPriority === 'all') return true;
            return goal.priority === parseInt(filterPriority);
        })
        .sort((a, b) => {
            // Sort
            if (sortBy === 'priority') return a.priority - b.priority;
            if (sortBy === 'progress') return (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount);
            if (sortBy === 'deadline') {
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            }
            if (sortBy === 'amount') return b.targetAmount - a.targetAmount;
            return 0;
        });

    const activeGoalsCount = goals.filter(g => !g.isCompleted).length;
    const completedGoalsCount = goals.filter(g => g.isCompleted).length;
    const totalProgress = dashboardData?.summary.overallProgress || 0;

    const breadcrumb = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Goals', href: '/goals' },
    ];

    return (
        <ProtectedRoute>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <Header
                        title="Saving Goals"
                        subtitle="Track and manage your saving goals"
                    />

                    <Separator />

                    <div className="p-6 space-y-6">
                        {/* Overview Cards with Icons */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium">
                                            Total Goals
                                        </CardTitle>
                                        <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                                            <Flag className="h-4 w-4 text-primary" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {loading ? <Skeleton className="h-8 w-16" /> : goals.length}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                        <p className="text-xs text-muted-foreground">
                                            {completedGoalsCount} completed
                                        </p>
                                    </div>
                                </CardContent>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 to-primary" />
                            </Card>

                            <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium">
                                            Active Goals
                                        </CardTitle>
                                        <div className="p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
                                            <Target className="h-4 w-4 text-blue-500" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {loading ? <Skeleton className="h-8 w-16" /> : activeGoalsCount}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <TrendingUp className="h-3 w-3 text-blue-500" />
                                        <p className="text-xs text-muted-foreground">
                                            Currently in progress
                                        </p>
                                    </div>
                                </CardContent>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/40 to-blue-500" />
                            </Card>

                            <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium">
                                            Total Saved
                                        </CardTitle>
                                        <div className="p-2 bg-green-500/10 rounded-lg group-hover:scale-110 transition-transform">
                                            <Wallet className="h-4 w-4 text-green-500" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {loading ? <Skeleton className="h-8 w-24" /> :
                                            formatCurrency(dashboardData?.summary.totalCurrent || 0)}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <CircleDollarSign className="h-3 w-3 text-green-500" />
                                        <p className="text-xs text-muted-foreground">
                                            of {formatCurrency(dashboardData?.summary.totalTarget || 0)}
                                        </p>
                                    </div>
                                </CardContent>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500/40 to-green-500" />
                            </Card>

                            <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium">
                                            Overall Progress
                                        </CardTitle>
                                        <div className="p-2 bg-purple-500/10 rounded-lg group-hover:scale-110 transition-transform">
                                            <Percent className="h-4 w-4 text-purple-500" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {loading ? <Skeleton className="h-8 w-16" /> :
                                            `${Math.round(totalProgress)}%`}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Sparkles className="h-3 w-3 text-purple-500" />
                                        <p className="text-xs text-muted-foreground">
                                            {dashboardData?.summary.completedGoals || 0} of {goals.length} goals completed
                                        </p>
                                    </div>
                                </CardContent>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/40 to-purple-500" />
                            </Card>
                        </div>

                        {/* Upcoming Goals with Icons */}
                        {dashboardData?.upcomingGoals && dashboardData.upcomingGoals.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="p-1.5 bg-amber-500/10 rounded-lg">
                                            <Calendar className="h-5 w-5 text-amber-500" />
                                        </div>
                                        Upcoming Deadlines
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-2">
                                        <Clock className="h-3 w-3" />
                                        Goals due in the next 30 days
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {dashboardData.upcomingGoals.slice(0, 3).map((goal) => {
                                            const isUrgent = goal.daysRemaining <= 7;
                                            return (
                                                <motion.div
                                                    key={goal.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={cn(
                                                        "flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-all",
                                                        isUrgent && "border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "p-2 rounded-full",
                                                            isUrgent ? "bg-amber-100 dark:bg-amber-900/30" : "bg-muted"
                                                        )}>
                                                            {isUrgent ? (
                                                                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                            ) : (
                                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{goal.title}</p>
                                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                Due in {goal.daysRemaining} days
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant={isUrgent ? "destructive" : "outline"}
                                                        className={cn(
                                                            isUrgent && "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                                                        )}
                                                    >
                                                        {Math.round(goal.progress)}%
                                                    </Badge>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                    {dashboardData.upcomingGoals.length > 3 && (
                                        <div className="flex justify-center mt-4">
                                            <Badge variant="secondary" className="gap-1">
                                                <ListChecks className="h-3 w-3" />
                                                {dashboardData.upcomingGoals.length - 3} more goals upcoming
                                            </Badge>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Main Goals Section */}
                        <Card className="border-t-4 border-t-primary">
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Target className="h-6 w-6 text-primary" />
                                            </div>
                                            Your Goals
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2">
                                            Manage and track your saving goals
                                        </CardDescription>
                                    </div>
                                    <Button
                                        onClick={() => setShowCreateDialog(true)}
                                        className="gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        New Goal
                                    </Button>
                                </div>

                                {/* Filters with Icons */}
                                <div className="flex flex-col md:flex-row gap-4 mt-4">
                                    <Tabs
                                        value={activeTab}
                                        onValueChange={setActiveTab}
                                        className="flex-1"
                                    >
                                        <TabsList className="w-full">
                                            <TabsTrigger value="all" className="flex-1 gap-2">
                                                <ListChecks className="h-4 w-4" />
                                                All Goals
                                            </TabsTrigger>
                                            <TabsTrigger value="active" className="flex-1 gap-2">
                                                <Target className="h-4 w-4" />
                                                Active
                                                {activeGoalsCount > 0 && (
                                                    <Badge variant="secondary" className="ml-2">
                                                        {activeGoalsCount}
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
                                                placeholder="Search goals..."
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
                                                <SelectItem value="progress">Progress</SelectItem>
                                                <SelectItem value="deadline">Deadline</SelectItem>
                                                <SelectItem value="amount">Amount</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={filterPriority} onValueChange={setFilterPriority}>
                                            <SelectTrigger className="w-[140px]">
                                                <Filter className="mr-2 h-4 w-4" />
                                                <SelectValue placeholder="Priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Priorities</SelectItem>
                                                <SelectItem value="1">
                                                    <div className="flex items-center gap-2">
                                                        <ArrowUp className="h-3 w-3 text-red-500" />
                                                        Priority 1
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="2">Priority 2</SelectItem>
                                                <SelectItem value="3">Priority 3</SelectItem>
                                                <SelectItem value="4">Priority 4</SelectItem>
                                                <SelectItem value="5">
                                                    <div className="flex items-center gap-2">
                                                        <ArrowDown className="h-3 w-3 text-green-500" />
                                                        Priority 5
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                {loading ? (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <Card key={i} className="p-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-start gap-4">
                                                        <Skeleton className="h-10 w-10 rounded-lg" />
                                                        <div className="flex-1 space-y-2">
                                                            <Skeleton className="h-5 w-3/4" />
                                                            <Skeleton className="h-4 w-1/2" />
                                                        </div>
                                                    </div>
                                                    <Skeleton className="h-8 w-full" />
                                                    <Skeleton className="h-2 w-full" />
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : filteredGoals.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="rounded-full bg-muted p-4 mb-4">
                                            <Target className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-semibold">No goals found</h3>
                                        <p className="text-sm text-muted-foreground mt-2 mb-6">
                                            {searchQuery || filterPriority !== 'all'
                                                ? "Try adjusting your filters"
                                                : "You haven't created any saving goals yet"}
                                        </p>
                                        {!searchQuery && filterPriority === 'all' && (
                                            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                                                <Plus className="h-4 w-4" />
                                                Create Your First Goal
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <AnimatePresence mode="popLayout">
                                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                {filteredGoals.map((goal) => (
                                                    <GoalCard
                                                        key={goal.id}
                                                        goal={goal}
                                                        onUpdate={fetchData}
                                                        onEdit={() => handleEdit(goal)}
                                                        onDelete={() => handleDelete(goal.id)}
                                                    />
                                                ))}
                                            </div>
                                        </AnimatePresence>

                                        {/* Pagination (if needed) */}
                                        {filteredGoals.length > 9 && (
                                            <div className="flex items-center justify-between mt-6 pt-6 border-t">
                                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <ListChecks className="h-4 w-4" />
                                                    Showing {filteredGoals.length} of {goals.length} goals
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
            <CreateGoalDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSuccess={fetchData}
            />

            <EditGoalDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                goal={selectedGoal}
                onSuccess={fetchData}
            />
        </ProtectedRoute>
    );
}