# Meta Accounts Center — Database Architecture Documentation

## 1. Database Overview

The **Meta Accounts Center** is a centralized identity, security, and account management platform designed to deliver cross-platform identity aggregation (Facebook, Instagram, WhatsApp), active multi-device session governance, immutable audit logging, and granular privacy/security configurations.

This document represents the foundational database design for **Batch 1 (Database Foundation Phase)**. In strict adherence to the project scope, no application logic, Express endpoints, JWT tokens, bcrypt implementations, or frontend components are created in this batch.

## 2. Database Name
`env`
- DB_NAME=meta
- MONGODB_URI=mongodb://localhost:27017/meta

The database name is strictly **`meta`**.

## 3. MongoDB & Mongoose

MongoDB paired with Mongoose was selected as the foundational persistence layer for the following architectural reasons:

1. **Document Flexibility & Polymorphism**: Meta Accounts Center models heterogeneous data, such as device telemetry, flexible activity metadata, and multi-provider social integrations, which are naturally represented as BSON documents.
2. **Atomic In-Document Updates & Schemas**: Mongoose provides strict schema-level validation, type casting, middleware hooks (for hashing, timestamps, and indexing), and clean reference handling (`ObjectId` ref populating).
3. **Automated Index & Collection Provisioning**: When Mongoose connects to MongoDB, it automatically declares and creates collections and compound/unique/TTL indexes without requiring manual intervention in MongoDB Compass or CLI shell seeding scripts.
4. **Performance & Horizontal Scalability**: High-frequency read queries (session lookups, activity feeds, security toggles) benefit from MongoDB's in-memory indexing, compound key lookups, and native sharding/replica-set high availability.

## 4. Collection List

The database architecture is structured into **7 core collections**:
Collection Name - Conceptual Category - Cardinality relative to `users`
`users` - Core Identity & Authentication - Root Entity
`connected_accounts` - Social Integrations (Meta Ecosystem) | one-to-many
`user_sessions` - Device & Session Lifecycle Management -  one-to-many
`activity_logs` - Immutable Security & Action Audit Trail | one-to-many
`privacy_settings` - Profile & Data Sharing Preferences | one-to-one
`security_settings` -  Multi-Factor Authentication & Credential Metadata | one-to-one
`password_reset_tokens` - Ephemeral Recovery Tokens | one-to-many

## 5. Detailed Field Documentation for Every Collection

### 5.1 `users` Collection

Stores root user identities, authentication credentials, verification state, and administrative status.

#### Fields Structure

| Field Name | Data Type | Required | Default | Allowed Values / Constraints | Purpose & Description |
| `_id` | `ObjectId` | Yes | Auto | Auto-generated 12-byte BSON ObjectId | Primary unique identifier for the user document. |
| `name.firstName` | `String` | Yes | N/A | Trimmed, 1–50 characters | User's first / given name. |
| `name.lastName` | `String` | Yes | N/A | Trimmed, 1–50 characters | User's last / family name. |
| `email` | `String` | Yes | N/A | Lowercase, trimmed, RFC 5322 regex | Primary account email address. Acts as the primary login credential. |
| `phone` | `String` | No | `null` | Trimmed, E.164 format (e.g. `+14155552671`) | Contact mobile phone number. Nullable. |
| `dateOfBirth` | `Date` | No | `null` | ISO 8601 Date (`YYYY-MM-DD`) | User's date of birth used for age compliance and profile info. |
| `profilePicture` | `String` | No | `null` | HTTPS URL or `null` | Cloud storage URL to user avatar image. |
| `passwordHash` | `String` | Yes | N/A | bcrypt hash (`$2b$12$...`) | One-way salted hash of the user password generated via `bcrypt` (never plaintext). |
| `role` | `String` | Yes | `"USER"` | `["USER", "ADMIN"]` | Role-based access control level. |
| `emailVerified` | `Boolean` | Yes | `false` | `true`, `false` | Indicates whether the user has completed email verification. |
| `status` | `String` | Yes | `"ACTIVE"` | `["ACTIVE", "INACTIVE", "SUSPENDED"]` | Operational status of the user account. |
| `createdAt` | `Date` | Yes | `Date.now` | ISO 8601 Timestamp | Document creation timestamp. |
| `updatedAt` | `Date` | Yes | `Date.now` | ISO 8601 Timestamp | Document modification timestamp. |


