import {
  DateRange,
  ExportFormat,
  ReportData,
  ReportPeriod,
  ReportType,
} from "@/types/report";
import apiClient from "./api-client";

class ReportService {
  private baseURL = "/reports";

  async generateReport(
    period: ReportPeriod = "month",
    type: ReportType = "all",
    customRange?: DateRange,
  ): Promise<ReportData> {
    try {
      let url = `${this.baseURL}?period=${period}&type=${type}`;

      if (customRange) {
        url += `&startDate=${customRange.startDate.toISOString()}&endDate=${customRange.endDate.toISOString()}`;
      }

      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to generate report",
      );
    }
  }

  async exportReport(
    period: ReportPeriod = "month",
    format: ExportFormat = "pdf",
  ): Promise<Blob> {
    try {
      const response = await apiClient.get(
        `${this.baseURL}/export?period=${period}&format=${format}`,
        { responseType: "blob" },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to export report",
      );
    }
  }
}

export const reportService = new ReportService();
