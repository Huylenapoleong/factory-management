# UI Role-Based Access Control (RBAC) & E2E Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full-scope frontend Role-Based Access Control (RBAC) across navigation menus, routes, and action controls for all 7 system roles, verify error handling resilience, and validate via Playwright and automated suites.

**Architecture:** 
- RBAC utility (`rbac.ts`) and hook (`useRbac.ts`) normalize role strings and evaluate granular permission sets matching backend Spring Security rules.
- Route-level defense-in-depth via `ProtectedRoute` rendering industrial `AccessDeniedView` (403) on unauthorized navigation.
- Dynamic layout filtering in `MainLayout` ensuring users only see authorized navigation items.
- Component-level permission guards disabling/hiding privileged operational actions (PO, SO, WO creation, Stock adjustments, User admin).
- Comprehensive Playwright tests validating role isolation, API failure UX, and absence of mock data.

**Tech Stack:** React 19, TypeScript, Ant Design v5, Zustand, React Router v6, Axios, Playwright, Spring Boot 3.4.

## Global Constraints
- **STRICTLY PROTECTED FILES - NEVER TOUCH, NEVER REVERT, NEVER COMMIT:**
  1. `.gitignore`
  2. `backend/src/main/resources/application-dev.yml`
  3. `frontend/vite.config.ts`
- Zero mock data fallbacks (`|| 1`, `Bay 05`, fake KPI metrics).
- Zero compilation errors (`npm run validate` and `mvn test` must pass 100%).

---

### Task 1: Core RBAC Types, Utilities, and Hooks

**Files:**
- Create: `frontend/src/utils/rbac.ts`
- Create: `frontend/src/hooks/useRbac.ts`
- Create: `frontend/src/components/common/PermissionGuard.tsx`
- Create: `frontend/src/components/common/AccessDeniedView.tsx`

**Interfaces:**
- Consumes: `useAuthStore` from `@/stores/useAuthStore`
- Produces: `hasRole`, `hasAnyRole`, `canAccessRoute`, `useRbac`, `PermissionGuard`, `AccessDeniedView`

- [ ] **Step 1: Implement `rbac.ts` utility**
  - Define 7 roles: `ADMIN`, `MANAGER`, `PRODUCTION`, `WAREHOUSE`, `PURCHASING`, `SALES`, `VIEWER`.
  - Normalization to strip `ROLE_` and handle case insensitivity.
  - Route permissions mapping matching backend controller `@PreAuthorize`.
  - Action permissions mapping for create/update/delete operations.

- [ ] **Step 2: Implement `useRbac.ts` hook**
  - Export role check helpers, active role flags (`isAdmin`, `isWarehouse`, etc.), and `canAccessRoute(pathname)`.

- [ ] **Step 3: Implement `AccessDeniedView.tsx`**
  - Industrial 403 Result view displaying current account role, required permissions, and navigation actions back to authorized workspaces.

- [ ] **Step 4: Implement `PermissionGuard.tsx`**
  - Container component conditionally rendering children or disabled tooltip/fallback based on role evaluation.

---

### Task 2: Route Protection and Dynamic Layout Filtering

**Files:**
- Modify: `frontend/src/routes/ProtectedRoute.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/layouts/MainLayout.tsx`

**Interfaces:**
- Consumes: `useRbac`, `AccessDeniedView`
- Produces: Role-guarded router with dynamic navigation sidebar

- [ ] **Step 1: Enhance `ProtectedRoute.tsx` with role authorization**
  - Add `allowedRoles?: string[]` prop.
  - Return `<AccessDeniedView />` if user lacks required role.

