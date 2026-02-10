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
    isVerified: boolean;
  };
  message?: string;
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
  isVerified: boolean;
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

  async signup(
    credentials: SignupCredentials,
  ): Promise<{ message: string; user: any }> {
    try {
      const response = await axios.post(
        `${this.baseURL}/auth/signup`,
        credentials,
      );
      return response.data;
    } catch (error: any) {
      // More specific error handling
      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          "Signup failed";
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error(
          "No response from server. Please check your connection.",
        );
      } else {
        throw new Error("Error setting up signup request.");
      }
    }
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const response = await axios.get(
        `${this.baseURL}/auth/verify-email/${token}`,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Email verification failed",
      );
    }
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    try {
      const response = await axios.post(
        `${this.baseURL}/auth/resend-verification`,
        { email },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to resend verification email",
      );
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await axios.post(
        `${this.baseURL}/auth/forgot-password`,
        { email },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to send password reset email",
      );
    }
  }

  async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<{ message: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/auth/reset-password`, {
        token,
        newPassword,
        confirmPassword,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to reset password",
      );
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
