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

const defaultRoles: RoleDefinition[] = [
  { id: 1, name: 'ADMIN', description: 'System Administrator with full plant governance' },
  { id: 2, name: 'MANAGER', description: 'Plant Director & Operations Supervisor' },
  { id: 3, name: 'PRODUCTION', description: 'Shop Floor Dispatcher & Line Operator' },
  { id: 4, name: 'WAREHOUSE', description: 'Inventory Clerk & Stocktake Controller' },
  { id: 5, name: 'PURCHASING', description: 'Procurement Specialist & Inbound QC' },
  { id: 6, name: 'SALES', description: 'Commercial Sales & Outbound Logistics' },
  { id: 7, name: 'VIEWER', description: 'Read-only observer & Quality auditor' },
];

const defaultUsers: UserAccount[] = [
  {
    id: 1,
    username: 'admin',
    fullName: 'System Administrator (系统管理员)',
    email: 'admin@wifim-factory.com',
    phone: '+86-13800000001',
    status: 'ACTIVE',
    roles: ['ADMIN', 'MANAGER'],
    createdAt: '2026-10-01 08:00:00',
  },
  {
    id: 2,
    username: 'director_zhang',
    fullName: 'Director Zhang Yong (张厂长)',
    email: 'zhang.yong@wifim-factory.com',
    phone: '+86-13800000002',
    status: 'ACTIVE',
    roles: ['MANAGER'],
    createdAt: '2026-10-01 08:15:00',
  },
  {
    id: 3,
    username: 'dispatcher_wang',
    fullName: 'Machinist Wang Qiang (王调度)',
    email: 'wang.q@wifim-factory.com',
    phone: '+86-13800000003',
    status: 'ACTIVE',
    roles: ['PRODUCTION'],
    createdAt: '2026-10-01 08:30:00',
  },
  {
    id: 4,
    username: 'clerk_liu',
    fullName: 'Warehouse Clerk Liu (刘仓管)',
    email: 'liu.wh@wifim-factory.com',
    phone: '+86-13800000004',
    status: 'ACTIVE',
    roles: ['WAREHOUSE'],
    createdAt: '2026-10-01 08:45:00',
  },
  {
    id: 5,
    username: 'qc_qian',
    fullName: 'QC Inspector Qian (钱质检)',
    email: 'qian.qc@wifim-factory.com',
    phone: '+86-13800000005',
    status: 'ACTIVE',
    roles: ['VIEWER', 'PRODUCTION'],
    createdAt: '2026-10-01 09:00:00',
  },
];

class UserService {
  private users: UserAccount[] = [...defaultUsers];

  public async getUsers(): Promise<UserAccount[]> {
    try {
      const res = await apiClient.get('/users');
      const responseData = (res as { data?: { data?: { content?: UserAccount[] } } })?.data;
      if (responseData?.data?.content && Array.isArray(responseData.data.content)) {
        return responseData.data.content;
      }
    } catch {
      // offline fallback
    }
    return [...this.users];
  }

  public async getRoles(): Promise<RoleDefinition[]> {
    try {
      const res = await apiClient.get('/roles');
      const responseData = (res as { data?: { data?: RoleDefinition[] } })?.data;
      if (responseData?.data && Array.isArray(responseData.data)) {
        return responseData.data;
      }
    } catch {
      // offline fallback
    }
    return defaultRoles;
  }

  public async createUser(payload: CreateUserPayload): Promise<UserAccount> {
    const newUser: UserAccount = {
      id: Date.now(),
      username: payload.username.trim(),
      fullName: payload.fullName.trim(),
      email: payload.email?.trim(),
      phone: payload.phone?.trim(),
      status: 'ACTIVE',
      roles: payload.roleNames.length > 0 ? payload.roleNames : ['VIEWER'],
      createdAt: new Date().toLocaleString(),
    };

    try {
      await apiClient.post('/users', payload);
    } catch {
      // offline fallback
    }
    this.users.unshift(newUser);
    return newUser;
  }

  public async toggleStatus(id: number): Promise<boolean> {
    const user = this.users.find((u) => u.id === id);
    if (!user) return false;
    user.status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      if (user.status === 'INACTIVE') {
        await apiClient.delete(`/users/${id}`);
      } else {
        await apiClient.put(`/users/${id}`, {
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          status: 'ACTIVE',
          roleNames: user.roles,
        });
      }
    } catch {
      // offline fallback
    }
    return true;
  }

  public async resetPassword(id: number, newPassword: string): Promise<boolean> {
    try {
      await apiClient.post(`/users/${id}/reset-password`, { newPassword });
    } catch {
      // offline fallback
    }
    return true;
  }
}

export const userService = new UserService();
export default userService;
