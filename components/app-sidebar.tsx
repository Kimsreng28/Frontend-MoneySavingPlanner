"use client";

import * as React from "react";
import {
  Bell,
  Command,
  Goal,
  LayoutDashboard,
  Settings2,
  SquareCheckBig,
  TrendingUp,
  Wallet,
  Target,
  PieChart,
  Calendar,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { dashboardService } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const [totalSaved, setTotalSaved] = React.useState<number | null>(null);
  const [monthlyChange, setMonthlyChange] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const data = await dashboardService.getDashboardData();
        setTotalSaved(data.summary.financial.totalSaved);
        setMonthlyChange(data.summary.financial.monthlyChange);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Fallback to 0 if API fails
        setTotalSaved(0);
        setMonthlyChange(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [],
    },
    {
      title: "Saving Plans",
      url: "/saving-plans",
      icon: Goal,
      items: [],
    },
    {
      title: "Goals",
      url: "/goals",
      icon: Target,
      items: [],
    },
    {
      title: "Tasks",
      url: "/tasks",
      icon: SquareCheckBig,
      items: [],
    },
    {
      title: "Reports",
      url: "/reports",
      icon: TrendingUp,
      items: [],
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: Calendar,
      items: [],
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: Bell,
      items: [],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [],
    },
  ];

  // If no user is logged in, don't render the sidebar
  if (!user) {
    return null;
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">SaveWise</span>
                  <span className="truncate text-xs">Smart Savings</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Main Navigation Platform */}
        <NavMain items={navMain} />

        {/* Quick Stats Section with Real Data */}
        <div className="px-4 py-3">
          <div className="rounded-lg bg-sidebar-accent p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Wallet className="h-4 w-4" />
              <span>Total Saved</span>
            </div>
            <div className="mt-2 text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-24 bg-sidebar-accent-foreground/10" />
              ) : (
                formatCurrency(totalSaved || 0)
              )}
            </div>
            <div className="mt-1 text-xs text-sidebar-accent-foreground/70">
              {isLoading ? (
                <Skeleton className="h-4 w-20 bg-sidebar-accent-foreground/10" />
              ) : (
                <>
                  {monthlyChange && monthlyChange > 0 ? '+' : ''}
                  {monthlyChange}% from last month
                </>
              )}
            </div>
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}