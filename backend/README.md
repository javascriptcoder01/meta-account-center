# Meta Accounts Center — Node.js Express Backend Foundation (Batch 2)

This directory contains the foundational, modular Node.js + Express backend persistence, routing, and infrastructure layer for the **Meta Accounts Center**.


## 1. Project Purpose & Scope

The **Meta Accounts Center** is a centralized platform for managing connected social media accounts, active logins, telemetry, security settings (including 2FA metadata), and activity audits.

### Batch 2 Scope Boundaries
This is the **foundation-only phase**. To ensure absolute clarity during implementation reviews:
- **No authentication routes, login, registration, or JWT validations exist.**
- **No password hashing (bcrypt logic) is implemented.**
- **No profile, connected accounts, security, privacy, or device business controllers or APIs are present.**
- **Only modular boilerplate structure, Mongoose model definitions (and automated indexing), standardized errors/responses, security middlewares, and the database-aware health check API are implemented.**

---

## 2. Technology Stack

- **Runtime**: Node.js (LTS v20+)
- **Framework**: Express (v4.19)
- **Database ODM**: Mongoose (v8.4)
- **Security Middlewares**: Helmet, CORS (configurable origin), Express Rate Limit
- **Input Validation**: Express Validator
- **Logging**: Structured Pino + Pino-pretty (development)
- **Testing**: Vitest + Supertest

---

## 3. Directory Structure

backend/
├── src/
│   ├── config/              # Central configuration (env parsing, database connection, Pino logger)
│   ├── constants/           # Global enums and constants (roles, providers, activity types, error codes)
│   ├── models/              # Mongoose schema definitions and validation (Batch 1 compliant)
│   ├── repositories/        # Database concern isolation (focused Mongoose CRUD operations)
│   ├── services/            # Service layer placeholders (future business logic)
│   ├── controllers/         # Express controllers (contains health.controller.js)
│   ├── routes/              # Routing layers (/api/v1/health)
│   ├── middlewares/         # Centralized error, not-found, validation, auth/authorization placeholders
│   ├── utils/               # Standard ApiResponse, ApiError, and asyncHandler wrapper
│   ├── app.js               # Express application initialization
│   └── server.js            # Node.js process bootstrapper (DB connection & graceful shutdown handlers)
├── tests/                   # Integration and unit tests (Vitest)
├── .env.example             # Local developer configuration template
├── package.json             # NPM metadata and script configurations
└── README.md                # System documentation

---

## 4. Environment Configuration

The application loads configuration directly from environment variables. Create a local `.env` file under the `backend/` directory utilizing the configuration template:

### File: `backend/.env.example`
env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration (MongoDB Atlas Cluster0 Example)
MONGODB_URI=mongodb+srv://<ATLAS_USERNAME>:<ATLAS_PASSWORD>@cluster0.scn6m7r.mongodb.net/meta?retryWrites=true&w=majority&appName=Cluster0
MONGODB_URI=ongodb://localhost:27017/meta
DB_NAME=meta

# CORS Origin Config
CORS_ORIGIN=http://localhost:5173

# Logging Config
LOG_LEVEL=info
*Note: A project-level `.gitignore` blocks `backend/.env` from being checked into source control.*

---

## 4.1 MongoDB Atlas Cluster Integration
The backend is designed to integrate with a MongoDB Atlas cluster. To run the application locally or in production:
1. **Network Access**: Ensure the Atlas IP Access List (under Network Access) is configured to permit connections from your deployment origin or local development IP address.
2. **Database Access**: Create a database user in your Atlas cluster dashboard with read/write permissions for the target database.
3. **Target Database**: The connection is configured to target database name `meta`.
4. **Environment Setup**: Copy the contents of `backend/.env.example` to `backend/.env` and replace `<ATLAS_USERNAME>` and `<ATLAS_PASSWORD>` with the actual database user credentials. Never commit this file.


## 5. Security & Infrastructure Principles

1. **Zero Plaintext Credentials**: No raw tokens, keys, or passwords will ever be saved. The Mongoose models enforce hashing columns (`passwordHash`, `refreshTokenHash`, `tokenHash`).
2. **Built-in Cryptographic Identifiers**: We use Node.js's built-in `node:crypto` API (specifically `crypto.randomUUID()`) for session and validation tokens rather than third-party packages or predictable counters.
3. **Database-Aware Health Check**:
   - `GET /api/health` is unauthenticated and checks if the Mongoose connection state is active (`readyState === 1`).
   - If MongoDB is disconnected, it returns an HTTP 503 degraded status.
   - It will not log connection credentials or leak database internals to the API payload.
