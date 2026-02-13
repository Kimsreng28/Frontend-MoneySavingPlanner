import {
  CalendarEvent,
  CalendarFilters,
  DayEvents,
  MonthData,
  QuickAddEventDto,
  UpdateEventStatusDto,
} from "@/types/calendar";
import apiClient from "./api-client";

class CalendarService {
  private baseURL = "/calendar";

  async getMonthData(
    year: number,
    month: number,
    filters?: CalendarFilters,
  ): Promise<MonthData> {
    try {
      let url = `${this.baseURL}/month/${year}/${month}`;

      if (filters) {
        const params = new URLSearchParams();
        if (filters.types) params.append("types", filters.types.join(","));
        if (filters.status) params.append("status", filters.status.join(","));
        url += `?${params.toString()}`;
      }

      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch calendar data",
      );
    }
  }

  async getDayEvents(
    date: Date,
    filters?: CalendarFilters,
  ): Promise<DayEvents> {
    try {
      let url = `${this.baseURL}/day?date=${date.toISOString()}`;

      if (filters) {
        const params = new URLSearchParams();
        if (filters.types) params.append("types", filters.types.join(","));
        if (filters.status) params.append("status", filters.status.join(","));
        url += `&${params.toString()}`;
      }

      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch day events",
      );
    }
  }

  async quickAddEvent(dto: QuickAddEventDto): Promise<CalendarEvent> {
    try {
      const response = await apiClient.post(`${this.baseURL}/quick-add`, dto);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to add event");
    }
  }

  async updateEventStatus(dto: UpdateEventStatusDto): Promise<CalendarEvent> {
    try {
      const response = await apiClient.patch(
        `${this.baseURL}/update-status`,
        dto,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update event status",
      );
    }
  }
}

export const calendarService = new CalendarService();
