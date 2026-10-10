import { useMemo } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  EnterpriseRole,
  ENTERPRISE_ROLES,
  RoleMetadata,
  normalizeRole,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  canAccessRoute,
  canPerformAction,
  ActionPermissionKey,
} from '@/utils/rbac';

export interface UseRbacReturn {
  user: ReturnType<typeof useAuthStore.getState>['user'];
  roles: string[];
  primaryRole: EnterpriseRole | 'UNKNOWN';
  primaryRoleMetadata: RoleMetadata | null;
  isAdmin: boolean;
  isManager: boolean;
  isProduction: boolean;
  isWarehouse: boolean;
  isPurchasing: boolean;
  isSales: boolean;
  isViewer: boolean;
  hasRole: (targetRole: EnterpriseRole | string) => boolean;
  hasAnyRole: (allowedRoles: (EnterpriseRole | string)[]) => boolean;
  hasAllRoles: (requiredRoles: (EnterpriseRole | string)[]) => boolean;
  canAccessRoute: (routePath: string) => boolean;
  canPerformAction: (action: ActionPermissionKey) => boolean;
}

export const useRbac = (): UseRbacReturn => {
  const user = useAuthStore((state) => state.user);

  return useMemo(() => {
    const rawRoles = user?.roles || [];
    const roles = rawRoles.map(normalizeRole);
    const primaryNormalized = (roles[0] || 'UNKNOWN') as EnterpriseRole;
    const metadata = ENTERPRISE_ROLES[primaryNormalized] || null;

    const admin = hasRole(rawRoles, 'ADMIN');
    const manager = hasRole(rawRoles, 'MANAGER');
    const production = hasRole(rawRoles, 'PRODUCTION');
    const warehouse = hasRole(rawRoles, 'WAREHOUSE');
    const purchasing = hasRole(rawRoles, 'PURCHASING');
    const sales = hasRole(rawRoles, 'SALES');
    const viewer = hasRole(rawRoles, 'VIEWER');

    return {
      user,
      roles,
      primaryRole: primaryNormalized,
      primaryRoleMetadata: metadata,
      isAdmin: admin,
      isManager: manager,
      isProduction: production,
      isWarehouse: warehouse,
      isPurchasing: purchasing,
      isSales: sales,
      isViewer: viewer,
      hasRole: (targetRole) => hasRole(rawRoles, targetRole),
      hasAnyRole: (allowed) => hasAnyRole(rawRoles, allowed),
      hasAllRoles: (required) => hasAllRoles(rawRoles, required),
      canAccessRoute: (routePath) => canAccessRoute(rawRoles, routePath),
      canPerformAction: (action) => canPerformAction(rawRoles, action),
    };
  }, [user]);
};

export default useRbac;