4. **Clean Error Handling**: Centralized error middleware traps operational errors (`ApiError`), Mongoose validator/cast errors, and MongoDB duplicate key conflicts, stripping runtime stacks in production.
5. **CORS Restrictions**: Configured via the `CORS_ORIGIN` environment variable. Production prevents wildcard `*` matches.

## 6. Installation & Usage

### Prerequisites
- Node.js >= v20.0.0
- Local or Cloud MongoDB database server running

### 1. Installation
Run npm install inside the `backend/` directory: type -
cd backend
npm install

### 2. Startup Scripts
- **Development mode** (reloads on changes using nodemon): npm run dev

## 8. API Specifications

### Health Check Endpoint
Returns service availability details and database connection health.

- **URL**: `/api/health`
- **Method**: `GET`
- **Auth Required**: No

#### Healthy Response (HTTP 200)
```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "status": "UP",
    "database": "UP"
  }
}

#### Unhealthy/Degraded Response (HTTP 503)
json 
{
  "success": false,
  "message": "Service is unhealthy",
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "details": [
      {
        "status": "DOWN",
        "database": "DOWN"
      }
    ]
  }
}

9. Authentication & Session Architecture

Batch 2.1 implements a secure, modular, token-based authentication and session management layer.

### 9.1 Key Architectural Decisions

1. **Password Security**:
   - Plaintext passwords are never stored, logged, or returned in API payloads.
   - Hashed using native `bcrypt` with work factor (default `BCRYPT_SALT_ROUNDS=12`) read from env.
   - Implements strict validation: 8-128 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (`@$!%*?&`).
2. **Short-Lived Access Token**:
   - Signed using HS256 algorithm with `JWT_ACCESS_SECRET`.
   - Expires in 15 minutes.
   - Contains minimal claims: `sub` (userId), `role`, `sessionId`.
3. **Opaque Rotated Refresh Token**:
   - Cryptographically secure random token formatted as `sessionId:secret` generated via `node:crypto`.
   - The raw token is **never stored** in the database. Only its SHA-256 hash (`refreshTokenHash`) is saved in `user_sessions`.
   - Expiration aligns with `JWT_REFRESH_EXPIRES_IN=7d`.
   - **Rotation**: On every `/refresh` request, the session's stored hash is replaced by a new hash, invalidating the old token automatically.
   - **Reuse Detection**: If an old rotated token is presented, the system extracts the `sessionId` from the prefix, revokes the entire session (`isActive = false`), clears the cookie, logs a security activity log, and denies access.
4. **Cookie Security**:
   - Delivered in `HttpOnly`, `Secure` (production only), `SameSite=Strict`, `Path=/api/v1/auth` cookie named `refreshToken`.
   - Exclude `maxAge` on deletion (`res.clearCookie`) to prevent v5.0 deprecation warnings.
5. **MongoDB Transactions**:
   - Registration writes to `users`, `privacy_settings`, `security_settings`, and `activity_logs` inside a single transactional block (`startTransaction()`).
   - If transactions are unsupported by the database server, a manual rollback compensation deletes successfully written records to prevent partial orphan write pollution.
6. **Password Recovery Flow**:
   - Forgot-password endpoint returns an identical generic message regardless of email existence to protect against user enumeration.
   - Creates a random reset token. Stores the SHA-256 hash in `password_reset_tokens` expiring in 15 minutes.
   - **Single-Use**: Redemptions are processed atomically using Mongoose `findOneAndUpdate(...)` to prevent race conditions.
   - **Revocation**: Successful password resets revoke all active sessions for the user immediately.
7. **Rate Limiting**:
   - Strict limit of 5 requests per 15 minutes applies to `/login`, `/register`, `/forgot-password`, `/reset-password`, and `/refresh`.

### 9.2 Implemented Endpoints

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register user and provision profile settings in transaction |
| `POST` | `/api/v1/auth/login` | Public | Verify credentials, create session, set refresh cookie, and return JWT |
| `POST` | `/api/v1/auth/refresh` | Refresh Cookie | Rotate refresh token and issue new access token |
| `POST` | `/api/v1/auth/logout` | Access Token | Mark current session inactive and clear cookies |
| `POST` | `/api/v1/auth/logout-all` | Access Token | Mark all user sessions inactive and clear cookies |
| `POST` | `/api/v1/auth/forgot-password` | Public | Generate password reset token (Mock logs in development) |
| `POST` | `/api/v1/auth/reset-password` | Public | Update password using valid reset token and terminate sessions |

---

## 10. User Profile & Account Management (Batch 2.2)

Batch 2.2 implements authenticated user profile retrieval/modification and secure account configuration changes (password, email, phone, and profile picture).

### 10.1 Key Architectural Decisions

1. **Mass-Assignment & Ownership Safeguards**:
   - Every profile endpoint requires authentication and obtains the user's identity strictly from `req.user.id` (client-provided target IDs in body or params are ignored).
   - Only updates to permitted fields are accepted: `firstName`, `lastName`, `dateOfBirth`, `profilePicture`.
   - Protects critical fields (`role`, `status`, `emailVerified`, `passwordHash`, `_id`, `createdAt`) from client-side modification.
   - Enforces user accounts must be `ACTIVE` to request changes.
2. **Session Revocation Policy**:
   - **Sensitive Operations** (Change password, change email) immediately revoke **ALL** active sessions in `user_sessions` and clear the HttpOnly `refreshToken` cookie, forcing the user to log in again.
   - **General Operations** (Profile name, dateOfBirth, phone, profilePicture changes) do **NOT** revoke active sessions.
3. **MongoDB Transactional Security**:
   - **Password Change** updates `users.passwordHash`, `security_settings.lastPasswordChangedAt`, revokes all sessions, and writes a `PASSWORD_CHANGED` activity log under a single Mongoose transaction.
   - **Email Change** updates `users.email`, sets `emailVerified: false`, revokes all sessions, and writes an `EMAIL_CHANGED` activity log under a single Mongoose transaction.
   - If transactions are unsupported by the database deployment, a manual rollback compensation reverts successfully written records to protect database consistency.
4. **Validation Rules**:
   - `firstName` and `lastName`: String, trimmed, length 1–50.
   - `dateOfBirth`: Valid ISO-compatible date, must not be in the future.
   - `profilePicture`: Secure `HTTPS` URL or `null` to remove. Scheme checks reject `http:`, `javascript:`, `data:`, `file:`.
   - `phone`: E.164 pattern or `null` to remove (preserves compatibility with the database sparse partial unique index).
5. **No Verification Implementations**:
   - Email verification is **NOT** implemented in this batch (email change sets `emailVerified = false` to be processed in a future verification batch).
   - Phone verification (SMS) is **NOT** implemented.
6. **Rate Limiting**:
   - Strict limit of 5 requests per 15 minutes applies to `/change-password`, `/email`, and `/phone` endpoints.

### 10.2 Implemented Endpoints

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/profile` | Access Token | Retrieves the current user's profile information |
| `PATCH` | `/api/v1/profile` | Access Token | Updates name, dateOfBirth, and profile picture URL (Rejects empty bodies) |
| `POST` | `/api/v1/profile/change-password` | Access Token | Validates old password, hashes new password, revokes all sessions, and clears cookie |
| `PATCH` | `/api/v1/profile/email` | Access Token | Updates email, sets `emailVerified = false`, revokes all sessions, and clears cookie |
| `PATCH` | `/api/v1/profile/phone` | Access Token | Updates phone number (Allows `null` to remove, does not revoke sessions) |
| `PATCH` | `/api/v1/profile/profile-picture` | Access Token | Updates or removes profile picture URL (HTTPS only, does not revoke sessions) |

