export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface SavingsTrend {
  date: string;
  amount: number;
  cumulative: number;
  type: "saved" | "withdrawn" | "interest";
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color?: string;
}

export interface GoalProgressReport {
  goalId: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  deadline?: Date;
  daysRemaining?: number;
  status: "on_track" | "behind" | "completed" | "overdue";
  monthlyContribution: number;
  projectedCompletionDate?: Date;
}

export interface TaskCompletionReport {
  period: string;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
}

export interface PlanPerformanceReport {
  planId: string;
  planName: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  expectedProgress: number;
  variance: number;
  isOnTrack: boolean;
  amountPerPeriod: number;
  frequency: string;
}

export interface FinancialSummary {
  totalSaved: number;
  totalTarget: number;
  totalWithdrawn: number;
  netSavings: number;
  averageMonthlySavings: number;
  bestMonth: {
    month: string;
    amount: number;
  };
  worstMonth: {
    month: string;
    amount: number;
  };
}

export interface ReportSummary {
  financial: FinancialSummary;
  goals: {
    total: number;
    completed: number;
    active: number;
    onTrack: number;
    behind: number;
    overdue: number;
  };
  tasks: {
    total: number;
    completed: number;
    completionRate: number;
    averagePerDay: number;
  };
  plans: {
    total: number;
    active: number;
    completed: number;
    onTrack: number;
  };
}

export interface ReportData {
  summary: ReportSummary;
  savingsTrends: SavingsTrend[];
  categoryBreakdown: CategoryBreakdown[];
  goalProgress: GoalProgressReport[];
  taskCompletion: TaskCompletionReport[];
  planPerformance: PlanPerformanceReport[];
  recommendations: string[];
}

export type ReportPeriod = "week" | "month" | "quarter" | "year" | "custom";
export type ReportType = "all" | "goals" | "tasks" | "plans" | "financial";
export type ExportFormat = "pdf" | "csv" | "excel";

export interface ReportFilter {
  period: ReportPeriod;
  type: ReportType;
  customRange?: DateRange;
}
