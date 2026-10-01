# Frontend Industrial Enterprise UI/UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete Industrial Enterprise (Ant Design Pro) UI/UX for the Factory Management platform, featuring bilingual English & Simplified Chinese support, plant console layout, and live operational dashboard connected to backend APIs.

**Architecture:** Build high-density, Ant Design 6-powered modular components styled to match the validated Stitch MCP Design System (*Precision Industrial ERP*). Use Axios client with JWT bearer tokens for API communications, Zustand for application state (workshop/shift context, language, user session), and React Router for seamless navigation.

**Tech Stack:** React 19, TypeScript 6.0, Ant Design 6.0, Vite 8.3, react-i18next, Axios, Ant Design Icons.

**Spec:** `docs/superpowers/specs/2026-10-01-frontend-industrial-design.md`

## Global Constraints
- Strictly avoid generic AI aesthetics (no purple neon glows, no glassmorphism, no floating 3D spheres, no empty wasted whitespace).
- True bilingual support: All components, labels, and table columns must support English and Simplified Chinese (EN / 简中).
- Compact information density: Tables use `size="middle"` or `size="small"`, crisp 1px borders `#e5e7eb`, neutral background `#f0f2f5`.
- Tabular monospace numbers (`tnum`) for batch numbers, order codes, quantities, and timestamps.
- Zero placeholder code: Every file must be fully functional and tested with `npm run lint` and `npm run build`.

---

## File Structure

```
frontend/src/
├── app/
│   └── theme.ts                             # Ant Design 6 industrial theme tokens & algorithms
├── locales/
│   ├── en/translation.json                   # Comprehensive English manufacturing terminology
│   └── zh-CN/translation.json                # Comprehensive Simplified Chinese manufacturing terminology
├── layouts/
│   ├── MainLayout.tsx                       # Industrial plant console shell with sidebar & header
│   └── components/
│       ├── HeaderBar.tsx                    # Plant/workshop switcher, shift badge, language toggle
│       └── BreadcrumbBar.tsx                # Breadcrumbs, system clock & manual refresh button
├── services/
│   ├── api.ts                               # Axios base client with JWT interceptors
│   └── dashboardService.ts                  # Dashboard API calls (summary, progress, low-stock)
├── features/
│   └── dashboard/
│       ├── components/
│       │   ├── DashboardView.tsx            # Main assembled dashboard page
│       │   ├── KpiMetricsStrip.tsx          # 4 top KPI cards (Plan %, WOs, Stock alert, Outbound)
│       │   ├── PriorityWorkOrdersCard.tsx   # Compact table for active work orders & progress
│       │   ├── HourlyThroughputCard.tsx     # Hourly line output & yield rate visual chart
│       │   ├── MaterialShortageCard.tsx     # Urgent shortage table with Quick PO action
│       │   └── StockMovementsTimelineCard.tsx # Real-time warehouse transaction timeline
│       ├── types.ts                         # Dashboard component state & DTO interfaces
│       └── index.ts                         # Public exports
└── index.css                                # Global enterprise CSS, tabular numerals, scrollbars
```

---

### Task 1: Theme & Design System Setup

**Files:**
- Create: `frontend/src/app/theme.ts`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/index.css`

**Interfaces:**
- Produces: `industrialTheme` configuration export for Ant Design `ConfigProvider`.

- [ ] **Step 1: Create industrial theme configuration**

Create `frontend/src/app/theme.ts` with Ant Design 6 tokens:
```typescript
import { ThemeConfig, theme } from 'antd';