---

## 11. Privacy & Security Settings (Batch 2.3)

Batch 2.3 implements authenticated user endpoints to read and configure Privacy Settings and Security (2FA) preferences.

### 11.1 Key Architectural Decisions

1. **Privacy Settings Fields**:
   - `profileVisibility`: `'PUBLIC'`, `'FRIENDS'`, `'PRIVATE'` (Default: `'PUBLIC'`)
   - `emailVisibility`: `'PUBLIC'`, `'FRIENDS'`, `'PRIVATE'` (Default: `'PRIVATE'`)
   - `phoneVisibility`: `'PUBLIC'`, `'FRIENDS'`, `'PRIVATE'` (Default: `'PRIVATE'`)
   - `personalizedAds`: Boolean (Default: `true`)
   - `dataSharing`: Boolean (Default: `false`)
   - Rejects empty bodies. Logs `PRIVACY_UPDATED` with `changedFields` metadata on actual updates.
2. **Two-Factor Configuration (2FA) Boundary**:
   - Enforces the configuration/mock state available in `security_settings`: `twoFactorEnabled`, `twoFactorMethod`.
   - **No actual 2FA verification logic exists** (no OTP generation/verification, SMS sending, email codes, trusted devices, or backup recovery codes). It acts strictly as a configuration/mock settings manager.
   - **Logical validations**:
     - If `twoFactorEnabled === false`, `twoFactorMethod` must be `null`.
     - If `twoFactorEnabled === true`, `twoFactorMethod` must be SMS, AUTHENTICATOR_APP, or EMAIL (cannot be `null`).
