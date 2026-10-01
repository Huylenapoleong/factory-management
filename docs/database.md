# Database Design & Migration Specification

## 1. Database Engine
- **Engine:** PostgreSQL 18.x
- **Migration Framework:** Flyway (`src/main/resources/db/migration/`)
- **Naming Conventions:**
  - Table names: `snake_case` plural (e.g. `items`, `purchase_orders`)
  - Column names: `snake_case` (e.g. `category_id`, `created_at`)
  - Primary keys: `id BIGSERIAL` or `BIGINT GENERATED ALWAYS AS IDENTITY`

## 2. Flyway Migration Versioning

```text
db/migration/
├── V1__init.sql          # Users, Roles, Permissions, Refresh Tokens, Audit Logs
├── V2__master_data.sql   # Item Categories, UoM, Items, Warehouses, Locations, Suppliers, Customers
├── V3__inventory.sql     # Inventory Balances, Stock Transactions
├── V4__purchasing.sql    # Purchase Orders, PO Items, Goods Receipts, Goods Receipt Items, Price History
├── V5__production.sql    # BOMs, BOM Items, Routings, Routing Steps, Production Orders, Materials, Operations
├── V6__sales.sql         # Sales Orders, SO Items, Deliveries, Delivery Items
└── V7__settings.sql      # System Settings (White-label & Feature Flags)
```

## 3. Core Tables & Formulas

### Inventory Balance & Stock Transactions
Formula:
$$\text{available\_quantity} = \text{quantity} - \text{reserved\_quantity}$$
$$\text{current\_stock} = \sum \text{Stock In} - \sum \text{Stock Out} \pm \text{Adjustments}$$

### Concurrency & Consistency
- Critical inventory row locks: `SELECT ... FOR UPDATE` before stock deductions.
- Strict checks: `issue_quantity <= available_quantity`. Negative quantities are rejected at database and application levels.
