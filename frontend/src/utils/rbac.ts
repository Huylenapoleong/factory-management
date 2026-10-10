/**
 * Enterprise Role-Based Access Control (RBAC) System
 * Defines standard roles, route permissions, and operational authority rules
 * matching backend Spring Security (@PreAuthorize) specifications.
 */

export type EnterpriseRole =
  'ADMIN' | 'MANAGER' | 'PRODUCTION' | 'WAREHOUSE' | 'PURCHASING' | 'SALES' | 'VIEWER';

export interface RoleMetadata {
  key: EnterpriseRole;
  titleZh: string;
  titleEn: string;
  titleVi: string;
  color: string;
  descriptionZh: string;
  descriptionVi: string;
  descriptionEn: string;
  allowedModules: string[];
}

export const ENTERPRISE_ROLES: Record<EnterpriseRole, RoleMetadata> = {
  ADMIN: {
    key: 'ADMIN',
    titleZh: '系统管理员 / 厂长',
    titleEn: 'System Administrator',
    titleVi: 'Quản trị viên Hệ thống',
    color: 'red',
    descriptionZh: '拥有全系统最高管理权限，涵盖用户账号、审计日志及工厂全局参数。',
    descriptionVi:
      'Toàn quyền quản trị hệ thống, tài khoản người dùng, nhật ký kiểm toán và thông số nhà máy.',
    descriptionEn:
      'Full system authorization, user governance, audit logging, and core plant configurations.',
    allowedModules: [
      'Dashboard',
      'Production',
      'BOMs',
      'Inventory',
      'Purchasing',
      'Sales',
      'Master Data',
      'Audit Logs',
      'Settings',
    ],
  },
  MANAGER: {
    key: 'MANAGER',
    titleZh: '生产总监 / 运营主管',
    titleEn: 'Plant Operations Manager',
    titleVi: 'Giám đốc Vận hành / Quản lý',
    color: 'orange',
    descriptionZh: '主管车间生产调度、供应链及仓储运营（除用户管理与底层审计日志外）。',
    descriptionVi:
      'Quản lý toàn bộ quy trình sản xuất, mua bán, kho bãi và cấu hình vận hành (trừ quản lý tài khoản & audit log).',
    descriptionEn:
      'Supervises shop floor, supply chain, inventory, and operational parameters (excluding user admin & audit logs).',
    allowedModules: [
      'Dashboard',
      'Production',
      'BOMs',
      'Inventory',
      'Purchasing',
      'Sales',
      'Master Data',
      'Settings (General)',
    ],
  },
  PRODUCTION: {
    key: 'PRODUCTION',
    titleZh: '车间调度 / 产线操作员',
    titleEn: 'Production & Shop Floor',
    titleVi: 'Sản xuất & Điều độ Phân xưởng',
    color: 'blue',
    descriptionZh: '负责生产工单下达与流转、工位报工、良品与报废登记及 BOM 结构核查。',
    descriptionVi:
      'Lập lệnh sản xuất, phân bổ công đoạn, ghi nhận sản lượng/phế phẩm, giám sát định mức BOM.',
    descriptionEn:
      'Dispatches work orders, records operation telemetry, reports scraps/yields, and oversees BOM structures.',
    allowedModules: ['Dashboard', 'Production', 'BOMs', 'Master Data (Items)'],
  },
  WAREHOUSE: {
    key: 'WAREHOUSE',
    titleZh: '仓储主管 / 物流仓管员',
    titleEn: 'Warehouse & Logistics',
    titleVi: 'Kho vận & Tiếp vận Logistics',
    color: 'green',
    descriptionZh: '负责采购入库质检入账、销售发货出库装运、库位调拨与盘点核销。',
    descriptionVi:
      'Thực hiện nhập kho theo đơn mua, xuất kho giao hàng, điều chuyển vị trí và kiểm kê tồn kho.',
    descriptionEn:
      'Handles inbound goods receipts, sales outbound dispatches, warehouse bin transfers, and stock reconciliations.',
    allowedModules: [
      'Dashboard',
      'Inventory',
      'Purchasing (Receipts)',
      'Sales (Deliveries)',
      'Master Data',
      'Suppliers',
    ],
  },
  PURCHASING: {
    key: 'PURCHASING',
    titleZh: '采购工程师 / 供应链专员',
    titleEn: 'Purchasing & Procurement',
    titleVi: 'Mua sắm & Chuỗi cung ứng',
    color: 'cyan',
    descriptionZh: '编制物料采购订单、跟踪供应商交期及监控来料质检管道。',
    descriptionVi:
      'Lập đơn đặt mua nguyên vật liệu, quản lý hồ sơ nhà cung cấp và theo dõi tiến độ giao hàng.',
    descriptionEn:
      'Issues purchase orders, qualifies vendors, monitors supply lead times, and oversees inbound pipeline.',
    allowedModules: [
      'Dashboard',
      'Purchasing',
      'Suppliers',
      'Inventory (Read)',
      'Master Data (Items)',
    ],
  },
  SALES: {
    key: 'SALES',
    titleZh: '销售代表 / 客户经理',
    titleEn: 'Sales & Order Management',
    titleVi: 'Kinh doanh & Bán hàng',
    color: 'purple',
    descriptionZh: '录入销售订单、维护客户档案、协调发货计划与交付进度。',
    descriptionVi:
      'Tiếp nhận đơn hàng khách hàng, quản lý danh bạ khách hàng và phối hợp lịch giao hàng.',
    descriptionEn:
      'Registers customer orders, manages CRM directory, and coordinates shipment fulfillments.',
    allowedModules: ['Dashboard', 'Sales', 'Customers', 'Inventory (Read)', 'Master Data (Items)'],
  },
  VIEWER: {
    key: 'VIEWER',
    titleZh: '审计只读 / 访客观察员',
    titleEn: 'Auditor & Read-Only Viewer',
    titleVi: 'Người xem / Thanh tra Chỉ đọc',
    color: 'default',
    descriptionZh: '具备综合看板与主数据只读浏览权限，无权新增、修改或删除任何业务数据。',
    descriptionVi:
      'Chỉ có quyền xem bảng tin tổng quan và danh mục vật tư; không được phép tạo, sửa hoặc xóa dữ liệu.',
    descriptionEn:
      'Read-only visibility for executive boards and auditors without modification permissions.',
    allowedModules: ['Dashboard', 'Master Data (Read-only)'],
  },
};