3. **Session Revocation Policy**:
   - **Privacy Updates** do **NOT** affect active sessions or clear cookies.
   - **2FA Configurations** (Enabling/disabling 2FA or changing the active factor method) are critical security state changes. They revoke **ALL** active sessions in `user_sessions`, clear the refresh token cookie, and force a full re-login.
4. **MongoDB Transactions**:
   - Updates to 2FA configuration are performed inside a Mongoose transaction (`startTransaction()`) spanning `security_settings`, session revocation, and `TWO_FACTOR_ENABLED`/`TWO_FACTOR_DISABLED` activity logging.
   - Fallback sequential compensation reverts state if transactions are unsupported.
5. **Legacy Initialization-on-Read**:
   - If a legacy user record is read and lacks a `privacy_settings` or `security_settings` document, the service layer automatically provisions one with default settings.
   - Handles concurrent write race conditions safely checking duplicate key code `11000`.
6. **Rate Limiting**:
   - Strict limit of 5 requests per 15 minutes applies to PATCH `/security/settings`.
   - Privacy endpoints utilize the global rate limiter.

### 11.2 Implemented Endpoints

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/privacy` | Access Token | Retrieves the authenticated user's privacy configurations |
| `PATCH` | `/api/v1/privacy` | Access Token | Updates whitelisted privacy settings (No session revocation) |
| `GET` | `/api/v1/security/settings` | Access Token | Retrieves the authenticated user's 2FA configurations |
| `PATCH` | `/api/v1/security/settings` | Access Token | Configures 2FA settings, revokes all sessions, and clears cookie (Transactional) |

---

## 12. Connected Accounts (Batch 2.4)

Batch 2.4 implements authenticated mock connected account management endpoints to view, connect, and remove platform integrations.

### 12.1 Key Architectural Decisions

1. **Mock OAuth Boundary**:
   - **No real OAuth integrations or external API requests are performed** (no Facebook Login, Instagram Basic Display, WhatsApp Cloud APIs, redirect callbacks, scopes, client IDs, secrets, or provider access/refresh tokens are stored or managed).
   - Mock credentials are accepted to simulate connections directly.
2. **Whitelisted Provider List**:
   - Restricts platforms strictly to `'FACEBOOK'`, `'INSTAGRAM'`, and `'WHATSAPP'` (constants-bound). Other providers (Google, Twitter, GitHub, etc.) are strictly rejected.
3. **Compound Key & Duplicates Protection**:
   - Respects the unique compound index `{ provider: 1, providerUserId: 1 }` to prevent multiple distinct Meta Account Center users from claiming the same external social account (returns `409 Conflict`).
   - Multiple connected accounts of the same provider are permitted for a single user (as `{ userId: 1, provider: 1 }` is non-unique).
4. **Physical Deletion Policy**:
   - The remove endpoint (`DELETE /api/v1/connected-accounts/:id`) physically removes the document from the database. This releases the unique compound key `{ provider, providerUserId }` so the same mock profile can be connected again later.
5. **Session Revocation Policy**:
   - Connected Account operations **DO NOT** revoke active sessions, clear cookies, or force re-login.
6. **MongoDB Transactions**:
   - Connected account linkage and unlinkage writes are executed under Mongoose transactions (`startTransaction()`) covering `connected_accounts` writes/deletes and activity logging (`ACCOUNT_CONNECTED` or `ACCOUNT_DISCONNECTED`).
   - Fallback sequential compensation reverts states if transactions are unsupported.
7. **Safe Input Validations**:
   - Accepts: `provider`, `providerUserId`, `displayName`, `username` (optional), and `profilePicture` (optional HTTPS URL only). Rejects HTTP, javascript, data, or file schemes.

### 12.2 Implemented Endpoints

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/connected-accounts` | Access Token | Retrieves the authenticated user's connected social accounts |
| `POST` | `/api/v1/connected-accounts` | Access Token | Connects a new mock account (Validation & duplicate protection enforced) |
| `DELETE` | `/api/v1/connected-accounts/:id` | Access Token | Removes a connected account belonging to the authenticated user |