### 5.2 `connected_accounts` Collection

Manages linked identities across Meta ecosystem platforms (Facebook, Instagram, WhatsApp) within the Accounts Center.

#### Fields Structure

| Field Name | Data Type | Required | Default | Allowed Values / Constraints | Purpose & Description |
| `_id` | `ObjectId` | Yes | Auto | Auto-generated BSON ObjectId | Primary unique identifier. |
| `userId` | `ObjectId` | Yes | N/A | Reference to `users._id` | Foreign key referencing the parent user. |
| `provider` | `String` | Yes | N/A | `["FACEBOOK", "INSTAGRAM", "WHATSAPP"]` | Meta platform provider identity. Extensible for future providers. |
| `providerUserId` | `String` | Yes | N/A | Non-empty String | Immutable unique user ID assigned by the external provider. |
| `username` | `String` | No | `null` | Trimmed string or `null` | Platform-specific handle (e.g. `@johndoe`). |
| `displayName` | `String` | Yes | N/A | Trimmed string | Display name rendered in the Accounts Center UI. |
| `profilePicture` | `String` | No | `null` | HTTPS URL or `null` | URL of platform avatar image. |
| `status` | `String` | Yes | `"CONNECTED"` | `["CONNECTED", "DISCONNECTED"]` | Linkage and active synchronization status. |
| `connectedAt` | `Date` | Yes | `Date.now` | ISO 8601 Timestamp | Timestamp when the external account was initially connected. |
| `updatedAt` | `Date` | Yes | `Date.now` | ISO 8601 Timestamp | Timestamp when document was last modified. |

### 5.3 `user_sessions` Collection

Tracks active authentication sessions, device fingerprints, client telemetry, and revocation state.

#### Fields Structure

| Field Path | Data Type | Required | Default | Allowed Values / Constraints | Purpose & Description |
| `_id` | `ObjectId` | Yes | Auto | Auto-generated BSON ObjectId | Primary unique identifier. |
| `userId` | `ObjectId` | Yes | N/A | Reference to `users._id` | Foreign key referencing the authenticated user. |
| `sessionId` | `String` | Yes | N/A | UUID v4 / Cryptographic String | Unique public identifier for the active session. |
| `refreshTokenHash` | `String` | Yes | N/A | 64-char Hex (SHA-256) | One-way cryptographic hash of the issued refresh token (never plaintext). |
| `deviceName` | `String` | No | `null` | e.g. `"iPhone 15 Pro"`, `"MacBook Pro 16"` | Human-readable hardware name. |
| `browser` | `String` | No | `null` | e.g. `"Chrome"`, `"Safari"`, `"Firefox"` | Client browser family. |
| `browserVersion` | `String` | No | `null` | e.g. `"124.0.0"` | Client browser version string. |
| `operatingSystem` | `String` | No | `null` | e.g. `"iOS 17.4"`, `"Windows 11"`, `"macOS"` | Client operating system and version. |
| `ipAddress` | `String` | No | `null` | IPv4 / IPv6 string | Originating client IP address. |
| `userAgent` | `String` | No | `null` | Raw HTTP User-Agent string | Complete client user agent header for forensic analysis. |
| `loginAt` | `Date` | Yes | `Date.now` | ISO 8601 Timestamp | Timestamp of session establishment. |
| `lastActivityAt` | `Date` | Yes | `Date.now` | ISO 8601 Timestamp | Timestamp of most recent token refresh / activity. |
| `expiresAt` | `Date` | Yes | N/A | ISO 8601 Timestamp | Authoritative application-level session expiration timestamp. |
| `isActive` | `Boolean` | Yes | `true` | `true`, `false` | Quick query flag indicating active vs revoked/expired session. |
| `revokedAt` | `Date` | No | `null` | ISO 8601 Timestamp or `null` | Timestamp when session was explicitly revoked (logout). |
| `createdAt` | `Date` | Yes | `Date.now` | ISO 8601 Timestamp | Document creation timestamp. |
| `updatedAt` | `Date` | Yes | `Date.now` | ISO 8601 Timestamp | Document modification timestamp. |