/**
 * Normalizes a raw role string from JWT or DB (e.g. 'ROLE_ADMIN' -> 'ADMIN')
 */
export const normalizeRole = (role: string): string => {
  if (!role) return '';
  return role
    .replace(/^ROLE_/i, '')
    .trim()
    .toUpperCase();
};

/**
 * Checks whether user has a specific target role
 */
export const hasRole = (
  userRoles: readonly string[] | string[] | undefined | null,
  targetRole: EnterpriseRole | string,
): boolean => {
  if (!userRoles || !Array.isArray(userRoles) || userRoles.length === 0) return false;
  const target = normalizeRole(targetRole);
  return userRoles.some((r) => normalizeRole(r) === target);
};

/**
 * Checks whether user has at least one of the allowed roles
 */
export const hasAnyRole = (
  userRoles: readonly string[] | string[] | undefined | null,
  allowedRoles: readonly (EnterpriseRole | string)[] | (EnterpriseRole | string)[],
): boolean => {
  if (!userRoles || !Array.isArray(userRoles) || userRoles.length === 0) return false;
  const normalizedAllowed = allowedRoles.map((r) => normalizeRole(r));
  return userRoles.some((r) => normalizedAllowed.includes(normalizeRole(r)));
};

/**
 * Checks whether user has all required roles
 */
export const hasAllRoles = (
  userRoles: readonly string[] | string[] | undefined | null,
  requiredRoles: readonly (EnterpriseRole | string)[] | (EnterpriseRole | string)[],
): boolean => {
  if (!userRoles || !Array.isArray(userRoles) || userRoles.length === 0) return false;
  const userNormalized = userRoles.map((r) => normalizeRole(r));
  return requiredRoles.every((r) => userNormalized.includes(normalizeRole(r)));
};

/**
 * Route-level RBAC permission matrix
 */