---

## 13. Activity History (Batch 2.5)

Batch 2.5 implements read-only endpoints to retrieve the authenticated user's activity logs (login history, password changes, profile updates, connected accounts linkages, and privacy updates).

### 13.1 Key Architectural Decisions

1. **Target Collection & Immutability**:
   - Reuses the existing `activity_logs` collection.
   - Read-only endpoints: no create (`POST`), update (`PATCH`), or delete (`DELETE`) endpoints are provisioned. The logs remain strictly append-only audit records.
2. **Scoping & Ownership Security**:
   - Scopes all queries strictly by `req.user.id`.
   - Never trusts client-supplied user IDs in parameters, query variables, or payload bodies.
3. **Response Sanitization**:
   - Exposes safe fields only: `id`, `action`, `category`, `description`, `deviceName`, `browser`, `operatingSystem`, `ipAddress`, `metadata` (sanitized), and `createdAt`.
   - Excludes sensitive keys such as `userId`, credentials, password hashes, and tokens.
4. **Pagination**:
   - Implements page-based pagination using `page` (Default: `1`) and `limit` (Default: `20`, Max: `100`).
   - Response includes a `pagination` metadata block containing `total`, `page`, `limit`, and `pages`.
5. **Category Filtering**:
   - Optional query parameter `category` restricts outputs to target domain categories (e.g. `'AUTHENTICATION'`, `'PROFILE'`, `'SECURITY'`, `'PRIVACY'`, `'CONNECTED_ACCOUNT'`).
6. **Chronological Sorting & Index Optimization**:
   - Default sorting: `createdAt DESC` (most recent first).
   - Utilizes existing index `{ userId: 1, createdAt: -1 }` for default listing.
   - Utilizes existing index `{ userId: 1, category: 1, createdAt: -1 }` when category filter is supplied.

### 13.2 Implemented Endpoints

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/activity-logs` | Access Token | Retrieves paginated and category-filtered activity history for the authenticated user |

---

## 14. Device Management (Batch 2.6)

Batch 2.6 implements authenticated device management endpoints to view active device details and revoke individual device sessions safely.

### 14.1 Key Architectural Decisions

1. **Database Source**:
   - Reuses the existing `user_sessions` collection. No secondary device collection is created.
2. **Active Device Definition**:
   - A session is active if and only if `isActive === true`, `revokedAt === null`, and `expiresAt > current_time`.
3. **Response Sanitization**:
   - Exposes safe fields only: `id` (mapped from `_id`), `sessionId`, `deviceName`, `browser`, `browserVersion`, `operatingSystem`, `ipAddress`, `loginAt`, `lastActivityAt`.
   - Excludes sensitive keys such as `userId`, `refreshTokenHash`, password hashes, and tokens.
4. **Current Session Self-Revocation**:
   - Allows users to revoke their own current session. If the current session (`sessionId === req.user.sessionId`) is revoked:
     - Clear the `refreshToken` cookie.
     - Revokes the session in database (sets `isActive = false`, `revokedAt = now`).
     - Subsequent requests using the old token fail authentication.
5. **Non-Current Session Revocation**:
   - Only the specific targeted session is revoked. No other sessions are affected, and the current session's refresh cookie remains valid.
6. **Soft Revocation (No Physical Deletes)**:
   - Device removal does not physically delete the document to preserve database history for security audits. The existing Mongoose TTL index automatically purges records 90 days after session expiration.
7. **MongoDB Transactions**:
   - Revocation and writing of `SESSION_REVOKED` activity log execute within a single Mongoose transaction (`startTransaction()`).
   - Fallback sequential compensation reverts states if transactions are unsupported.
8. **Rate Limiting**:
   - Enforces strict rate limits (5 requests per 15 minutes) on DELETE `/devices/:sessionId`.

### 14.2 Implemented Endpoints

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/devices` | Access Token | Retrieves the authenticated user's active device sessions |
| `DELETE` | `/api/v1/devices/:sessionId` | Access Token | Revokes the specified device session (Safe ownership verified) |

