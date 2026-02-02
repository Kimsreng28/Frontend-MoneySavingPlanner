import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function to get token from localStorage or cookies
const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;

  // Get from localStorage first
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      // Check if token is in user object or separate
      if (user.accessToken) return user.accessToken;
    }

    // Direct localStorage access
    const token = localStorage.getItem("access_token");
    if (token) return token;

    // Auth tokens
    const authTokens = localStorage.getItem("auth_tokens");
    if (authTokens) {
      const tokens = JSON.parse(authTokens);
      return tokens.accessToken;
    }
  } catch (error) {
    console.error("Error retrieving token:", error);
  }

  return null;
};

// Helper function to get avatar URL
export const getAvatarUrl = (userId: string): string => {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  // Get the token from localStorage
  const getAccessToken = (): string | null => {
    if (typeof window === "undefined") return null;

    try {
      const token = localStorage.getItem("access_token");
      if (token) return token;

      // Try to get from user object
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.accessToken) return user.accessToken;
      }
    } catch (error) {
      console.error("Error retrieving token:", error);
    }

    return null;
  };

  const token = getAccessToken();

  if (token) {
    return `${API_BASE_URL}/users/avatar/${userId}`;
  }

  return `${API_BASE_URL}/users/avatar/${userId}`;
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Skip adding token for auth endpoints
    const isAuthEndpoint =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/signup") ||
      config.url?.includes("/auth/refresh") ||
      (config.url?.includes("/users") &&
        config.method === "post" &&
        !config.url.includes("/users/avatar"));

    if (!isAuthEndpoint) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors and avoid infinite retry loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const userId = localStorage.getItem("user_id");

        if (refreshToken && userId) {
          // Call refresh token endpoint without Authorization header
          const refreshConfig = {
            headers: {
              "Content-Type": "application/json",
            },
          };

          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { userId, refreshToken },
            refreshConfig,
          );

          const { accessToken } = response.data;

          // Update localStorage
          localStorage.setItem("access_token", accessToken);

          // Update cookie
          const date = new Date();
          date.setTime(date.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day
          const expires = `expires=${date.toUTCString()}`;
          document.cookie = `access_token=${accessToken}; ${expires}; path=/; SameSite=Lax`;

          // Update the failed request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Refresh failed - clear storage
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_id");
        localStorage.removeItem("user");

        // Clear cookies
        document.cookie =
          "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Redirect to login
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
