# Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Modular Monolith backend for the Factory Management Platform covering Authentication, RBAC, System Settings, Master Data, Inventory Balances & Transactions, Purchasing, Production, Sales, and Dashboard APIs based on `factory-management-final-spec-techstack.md`.

**Architecture:** Spring Boot 4.1.1 Modular Monolith with Spring Security (JWT), Spring Data JPA, PostgreSQL 18, Flyway migrations, pessimistic locking on inventory balances, atomic database transactions, and MapStruct DTO mappers.

**Tech Stack:** Java 23/25, Spring Boot 4.1.1, Spring Data JPA, Hibernate, PostgreSQL 18, Flyway, JJWT 0.13.0, Springdoc OpenAPI 3.1.1, MapStruct 1.6.3, Testcontainers 1.20.6, JUnit 5.

**Spec:** `factory-management-final-spec-techstack.md`

## Global Constraints
- Single codebase, independent customer database deployment (no `tenant_id` column).
- Modular Monolith: All 13 modules under `com.company.factory.<module>` with 7 layers (`controller`, `service`, `domain`, `repository`, `dto`, `mapper`, `validation`).
- Standard API response envelope: `ApiResponse<T>`, `PageResponse<T>`, `ErrorResponse`.
- Transactional atomicity: Stock mutation must create `stock_transactions` and update `inventory_balances` atomically within `@Transactional`.
- Inventory concurrency control: Pessimistic write lock (`@Lock(LockModeType.PESSIMISTIC_WRITE)`) on `inventory_balances` to strictly prevent negative stock and double-issuing.
- Passwords must be hashed using BCrypt (`PasswordEncoder`).

---

### Task 1: Security & Authentication Infrastructure
**Files:**
- Create: `backend/src/main/java/com/company/factory/auth/domain/RefreshToken.java`
- Create: `backend/src/main/java/com/company/factory/auth/repository/RefreshTokenRepository.java`
- Create: `backend/src/main/java/com/company/factory/common/config/SecurityConfig.java`
- Create: `backend/src/main/java/com/company/factory/common/config/JwtTokenProvider.java`
- Create: `backend/src/main/java/com/company/factory/common/config/JwtAuthenticationFilter.java`
- Test: `backend/src/test/java/com/company/factory/auth/JwtTokenProviderTest.java`

**Interfaces:**
- Consumes: `app.jwt.secret`, `app.jwt.access-expiration`, `app.jwt.refresh-expiration` from `application.yml`
- Produces: `JwtTokenProvider.generateAccessToken(UserDetails)`, `generateRefreshToken(UserDetails)`, `validateToken(String)`

