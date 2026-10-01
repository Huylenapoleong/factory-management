import { create } from 'zustand';
import apiClient from '@/services/api';

export interface AuthUser {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  roles: string[];
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setAuth: (token: string, refreshToken: string, user: AuthUser) => void;
}

const getStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialToken = localStorage.getItem('access_token');
const initialUser = getStoredUser();

export const useAuthStore = create<AuthState>((set) => ({
  token: initialToken,
  refreshToken: localStorage.getItem('refresh_token'),
  user: initialUser,
  isAuthenticated: Boolean(initialToken),
  isLoading: false,

  setAuth: (token: string, refreshToken: string, user: AuthUser) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({
      token,
      refreshToken,
      user,
      isAuthenticated: true,
    });
  },

  login: async (username: string, password: string) => {
    set({ isLoading: true });
    try {
      // 1. Try real enterprise backend gateway (/api/v1/auth/login)
      const res = await apiClient.post<
        | { data?: { accessToken: string; refreshToken: string; user: AuthUser } }
        | { accessToken: string; refreshToken: string; user: AuthUser }
      >('/auth/login', { username, password });
      const authData = (res as { data?: { accessToken: string; refreshToken: string; user: AuthUser } })?.data || res;

      if (authData && 'accessToken' in authData && authData.accessToken) {
        const { accessToken, refreshToken, user } = authData as { accessToken: string; refreshToken: string; user: AuthUser };
        localStorage.setItem('access_token', accessToken);
        if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
        if (user) localStorage.setItem('auth_user', JSON.stringify(user));

        set({
          token: accessToken,
          refreshToken: refreshToken || null,
          user: user || null,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      }
      throw new Error('Invalid authentication response structure');
    } catch (err: unknown) {
      set({ isLoading: false });
      const apiMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      return {
        success: false,
        error: apiMessage || 'Authentication failed. Please check your username and password.',
      };
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken }).catch(() => {});
      }
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_user');
      set({
        token: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
      });
    }
  },
}));