### 5.4 `activity_logs` Collection

Append-only immutable audit ledger recording all sensitive security, authentication, and profile events.

#### Fields Structure

| Field Path | Data Type | Required | Default | Allowed Values / Constraints | Purpose & Description |
| `_id` | `ObjectId` | Yes | Auto | Auto-generated BSON ObjectId | Primary unique identifier. |
| `userId` | `ObjectId` | Yes | N/A | Reference to `users._id` | Foreign key referencing actor/target user. |
| `action` | `String` | Yes | N/A | Enumerated action string (see below) | Machine-readable action type. |
| `category` | `String` | Yes | N/A | `["AUTHENTICATION", "PROFILE", "CONNECTED_ACCOUNT", "SECURITY", "PRIVACY", "SESSION"]` | Domain category for grouping and UI filtering. |
| `description` | `String` | Yes | N/A | Human-readable string | Descriptive audit sentence (e.g. `"Logged in from Chrome on macOS"`). |
| `deviceName` | `String` | No | `null` | String | Hardware device name at the time of event. |
| `browser` | `String` | No | `null` | String | Browser family at the time of event. |
| `operatingSystem` | `String` | No | `null` | String | Operating system at the time of event. |
| `ipAddress` | `String` | No | `null` | String | Client IP address at event occurrence. |
| `metadata` | `Object` | No | `{}` | Flexible BSON Document | Arbitrary context payload (e.g. `{ "provider": "FACEBOOK" }`, `{ "changedFields": ["phone"] }`). |
| `createdAt` | `Date` | Yes | `Date.now` | ISO 8601 Timestamp | Immutable timestamp when action occurred. |

#### Supported Action Types:
- `REGISTER`
- `LOGIN`
- `LOGOUT`
- `PASSWORD_CHANGED`
- `PROFILE_UPDATED`
- `EMAIL_CHANGED`
- `PHONE_CHANGED`
- `ACCOUNT_CONNECTED`
- `ACCOUNT_DISCONNECTED`
- `PRIVACY_UPDATED`
- `TWO_FACTOR_ENABLED`
- `TWO_FACTOR_DISABLED`
- `SESSION_REVOKED`
- `ALL_SESSIONS_REVOKED`

### 5.5 `privacy_settings` Collection

Maintains 1:1 user preferences for profile discoverability, contact visibility, personalized advertising, and data sharing.

#### Fields Structure

| Field Path | Data Type | Required | Default | Allowed Values / Constraints | Purpose & Description |
| `_id` | `ObjectId` | Yes | Auto | Auto-generated BSON ObjectId | Primary unique identifier. |
| `userId` | `ObjectId` | Yes | N/A | Reference to `users._id` (Unique) | Foreign key referencing owner user. |
| `profileVisibility` | `String` | Yes | `"PUBLIC"` | `["PUBLIC", "FRIENDS", "PRIVATE"]` | Controls who can view the user profile across Meta Accounts Center. |
| `emailVisibility` | `String` | Yes | `"PRIVATE"` | `["PUBLIC", "FRIENDS", "PRIVATE"]` | Controls who can view the user's email address. |
| `phoneVisibility` | `String` | Yes | `"PRIVATE"` | `["PUBLIC", "FRIENDS", "PRIVATE"]` | Controls who can view the user's phone number. |
| `personalizedAds` | `Boolean` | Yes | `true` | `true`, `false` | Preference toggle for interest-based personalized ads. |
| `dataSharing` | `Boolean` | Yes | `false` | `true`, `false` | Preference toggle for cross-platform data synchronization. |
| `createdAt` | `Date` | Yes | `Date.now` | ISO 8601 Timestamp | Document creation timestamp. |
| `updatedAt` | `Date` | Yes | `Date.now` | ISO 8601 Timestamp | Document modification timestamp. |

### 5.6 `security_settings` Collection

Maintains 1:1 user security configurations, 2FA mock preferences, and credential change timestamps.

#### Fields Structure

