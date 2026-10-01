import apiClient from './api';

export interface UserAccount {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE';
  roles: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleDefinition {
  id: number;
  name: string;
  description: string;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  fullName: string;
  email?: string;
  phone?: string;
  roleNames: string[];
}

class UserService {
  public async getUsers(): Promise<UserAccount[]> {
    try {
      const res = await apiClient.get('/users', { params: { size: 50 } });
      const responseData = (res as {
        data?: {
          data?: Array<{
            id: number;
            username: string;
            fullName: string;
            email?: string;
            phone?: string;
            status: string;
            roles: string[];
            createdAt?: string;
            updatedAt?: string;
          }>;
        };
      })?.data;

      const rawList = responseData?.data;
      if (Array.isArray(rawList)) {
        return rawList.map((u) => ({
          id: u.id,
          username: u.username,
          fullName: u.fullName,
          email: u.email,
          phone: u.phone,
          status: (u.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE') as UserAccount['status'],
          roles: Array.isArray(u.roles) ? u.roles : [],
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  public async getRoles(): Promise<RoleDefinition[]> {
    try {
      const res = await apiClient.get('/roles');
      const responseData = (res as {
        data?: Array<{
          id: number;
          name: string;
          description: string;
        }>;
      })?.data;

      if (Array.isArray(responseData)) {
        return responseData.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description || r.name,
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  public async createUser(payload: CreateUserPayload): Promise<UserAccount> {
    try {
      const res = (await apiClient.post('/users', {
        username: payload.username.trim(),
        password: payload.password,
        fullName: payload.fullName.trim(),
        email: payload.email?.trim(),
        phone: payload.phone?.trim(),
        roleNames: payload.roleNames.length > 0 ? payload.roleNames : ['VIEWER'],
      })) as {
        data?: {
          id: number;
          username: string;
          fullName: string;
          email?: string;
          phone?: string;
          status: string;
          roles: string[];
          createdAt?: string;
        };
      };

      const created = res?.data;
      return {
        id: created?.id || Date.now(),
        username: created?.username || payload.username,
        fullName: created?.fullName || payload.fullName,
        email: created?.email || payload.email,
        phone: created?.phone || payload.phone,
        status: (created?.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE') as UserAccount['status'],
        roles: created?.roles || payload.roleNames,
        createdAt: created?.createdAt || new Date().toLocaleString(),
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create user';
      throw new Error(message, { cause: err });
    }
  }

  public async toggleStatus(id: number, currentStatus?: 'ACTIVE' | 'INACTIVE'): Promise<boolean> {
    try {
      if (currentStatus === 'ACTIVE') {
        await apiClient.delete(`/users/${id}`);
      } else {
        await apiClient.put(`/users/${id}`, {
          status: 'ACTIVE',
        });
      }
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to toggle user status';
      throw new Error(message, { cause: err });
    }
  }

  public async resetPassword(id: number, newPassword: string): Promise<boolean> {
    try {
      await apiClient.post(`/users/${id}/reset-password`, { newPassword });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reset password';
      throw new Error(message, { cause: err });
    }
  }
}

export const userService = new UserService();
export default userService;
