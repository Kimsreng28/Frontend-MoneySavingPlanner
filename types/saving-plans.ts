export type SavingFrequency =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "YEARLY"
  | "CUSTOM"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "custom";

export interface SavingPlan {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate?: string;
  frequency: SavingFrequency;
  amountPerPeriod: number;
  isActive: boolean;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  category?: string;
  color?: string;
}

export interface DashboardData {
  summary: {
    totalPlans: number;
    activePlans: number;
    completedPlans: number;
    totalTarget: number;
    totalCurrent: number;
    overallProgress: number;
  };
  plans: Array<{
    id: string;
    name: string;
    currentAmount: number;
    targetAmount: number;
    progress: number;
    frequency: string;
    isActive: boolean;
    isCompleted: boolean;
    startDate: string;
    endDate?: string;
  }>;
}

export interface CreatePlanDto {
  name: string;
  description?: string;
  targetAmount: number;
  startDate: string;
  frequency: SavingFrequency;
  amountPerPeriod: number;
  category?: string;
  color?: string;
}

export interface UpdatePlanDto {
  name?: string;
  description?: string;
  targetAmount?: number;
  startDate?: string;
  endDate?: string;
  frequency?: SavingFrequency;
  amountPerPeriod?: number;
  isActive?: boolean;
  isCompleted?: boolean;
  category?: string;
  color?: string;
}
