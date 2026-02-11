export enum NotificationType {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
  GOAL_ACHIEVED = "goal_achieved",
  PLAN_COMPLETED = "plan_completed",
  TASK_REMINDER = "task_reminder",
  SAVING_MILESTONE = "saving_milestone",
  SYSTEM = "system",
}

export enum NotificationChannel {
  IN_APP = "in_app",
  EMAIL = "email",
  PUSH = "push",
  BOTH = "both",
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  channel: NotificationChannel;
  isRead: boolean;
  isSent: boolean;
  metadata?: Record<string, any>;
  readAt: string | null;
  createdAt: string;
  userId: string;
}

export interface NotificationFilters {
  isRead?: boolean;
  type?: string;
  channel?: string;
  page?: number;
  limit?: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
}

export interface NotificationStats {
  summary: {
    totalCount: number;
    unreadCount: number;
    readCount: number;
  };
  byType: Record<string, number>;
  byChannel: Record<string, number>;
  recent: Array<{
    id: string;
    title: string;
    type: string;
    isRead: boolean;
    createdAt: string;
  }>;
}
