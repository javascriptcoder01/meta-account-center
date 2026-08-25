# Meta Accounts Center — Frontend +  Vite

React frontend for the Meta Accounts Center assignment.

The assignment requires a responsive modern UI, smooth navigation, loading states, validation messages and empty states. fileciteturn6file0

## 1. Technology

- React
- Vite
- Tailwind CSS
- Redux Toolkit
- Redux-Saga
- React Router
- Axios
- Vitest
- React Testing Library

## 2. Frontend Architecture
React Pages
    ↓
Reusable Components
    ↓
Redux Slice
    ↓
Redux Saga
    ↓
API Service
    ↓
Central Axios apiClient
    ↓
Express REST API

### State

The main Redux modules are:

auth
dashboard
profile
connectedAccounts
privacy
securitySettings
activityLog
device

### Side Effects

Redux-Saga handles:

authentication
dashboard loading
profile operations
connected-account operations
privacy updates
security updates
activity history
device management

## 3. Routes

### Public

/login
/register
/forgot-password
/reset-password

### Protected

/dashboard
/profile
/connected-accounts
/privacy
/security
/activity
/devices

Protected routes use `ProtectedRoute`.

Public authentication routes use `PublicRoute`.

## 4. Authentication Security

### Access token

The access token is kept in Redux/in-memory state.

It is NOT persisted to:

- localStorage
- sessionStorage
- regular cookies
- URL query parameters

### Refresh token

The refresh token is managed by the backend as an HttpOnly cookie.

The frontend uses: withCredentials: true

JavaScript does not read or write the refresh token.

### 401 refresh

The central Axios client:

1. Receives a 401.
2. Starts one refresh request.
3. Queues concurrent failed requests.
4. Retries them after successful refresh.
5. Clears authentication if refresh fails.
6. Redirects the user to login.

This single-flight behavior was explicitly implemented in the authentication frontend.

## 5. Tailwind CSS

The UI uses Tailwind CSS for styling.

Design goals:

- responsive layouts
- clean cards
- accessible forms
- loading skeletons
- alerts
- empty states
- modal dialogs
- keyboard-friendly interactions

## 6. Run Frontend

cd frontend
npm install
npm run dev

Frontend: http://localhost:5173

The API base URL is configured for: http://localhost:5000/api

## 7. Test

Run: `npm run test`

Lint: `npm run lint`

Production build: `pm run build`

Final integration verification reached:

41 test files passed
318 tests passed
0 lint warnings
0 lint errors
Production build successful

## 8. Frontend Modules

### Authentication

- Login
- Register
- Forgot Password
- Reset Password
- Logout
- Logout All
- Automatic token refresh

### Dashboard
- Profile summary
- Connected accounts
- Security status
- Recent activities
- Connected devices

### Profile
- Personal information
- Email
- Phone
- Password
- Profile picture
- Date of birth

### Connected Accounts
- Facebook
- Instagram
- WhatsApp

These are mock connections; there is no real OAuth integration.

### Privacy
- Profile visibility
- Email visibility
- Phone visibility
- Personalized ads
- Data sharing

### Security
- 2FA enabled/disabled
- 2FA method
- Last password changed

Allowed methods:
- SMS
- AUTHENTICATOR_APP
- EMAIL

No TOTP flow is implemented.

### Activity
- Authentication
- Session
- Profile
- Connected Account
- Security
- Privacy

Includes pagination and category filtering.

### Devices
- Active sessions
- Browser
- Browser version
- Operating system
- IP address
- Login time
- Last activity
- Individual session revocation

## 9. Security / Payload Rules

Frontend mutating requests explicitly construct payloads.

Never send:
- userId
- _id
- role
- status
- passwordHash
- refreshTokenHash
- accessToken
- refreshToken
- token
- secret
- createdAt
- updatedAt
- expiresAt
- revokedAt

Passwords are only held temporarily while submitting forms and are not persisted.

## 10. Empty & Error States

The UI handles:
- loading
- success
- validation errors
- API errors
- unauthorized sessions
- empty connected accounts
- empty activity history
- empty device list
- failed refresh
- session revocation

## 11. Interview Explanation

A simple explanation:
> "I used React with Redux Toolkit for predictable application state and Redux-Saga for asynchronous API workflows. Axios is centralized so authentication headers and refresh behavior are handled in one place. Each page uses reusable Tailwind components and explicit payload construction so UI state is never blindly sent to the backend."

## 12. Backend Dependency

Start the backend before using the complete frontend:
- Backend:  http://localhost:5000
- Frontend: http://localhost:5173

The frontend expects the backend API base:
- http://localhost:5000/api

## 13. Assignment Alignment

The assignment requires a responsive modern frontend with smooth navigation, loading states, validation messages and empty states.
The implemented UI covers the assignment's authentication, dashboard, profile, connected accounts, security, privacy, activity and device requirements.
