import {
  CreateGoalDto,
  DashboardGoalsData,
  GoalProgress,
  SavingGoal,
  UpdateGoalDto,
} from "@/types/goal";
import apiClient from "./api-client";

class GoalService {
  private baseURL = "/goals";

  async getAllGoals(): Promise<SavingGoal[]> {
    try {
      const response = await apiClient.get(this.baseURL);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch goals");
    }
  }

  async getDashboardData(): Promise<DashboardGoalsData> {
    try {
      const response = await apiClient.get(`${this.baseURL}/dashboard`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch dashboard data",
      );
    }
  }

  async getGoal(id: string): Promise<SavingGoal> {
    try {
      const response = await apiClient.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch goal");
    }
  }

  async getGoalProgress(id: string): Promise<GoalProgress> {
    try {
      const response = await apiClient.get(`${this.baseURL}/${id}/progress`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch goal progress",
      );
    }
  }

  async createGoal(data: CreateGoalDto): Promise<SavingGoal> {
    try {
      const response = await apiClient.post(this.baseURL, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to create goal");
    }
  }

  async updateGoal(id: string, data: UpdateGoalDto): Promise<SavingGoal> {
    try {
      const response = await apiClient.patch(`${this.baseURL}/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update goal");
    }
  }

  async addAmount(id: string, amount: number): Promise<SavingGoal> {
    try {
      const response = await apiClient.patch(
        `${this.baseURL}/${id}/add-amount`,
        { amount },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to add amount");
    }
  }

  async withdrawAmount(id: string, amount: number): Promise<SavingGoal> {
    try {
      const response = await apiClient.patch(
        `${this.baseURL}/${id}/withdraw-amount`,
        { amount },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to withdraw amount",
      );
    }
  }

  async deleteGoal(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseURL}/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to delete goal");
    }
  }

  async reorderGoals(goalIds: string[]): Promise<SavingGoal[]> {
    try {
      const response = await apiClient.post(`${this.baseURL}/reorder`, {
        goalIds,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to reorder goals",
      );
    }
  }
}

export const goalService = new GoalService();
