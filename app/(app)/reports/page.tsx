'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Download,
    Calendar as CalendarIcon,
    PieChart,
    TrendingUp,
    Target,
    CheckSquare,
    FileText,
    RefreshCw,
    Loader2
} from 'lucide-react';
import { format, subDays } from 'date-fns';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/dashboard/header';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { FinancialSummaryCard } from '@/components/reports/financial-summary-card';
import { GoalProgressTable } from '@/components/reports/goal-progress-table';
import { TaskCompletionChart } from '@/components/reports/task-completion-chart';
import { PlanPerformanceCard } from '@/components/reports/plan-performance-card';
import { RecommendationsCard } from '@/components/reports/recommendations-card';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { reportService } from '@/api/reports';
import { ReportData, ReportPeriod, ReportType } from '@/types/report';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { format as formatDate } from 'date-fns';

export default function ReportsPage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [period, setPeriod] = useState<ReportPeriod>('month');
    const [reportType, setReportType] = useState<ReportType>('all');
    const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | undefined>();
    const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);

    useEffect(() => {
        if (user) {
            generateReport();
        }
    }, [user, period, reportType]);

    const generateReport = async () => {
        setLoading(true);
        try {
            const data = await reportService.generateReport(
                period,
                reportType,
                customRange ? { startDate: customRange.from, endDate: customRange.to } : undefined
            );
            setReportData(data);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to generate report',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
        try {
            toast({
                title: 'Export Started',
                description: `Exporting report as ${format.toUpperCase()}...`,
            });

            const blob = await reportService.exportReport(period, format);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            const dateStr = formatDate(new Date(), 'yyyy-MM-dd');
            a.download = `savings-report-${dateStr}.${format}`;
            a.click();

            toast({
                title: 'Export Complete',
                description: `Report exported as ${format.toUpperCase()}`,
            });
        } catch (error: any) {
            toast({
                title: 'Export Failed',
                description: error.message || 'Failed to export report',
                variant: 'destructive',
            });
        }
    };

    const handleCustomDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
        if (range?.from && range?.to) {
            setCustomRange({ from: range.from, to: range.to });
            setIsCustomDateOpen(false);
            setPeriod('custom');
        }
    };

    const breadcrumb = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Reports', href: '/reports' },
    ];

    return (
        <ProtectedRoute>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <Header
                        title="Reports & Analytics"
                        subtitle="Comprehensive insights into your savings journey"
                    />
                    <Separator />

                    <div className="p-6 space-y-6">
                        {/* Report Controls */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <Tabs value={period} onValueChange={(v) => setPeriod(v as ReportPeriod)}>
                                    <TabsList>
                                        <TabsTrigger value="week">Week</TabsTrigger>
                                        <TabsTrigger value="month">Month</TabsTrigger>
                                        <TabsTrigger value="quarter">Quarter</TabsTrigger>
                                        <TabsTrigger value="year">Year</TabsTrigger>
                                        <Popover open={isCustomDateOpen} onOpenChange={setIsCustomDateOpen}>
                                            <PopoverTrigger asChild>
                                                <TabsTrigger
                                                    value="custom"
                                                    className={cn(period === 'custom' && 'bg-primary text-primary-foreground')}
                                                >
                                                    <CalendarIcon className="h-4 w-4 mr-2" />
                                                    Custom
                                                </TabsTrigger>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="range"
                                                    selected={customRange}
                                                    onSelect={handleCustomDateSelect}
                                                    numberOfMonths={2}
                                                    defaultMonth={new Date()}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </TabsList>
                                </Tabs>

                                <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                                    <SelectTrigger className="w-[180px]">
                                        <FileText className="mr-2 h-4 w-4" />
                                        <SelectValue placeholder="Report Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Reports</SelectItem>
                                        <SelectItem value="financial">Financial</SelectItem>
                                        <SelectItem value="goals">Goals</SelectItem>
                                        <SelectItem value="plans">Plans</SelectItem>
                                        <SelectItem value="tasks">Tasks</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={generateReport}
                                    disabled={loading}
                                >
                                    <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
                                    Refresh
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport('pdf')}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export PDF
                                </Button>
                            </div>
                        </div>

                        {/* Report Content */}
                        {loading ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <Skeleton key={i} className="h-32 w-full" />
                                    ))}
                                </div>
                                <Skeleton className="h-64 w-full" />
                                <Skeleton className="h-96 w-full" />
                            </div>
                        ) : reportData ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <FinancialSummaryCard financial={reportData.summary.financial} />

                                    <div className="grid grid-cols-2 gap-4 lg:col-span-3">
                                        <Card className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Goals</p>
                                                    <p className="text-2xl font-bold">
                                                        {reportData.summary.goals.completed}/{reportData.summary.goals.total}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {reportData.summary.goals.onTrack} on track
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>

                                        <Card className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                                    <CheckSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Tasks</p>
                                                    <p className="text-2xl font-bold">
                                                        {reportData.summary.tasks.completionRate}%
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {reportData.summary.tasks.completed} completed
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>

                                        <Card className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                                    <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Plans</p>
                                                    <p className="text-2xl font-bold">
                                                        {reportData.summary.plans.onTrack}/{reportData.summary.plans.active}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        on track
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>

                                        <Card className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                                    <PieChart className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Net Savings</p>
                                                    <p className="text-2xl font-bold">
                                                        {formatCurrency(reportData.summary.financial.netSavings)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        avg {formatCurrency(reportData.summary.financial.averageMonthlySavings)}/mo
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                </div>

                                {/* Recommendations */}
                                <RecommendationsCard recommendations={reportData.recommendations} />

                                {/* Charts and Tables */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2">
                                        <TaskCompletionChart data={reportData.taskCompletion} />
                                    </div>
                                    <div>
                                        <PlanPerformanceCard plans={reportData.planPerformance} />
                                    </div>
                                </div>

                                {/* Goals Progress Table */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <Target className="h-5 w-5" />
                                            Goal Progress Report
                                        </h3>
                                        <Badge variant="outline">
                                            {reportData.goalProgress.filter(g => g.status === 'on_track').length} on track
                                        </Badge>
                                    </div>
                                    <GoalProgressTable goals={reportData.goalProgress} />
                                </div>
                            </motion.div>
                        ) : null}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </ProtectedRoute>
    );
}