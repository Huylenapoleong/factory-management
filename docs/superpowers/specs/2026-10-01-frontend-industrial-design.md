# Frontend Industrial Design Specification: Factory Management ERP/MES

- **Date:** 2026-10-01
- **Target Audience:** Factory Managers, Production Planners, Workshop Supervisors, Warehouse Keepers, Supply Chain Operators (Bilingual: English & Simplified Chinese / 简中).
- **Core Philosophy:** Strictly pragmatic, zero AI-gimmick design. Modeled on Ant Design Pro and Chinese high-density enterprise manufacturing systems (Kingdee, Yonyou, DingTalk MES).
- **Stitch Project ID:** `8042374000305828178`
- **Stitch Design System:** `assets/08fbd18c14b64325996bfb71c603e2dc` (*Precision Industrial ERP*)

---

## 1. Visual Language & Design Tokens

### 1.1 Color Hierarchy & Surface Elevation
- **Canvas / Background:** `#f0f2f5` (Industrial light gray, eliminates glare in factory offices).
- **Card Surfaces:** `#ffffff` with a crisp `1px solid #e5e7eb` structural border and micro-elevation (`box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03)`).
- **Primary Technical Cobalt:** `#1677ff` (Ant Design 6 primary blue for active tabs, primary buttons, links).
- **Text Hierarchy:**
  - High-contrast Charcoal (`#1f2937` / `#141414`) for primary headers and data values.
  - Secondary Gray (`#6b7280`) for metadata and column headers.
  - Muted Gray (`#9ca3af`) for units (`pcs`, `kg`, `h`) and timestamps.
- **Operational Status Colors (Strict Semantic Data):**
  - **Success (`#52c41a` / bg `#f6ffed` / border `#b7eb8f`):** Completed, Running, In Stock, Normal.
  - **Warning (`#faad14` / bg `#fffbe6` / border `#ffe58f`):** Pending, Low Stock, QC Inspection, Near Deadline.
  - **Danger / Urgent (`#ff4d4f` / bg `#fff1f0` / border `#ffa39e`):** Critical Shortage, Scrapped, Line Stoppage.
  - **Info / Planned (`#1677ff` / bg `#e6f4ff` / border `#91caff`):** In Production, Dispatched, Scheduled.

### 1.2 Typography & Numerals
- **Font Stack:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `'PingFang SC'`, `'Microsoft YaHei'`, `sans-serif`.
- **Tabular Figures:** Monospace lining digits (`font-variant-numeric: tabular-nums`) for all order codes (`WO-20261001-01`), lot numbers, quantities, and timestamps to ensure vertical alignment across data rows.
- **Bilingual Structure:** Every label pairs concise English with Simplified Chinese subtitle/inline text (e.g. `Priority Work Orders | 重点生产工单`).

---

## 2. Layout Architecture & Navigation Shell

### 2.1 Fixed App Shell
- **Sidebar (Collapsible 208px -> 64px):**
  - Brand header: WIFIM MES / 制造执行系统 with industrial badge.
  - Menu Items:
    1. Dashboard / 实时看板 (`/dashboard`)
    2. Work Orders & Production / 生产工单 (`/production/orders`)
    3. Production Lines & Routing / 产线与工艺 (`/production/routing`)
    4. Inventory & Stock Balances / 物料仓储 (`/inventory`)
    5. Purchasing & PO / 采购管理 (`/purchasing`)
    6. Sales & Delivery / 销售与出库 (`/sales`)
    7. Master Data / 主数据管理 (`/masterdata`)
    8. Quality & Audit Logs / 质检与日志 (`/audit`)
    9. System Settings / 系统设置 (`/settings`)
- **Top Header Bar (Height 50px, border-bottom `#e5e7eb`):**
  - Workshop & Line Selector dropdown (e.g., `Workshop 01 - Heavy Machining | 第一车间`).
  - Shift Indicator badge with live status (`Shift A (08:00 - 16:30) | 早班`).
  - System Health & Line Status badge (`All Lines Operational | 产线正常运行`).
  - Bilingual Toggle (`EN / 简中`).
  - Urgent Alert Notification Bell (showing real-time badge count of critical stock deficits).
  - Current User pill (`Plant Director Zhang (Admin) | 张厂长`).
- **Breadcrumb & Context Bar:**
  - Real-time timestamp with auto-refresh interval (`Auto-refresh: 10s`).
  - Manual Refresh button.

---

## 3. Primary Screen: Factory & Warehouse Dashboard

### 3.1 KPI Metrics Strip (Row of 4 Cards)
1. **Daily Plan Completion | 今日计划达成率:**
   - Value: `94.2%` (Target: 95.0%, `+2.4% vs yesterday`).
   - Visual: Linear Ant Design green progress bar.
2. **Active Work Orders | 进行中工单:**
   - Value: `18 Orders`.
   - Badges: `2 Near Deadline | 2单临期` (Warning amber), `14 On Schedule`, `2 Delayed`.
3. **Low Safety Stock Alerts | 安全库存预警:**
   - Value: `5 Items`.
   - Badges: `Critical Shortage | 严重缺料` (Urgent red). Subtext: `3 Raw Metals, 2 Electrical`.
4. **Pending Outbound Shipments | 今日待发货:**
   - Value: `12 Orders`.
   - Badges: `8 Dispatched | 8单已发` (Blue). Subtext: `Next pickup: 13:30 Carrier`.

### 3.2 Main Grid Layout (66% Left / 34% Right)
- **Left Column (Production Execution & Throughput):**
  - **Priority Work Orders Progress Table:**
    - Filter tabs: All (18), In Production (11), QC Inspection (4), Completed (3).
    - Search input & Export CSV button.
    - Columns: WO Number, Product & Spec, Workstation/Line, Plan vs Actual, Progress Bar (AntD), Status Tag, Actions (`Detail / 详情`, `Dispatch / 报工`).
  - **Hourly Output & Yield Rate Chart:**
    - Dual-axis chart: Bar chart for Target Output vs Actual Output per hour (08:00 to 17:00), Line chart for Yield Rate (`98.6%`).
- **Right Column (Supply Chain Deficits & Stock Flow):**
  - **Critical Material Shortage Alert Card:**
    - Alert pill: `5 Critical Deficits | 5项严重缺料`.
    - Compact data table: Material Code & Name, Current Stock vs Safety Min, Deficit quantity (bold red text), Quick action button `Quick PO / 一键采购` (opens PO creation modal pre-filled with required deficit quantity).
  - **Real-Time Warehouse Stock Movements:**
    - Filter tags: All, Inbound, Outbound, Transfer.
    - Timeline list displaying real-time transactions with timestamps, document references, batch numbers, and warehouse locations.

---

## 4. Frontend Component Implementation Plan

1. **State & i18n:**
   - Utilize existing `react-i18next` with complete English (`en`) and Simplified Chinese (`zh-CN`) dictionary files.
   - Global context / zustand store for active Workshop, active Shift, and real-time dashboard refresh.
2. **Ant Design 6 Theme Config (`antd/es/theme`):**
   - Compact algorithm (`theme.compactAlgorithm`).
   - Token overrides matching Stitch Design System (`colorPrimary: #1677ff`, `borderRadius: 4`, `colorBgLayout: #f0f2f5`).
3. **Data Integration:**
   - Connect directly to backend endpoints:
     - `GET /api/v1/reporting/dashboard/summary` (KPI cards).
     - `GET /api/v1/reporting/dashboard/production-progress` (Work Orders table).
     - `GET /api/v1/reporting/dashboard/low-stock` (Material shortages).
     - `GET /api/v1/inventory/movements` (Stock timeline).
