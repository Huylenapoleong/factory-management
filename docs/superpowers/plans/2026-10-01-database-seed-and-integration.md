# Database Seed & Full-Stack Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure PostgreSQL on non-standard port 5433 to avoid port collisions, seed comprehensive factory data covering all 14 business modules, and configure full-stack integration between Frontend and Spring Boot Backend.

**Architecture:** PostgreSQL runs on host port 5433 mapped to container 5432. Flyway migrations (`V1` - `V7`) establish tables and configuration, followed by a new migration `V8__seed_data.sql` and enhanced `DataInitializer.java` providing full operational seed coverage. Vite reverse-proxies `/api/v1` calls to the Spring Boot application running on port 8080.

**Tech Stack:** Spring Boot 3.4, Java 23, PostgreSQL 18-alpine, Flyway, Hibernate 6, Vite 8, React 19, Ant Design 5.

**Spec:** `factory-management-final-spec-techstack.md`

## Global Constraints
- Target PostgreSQL host port: 5433 (Port 5432 is strictly reserved by the host environment).
- Backend API base prefix: `/api/v1`.
- Default credentials: `admin / admin123`, `operator / operator123`.
- Passwords must be encoded via Spring Security's `PasswordEncoder` (BCrypt).
- Seed data must mirror the UI mock/demo entities for complete operational realism.
- No raw emojis in code or database strings; use proper industrial codes and UTF-8 characters.

---

### Task 1: PostgreSQL Port Configuration & Deployment Environment

**Files:**
- Modify: `deploy/docker-compose.yml:10-15`
- Modify: `deploy/.env:30-36`
- Modify: `deploy/env.example:30-36`
- Modify: `backend/src/main/resources/application.yml:7-12`

**Interfaces:**
- Consumes: Host environment variables `DB_HOST_PORT` or defaults to `5433`.
- Produces: PostgreSQL available at `localhost:5433` for local Spring Boot development and container networking.

- [ ] **Step 1: Update `deploy/docker-compose.yml` to support configurable host port**
  Map host port `${DB_HOST_PORT:-5433}:5432` so port 5432 on the host machine is never touched.

- [ ] **Step 2: Update `deploy/.env` and `deploy/env.example`**
  Set `DB_HOST_PORT=5433` and update comments explaining port 5433 usage.

- [ ] **Step 3: Update `backend/src/main/resources/application.yml`**
  Update default fallback URL to `jdbc:postgresql://localhost:5433/factory_db`.

- [ ] **Step 4: Verify Docker compose configuration validity**
  Run: `docker compose -f deploy/docker-compose.yml config` to confirm valid YAML syntax.

- [ ] **Step 5: Commit changes**
  Run: `git add deploy/ backend/src/main/resources/application.yml && git commit -m "chore(db): configure postgres on port 5433 to avoid port collisions"`

---

### Task 2: Comprehensive Seed Data Migration (`V8__seed_data.sql`)

**Files:**
- Create: `backend/src/main/resources/db/migration/V8__seed_data.sql`

**Interfaces:**
- Consumes: Tables created by `V1__init.sql` through `V7__settings.sql`.
- Produces: Populated Master Data (Categories, UOMs, Items, Warehouses, Locations, Suppliers, Customers), Inventory Balances, POs, Goods Receipts, Work Orders, Routings, BOMs, SOs, and Deliveries.

- [ ] **Step 1: Define Categories & Units of Measurement**
  Insert standard industrial categories (`CAT-RM`, `CAT-SEMI`, `CAT-FG`, `CAT-CONS`, `CAT-ELEC`) and units (`PCS`, `KG`, `M`, `SET`, `L`).

- [ ] **Step 2: Define Master Items (SKUs)**
  Insert active parts matching UI: `RM-STEEL-304`, `ELEC-MOTOR-750W`, `SEAL-RING-NBR50`, `FASTENER-M8-30`, `ALLOY-AL6061-T6`, `HYD-VALVE-CORE-02`, `SENS-LASER-DIST-01`, `HV-204`, `PCB-8801`, `A-3001`.

- [ ] **Step 3: Define Warehouses and Locations**
  Insert `WH-01` (Main Raw Materials), `WH-02` (Sub-Assembly Staging), `WH-03` (Finished Goods & Heavy Machinery), `WH-04` (Quarantine & Inbound QC), with locations `A-03-02`, `B-01-04`, `C-04-01`, `D-02-05`, `E-02-11`, `S-01-01`, `QC-HOLD-01`.

- [ ] **Step 4: Define Suppliers and Customers**
  Insert Suppliers (Baosteel, Inovance, Parker Hannifin, Dongguan Standard Fasteners, Omron) and Customers (Munich Automotive, Foxconn Precision, Siemens Energy).

