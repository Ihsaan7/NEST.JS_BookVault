<p align="center">
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/NestJS-Dark.svg" width="80" alt="NestJS" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/SQLite.svg" width="80" alt="SQLite" />
</p>

<h1 align="center">🏛️ Book-Vault API</h1>

<p align="center">
  <strong>A Curated Archival Library, Catalog & Circulation Backend Engine</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-v12.0-E0234E?style=flat&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/SQLite-v3-003B57?style=flat&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/TypeScript-v6-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Sentry-Monitoring-362D59?style=flat&logo=sentry&logoColor=white" alt="Sentry" />
  <img src="https://img.shields.io/badge/Vitest-E2E%20Tested-6E9F18?style=flat&logo=vitest&logoColor=white" alt="Vitest" />
  <img src="https://img.shields.io/badge/Auth-JWT%20%2B%20Bcrypt-000000?style=flat&logo=jsonwebtokens&logoColor=white" alt="Auth" />
</p>

---

## 📌 Project Focus & Disclaimer

> 💡 **Backend-First Architectural Project**  
> This application was constructed primarily to learn and master **NestJS server-side patterns** — enterprise modular architecture, custom dependency injection, route validation pipes, JWT authentication guards, role-based access control (RBAC), and SQLite relational data integrity.  
>  
> *Note on Frontend:* **AI was utilized to design and style the minimalist archival interface**, serving as a living testbed for the backend APIs without shifting focus away from backend engineering.

---

## 📑 Table of Contents