---

## 15. Batch 2.7 — Dashboard / Account Center Overview

### 15.1 Architecture

Single aggregated read-only endpoint that returns a consolidated overview of the authenticated user's account. All 5 underlying queries execute concurrently using `Promise.all` for minimal latency.

**Query Strategy:**

| Section | Source Collection | Index Used |
| :--- | :--- | :--- |
| `profile` | `users` | `_id` (primary key) |
| `connectedAccounts` | `connected_accounts` | `{ userId: 1, provider: 1 }` |
| `securityStatus` | `security_settings` | `{ userId: 1 }` |
| `activeDeviceCount` | `user_sessions` | `{ userId: 1, isActive: 1, expiresAt: 1 }` |
| `recentActivities` | `activity_logs` | `{ userId: 1, createdAt: -1 }` |
| `connectedDevices` | `user_sessions` | `{ userId: 1, isActive: 1, expiresAt: 1 }` |

**Active session definition** (used identically for both `activeDeviceCount` and `connectedDevices`):
```
isActive === true AND revokedAt === null AND expiresAt > current_time
```

### 15.2 Implemented Endpoints

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/dashboard` | Access Token | Returns consolidated account overview |

---

## 16. Batch 3 — Backend Hardening

### 16.1 Security Fixes Applied

| Issue | Fix | File |
| :--- | :--- | :--- |
| Session ownership not verified against JWT `sub` | Added `session.userId.toString() !== userId` cross-check | `auth.middleware.js` |
| `getActiveDevices` missing `revokedAt: null` filter | Added `revokedAt: null` to match approved active session definition | `device.service.js` |
| `PROFILE_UPDATED` activity logged to wrong category `AUTHENTICATION` | Changed to `ACTIVITY_CATEGORIES.PROFILE` | `profile.service.js` |
| Stack traces returned in HTTP error responses (information disclosure) | Stack traces now logged server-side only — never returned to client | `error.middleware.js` |
| CORS dev mode had unconditional allow-all fallback | Dev CORS now rejects non-localhost origins | `app.js` |

### 16.2 PDF Compliance

See [`backend/docs/final-backend-compliance.md`](./docs/final-backend-compliance.md) — **47/47 requirements compliant**.

### 16.3 Security Audit

See [`backend/docs/security-audit.md`](./docs/security-audit.md) for the complete security audit covering 15 domains.

### 16.4 Final Test Results

```
Test Files   9 passed (9)
     Tests  97 passed (97)
  Duration  ~210s (sequential)
```

---

## 17. Production Prerequisites

1. **MongoDB Atlas (Replica Set)** is **required** for Mongoose transaction support across multi-collection operations.  
   Standalone MongoDB falls back to sequential compensation writes (which still maintain data consistency but without atomicity guarantees).

2. **Environment Variables** — all required vars must be set. The server exits with `[FATAL]` if any required variable is missing:
   - `MONGODB_URI` — Full MongoDB Atlas connection URI
   - `DB_NAME` — Database name (use `meta` for production)
   - `CORS_ORIGIN` — Allowed frontend origin URL
   - `JWT_ACCESS_SECRET` — Minimum 32-character signing secret

3. **Trust Proxy** — If deployed behind a reverse proxy (Nginx, Cloudflare, etc.), add `app.set('trust proxy', 1)` to ensure accurate IP addresses in session telemetry and rate limiting.

4. **Email Delivery** — Password reset flows log a mock token URL in development. A real SMTP integration is required for production.

---

## 18. Mock-Only: Connected Facebook/Instagram/WhatsApp Accounts

> ⚠️ **The Connected Accounts feature (Facebook, Instagram, WhatsApp) is MOCK-ONLY.**
>
> - No real OAuth 2.0 integration exists.
> - No external Meta/Facebook/Instagram/WhatsApp APIs are called.
> - No OAuth access tokens, refresh tokens, authorization codes, scopes, callback URLs, or provider secrets are stored or processed.
> - `providerUserId` is a client-supplied mock identifier.
>
> This is intentional per the assignment specification:
> _"No real OAuth integration is required. Mock implementations are acceptable."_


