import React from 'react';
import { Tooltip } from 'antd';
import { useRbac } from '@/hooks/useRbac';
import { EnterpriseRole, ActionPermissionKey } from '@/utils/rbac';

interface PermissionGuardProps {
  roles?: (EnterpriseRole | string)[];
  action?: ActionPermissionKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  mode?: 'hide' | 'disable';
  disabledTooltip?: string;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  roles,
  action,
  children,
  fallback = null,
  mode = 'hide',
  disabledTooltip = 'Action restricted by security policy',
}) => {
  const { hasAnyRole, canPerformAction } = useRbac();

  let hasPermission = true;

  if (roles && roles.length > 0) {
    hasPermission = hasAnyRole(roles);
  }

  if (hasPermission && action) {
    hasPermission = canPerformAction(action);
  }

  if (hasPermission) {
    return <>{children}</>;
  }

  if (mode === 'hide') {
    return <>{fallback}</>;
  }

  // mode === 'disable': wrap child in disabled container + tooltip
  return (
    <Tooltip title={disabledTooltip}>
      <span style={{ display: 'inline-block', cursor: 'not-allowed' }}>
        {React.isValidElement<{ disabled?: boolean; style?: React.CSSProperties }>(children)
          ? React.cloneElement(children, {
              disabled: true,
              style: {
                ...(children.props.style || {}),
                pointerEvents: 'none',
              },
            })
          : children}
      </span>
    </Tooltip>
  );
};

export default PermissionGuard;
