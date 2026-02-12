import apiClient from "@/api/api-client";

export interface DashboardSummary {
  financial: {
    totalSaved: number;
    totalTarget: number;
    monthlyContribution: number;
    monthlyChange: number;
    streak: {
      current: number;
      best: number;
    };
  };
  goals: {
    total: number;
    completed: number;
    active: number;
    upcomingDeadlines: number;
    overallProgress: number;
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
    todayDue: number;
    overdue: number;
    completionRate: number;
  };
  notifications: {
    unread: number;
  };
}

export interface UpcomingItem {
  id: string;
  title: string;
  type: "goal" | "task" | "plan";
  dueDate: Date;
  amount?: number;
  progress?: number;
  priority?: number;
}

export interface RecentActivityTime {
  id: string;
  type:
    | "goal_completed"
    | "task_completed"
    | "plan_created"
    | "amount_added"
    | "milestone_reached";
  title: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface DashboardData {
  summary: DashboardSummary;
  upcomingItems: UpcomingItem[];
  recentActivities: RecentActivityTime[];
  charts: {
    savingsGrowth: Array<{
      month: string;
      amount: number;
    }>;
    goalsProgress: Array<{
      id: string;
      name: string;
      progress: number;
      target: number;
      current: number;
    }>;
    tasksByPriority: Array<{
      priority: number;
      count: number;
    }>;
  };
}

class DashboardService {
  private baseURL = "/dashboard";

  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await apiClient.get(this.baseURL);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch dashboard data",
      );
    }
  }
}

export const dashboardService = new DashboardService();
