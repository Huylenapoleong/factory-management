import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { message } from '@/utils/antdApp';

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
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Auto-refresh token on 401 Unauthorized ONLY if we have a valid refresh token stored
    if (error.response?.status === 401 && !originalRequest._retry) {
      const storedRefreshToken = localStorage.getItem('refresh_token');

      if (!storedRefreshToken) {
        return Promise.reject(error.response?.data || error.message);
      }

      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post<{
          data?: { accessToken?: string };
          accessToken?: string;
        }>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken: storedRefreshToken },
          { withCredentials: true },
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

    // Friendly notification on 403 Forbidden access violation
    if (error.response?.status === 403) {
      const currentLang = localStorage.getItem('i18nextLng') || 'zh-CN';
      const isZh = currentLang.startsWith('zh');
      message.error(
        isZh
          ? '操作被拒绝 (403): 您的账户缺少执行此工控操作的安全角色权限'
          : 'Access Denied (403): Your account lacks required authorization.',
      );
    } else if (!error.response && error.message === 'Network Error') {
      const currentLang = localStorage.getItem('i18nextLng') || 'zh-CN';
      const isZh = currentLang.startsWith('zh');
      message.warning(
        isZh
          ? '工业网关连接超时，请核查 MES 局域网连接'
          : 'MES Gateway connection timeout. Please check network.',
      );
    }

    return Promise.reject(error.response?.data || error.message);
  },
);

export default apiClient;
