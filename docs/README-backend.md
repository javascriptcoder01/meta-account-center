# Meta Accounts Center — Backend

Backend REST API for the Meta Accounts Center assignment.

The implementation follows the assignment requirements for authentication, profile management, connected accounts, security settings, privacy settings, activity history, device management, and dashboard overview. The assignment explicitly requires REST APIs, validation, error handling, authentication middleware, authorization, and status-code handling. fileciteturn6file0

## 1. Technology

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- HttpOnly refresh-token cookie
- Argon2/bcrypt password hashing as implemented by the project
- Express Validator
- Rate limiting
- Helmet/security middleware
- Vitest integration tests

## 2. Backend Structure
backend/
├── src/
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   └── app/server - > entrypoints
├── docs/
├── .env.example
└── package.json

The backend is organized as:
Route
  ↓
Middleware / Validation
  ↓
Controller
  ↓
Service
  ↓
Repository / Mongoose Model
  ↓
MongoDB

## 3. Environment

Create the backend environment file from the existing `.env.example`.

Typical local configuration: env
- NODE_ENV=development
- PORT=5000
- MONGODB_URI=mongodb://127.0.0.1:27017/meta
- JWT_SECRET=change-me
- JWT_EXPIRES_IN=...
- REFRESH_TOKEN_SECRET=change-me
- CORS_ORIGIN=http://localhost:5173

Use the actual variable names already present in the project's `.env.example`; do not invent replacement names when configuring the existing application.

## 4. Install & Run
`cd backend`
`npm install`
`npm run dev`

Backend:
- http://localhost:5000

API base:
http://localhost:5000/api

## 5. Test

Run the complete backend suite sequentially:
- npm test -- --fileParallelism=false

across authentication, profile, connected accounts, privacy, security settings, activity history, devices, health, and dashboard functionality.

## 6. Authentication Model

The frontend/backend architecture uses:

- Access token: short-lived JWT returned by authentication APIs.
- Frontend storage: Redux/in-memory only.
- Refresh token: HttpOnly cookie.
- Axios requests: `withCredentials: true`.
- Protected endpoints: `Authorization: Bearer <accessToken>`.
- Refresh endpoint: rotates/restores the access session through the cookie.
- Sensitive operations can revoke all sessions according to the endpoint policy.

Never put refresh tokens, password hashes, or reset secrets into API request bodies.

## 7. Security Rules

### Ownership

Authenticated user ownership always comes from:
- req.user.id

Client-supplied `userId` is not trusted.

### Mass Assignment

Mutating APIs explicitly whitelist accepted fields.

Protected/internal fields such as:
- userId
- _id
- role
- status
- passwordHash
- refreshTokenHash
- createdAt
- updatedAt
- lastPasswordChangedAt
- expiresAt
- revokedAt

must not be accepted from the client.

### 2FA Boundary

This assignment implements configuration-only 2FA.

Allowed methods:
- SMS
- AUTHENTICATOR_APP
- EMAIL
- null

There is no OTP generation, secret enrollment, QR-code enrollment, recovery-code flow, or real 2FA verification.

`TOTP` is not part of this project's contract.

### Connected Accounts

Supported mock providers:

- FACEBOOK
- INSTAGRAM
- WHATSAPP

There is no real OAuth integration. The assignment explicitly permits mock connected-account implementations.

## 8. Session Policies

Operation | Session effect
Privacy update | Sessions preserved 
Connected account connect/disconnect | Sessions preserved
Profile normal update | Session preserved
Phone update | Session preserved
Profile picture update | Session preserved
Password change | All sessions revoked
Email change | All sessions revoked
2FA configuration change | All sessions revoked
Current device revocation | Current session becomes invalid
Individual non-current device revocation | Other sessions preserved
Logout | Current session terminated
Logout all | All sessions terminated

## 9. Main Collections

- users
- connected_accounts
- user_sessions
- activity_logs
- privacy_settings
- security_settings

No dashboard-specific collection is required.

## 10. Activity Logging

Important activity events include:

- LOGIN
- LOGOUT
- PASSWORD_CHANGED
- PROFILE_UPDATED
- EMAIL_CHANGED
- PHONE_CHANGED
- ACCOUNT_CONNECTED
- ACCOUNT_DISCONNECTED
- PRIVACY_UPDATED
- SESSION_REVOKED
- TWO_FACTOR_ENABLED
- TWO_FACTOR_DISABLED

Activity history is read-only from the public API.

## 11. Rate Limiting

Authentication endpoints are rate limited.

For local development/testing, the current configuration may use a shorter window so repeated Postman/UI testing is practical. Production should retain the stricter security configuration.

A rate-limited request must still return:
- 429 Too Many Requests

Do not remove rate limiting just to make testing easier.

## 12. API Documentation

See:
- docs/API-TESTING-POSTMAN.md
- docs/meta-accounts-center.postman_collection.json

Import the Postman collection and set:

- baseUrl = http://localhost:5000/api

The collection uses a `accessToken` variable for protected requests.

## 13. Interview Explanation

A simple explanation:

> "I used a layered Express architecture with route-level validation, authentication middleware, controllers for HTTP concerns, services for business rules, and repositories/models for MongoDB access. Authentication uses a short-lived access JWT with an HttpOnly refresh cookie. User ownership is always derived from the authenticated request, and mutating APIs use explicit whitelists to prevent mass assignment."

## 14. Assignment Alignment

The original assignment asks for registration/login, profile management, connected accounts, security settings, privacy settings, activity history, device management, and a dashboard overview, together with validation, authentication, authorization and error handling. fileciteturn6file1

The implementation also follows the assignment's requested deliverables around setup documentation and API documentation. fileciteturn6file2
