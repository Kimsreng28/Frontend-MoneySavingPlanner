import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/dashboard/header";
import { QuickActions } from "@/components/dashboard/quickAction";
import { StatsCard } from "@/components/dashboard/statCard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  ArrowUpRight,
  Calendar,
  Flame,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";

export default function Page() {
  // Greeting
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <SidebarProvider>
      {/* Logo Enterprise */}
      <AppSidebar />

      {/* Main Content */}
      <SidebarInset>
        {/* Header */}
        <Header
          title={`${greeting()}, KIM!`}
          subtitle="Here's your savings overview for today"
        />

        <Separator />

        {/* Button Quick Actions */}
        <div className="gap-2 p-4">
          <QuickActions onAddSaving={() => {}} onNewPlan={() => {}} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch p-4">
          {/* Stats Cards */}
          <StatsCard
            title="Total Saved"
            value="$1,234"
            subtitle="Across all plans"
            icon={Wallet}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Active Plans"
            value="2"
            subtitle="In progress"
            icon={Target}
          />
          <StatsCard
            title="Current Streak"
            value="5"
            subtitle="Best: 28 days"
            icon={Flame}
            variant="accent"
          />
          <StatsCard
            title="This Month"
            value="$1,234"
            subtitle="+$130 vs last month"
            icon={TrendingUp}
            trend={{ value: 18, isPositive: true }}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 items-stretch p-4">
          {/* Overall Progress */}
          <div className="card-elevated bg-muted/50 rounded-xl flex flex-col h-full min-h-[300px]">
            <div className="flex items-center justify-between p-4 mb-4">
              <h3 className="font-display font-semibold text-lg text-foreground">
                Overall Progress
              </h3>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            {/* Content */}
            <div className="flex-1 p-4"></div>
          </div>

          {/* Savings Chart */}
          <div className="lg:col-span-2 bg-muted/50 rounded-xl flex flex-col h-full min-h-[300px]">
            <div className="flex items-center justify-between p-4 mb-4">
              <h3 className="font-display font-semibold text-lg text-foreground">
                Savings Growth
              </h3>
            </div>
            {/* Content */}
            <div className="flex-1 p-4"></div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
