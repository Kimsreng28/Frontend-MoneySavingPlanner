import {
  ChecklistTask,
  CreateTaskDto,
  TaskStat,
  UpdateTaskDto,
} from "@/types/task";
import apiClient from "./api-client";

class TaskService {
  private baseURL = "/checklist";

  async getAllTasks(): Promise<ChecklistTask[]> {
    try {
      const response = await apiClient.get(this.baseURL);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch tasks");
    }
  }

  async getTodayTasks(): Promise<ChecklistTask[]> {
    try {
      const response = await apiClient.get(`${this.baseURL}/today`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch today's tasks",
      );
    }
  }

  async getTaskStats(): Promise<TaskStat> {
    try {
      const response = await apiClient.get(`${this.baseURL}/stats`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch task stats",
      );
    }
  }

  async getTask(id: string): Promise<ChecklistTask> {
    try {
      const response = await apiClient.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch task");
    }
  }

  async createTask(data: CreateTaskDto): Promise<ChecklistTask> {
    try {
      const response = await apiClient.post(this.baseURL, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to create task");
    }
  }

  async updateTask(id: string, data: UpdateTaskDto): Promise<ChecklistTask> {
    try {
      const response = await apiClient.patch(`${this.baseURL}/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update task");
    }
  }

  async completeTask(id: string): Promise<ChecklistTask> {
    try {
      const response = await apiClient.patch(`${this.baseURL}/${id}/complete`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to complete task",
      );
    }
  }

  async uncompleteTask(id: string): Promise<ChecklistTask> {
    try {
      const response = await apiClient.patch(
        `${this.baseURL}/${id}/uncomplete`,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to uncomplete task",
      );
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseURL}/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to delete task");
    }
  }

  async reorderTasks(taskIds: string[]): Promise<ChecklistTask[]> {
    try {
      const response = await apiClient.post(`${this.baseURL}/reorder`, {
        taskIds,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to reorder tasks",
      );
    }
  }
}

export const taskService = new TaskService();