export const ROUTE_PERMISSIONS: Record<string, EnterpriseRole[]> = {
  '/dashboard': ['ADMIN', 'MANAGER', 'PRODUCTION', 'WAREHOUSE', 'PURCHASING', 'SALES', 'VIEWER'],
  '/production': ['ADMIN', 'MANAGER', 'PRODUCTION'],
  '/production/bom': ['ADMIN', 'MANAGER', 'PRODUCTION'],
  '/inventory': ['ADMIN', 'MANAGER', 'WAREHOUSE', 'PURCHASING', 'SALES'],
  '/purchasing': ['ADMIN', 'MANAGER', 'PURCHASING', 'WAREHOUSE'],
  '/sales': ['ADMIN', 'MANAGER', 'SALES', 'WAREHOUSE'],
  '/items': ['ADMIN', 'MANAGER', 'PRODUCTION', 'WAREHOUSE', 'PURCHASING', 'SALES', 'VIEWER'],
  '/suppliers': ['ADMIN', 'MANAGER', 'PURCHASING', 'WAREHOUSE'],
  '/customers': ['ADMIN', 'MANAGER', 'SALES', 'WAREHOUSE'],
  '/audit': ['ADMIN'],
  '/settings': ['ADMIN', 'MANAGER'],
  '/guide': ['ADMIN', 'MANAGER', 'PRODUCTION', 'WAREHOUSE', 'PURCHASING', 'SALES', 'VIEWER'],
};

/**
 * Evaluates whether a user can access a given frontend route
 */
export const canAccessRoute = (
  userRoles: string[] | undefined | null,
  routePath: string,
): boolean => {
  // Strip trailing slashes or subpaths to find matching prefix
  const cleanPath = routePath.split('?')[0].replace(/\/+$/, '') || '/';

  // Exact match
  if (ROUTE_PERMISSIONS[cleanPath]) {
    return hasAnyRole(userRoles, ROUTE_PERMISSIONS[cleanPath]);
  }

  // Prefix match (e.g. /production/bom)
  const matchedKey = Object.keys(ROUTE_PERMISSIONS)
    .filter((k) => k !== '/dashboard' && cleanPath.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];

  if (matchedKey) {
    return hasAnyRole(userRoles, ROUTE_PERMISSIONS[matchedKey]);
  }

  // Default fallback for unknown sub-paths
  return true;
};

/**
 * Granular action permissions matching backend @PreAuthorize annotations
 */
export const ACTION_PERMISSIONS = {
  // Production
  CREATE_WORK_ORDER: ['ADMIN', 'MANAGER', 'PRODUCTION'],
  CANCEL_WORK_ORDER: ['ADMIN', 'MANAGER'],
  RECORD_OPERATION: ['ADMIN', 'MANAGER', 'PRODUCTION'],
  MANAGE_BOM: ['ADMIN', 'MANAGER', 'PRODUCTION'],

  // Inventory & Warehouse
  TRANSFER_STOCK: ['ADMIN', 'MANAGER', 'WAREHOUSE'],
  ADJUST_STOCK: ['ADMIN', 'MANAGER', 'WAREHOUSE'],
  RECEIVE_GOODS: ['ADMIN', 'MANAGER', 'WAREHOUSE'],

  // Purchasing
  CREATE_PURCHASE_ORDER: ['ADMIN', 'MANAGER', 'PURCHASING'],
  APPROVE_PURCHASE_ORDER: ['ADMIN', 'MANAGER'],
  MANAGE_SUPPLIERS: ['ADMIN', 'MANAGER', 'PURCHASING'],

  // Sales
  CREATE_SALES_ORDER: ['ADMIN', 'MANAGER', 'SALES'],
  DISPATCH_DELIVERY: ['ADMIN', 'MANAGER', 'WAREHOUSE', 'SALES'],
  MANAGE_CUSTOMERS: ['ADMIN', 'MANAGER', 'SALES'],

  // Master Data
  CREATE_ITEM: ['ADMIN', 'MANAGER', 'PRODUCTION', 'WAREHOUSE'],
  DELETE_ITEM: ['ADMIN', 'MANAGER'],

  // System Administration
  MANAGE_USERS: ['ADMIN'],
  RESET_USER_PASSWORD: ['ADMIN'],
  VIEW_AUDIT_LOGS: ['ADMIN'],
  UPDATE_SYSTEM_SETTINGS: ['ADMIN', 'MANAGER'],
} as const;

export type ActionPermissionKey = keyof typeof ACTION_PERMISSIONS;

export const canPerformAction = (
  userRoles: string[] | undefined | null,
  action: ActionPermissionKey,
): boolean => {
  return hasAnyRole(userRoles, ACTION_PERMISSIONS[action]);
};
