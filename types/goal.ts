export interface SavingGoal {
  id: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  priority: number;
  isCompleted: boolean;
  iconUrl?: string;
  colorCode?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
}

export interface CreateGoalDto {
  title: string;
  description?: string;
  targetAmount: number;
  deadline?: Date;
  priority?: number;
  iconUrl?: string;
  colorCode?: string;
}

export interface UpdateGoalDto {
  title?: string;
  description?: string;
  targetAmount?: number;
  deadline?: Date;
  priority?: number;
  isCompleted?: boolean;
  iconUrl?: string;
  colorCode?: string;
}

export interface GoalProgress {
  percentage: number;
  currentAmount: number;
  targetAmount: number;
  remainingAmount: number;
  daysRemaining: number | null;
  isOnTrack: boolean;
}

export interface DashboardGoalsData {
  summary: {
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    totalTarget: number;
    totalCurrent: number;
    overallProgress: number;
  };
  upcomingGoals: Array<{
    id: string;
    title: string;
    deadline: Date;
    targetAmount: number;
    currentAmount: number;
    progress: number;
    daysRemaining: number;
  }>;
  goals: Array<{
    id: string;
    title: string;
    currentAmount: number;
    targetAmount: number;
    progress: number;
    priority: number;
    isCompleted: boolean;
    deadline?: Date;
    iconUrl?: string;
    colorCode?: string;
  }>;
}