| Field Path | Data Type | Required | Default | Allowed Values / Constraints | Purpose & Description |
| `_id` | `ObjectId` | Yes | Auto | Auto-generated BSON ObjectId | Primary unique identifier. |
| `userId` | `ObjectId` | Yes | N/A | Reference to `users._id` (Unique) | Foreign key referencing owner user. |
| `twoFactorEnabled` | `Boolean` | Yes | `false` | `true`, `false` | Master toggle enabling two-factor authentication requirement. |
| `twoFactorMethod` | `String` | No | `null` | `["SMS", "AUTHENTICATOR_APP", "EMAIL"]` or `null` | Active secondary verification method when 2FA is enabled (`null` when disabled). |
| `lastPasswordChangedAt` | `Date` | No | `null` | ISO 8601 Timestamp or `null` | Timestamp when user last changed their password (`null` for new accounts; updated only when password is changed). |
| `createdAt` | `Date` | Yes | `Date.now` | ISO 8601 Timestamp | Document creation timestamp. |
| `updatedAt` | `Date` | Yes | `Date.now` | ISO 8601 Timestamp | Document modification timestamp. |

### 5.7 `password_reset_tokens` Collection

Stores ephemeral, single-use, cryptographically hashed tokens used for forgot/reset password flows.

#### Fields Structure

| Field Path | Data Type | Required | Default | Allowed Values / Constraints | Purpose & Description |
| `_id` | `ObjectId` | Yes | Auto | Auto-generated BSON ObjectId | Primary unique identifier. |
| `userId` | `ObjectId` | Yes | N/A | Reference to `users._id` | Foreign key referencing requesting user. |
| `tokenHash` | `String` | Yes | N/A | 64-char Hex (SHA-256) | Cryptographic one-way hash of the raw reset token (never plaintext). |
| `expiresAt` | `Date` | Yes | N/A | ISO 8601 Timestamp | Timestamp when token validity expires. |
| `usedAt` | `Date` | No | `null` | ISO 8601 Timestamp or `null` | Timestamp when token was successfully redeemed. |
| `createdAt` | `Date` | Yes | `Date.now` | ISO 8601 Timestamp | Document creation timestamp. |

## 6. Conceptual Hierarchy & Relationships

users
├── connected_accounts       (1 : N)
├── user_sessions            (1 : N)
├── activity_logs            (1 : N)
├── privacy_settings         (1 : 1)
├── security_settings        (1 : 1)
└── password_reset_tokens    (1 : N)

### Relationship Breakdown

1. **`users` (1) ── (N) `connected_accounts`**
   - Linked via `connected_accounts.userId` -> `users._id`.
   - A user can link multiple provider accounts (Facebook, Instagram, WhatsApp).
   - Compound index on `{ provider: 1, providerUserId: 1 }` prevents duplicate linkages across users.

2. **`users` (1) ── (N) `user_sessions`**
   - Linked via `user_sessions.userId` -> `users._id`.
   - A user can have multiple concurrent sessions across devices (mobile, laptop, tablet).

3. **`users` (1) ── (N) `activity_logs`**
   - Linked via `activity_logs.userId` -> `users._id`.
   - An append-only audit trail capturing sensitive user events over time.

4. **`users` (1) ── (1) `privacy_settings`**
   - Linked via `privacy_settings.userId` -> `users._id`.
   - Strictly 1 document per user enforced by unique index on `userId`.

5. **`users` (1) ── (1) `security_settings`**
   - Linked via `security_settings.userId` -> `users._id`.
   - Strictly 1 document per user enforced by unique index on `userId`.

6. **`users` (1) ── (N) `password_reset_tokens`**
   - Linked via `password_reset_tokens.userId` -> `users._id`.
   - Ephemeral single-use tokens created on-demand for password recovery.