- [ ] **Step 5: Define Inventory Balances & Lots**
  Insert stock balances with lot tracking: `26Q4-LOT08` (2,450 kg), `LOT-20261001-A` (8 pcs), `LOT-09201-B` (120 pcs), `26H2-FAST01` (19,400 pcs), `LOT-20260918` (1,850 kg), `LOT-VALV-441` (350 pcs).

- [ ] **Step 6: Define Purchasing (POs & Goods Receipts)**
  Insert Purchase Orders `PO-202610-08812`, `PO-202610-08819`, `PO-202610-08824`, `PO-202610-08831` with line items, and Goods Receipts `GRN-20261024-019`, `GRN-20261024-022`.

- [ ] **Step 7: Define Production (Work Orders, BOM Components & Routings)**
  Insert Work Orders `WO-20261001-01` (Precision Hydraulic Valve V2, URGENT, 5-step routing), `WO-20261001-02` (Controller PCB-8801), `WO-20261001-03` (Drive Pump A-3001), with corresponding BOM requirements.

- [ ] **Step 8: Define Sales & Deliveries**
  Insert Sales Orders `SO-202610-0041` (Munich Automotive), `SO-202610-0042` (Foxconn Precision) and Delivery Order `DO-20261025-01`.

- [ ] **Step 9: Commit migration**
  Run: `git add backend/src/main/resources/db/migration/V8__seed_data.sql && git commit -m "feat(db): add V8 comprehensive industrial seed data migration"`

---

### Task 3: Enhance `DataInitializer.java` for Full RBAC Accounts

**Files:**
- Modify: `backend/src/main/java/com/company/factory/common/config/DataInitializer.java:25-65`

**Interfaces:**
- Consumes: `RoleRepository`, `UserRepository`, `PasswordEncoder`.
- Produces: Initialized users with BCrypt passwords matching all workshop roles.

- [ ] **Step 1: Add seed users with BCrypt password hashing**
  Initialize:
  - `admin / admin123` (Admin / Plant Director)
  - `operator / operator123` (Shop Floor Operator)
  - `director_zhang / zhang123` (Plant Director)
  - `dispatcher_wang / wang123` (Production Dispatcher)
  - `clerk_liu / liu123` (Warehouse Clerk)
  - `qc_qian / qian123` (Quality Inspector)

- [ ] **Step 2: Assign corresponding roles**
  Link users to `ADMIN`, `MANAGER`, `OPERATOR`, `WAREHOUSE`, `PRODUCTION`, `PURCHASING`, `SALES`, `VIEWER` roles.

- [ ] **Step 3: Compile backend to verify clean build**
  Run: `mvn compile -DskipTests` in `backend/`.

- [ ] **Step 4: Commit changes**
  Run: `git add backend/src/main/java/com/company/factory/common/config/DataInitializer.java && git commit -m "feat(auth): initialize demo operator and managerial accounts in DataInitializer"`

---

### Task 4: Frontend Vite Proxy Configuration for Backend Integration

**Files:**
- Modify: `frontend/vite.config.ts`

**Interfaces:**
- Consumes: Vite dev server running on port 5173.
- Produces: Proxy routing for `/api/v1` requests forwarding to Spring Boot at `http://localhost:8080`.

- [ ] **Step 1: Check existing `frontend/vite.config.ts`**
  Verify whether `/api` proxy target is set to `http://localhost:8080` with `changeOrigin: true`.

- [ ] **Step 2: Ensure correct proxy configuration**
  Add or refine server proxy block in `vite.config.ts`.

- [ ] **Step 3: Verify frontend build**
  Run: `npm run build` in `frontend/`.

- [ ] **Step 4: Commit changes**
  Run: `git add frontend/vite.config.ts && git commit -m "feat(frontend): ensure /api/v1 proxy forwarding to backend in vite.config"`

---

### Task 5: Database Spin-up & Full End-to-End Smoke Test

**Files:**
- Verification only: Database container, Spring Boot backend, Frontend live query.

- [ ] **Step 1: Start PostgreSQL container on port 5433**
  Run: `docker compose -f deploy/docker-compose.yml up -d postgres`
  Verify port 5433 is listening: `netstat -ano | findstr :5433` (or Docker status).

- [ ] **Step 2: Run Flyway migration via Spring Boot backend**
  Start backend or run test: `mvn test-compile` / test run to verify Flyway applies `V1` through `V8` without errors.

- [ ] **Step 3: Verify seed data via API endpoint or SQL count query**
  Verify tables have records (Users, Items, Warehouses, Orders).

- [ ] **Step 4: Test frontend login with seeded `admin / admin123` and `operator / operator123`**
  Verify token issuance and navigation to dashboard.
