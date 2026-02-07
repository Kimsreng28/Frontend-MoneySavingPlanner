import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    username: string;
  };
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

class AuthService {
  private baseURL = API_BASE_URL;

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/auth/login`,
        credentials,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Login failed");
      }
      throw error;
    }
  }

  async signup(credentials: SignupCredentials): Promise<User> {
    try {
      const response = await axios.post(`${this.baseURL}/users`, credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Signup failed");
      }
      throw error;
    }
  }

  async refreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/auth/refresh`, {
        userId,
        refreshToken,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Token refresh failed",
        );
      }
      throw error;
    }
  }

  async logout(userId: string): Promise<{ message: string }> {
    try {
      const response = await axios.post(
        `${this.baseURL}/auth/logout`,
        {},
        {
          headers: this.getAuthHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Logout failed");
      }
      throw error;
    }
  }

  async getProfile(): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}/auth/profile`,
        {},
        {
          headers: this.getAuthHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to get profile",
        );
      }
      throw error;
    }
  }

  private getAuthHeaders() {
    const token = localStorage.getItem("access_token");
    return {
      Authorization: `Bearer ${token}`,
    };
  }
}

export const authService = new AuthService();