- [🏛️ Overview](#️-overview)
- [🧩 Architecture & Core Concepts](#-architecture--core-concepts)
- [📡 API Route Manifest (All 18 Routes)](#-api-route-manifest-all-18-routes)
- [🛡️ Security & Role Matrix](#️-security--role-matrix)
- [📈 Observability & Sentry](#-observability--sentry)
- [💾 Database Relational Schema](#-database-relational-schema)
- [🚀 Quick Start & Installation](#-quick-start--installation)
- [🧪 Test Suite Execution](#-test-suite-execution)
- [📦 Built-in Demo Personas](#-built-in-demo-personas)

---

## 🏛️ Overview

**Book-Vault** is an archival catalog and private circulation management platform. It models a scholarly preservation library where:

1. **Curators (`ADMIN`)** accession rare volumes, categorize texts, audit registered scholars, update user access permissions, and de-accession volumes.
2. **Scholars (`USER`)** browse categorized volumes, search by title or author, request physical loans, return volumes to restore shelf availability, submit star-rated critiques, and monitor their personal reading metrics.

---

## 🧩 Architecture & Core Concepts

Built according to clean NestJS software engineering principles:

- **Modular Architecture**: Isolated domain modules (`AuthModule`, `BookModule`, `BorrowModule`, `ReviewModule`, `UserModule`, `DatabaseModule`).
- **Global Database Service**: SQLite connection pool with explicit `PRAGMA foreign_keys = ON;`, `PRAGMA journal_mode = WAL;`, and automatic schema synchronization.
- **DTO Validation Pipeline**: Strict request payloads validated via `class-validator` and `ValidationPipe` (`whitelist: true, forbidNonWhitelisted: true, transform: true`).
- **Guards & Custom Decorators**:
  - `AuthGuard`: Verifies Bearer JWT signature and extracts user metadata.
  - `RolesGuard`: Enforces role-based endpoint authorization (`ADMIN` vs `USER`).
  - `@CurrentUser()`: Extracts the authenticated user entity from request context.
- **Global Error Handling**: `AllExceptionFilter` standardizes response shapes and intercepts uncaught 500 exceptions directly to **Sentry**.

---

## 📡 API Route Manifest (All 18 Routes)

| # | HTTP Method | Endpoint | Access Level | Description |
|---|---|---|---|---|
| **1** | `POST` | `/auth/register` | Public | Register new fellow or curator |
| **2** | `POST` | `/auth/login` | Public | Authenticate credentials & issue JWT |
| **3** | `GET` | `/auth/me` | Protected (`USER`/`ADMIN`) | Retrieve authenticated scholar profile |
| **4** | `GET` | `/books` | Public | List all books with category, author & search filters |
| **5** | `GET` | `/books/:id` | Public | Retrieve accession details for specific volume |
| **6** | `POST` | `/books` | Curator (`ADMIN`) | Deposit new volume into the archival stacks |
| **7** | `PATCH` | `/books/:id` | Curator (`ADMIN`) | Modify volume metadata or description |
| **8** | `DELETE` | `/books/:id` | Curator (`ADMIN`) | De-accession / remove volume from archive |
| **9** | `POST` | `/borrows` | Protected (`USER`/`ADMIN`) | Request a book loan (marks book unavailable) |
| **10** | `PATCH` | `/borrows/:id/return` | Protected (Borrower) | Return loaned volume (restores shelf availability) |
| **11** | `GET` | `/borrows/my` | Protected (`USER`/`ADMIN`) | View authenticated user's active & past loans |
| **12** | `POST` | `/reviews` | Protected (`USER`/`ADMIN`) | Post curatorial review with 1–5 star rating |
| **13** | `GET` | `/reviews/book/:bookId` | Public | Fetch critiques & average rating for a book |
| **14** | `GET` | `/users` | Curator (`ADMIN`) | Audit full fellowship user directory & loan counts |
| **15** | `PATCH` | `/users/:id/role` | Curator (`ADMIN`) | Elevate or downgrade a user's role |
| **16** | `GET` | `/users/me/dashboard` | Protected (`USER`/`ADMIN`) | Scholar stats (borrows, active, avg rating) |
| **17** | `GET` | `/api/health` | Public | System uptime & Sentry telemetry status |
| **18** | `GET` | `/` | Browser / Test | Delivers UI for browsers; plain text for test fixtures |

---

## 🛡️ Security & Role Matrix

```
┌────────────────────┬───────────┬─────────────┬──────────────┐
│ Endpoint Scope     │ Anonymous │ Role: USER  │ Role: ADMIN  │
├────────────────────┼───────────┼─────────────┼──────────────┤
│ Catalog Browsing   │     ✅    │      ✅     │      ✅      │
│ Book Reviews Read  │     ✅    │      ✅     │      ✅      │
│ Borrowing Books    │     ❌    │      ✅     │      ✅      │
│ Returning Books    │     ❌    │  ✅ (Own)   │  ✅ (Own)    │
│ Writing Reviews    │     ❌    │      ✅     │      ✅      │
│ Personal Dashboard │     ❌    │      ✅     │      ✅      │
│ Accessioning Books │     ❌    │      ❌     │      ✅      │
│ Deleting Books     │     ❌    │      ❌     │      ✅      │
│ Modifying Roles    │     ❌    │      ❌     │      ✅      │
│ User Auditing      │     ❌    │      ❌     │      ✅      │
└────────────────────┴───────────┴─────────────┴──────────────┘
```

---

## 📈 Observability & Sentry

Error tracking and performance monitoring are integrated into the application entry point via `@sentry/nestjs`:

- **Instrumentation Bootstrap**: `src/instrument.ts` initializes Sentry before any other Nest application modules load.
- **Central Exception Filter**: `src/common/filters/allExceptions.filter.ts` catches unhandled runtime exceptions and forwards traces to Sentry with complete stack diagnostics.
- **Trace Context**: Preserves execution context across controllers, guards, and SQLite queries.

---

## 💾 Database Relational Schema

```sql
-- SQLite Relational Architecture with Foreign Keys Enabled
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('USER', 'ADMIN')) DEFAULT 'USER',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT CHECK(category IN ('FICTION', 'NON_FICTION', 'SCI_FI', 'BIOGRAPHY', 'MYSTERY', 'FANTASY')) NOT NULL,
    description TEXT,
    isbn TEXT UNIQUE NOT NULL,
    is_available BOOLEAN DEFAULT 1,
    added_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE borrows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    borrowed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    returned_at DATETIME,
    status TEXT CHECK(status IN ('BORROWED', 'RETURNED')) DEFAULT 'BORROWED'
);

CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    rating INTEGER CHECK(rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id)
);
```

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js**: `v20+` or `v22+`
- **npm**: `v10+`

### 2. Clone & Install Dependencies
```bash
git clone <repository-url>
cd bookvault-api
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (or use default development fallbacks):
```env
PORT=3000
JWT_SECRET=your_super_secret_jwt_key
SENTRY_DSN=your_sentry_dsn_optional
```

### 4. Run Development Server
```bash
# Starts the NestJS dev server with file watching
npm run dev
```
Visit `http://localhost:3000` in your browser to experience the archival interface or test the API.

---

## 🧪 Test Suite Execution

The project features 100% route coverage spanning controllers, services, guards, and SQLite state changes.

```bash
# Run unit tests
npm test

# Run full end-to-end (E2E) integration test suite
npm run test:e2e

# Run linter (oxlint with zero warnings / errors)
npm run lint

# Build production bundle
npm run build
```

---

## ⚡ Deployment to Vercel

Book-Vault is pre-configured for frictionless serverless deployment on Vercel:

- **Serverless Entrypoint**: `api/index.ts` automatically wraps the NestJS engine into a Vercel Serverless Function.
- **Vercel Routing**: `vercel.json` routes all REST API requests seamlessly while serving the static minimalist archival UI from `public/`.
- **Serverless SQLite Compatibility**: `DatabaseService` dynamically detects the Vercel runtime and mounts the SQLite datastore into the writable `/tmp` volume with automatic schema initialization and pre-seeding.

### Deploy Steps:

#### Option A: One-Click Vercel CLI
```bash
# 1. Install Vercel CLI globally (if not installed)
npm i -g vercel

# 2. Deploy from the project root
vercel

# 3. Deploy to production
vercel --prod
```

#### Option B: GitHub / Git Integration
1. Push your repository to **GitHub** (or GitLab/Bitbucket).
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `bookvault-api` repository.
4. **Environment Variables**:
   - `JWT_SECRET`: (e.g. `your_production_secret_key_here`)
   - `SENTRY_DSN`: (optional)
5. Click **Deploy**. Vercel will automatically build the NestJS backend and publish your live application.

---

## 📦 Built-in Demo Personas

When running the application, demo accounts are pre-seeded into the SQLite database for rapid testing:

| Persona | Role | Email | Password |
|---|---|---|---|
| **Curator Eleanor Vance** | `ADMIN` | `curator@bookvault.org` | `vault123` |
| **Fellow Julian Blackwood** | `USER` | `reader@bookvault.org` | `vault123` |

---

<p align="center">
  <sub>Crafted with passion for clean backend engineering and scholarly curation.</sub>
</p>
