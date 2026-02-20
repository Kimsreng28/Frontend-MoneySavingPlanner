import {
  AppearanceSettings,
  ExportDataDto,
  NotificationSettings,
  PreferencesSettings,
  PrivacySettings,
  QuietHoursDto,
  SecuritySettings,
  UserSettings,
} from "@/types/settings";
import apiClient from "./api-client";

class SettingsService {
  private baseURL = "/settings";

  async getSettings(): Promise<UserSettings> {
    try {
      const response = await apiClient.get(this.baseURL);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch settings",
      );
    }
  }

  async updateAppearance(
    settings: Partial<AppearanceSettings>,
  ): Promise<AppearanceSettings> {
    try {
      const response = await apiClient.put(
        `${this.baseURL}/appearance`,
        settings,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update appearance settings",
      );
    }
  }

  async updateNotifications(
    settings: Partial<NotificationSettings>,
  ): Promise<NotificationSettings> {
    try {
      const response = await apiClient.put(
        `${this.baseURL}/notifications`,
        settings,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to update notification settings",
      );
    }
  }

  async updatePrivacy(
    settings: Partial<PrivacySettings>,
  ): Promise<PrivacySettings> {
    try {
      const response = await apiClient.put(`${this.baseURL}/privacy`, settings);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update privacy settings",
      );
    }
  }

  async updateSecurity(
    settings: Partial<SecuritySettings>,
  ): Promise<SecuritySettings> {
    try {
      const response = await apiClient.put(
        `${this.baseURL}/security`,
        settings,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update security settings",
      );
    }
  }

  async updatePreferences(
    settings: Partial<PreferencesSettings>,
  ): Promise<PreferencesSettings> {
    try {
      const response = await apiClient.put(
        `${this.baseURL}/preferences`,
        settings,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update preferences",
      );
    }
  }

  async updateQuietHours(dto: QuietHoursDto): Promise<QuietHoursDto> {
    try {
      const response = await apiClient.patch(
        `${this.baseURL}/quiet-hours`,
        dto,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update quiet hours",
      );
    }
  }

  async toggleFavoriteGoal(goalId: string): Promise<string[]> {
    try {
      const response = await apiClient.post(
        `${this.baseURL}/favorite-goals/${goalId}`,
        { goalId },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to toggle favorite goal",
      );
    }
  }

  async togglePinnedTask(taskId: string): Promise<string[]> {
    try {
      const response = await apiClient.post(
        `${this.baseURL}/pinned-tasks/${taskId}`,
        { taskId },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to toggle pinned task",
      );
    }
  }

  async resetToDefaults(): Promise<UserSettings> {
    try {
      const response = await apiClient.post(`${this.baseURL}/reset`, {});
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to reset settings",
      );
    }
  }

  async exportData(dto: ExportDataDto): Promise<Blob> {
    try {
      const response = await apiClient.post(`${this.baseURL}/export`, dto, {
        responseType: "blob",
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to export data");
    }
  }

  async deleteAccount(password: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseURL}/account`, { data: { password } });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete account",
      );
    }
  }
}

export const settingsService = new SettingsService();
