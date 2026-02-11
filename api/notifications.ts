import {
  Notification,
  NotificationFilters,
  NotificationsResponse,
  NotificationStats,
} from "@/types/notification";
import apiClient from "./api-client";

class NotificationService {
  private baseURL = "/notifications";

  async getNotifications(
    filters?: NotificationFilters,
  ): Promise<NotificationsResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.isRead !== undefined)
        params.append("isRead", String(filters.isRead));
      if (filters?.type) params.append("type", filters.type);
      if (filters?.channel) params.append("channel", filters.channel);
      if (filters?.page) params.append("page", String(filters.page));
      if (filters?.limit) params.append("limit", String(filters.limit));

      const response = await apiClient.get(
        `${this.baseURL}?${params.toString()}`,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch notifications",
      );
    }
  }

  async getUnreadCount(): Promise<{ count: number }> {
    try {
      const response = await apiClient.get(`${this.baseURL}/unread/count`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch unread count",
      );
    }
  }

  async getNotificationStats(): Promise<NotificationStats> {
    try {
      const response = await apiClient.get(`${this.baseURL}/stats`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch notification stats",
      );
    }
  }

  async getNotification(id: string): Promise<Notification> {
    try {
      const response = await apiClient.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch notification",
      );
    }
  }

  async markAsRead(
    notificationIds?: string[],
  ): Promise<{ success: boolean; count: number }> {
    try {
      const response = await apiClient.patch(`${this.baseURL}/mark-as-read`, {
        notificationIds,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to mark as read",
      );
    }
  }

  async markAllAsRead(): Promise<{ success: boolean; count: number }> {
    try {
      const response = await apiClient.patch(
        `${this.baseURL}/mark-all-as-read`,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to mark all as read",
      );
    }
  }

  async deleteNotification(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseURL}/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete notification",
      );
    }
  }

  async deleteAllRead(): Promise<{ success: boolean; count: number }> {
    try {
      const response = await apiClient.delete(`${this.baseURL}/read`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete read notifications",
      );
    }
  }
}

export const notificationService = new NotificationService();
