# API Design Specification & Standards

## 1. Protocol & Base Paths
- Base URL: `/api/v1`
- Format: JSON (`Content-Type: application/json; charset=UTF-8`)
- Authentication Header: `Authorization: Bearer <access_token>`
- Documentation: Springdoc OpenAPI (`/swagger-ui.html`, `/v3/api-docs`)

## 2. Standard Response Envelopes

### Success Response (Single Object)
```json
{
  "data": {
    "id": 1,
    "code": "RM-STEEL-001"
  },
  "message": "success"
}
```

### Paginated Response
```json
{
  "data": [
    { "id": 1, "code": "RM-STEEL-001" }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 100,
  "totalPages": 5
}
```

### Error Response
```json
{
  "timestamp": "2026-10-01T10:00:00Z",
  "status": 400,
  "code": "INSUFFICIENT_STOCK",
  "message": "Insufficient stock in warehouse",
  "details": [
    "Requested 50, but available is 20"
  ]
}
```

## 3. Core API Endpoint Groups
- `/api/v1/auth/**` - Login, Refresh, Logout, Current User
- `/api/v1/items/**` - Items & Master Data CRUD
- `/api/v1/warehouses/**` - Warehouses & Locations
- `/api/v1/inventory/**` - Current Balances & Stock Transactions
- `/api/v1/suppliers/**` - Suppliers & Pricing
- `/api/v1/purchase-orders/**` - PO creation, confirmation, Goods Receipt
- `/api/v1/boms/**` - Bills of Materials
- `/api/v1/routings/**` - Production routings and operations
- `/api/v1/production-orders/**` - Production release, start, progress report, completion
- `/api/v1/customers/**` - Customer master data
- `/api/v1/sales-orders/**` - Sales orders & delivery dispatch
- `/api/v1/dashboard/**` - KPI summaries, low stock alerts, production progress
- `/api/v1/settings/**` - White-label branding & feature flag configurations