- [ ] **Step 1: Write unit test for JwtTokenProvider**
- [ ] **Step 2: Implement JwtTokenProvider with JJWT 0.13.0**
- [ ] **Step 3: Implement JwtAuthenticationFilter and SecurityConfig (CORS, CSRF disable, Stateless Session, permit /api/v1/auth/**, /swagger-ui/**, /v3/api-docs/**, /actuator/**)**
- [ ] **Step 4: Run unit tests to verify token generation and validation**
- [ ] **Step 5: Commit changes**

---

### Task 2: User, Role & Authentication APIs
**Files:**
- Create: `backend/src/main/java/com/company/factory/role/domain/Role.java`
- Create: `backend/src/main/java/com/company/factory/role/repository/RoleRepository.java`
- Create: `backend/src/main/java/com/company/factory/user/domain/User.java`
- Create: `backend/src/main/java/com/company/factory/user/repository/UserRepository.java`
- Create: `backend/src/main/java/com/company/factory/user/service/UserService.java`
- Create: `backend/src/main/java/com/company/factory/auth/dto/LoginRequest.java`
- Create: `backend/src/main/java/com/company/factory/auth/dto/AuthResponse.java`
- Create: `backend/src/main/java/com/company/factory/auth/dto/UserResponse.java`
- Create: `backend/src/main/java/com/company/factory/auth/service/AuthService.java`
- Create: `backend/src/main/java/com/company/factory/auth/controller/AuthController.java`
- Test: `backend/src/test/java/com/company/factory/auth/AuthControllerTest.java`

**Interfaces:**
- Consumes: `UserRepository`, `RoleRepository`, `JwtTokenProvider`, `PasswordEncoder`
- Produces: `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`

- [ ] **Step 1: Write integration test for AuthController (Login, Me, Refresh)**
- [ ] **Step 2: Implement User & Role entities and Spring Data repositories**
- [ ] **Step 3: Implement AuthService & CustomUserDetailsService**
- [ ] **Step 4: Implement AuthController endpoints returning standard `ApiResponse<AuthResponse>`**
- [ ] **Step 5: Run tests to verify authentication flow**
- [ ] **Step 6: Commit changes**

---

### Task 3: System Settings & White-label APIs
**Files:**
- Create: `backend/src/main/java/com/company/factory/settings/domain/SystemSetting.java`
- Create: `backend/src/main/java/com/company/factory/settings/repository/SystemSettingRepository.java`
- Create: `backend/src/main/java/com/company/factory/settings/service/SystemSettingService.java`
- Create: `backend/src/main/java/com/company/factory/settings/dto/SettingResponse.java`
- Create: `backend/src/main/java/com/company/factory/settings/controller/SystemSettingController.java`
- Test: `backend/src/test/java/com/company/factory/settings/SystemSettingServiceTest.java`

**Interfaces:**
- Consumes: `system_settings` table (V7 migration seed data)
- Produces: `GET /api/v1/settings`, `PUT /api/v1/settings` (Admin only)

- [ ] **Step 1: Write unit test for SystemSettingService**
- [ ] **Step 2: Implement SystemSetting entity and repository**
- [ ] **Step 3: Implement SystemSettingService with cache/reload support**
- [ ] **Step 4: Implement SystemSettingController**
- [ ] **Step 5: Run tests and verify**
- [ ] **Step 6: Commit changes**

---

### Task 4: Master Data Modules (Items, Warehouses, Locations, Suppliers, Customers)
**Files:**
- Create: Entities, Repositories, DTOs, Services, and Controllers for:
  - `masterdata`: `ItemCategory`, `UnitOfMeasurement`, `Item`
  - `inventory`: `Warehouse`, `WarehouseLocation`
  - `supplier`: `Supplier`
  - `customer`: `Customer`
- Test: `backend/src/test/java/com/company/factory/masterdata/ItemServiceTest.java`

**Interfaces:**
- Consumes: Tables from `V2__master_data.sql`
- Produces: CRUD endpoints with pagination (`PageResponse<T>`) for Items, Warehouses, Locations, Suppliers, Customers.

- [ ] **Step 1: Write unit tests for Item & Warehouse CRUD validation (unique code, active status)**
- [ ] **Step 2: Implement Entities & Repositories with JPA Specifications for filtering**
- [ ] **Step 3: Implement Services with MapStruct mappers**
- [ ] **Step 4: Implement REST Controllers (`/api/v1/items`, `/api/v1/warehouses`, `/api/v1/suppliers`, `/api/v1/customers`)**
- [ ] **Step 5: Run tests and verify**
- [ ] **Step 6: Commit changes**

---

### Task 5: Inventory Balances & Atomic Stock Transactions
**Files:**
- Create: `backend/src/main/java/com/company/factory/inventory/domain/InventoryBalance.java`
- Create: `backend/src/main/java/com/company/factory/inventory/domain/StockTransaction.java`
- Create: `backend/src/main/java/com/company/factory/inventory/domain/TransactionType.java`
- Create: `backend/src/main/java/com/company/factory/inventory/repository/InventoryBalanceRepository.java`
- Create: `backend/src/main/java/com/company/factory/inventory/repository/StockTransactionRepository.java`
- Create: `backend/src/main/java/com/company/factory/inventory/service/InventoryService.java`
- Create: `backend/src/main/java/com/company/factory/inventory/controller/InventoryController.java`
- Test: `backend/src/test/java/com/company/factory/inventory/InventoryConcurrencyTest.java`

**Interfaces:**
- Consumes: `Item`, `Warehouse`, `WarehouseLocation`
- Produces: `InventoryService.increaseStock(...)`, `InventoryService.decreaseStock(...)`, `GET /api/v1/inventory`, `GET /api/v1/stock-transactions`

- [ ] **Step 1: Write test for negative stock prevention and pessimistic write lock**
- [ ] **Step 2: Implement InventoryBalance entity with `@Version` and repository with `@Lock(LockModeType.PESSIMISTIC_WRITE)`**
- [ ] **Step 3: Implement StockTransaction entity and repository**
- [ ] **Step 4: Implement InventoryService with atomic `@Transactional` stock mutation methods**
- [ ] **Step 5: Implement InventoryController**
- [ ] **Step 6: Run concurrency and boundary tests**
- [ ] **Step 7: Commit changes**

---

### Task 6: Purchasing Module (Purchase Orders & Goods Receipts)
**Files:**
- Create: `backend/src/main/java/com/company/factory/purchasing/domain/PurchaseOrder.java`
- Create: `backend/src/main/java/com/company/factory/purchasing/domain/PurchaseOrderItem.java`
- Create: `backend/src/main/java/com/company/factory/purchasing/domain/GoodsReceipt.java`
- Create: `backend/src/main/java/com/company/factory/purchasing/domain/GoodsReceiptItem.java`
- Create: `backend/src/main/java/com/company/factory/purchasing/repository/PurchaseOrderRepository.java`
- Create: `backend/src/main/java/com/company/factory/purchasing/repository/GoodsReceiptRepository.java`
- Create: `backend/src/main/java/com/company/factory/purchasing/service/PurchaseOrderService.java`
- Create: `backend/src/main/java/com/company/factory/purchasing/service/GoodsReceiptService.java`
- Create: `backend/src/main/java/com/company/factory/purchasing/controller/PurchaseOrderController.java`
- Create: `backend/src/main/java/com/company/factory/purchasing/controller/GoodsReceiptController.java`
- Test: `backend/src/test/java/com/company/factory/purchasing/GoodsReceiptPostingTest.java`

**Interfaces:**
- Consumes: `InventoryService.increaseStock(...)`, `SupplierRepository`, `ItemRepository`
- Produces: PO lifecycle (`POST /api/v1/purchase-orders`, `confirm`, `cancel`), Goods Receipt posting (`POST /api/v1/goods-receipts/{id}/post`) which atomically increments inventory balances and records price history.

- [ ] **Step 1: Write test verifying Goods Receipt posting increases stock and updates PO status**
- [ ] **Step 2: Implement PO & Goods Receipt domain models, items, and repositories**
- [ ] **Step 3: Implement PO lifecycle management service**
- [ ] **Step 4: Implement GoodsReceiptService: validate remaining PO quantity -> create PURCHASE_IN stock transaction -> increase inventory balance -> update PO received_quantity**
- [ ] **Step 5: Implement REST Controllers**
- [ ] **Step 6: Run tests and verify**
- [ ] **Step 7: Commit changes**

---

### Task 7: Production Module (BOM, Routing, Production Orders & Operations)
**Files:**
- Create: `backend/src/main/java/com/company/factory/production/domain/Bom.java`, `BomItem.java`
- Create: `backend/src/main/java/com/company/factory/production/domain/Routing.java`, `RoutingStep.java`
- Create: `backend/src/main/java/com/company/factory/production/domain/ProductionOrder.java`
- Create: `backend/src/main/java/com/company/factory/production/domain/ProductionMaterial.java`
- Create: `backend/src/main/java/com/company/factory/production/domain/ProductionOperation.java`
- Create: Repositories, Services, and Controllers for BOM, Routing, and Production Orders
- Test: `backend/src/test/java/com/company/factory/production/ProductionOrderWorkflowTest.java`

**Interfaces:**
- Consumes: `InventoryService.decreaseStock(...)` (Material Issue) and `InventoryService.increaseStock(...)` (Finished Goods Receipt)
- Produces: BOM/Routing CRUD, MO lifecycle (`release`, `start`, `pause`, `complete`), operation progress reporting (`POST /api/v1/production-operations/{id}/report`).

- [ ] **Step 1: Write test for MO release (material reservation), material issue (stock reduction), and MO completion (FG receipt)**
- [ ] **Step 2: Implement BOM & Routing entities, repositories, and services**
- [ ] **Step 3: Implement ProductionOrder domain models and repositories**
- [ ] **Step 4: Implement ProductionOrderService: explode BOM to required materials, track operations sequence, handle material issue transactions and finished goods receipts**
- [ ] **Step 5: Implement REST Controllers (`/api/v1/boms`, `/api/v1/routings`, `/api/v1/production-orders`, `/api/v1/production-operations`)**
- [ ] **Step 6: Run integration tests**
- [ ] **Step 7: Commit changes**

---

### Task 8: Sales Module (Sales Orders & Delivery Fulfillment)
**Files:**
- Create: `backend/src/main/java/com/company/factory/sales/domain/SalesOrder.java`, `SalesOrderItem.java`
- Create: `backend/src/main/java/com/company/factory/sales/domain/Delivery.java`, `DeliveryItem.java`
- Create: Repositories, Services, and Controllers for Sales Orders and Deliveries
- Test: `backend/src/test/java/com/company/factory/sales/DeliveryPostingTest.java`

**Interfaces:**
- Consumes: `InventoryService.decreaseStock(...)`, `CustomerRepository`
- Produces: SO lifecycle, Delivery dispatch (`POST /api/v1/deliveries/{id}/post`) which atomically decreases finished goods inventory.

- [ ] **Step 1: Write test for delivery validation: cannot deliver more than available stock or ordered quantity**
- [ ] **Step 2: Implement SalesOrder & Delivery domain models and repositories**
- [ ] **Step 3: Implement SalesOrderService and DeliveryService with SALE_OUT transaction logging and stock deduction**
- [ ] **Step 4: Implement REST Controllers (`/api/v1/sales-orders`, `/api/v1/deliveries`)**
- [ ] **Step 5: Run tests and verify**
- [ ] **Step 6: Commit changes**

---

### Task 9: Dashboard & Reporting APIs & Audit Log
**Files:**
- Create: `backend/src/main/java/com/company/factory/reporting/service/DashboardService.java`
- Create: `backend/src/main/java/com/company/factory/reporting/controller/DashboardController.java`
- Create: `backend/src/main/java/com/company/factory/audit/domain/AuditLog.java`
- Create: `backend/src/main/java/com/company/factory/audit/repository/AuditLogRepository.java`
- Create: `backend/src/main/java/com/company/factory/audit/service/AuditLogService.java`
- Test: `backend/src/test/java/com/company/factory/reporting/DashboardControllerTest.java`

**Interfaces:**
- Consumes: All module repositories
- Produces:
  - `GET /api/v1/dashboard/summary` (total items, active MOs, pending POs, open SOs)
  - `GET /api/v1/dashboard/production-progress`
  - `GET /api/v1/dashboard/low-stock`
  - `GET /api/v1/dashboard/recent-stock-transactions`
  - Audit logging interceptor/service for critical events

- [ ] **Step 1: Write unit tests for Dashboard summary and low stock queries**
- [ ] **Step 2: Implement AuditLog entity, repository, and service**
- [ ] **Step 3: Implement DashboardService with aggregation queries**
- [ ] **Step 4: Implement DashboardController**
- [ ] **Step 5: Run all backend tests and verify full suite passes**
- [ ] **Step 6: Commit changes**
