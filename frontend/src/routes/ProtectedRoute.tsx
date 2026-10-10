import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRbac } from '@/hooks/useRbac';
import { EnterpriseRole } from '@/utils/rbac';
import { AccessDeniedView } from '@/components/common/AccessDeniedView';

interface ProtectedRouteProps {
  allowedRoles?: (EnterpriseRole | string)[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated } = useAuthStore();
  const { hasAnyRole } = useRbac();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const isAuthorized = hasAnyRole(allowedRoles);
    if (!isAuthorized) {
      return <AccessDeniedView requiredRoles={allowedRoles} />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
