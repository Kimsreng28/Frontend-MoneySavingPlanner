export enum TaskFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  ONE_TIME = "one_time",
}

export interface ChecklistTask {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate: Date;
  frequency: TaskFrequency;
  completedAt: Date | null;
  priority: number;
  isRecurring: boolean;
  planId: string | null;
  plan?: {
    id: string;
    name: string;
  } | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  dueDate: Date;
  frequency?: TaskFrequency;
  priority?: number;
  isRecurring?: boolean;
  planId?: string | null;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  dueDate?: Date;
  frequency?: TaskFrequency;
  priority?: number;
  isCompleted?: boolean;
  isRecurring?: boolean;
  planId?: string | null;
}

export interface TaskStat {
  summary: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    todayTasks: number;
    completionRate: number;
  };
  byFrequency: Record<string, number>;
  recentTasks: Array<{
    id: string;
    title: string;
    isCompleted: boolean;
    dueDate: Date;
    frequency: TaskFrequency;
  }>;
}
