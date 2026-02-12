'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/dashboard/header';
import { QuickActions } from '@/components/dashboard/quickAction';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { UpcomingItems } from '@/components/dashboard/upcoming-items';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { ProgressCharts } from '@/components/dashboard/progress-charts';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { dashboardService, DashboardData } from '@/types/dashboard';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const dashboardData = await dashboardService.getDashboardData();
      setData(dashboardData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleAddSaving = () => {
    // Navigate to goals page with dialog open? or just navigate
    router.push('/goals');
  };

  const handleNewPlan = () => {
    router.push('/saving-plans');
  };

  const handleSchedule = () => {
    router.push('/tasks');
  };

  const handleViewReports = () => {
    router.push('/reports');
  };

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header
            title={greeting()}
            subtitle={user?.username ? `Welcome back, ${user.username}!` : 'Here\'s your savings overview'}
          />
          <Separator />

          <div className="p-6 space-y-6">
            {/* Quick Actions */}
            <QuickActions
              onAddSaving={handleAddSaving}
              onNewPlan={handleNewPlan}
              onSchedule={handleSchedule}
              onViewReports={handleViewReports}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-24 w-full" />
                  </div>
                ))
              ) : (
                data && <StatsCards summary={data.summary} />
              )}
            </div>

            {/* Upcoming Items & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {loading ? (
                <>
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-64 w-full" />
                </>
              ) : (
                <>
                  {data && <UpcomingItems items={data.upcomingItems} />}
                  {data && <RecentActivity activities={data.recentActivities} />}
                </>
              )}
            </div>

            {/* Charts & Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {loading ? (
                <>
                  <Skeleton className="h-80 w-full" />
                  <Skeleton className="h-80 w-full lg:col-span-2" />
                  <Skeleton className="h-64 w-full" />
                </>
              ) : (
                data && <ProgressCharts data={data} />
              )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}