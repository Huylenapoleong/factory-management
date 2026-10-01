# Factory Management System

> **Standalone White-label Manufacturing Management Platform**  
> Built from scratch with a Modular Monolith architecture, single shared codebase, independent customer deployments, and dedicated PostgreSQL databases per tenant.

---

## 1. Overview

The **Factory Management System** is an enterprise-grade solution designed for discrete manufacturing facilities and warehouses. It provides end-to-end operational visibility:

- **Inventory & Warehouse:** Real-time transaction-based balances, multi-warehouse, location-level tracking, negative stock protection.
- **Purchasing:** Suppliers, Purchase Orders (PO), Goods Receipts (GR), price history.
- **Production:** Multi-level BOM, Routing & operations, Production Orders (MO), material issues, real-time progress tracking, finished goods receipt.
- **Sales:** Customers, Sales Orders (SO), delivery fulfillment, automated stock deductions.
- **White-label & System Settings:** Per-tenant branding (company name, logo, currency, date/number formats) driven strictly by configuration.
- **Internationalization (i18n):** English (`en`) and Simplified Chinese (`zh-CN`).

---

## 2. Technical Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19.3, TypeScript, Vite, Ant Design 6, TanStack Query v5, Zustand, Axios, i18next, Apache ECharts, Day.js |
| **Backend** | Java 25 LTS (compatible with Java 23), Spring Boot 4.1.x, Spring Data JPA, Hibernate, Spring Security (JWT Access + Refresh), Jakarta Validation, MapStruct, Flyway, Springdoc OpenAPI 3.x |
| **Database** | PostgreSQL 18.x (dedicated instance/database per customer) |
| **Infrastructure** | Docker, Docker Compose, Nginx Reverse Proxy |

---

## 3. Repository Structure

```text
factory-management/
├── frontend/               # React 19 + TypeScript + Ant Design 6 Single Page Application
├── backend/                # Spring Boot Modular Monolith REST API
├── deploy/                 # Docker Compose, Nginx reverse proxy configuration & env templates
├── docs/                   # Architecture, Database schema & API documentation
├── .gitignore              # Repository git ignore rules
├── CHANGELOG.md            # Version changelog
└── README.md               # Project documentation
```

---

## 4. Getting Started

### Prerequisites
- **Node.js**: v24 LTS (or >= v20)
- **Java JDK**: 23 (or 25)
- **Maven**: 3.9+
- **Docker & Docker Compose**

### Running with Docker Compose
```bash
cd deploy
cp env.example .env
docker compose up -d
```

### Local Development

#### Backend
```bash
cd backend
mvn clean spring-boot:run
```
Backend will be available at: `http://localhost:8080` (API documentation at `/swagger-ui.html`).

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend development server will be available at: `http://localhost:5173`.