export const industrialTheme: ThemeConfig = {
  algorithm: [theme.defaultAlgorithm, theme.compactAlgorithm],
  token: {
    colorPrimary: '#1677ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1677ff',
    colorBgBase: '#ffffff',
    colorBgLayout: '#f0f2f5',
    colorTextBase: '#1f2937',
    colorTextSecondary: '#6b7280',
    colorBorder: '#e5e7eb',
    colorBorderSecondary: '#f0f0f0',
    borderRadius: 4,
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif",
  },
  components: {
    Card: {
      headerHeight: 42,
      headerFontSize: 14,
      headerFontWeight: 600,
    },
    Table: {
      headerBg: '#fafafa',
      headerColor: '#4b5563',
      headerSortActiveBg: '#f3f4f6',
      rowHoverBg: '#f9fafb',
      fontSize: 13,
    },
    Button: {
      borderRadius: 4,
      controlHeight: 32,
      controlHeightSM: 24,
    },
    Tag: {
      borderRadius: 2,
    },
  },
};
```

- [ ] **Step 2: Update `App.tsx` to use `industrialTheme`**

Modify `frontend/src/App.tsx` to import and apply `industrialTheme` in `ConfigProvider`.

- [ ] **Step 3: Update `index.css` for tabular numbers and clean reset**

Add to `frontend/src/index.css`:
```css
body {
  margin: 0;
  background-color: #f0f2f5;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.tnum {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build` in `frontend/`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/theme.ts frontend/src/App.tsx frontend/src/index.css
git commit -m "feat(frontend): configure industrial Ant Design theme tokens and typography"
```

---

### Task 2: Expanded Bilingual Dictionaries (EN & zh-CN)

**Files:**
- Modify: `frontend/src/locales/en/translation.json`
- Modify: `frontend/src/locales/zh-CN/translation.json`

**Interfaces:**
- Produces: Complete translation keys under `dashboard.*`, `workOrder.*`, `inventory.*`, `header.*`.

- [ ] **Step 1: Update English dictionary**

Add comprehensive keys for all manufacturing terms, plant console, KPI titles, table headers, and status badges to `frontend/src/locales/en/translation.json`.

- [ ] **Step 2: Update Simplified Chinese dictionary**

Add matching authentic Chinese enterprise manufacturing keys (`今日计划达成率`, `重点生产工单`, `安全库存预警`, `一键采购`, `生产领料`, `早班`, `第一车间`) to `frontend/src/locales/zh-CN/translation.json`.

- [ ] **Step 3: Verify build**

Run: `npm run build` in `frontend/`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/locales/en/translation.json frontend/src/locales/zh-CN/translation.json
git commit -m "feat(frontend): expand bilingual EN and zh-CN manufacturing translations"
```

---

### Task 3: Top Navigation Bar & Plant/Workshop Switcher Shell

**Files:**
- Create: `frontend/src/layouts/components/HeaderBar.tsx`
- Create: `frontend/src/layouts/components/BreadcrumbBar.tsx`
- Modify: `frontend/src/layouts/MainLayout.tsx`

**Interfaces:**
- Produces: `HeaderBar` with plant switcher dropdown, shift indicator, language toggle, alert badge, user avatar; `BreadcrumbBar` with real-time timestamp and manual refresh trigger.

- [ ] **Step 1: Implement `HeaderBar.tsx`**

Create `frontend/src/layouts/components/HeaderBar.tsx` using Ant Design components (`Select`, `Badge`, `Avatar`, `Button`, `Dropdown`, `Space`).

- [ ] **Step 2: Implement `BreadcrumbBar.tsx`**

Create `frontend/src/layouts/components/BreadcrumbBar.tsx` showing current hierarchy breadcrumb, system time clock (UTC+8), and "Manual Refresh" button.

- [ ] **Step 3: Integrate into `MainLayout.tsx`**

Update `frontend/src/layouts/MainLayout.tsx` to include `HeaderBar`, `BreadcrumbBar`, and collapsible industrial sidebar with standard navigation routes.

- [ ] **Step 4: Verify build & lint**

Run: `npm run lint && npm run build` in `frontend/`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/layouts/
git commit -m "feat(frontend): implement plant console header, workshop switcher, and breadcrumb bar"
```

---

### Task 4: API Service Layer for Dashboard & Operations

**Files:**
- Create: `frontend/src/features/dashboard/types.ts`
- Create: `frontend/src/services/dashboardService.ts`

**Interfaces:**
- Produces: `fetchDashboardSummary()`, `fetchProductionProgress()`, `fetchLowStockAlerts()`, `fetchRecentMovements()`.

- [ ] **Step 1: Define TypeScript interfaces in `features/dashboard/types.ts`**

Define `DashboardSummary`, `WorkOrderProgressItem`, `MaterialShortageItem`, `StockMovementItem`.

- [ ] **Step 2: Implement `dashboardService.ts`**

Implement API calls using `apiClient` with fallback mock data when the backend service is offline, ensuring the dashboard renders flawlessly in all environments.

- [ ] **Step 3: Verify build**

Run: `npm run build` in `frontend/`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/dashboard/types.ts frontend/src/services/dashboardService.ts
git commit -m "feat(frontend): add dashboard data types and API service client"
```

---

### Task 5: KPI Metric Cards Component (`KpiMetricsStrip`)

**Files:**
- Create: `frontend/src/features/dashboard/components/KpiMetricsStrip.tsx`

**Interfaces:**
- Consumes: `DashboardSummary` from `dashboardService.ts`.
- Produces: `KpiMetricsStrip` React component.

- [ ] **Step 1: Implement `KpiMetricsStrip.tsx`**

Render 4 metric cards:
1. Daily Plan Completion (`94.2%`, Target: 95.0%, progress bar in `#52c41a`).
2. Active Work Orders (`18 Orders`, `2 Near Deadline` amber tag).
3. Low Safety Stock Alerts (`5 Items`, `Critical Shortage` red tag).
4. Pending Outbound Shipments (`12 Orders`, `8 Dispatched` blue tag).

- [ ] **Step 2: Verify build**

Run: `npm run build` in `frontend/`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/dashboard/components/KpiMetricsStrip.tsx
git commit -m "feat(frontend): create high-density KPI metrics strip component"
```

---

### Task 6: Priority Work Orders Progress Table (`PriorityWorkOrdersCard`)

**Files:**
- Create: `frontend/src/features/dashboard/components/PriorityWorkOrdersCard.tsx`

**Interfaces:**
- Consumes: `WorkOrderProgressItem[]`.
- Produces: `PriorityWorkOrdersCard` component with search filter, status tabs, compact table, AntD progress bars, and row action triggers.

- [ ] **Step 1: Implement `PriorityWorkOrdersCard.tsx`**

Build compact Ant Design table with columns:
- WO No. (`WO-20261001-01` in monospace `tnum`)
- Product & Spec (`Precision Hydraulic Valve V2 / 精密液压阀`)
- Workstation/Line (`Line A-02`)
- Plan / Actual (`500 / 465 pcs`)
- Progress (Ant Design `Progress` bar)
- Status Tag (`In Production | 生产中` in blue, `QC | 质检中` in amber, `Completed | 已完工` in green)
- Actions (`Detail / 详情`, `Dispatch / 报工`)

- [ ] **Step 2: Verify build**

Run: `npm run build` in `frontend/`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/dashboard/components/PriorityWorkOrdersCard.tsx
git commit -m "feat(frontend): create priority work orders progress table component"
```

---

### Task 7: Hourly Production Output & Yield Chart (`HourlyThroughputCard`)

**Files:**
- Create: `frontend/src/features/dashboard/components/HourlyThroughputCard.tsx`

**Interfaces:**
- Produces: `HourlyThroughputCard` displaying hourly production throughput bars (Target vs Actual) and a yield rate line (`98.6%`).

- [ ] **Step 1: Implement `HourlyThroughputCard.tsx`**

Build visual chart component using clean SVG / CSS grid displaying:
- Time slots: 08:00, 09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00.
- Legend: Target Output (`#e5e7eb`), Actual Output (`#1677ff`), Yield Rate (`#52c41a`).
- Summary footer: OEE, Availability, Performance, Cycle Time.

- [ ] **Step 2: Verify build**

Run: `npm run build` in `frontend/`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/dashboard/components/HourlyThroughputCard.tsx
git commit -m "feat(frontend): create hourly production throughput and yield chart"
```

---

### Task 8: Material Shortage Alerts & Quick PO Action (`MaterialShortageCard`)

**Files:**
- Create: `frontend/src/features/dashboard/components/MaterialShortageCard.tsx`

**Interfaces:**
- Consumes: `MaterialShortageItem[]`.
- Produces: `MaterialShortageCard` with deficit badges, urgent red highlight, and modal trigger for "Quick PO | 一键采购".

- [ ] **Step 1: Implement `MaterialShortageCard.tsx`**

Table with columns:
- Material Name & Code (`RM-STEEL-304 / 304不锈钢棒材`)
- Stock / Safety Min (`45 kg / Min: 150 kg`)
- Deficit (`-105 kg` in bold red font)
- Action: "Quick PO | 一键采购" button (Ant Design `Button` type="primary" size="small" triggering confirmation notification or PO creation modal).

- [ ] **Step 2: Verify build**

Run: `npm run build` in `frontend/`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/dashboard/components/MaterialShortageCard.tsx
git commit -m "feat(frontend): create material shortage alert card with quick PO action"
```

---

### Task 9: Real-Time Warehouse Stock Movements Timeline (`StockMovementsTimelineCard`)

**Files:**
- Create: `frontend/src/features/dashboard/components/StockMovementsTimelineCard.tsx`

**Interfaces:**
- Consumes: `StockMovementItem[]`.
- Produces: `StockMovementsTimelineCard` with transaction type filter tags, Ant Design `Timeline`, and location badges.

- [ ] **Step 1: Implement `StockMovementsTimelineCard.tsx`**

Timeline items showing:
- Timestamp (e.g., `10:45 AM`)
- Movement Type (`PO Inbound | 采购入库`, `Production Issue | 生产领料`, `Outbound | 销售出库`, `QC Return | 质检退库`)
- Item & Qty (`+500 kg Alloy Steel`, `-80 pcs Bearings #6204`)
- Source/Destination warehouse locations.

- [ ] **Step 2: Verify build**

Run: `npm run build` in `frontend/`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/dashboard/components/StockMovementsTimelineCard.tsx
git commit -m "feat(frontend): create warehouse stock movements timeline component"
```

---

### Task 10: Assemble Dashboard View & Full Verification

**Files:**
- Modify: `frontend/src/features/dashboard/components/DashboardView.tsx`
- Modify: `frontend/src/features/dashboard/index.ts`

**Interfaces:**
- Assembles all components into the dual-column layout (66% Left / 34% Right).

- [ ] **Step 1: Integrate all components in `DashboardView.tsx`**

Assemble `KpiMetricsStrip`, `PriorityWorkOrdersCard`, `HourlyThroughputCard`, `MaterialShortageCard`, and `StockMovementsTimelineCard` in `DashboardView.tsx`. Add auto-refresh timer logic (10s interval) and manual refresh callback.

- [ ] **Step 2: Update `features/dashboard/index.ts`**

Export `DashboardView` cleanly.

- [ ] **Step 3: Run comprehensive verification**

Run in `frontend/`:
1. `npm run lint` -> must exit code 0.
2. `npm run build` -> must build successfully without errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/dashboard/
git commit -m "feat(dashboard): assemble complete industrial enterprise ERP/MES dashboard view"
```
