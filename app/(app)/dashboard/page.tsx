import { AppSidebar } from "@/components/app-sidebar";
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
  return (
    <SidebarProvider>
      {/* Logo Enterprise */}
      <AppSidebar />

      {/* Main Content */}
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Search Function */}

          {/* Theme Toggle */}

          {/* Notification */}

          {/* User Profile */}
        </header>

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