- [ ] **Step 2: Update `App.tsx` route definitions**
  - Group and protect routes with respective roles:
    * `/audit`: `['ADMIN']`
    * `/settings`: `['ADMIN', 'MANAGER']`
    * `/production`, `/production/bom`: `['ADMIN', 'MANAGER', 'PRODUCTION']`
    * `/inventory`: `['ADMIN', 'MANAGER', 'WAREHOUSE', 'PURCHASING', 'SALES']`
    * `/purchasing`: `['ADMIN', 'MANAGER', 'PURCHASING', 'WAREHOUSE']`
    * `/sales`: `['ADMIN', 'MANAGER', 'SALES', 'WAREHOUSE']`
    * `/suppliers`: `['ADMIN', 'MANAGER', 'PURCHASING', 'WAREHOUSE']`
    * `/customers`: `['ADMIN', 'MANAGER', 'SALES', 'WAREHOUSE']`
    * `/dashboard`, `/items`: all authenticated users.

- [ ] **Step 3: Update `MainLayout.tsx` menu items**
  - Filter `menuItems` using `canAccessRoute` so unauthorized links are never rendered in the sidebar or mobile drawer.

---

### Task 3: Feature-Level In-Page Permission Guards & RBAC Matrix Update

**Files:**
- Modify: `frontend/src/features/settings/components/SettingsView.tsx`
- Modify: `frontend/src/features/settings/components/UserManagementTable.tsx`
- Modify: `frontend/src/features/production/components/ProductionView.tsx`
- Modify: `frontend/src/features/purchasing/components/PurchasingView.tsx`
- Modify: `frontend/src/features/sales/components/SalesView.tsx`
- Modify: `frontend/src/features/inventory/components/InventoryView.tsx`
- Modify: `frontend/src/features/items/components/ItemsView.tsx`

**Interfaces:**
- Consumes: `useRbac`, `PermissionGuard`
- Produces: Clean UI/UX where unauthorized action buttons are hidden or disabled with clear tooltips.

- [ ] **Step 1: Update SettingsView and UserManagementTable**
  - In `SettingsView.tsx`: Tab RBAC Matrix updated to display all 7 authentic system roles and their permission grid.
  - In `SettingsView.tsx`: User management tab only accessible/rendered for `ADMIN`.
  - In `UserManagementTable.tsx`: "Create User" and "Reset Password" guarded to `ADMIN`.

- [ ] **Step 2: Update Operational Views**
  - `ProductionView.tsx`: Guard "New Work Order" button to `ADMIN`, `MANAGER`, `PRODUCTION`.
  - `PurchasingView.tsx`: Guard "New PO" to `ADMIN`, `MANAGER`, `PURCHASING`; "Goods Receipt" to `ADMIN`, `MANAGER`, `WAREHOUSE`.
  - `SalesView.tsx`: Guard "New SO" to `ADMIN`, `MANAGER`, `SALES`; "Dispatch Delivery" to `ADMIN`, `MANAGER`, `WAREHOUSE`, `SALES`.
  - `InventoryView.tsx`: Guard "Transfer Stock" to `ADMIN`, `MANAGER`, `WAREHOUSE`.
  - `ItemsView.tsx`: Guard "Add Item" to `ADMIN`, `MANAGER`, `PRODUCTION`, `WAREHOUSE`.

---

### Task 4: API Error Handling & System Resilience

**Files:**
- Modify: `frontend/src/services/api.ts`

- [ ] **Step 1: Enhance Axios response interceptor**
  - Provide meaningful notifications for 403 Forbidden, 500 Internal Error, and network interruptions.
  - Ensure unhandled API rejections don't crash UI components.

---

### Task 5: End-to-End Validation & Playwright Testing

**Files:**
- Create: Playwright test script or automation verification for all roles.
- Run: `npm run validate` in frontend.
- Run: `mvn test` in backend.

- [ ] **Step 1: Run frontend code quality validation** (`npm run validate`).
- [ ] **Step 2: Run backend tests** (`mvn test`).
- [ ] **Step 3: Playwright testing across all roles** (`admin`, `clerk_liu`, `operator`, `director_zhang`, `qc_qian`).
- [ ] **Step 4: Verify zero mock/fake data leftovers**.
