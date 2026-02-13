export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: "task" | "goal" | "plan" | "transaction" | "milestone" | "reminder";
  date: Date;
  endDate?: Date;
  status: "pending" | "completed" | "overdue" | "upcoming";
  priority?: number;
  amount?: number;
  progress?: number;
  color?: string;
  icon?: string;
  metadata?: Record<string, any>;
  actionable: boolean;
  relatedId?: string;
}

export interface DayEvents {
  date: string;
  events: CalendarEvent[];
  summary: {
    total: number;
    tasks: number;
    goals: number;
    plans: number;
    transactions: number;
    completed: number;
    pending: number;
    totalAmount?: number;
  };
}

export interface MonthData {
  year: number;
  month: number;
  days: DayEvents[];
  summary: {
    totalEvents: number;
    completedEvents: number;
    pendingEvents: number;
    totalSaved: number;
    totalSpent: number;
    activeGoals: number;
    activePlans: number;
    pendingTasks: number;
  };
}

export interface CalendarFilters {
  types?: (
    | "task"
    | "goal"
    | "plan"
    | "transaction"
    | "milestone"
    | "reminder"
  )[];
  status?: ("pending" | "completed" | "overdue" | "upcoming")[];
  startDate?: Date;
  endDate?: Date;
}

export interface QuickAddEventDto {
  title: string;
  description?: string;
  type: "task" | "goal" | "plan" | "reminder";
  date: Date;
  endDate?: Date;
  priority?: number;
  amount?: number;
  relatedId?: string;
}

export interface UpdateEventStatusDto {
  eventId: string;
  type: "task" | "goal" | "plan" | "transaction";
  status: "completed" | "pending" | "cancelled";
  metadata?: Record<string, any>;
}
