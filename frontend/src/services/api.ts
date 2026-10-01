import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Auto-refresh token on 401 Unauthorized ONLY if we have a real refresh token and not in demo mode
    if (error.response?.status === 401 && !originalRequest._retry) {
      const storedAccessToken = localStorage.getItem('access_token');
      const storedRefreshToken = localStorage.getItem('refresh_token');

      // Standalone demo tokens or absence of refresh token should NEVER trigger hard redirects to /login
      if (!storedRefreshToken || storedAccessToken?.startsWith('wifim_demo_jwt_')) {
        return Promise.reject(error.response?.data || error.message);
      }

      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post<{ data?: { accessToken?: string }; accessToken?: string }>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken: storedRefreshToken },
          { withCredentials: true }
        );
        const refreshData = refreshResponse.data?.data || refreshResponse.data;
        const newToken = refreshData?.accessToken;

        if (newToken) {
          localStorage.setItem('access_token', newToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails on a real enterprise token, clear session and redirect only if not already on /login
        if (window.location.pathname !== '/login') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('auth_user');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error.response?.data || error.message);
  }
);

export default apiClient;