## 7. Mermaid Entity-Relationship (ER) Diagram
erDiagram
    USERS ||--o{ CONNECTED_ACCOUNTS : "links"
    USERS ||--o{ USER_SESSIONS : "authenticates"
    USERS ||--o{ ACTIVITY_LOGS : "records"
    USERS ||--|| PRIVACY_SETTINGS : "configures"
    USERS ||--|| SECURITY_SETTINGS : "secures"
    USERS ||--o{ PASSWORD_RESET_TOKENS : "requests"

    USERS {
        ObjectId _id PK
        Object name "firstName, lastName"
        String email UK "unique"
        String phone UK "sparse partial unique"
        Date dateOfBirth "nullable"
        String profilePicture "nullable"
        String passwordHash "bcrypt hash"
        String role "USER | ADMIN"
        Boolean emailVerified
        String status "ACTIVE | INACTIVE | SUSPENDED"
        Date createdAt
        Date updatedAt
    }

    CONNECTED_ACCOUNTS {
        ObjectId _id PK
        ObjectId userId FK
        String provider "FACEBOOK | INSTAGRAM | WHATSAPP"
        String providerUserId "unique per provider"
        String username "nullable"
        String displayName
        String profilePicture "nullable"
        String status "CONNECTED | DISCONNECTED"
        Date connectedAt
        Date updatedAt
    }

    USER_SESSIONS {
        ObjectId _id PK
        ObjectId userId FK
        String sessionId UK "unique"
        String refreshTokenHash UK "SHA-256 hash"
        String deviceName "nullable"
        String browser "nullable"
        String browserVersion "nullable"
        String operatingSystem "nullable"
        String ipAddress "nullable"
        String userAgent "nullable"
        Date loginAt
        Date lastActivityAt
        Date expiresAt "retention TTL index (90d post-expiration)"
        Boolean isActive
        Date revokedAt "nullable"
        Date createdAt
        Date updatedAt
    }

    ACTIVITY_LOGS {
        ObjectId _id PK
        ObjectId userId FK
        String action "REGISTER | LOGIN | LOGOUT | etc."
        String category "AUTHENTICATION | PROFILE | CONNECTED_ACCOUNT | SECURITY | PRIVACY | SESSION"
        String description
        String deviceName "nullable"
        String browser "nullable"
        String operatingSystem "nullable"
        String ipAddress "nullable"
        Object metadata "BSON key-value"
        Date createdAt
    }

    PRIVACY_SETTINGS {
        ObjectId _id PK
        ObjectId userId FK,UK "unique 1:1"
        String profileVisibility "PUBLIC | FRIENDS | PRIVATE"
        String emailVisibility "PUBLIC | FRIENDS | PRIVATE"
        String phoneVisibility "PUBLIC | FRIENDS | PRIVATE"
        Boolean personalizedAds
        Boolean dataSharing
        Date createdAt
        Date updatedAt
    }

    SECURITY_SETTINGS {
        ObjectId _id PK
        ObjectId userId FK,UK "unique 1:1"
        Boolean twoFactorEnabled
        String twoFactorMethod "SMS | AUTHENTICATOR_APP | EMAIL | null"
        Date lastPasswordChangedAt "nullable, default null"
        Date createdAt
        Date updatedAt
    }

    PASSWORD_RESET_TOKENS {
        ObjectId _id PK
        ObjectId userId FK
        String tokenHash UK "SHA-256 hash"
        Date expiresAt "Immediate TTL index (0s)"
        Date usedAt "nullable"
        Date createdAt
    }

## 8. Index Strategy & Rationales

The database architecture defines **exactly 15 useful indexes** across all 7 collections, designed deliberately to maximize query throughput, guarantee multi-tenant data integrity, and manage storage retention:

| SR.No | Collection | Index Key | Index Type / Options | Detailed Architectural Rationale |
| **1** | **`users`** | `{ "email": 1 }` | `unique: true` | O(1) user lookup during login and prevents duplicate account registration. |
| **2** | **`users`** | `{ "phone": 1 }` | `unique: true, sparse: true, partialFilterExpression: { "phone": { "$type": "string" } }` | **Null-safe partial unique index**: Ensures phone numbers cannot be duplicated across users, while allowing multiple users with `null`/omitted phone numbers without duplicate key collisions. |
| **3** | **`users`** | `{ "status": 1, "role": 1 }` | Compound | Accelerates authorization checks and administrative dashboard filters. |
| **4** | **`connected_accounts`** | `{ "provider": 1, "providerUserId": 1 }` | `unique: true` | **Cross-user account collision prevention**: Prevents the same external social account from being linked to multiple distinct Meta accounts simultaneously. |
| **5** | **`connected_accounts`** | `{ "userId": 1, "provider": 1 }` | Compound | Rapid lookup of connected accounts for a specific user filtered by provider or listing all connected accounts in the UI. |
| **6** | **`user_sessions`** | `{ "sessionId": 1 }` | `unique: true` | O(1) session verification on incoming authenticated API requests. |
| **7** | **`user_sessions`** | `{ "refreshTokenHash": 1 }` | `unique: true` | Prevents token collision attacks and accelerates token refresh rotation lookups. |
| **8** | **`user_sessions`** | `{ "userId": 1, "isActive": 1, "expiresAt": 1 }` | Compound | Fast querying of active devices on the Security dashboard and accelerates mass revocation ("Log out of all devices"). |
| **9** | **`user_sessions`** | `{ "expiresAt": 1 }` | `expireAfterSeconds: 7776000` | **Audit-preserving retention TTL**: Delayed cleanup that removes dead session records approximately 90 days after expiration (retention/storage cleanup, NOT authentication check). |
| **10** | **`activity_logs`** | `{ "userId": 1, "createdAt": -1 }` | Compound | High-performance chronological feed retrieval for user activity log dashboard (most recent first). |
| **11** | **`activity_logs`** | `{ "userId": 1, "category": 1, "createdAt": -1 }` | Compound | Rapid filtering of user logs by category (e.g. SECURITY events). |
| **12** | **`privacy_settings`** | `{ "userId": 1 }` | `unique: true` | Enforces strictly one privacy settings document per user. |
| **13** | **`security_settings`** | `{ "userId": 1 }` | `unique: true` | Enforces strictly one security settings document per user. |
| **14** | **`password_reset_tokens`** | `{ "tokenHash": 1 }` | `unique: true` | O(1) lookup during password reset link verification. |
| **15** | **`password_reset_tokens`** | `{ "expiresAt": 1 }` | `expireAfterSeconds: 0` | **Immediate Ephemeral TTL**: Automatically purges expired single-use reset tokens once `expiresAt` is reached. |

## 9. Security Considerations

1. **Password Hashing Standard**:
   - Password hashes in the backend will use native `bcrypt` (work factor >= 12).
   - `bcryptjs` and `argon2` are explicitly excluded to adhere to assignment standards.
   - Plaintext passwords must **never** touch the database.

2. **Zero Plaintext Tokens**:
   - Storing plaintext refresh tokens or reset tokens exposes the system to catastrophic session takeover if a database backup or read replica is compromised.
   - All refresh tokens and password reset tokens are one-way hashed using `SHA-256` before being saved to MongoDB.

3. **Tamper-Proof Audit Logging**:
   - `activity_logs` collection is append-only. There is no `updatedAt` field. Once recorded, activity logs cannot be updated or altered by standard operations.

4. **Multi-Session Isolation & Instant Revocation**:
   - Sessions maintain explicit flags (`isActive`, `revokedAt`, `expiresAt`).
   - Logging out of a device immediately flips `isActive: false` and timestamps `revokedAt`, guaranteeing immediate token invalidation even prior to natural expiration.

## 10. Token Storage Strategy
+-------------------------------------------------------------------------------+
|                        CRYPTOGRAPHIC TOKEN LIFECYCLE                          |
+-------------------------------------------------------------------------------+
|                                                                               |
|  1. TOKEN ISSUANCE (Backend):                                                 |
|     rawToken = crypto.randomBytes(32).toString('hex') (64 hex characters)     |
|                                                                               |
|  2. ONE-WAY HASH COMPUTATION:                                                 |
|     tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')    |
|                                                                               |
|  3. PERSISTENCE IN MONGODB:                                                   |
|     Database stores ONLY `tokenHash` in `user_sessions` / `reset_tokens`      |
|                                                                               |
|  4. CLIENT TRANSMISSION:                                                      |
|     Client receives ONLY `rawToken` (via HttpOnly cookie or emailed link)     |
|                                                                               |
|  5. RUNTIME AUTHENTICATION:                                                   |
|     incomingHash = crypto.createHash('sha256').update(clientToken).digest()   |
|     Database match: { tokenHash: incomingHash, isActive: true, ... }          |
|                                                                               |
+-------------------------------------------------------------------------------+

## 11. Session Expiration vs. MongoDB TTL Retention Strategy

It is critical to distinguish between **Application-Level Session Expiration** and **MongoDB TTL Cleanup**:

### 1. Application-Level Session Expiration (Authoritative Security Boundary)
* `expiresAt` is the authoritative application-level session expiration timestamp.
* The backend must reject expired or revoked sessions immediately upon incoming request verification.
* A session is invalid if ANY of the following conditions are met:
  1. `expiresAt <= CurrentTime`
  2. `isActive === false`
  3. `revokedAt !== null`
* The application must **NEVER** depend on MongoDB TTL deletion to determine whether a session is valid.
* `isActive` and `revokedAt` support immediate manual revocation (e.g. single-device logout or "Log out from all devices").

### 2. MongoDB TTL Cleanup (Storage Retention Mechanism)
* **Index**: `{ "expiresAt": 1 }` with `{ "expireAfterSeconds": 7776000 }` (90 days post-expiration).
* **Purpose**: MongoDB TTL is strictly an asynchronous storage retention/cleanup mechanism. It is **NOT** an authentication or security enforcement mechanism.
* **Why delayed cleanup?**: In a modern accounts center, users expect to view their recent login history and past session activities (e.g., "Logged out of Chrome on Windows 11 on Aug 15"). If MongoDB immediately purged session documents the second they expired, historical visibility on the Security Dashboard would be permanently lost.
* **Result**: Inactive, expired, and revoked sessions remain readable in the database for 90 days for user device inspection and security audits, after which MongoDB's background thread purges them to prevent unbounded database growth.

### 3. Password Reset Tokens Cleanup
* For `password_reset_tokens`, records have no historical audit value once expired or consumed.
* An immediate TTL index `{ "expiresAt": 1 }` with `{ "expireAfterSeconds": 0 }` automatically purges expired tokens immediately.

## 12. Automatic Database Initialization Strategy

Developers should **never** need to open MongoDB Compass to manually create collections or define indexes.

When the Node.js backend initializes in Batch 2:
1. `mongoose.connect(MONGODB_URI)` establishes the database connection to `meta`.
2. Mongoose models (`User`, `ConnectedAccount`, `UserSession`, `ActivityLog`, `PrivacySetting`, `SecuritySetting`, `PasswordResetToken`) register schemas.
3. Mongoose automatically executes `createIndexes()` upon model compilation, automatically creating all 7 collections and all 15 background indexes if they do not already exist.
4. Auto-initialization is completely idempotent and zero-maintenance.

## 13. Design Assumptions & Trade-offs

| Architectural Decision | Chosen Strategy | Alternative Considered | Trade-off / Justification |
| **Settings Storage** | Separate 1:1 collections (`privacy_settings`, `security_settings`) | Embedded subdocuments in `users` | Avoids document size growth and write lock contention during frequent preference toggles. Enforces separation of concerns. |
| **Token Hashing** | SHA-256 for random bearer tokens | bcrypt for tokens | High-entropy 256-bit random tokens do not require slow key stretching (which is critical for low-entropy human passwords). SHA-256 provides sub-millisecond lookups. |
| **Session Retention** | 90-day offset TTL | 0-second immediate TTL | Immediate TTL destroys historical login visibility on the device security dashboard. 90-day retention balances audit history with storage bounding. |
| **Phone Indexing** | Null-safe partial filter unique index | Standard sparse unique index | Standard sparse index can fail on explicit `null` values across MongoDB drivers. Partial filter with `{ "$type": "string" }` guarantees strict null-safety. |

## 14. Scalability Considerations

1. **Read/Write Segregation**: The design supports MongoDB Replica Sets with `readPreference: secondaryPreferred` for high-throughput activity log and session queries.
2. **Sharding Strategy**:
   - `activity_logs` and `user_sessions` can be sharded on `{ "userId": "hashed" }` to distribute write load evenly across multiple MongoDB shards.
3. **Bounded Document Growth**: Avoiding embedded unbounded arrays (such as embedding all logs or all sessions inside `users`) ensures documents remain well below MongoDB's 16MB BSON limit and prevents memory fragmentation.
