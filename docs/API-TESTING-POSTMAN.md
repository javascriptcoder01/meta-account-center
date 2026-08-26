# Meta Accounts Center — Postman API Testing Guide

## Base URL
http://localhost:5000/api

In Postman create an environment:
baseUrl = http://localhost:5000/api
accessToken = <empty initially>
sessionId = <empty initially>
resetToken = <empty initially>
connectedAccountId = <empty initially>

For protected requests add: Headers -
Authorization: Bearer {{accessToken}}

The refresh token is handled through the HttpOnly cookie. Do not manually put it into JSON.

# 1. Authentication

## 1.1 Register
POST {{baseUrl}}/auth/register
Content-Type: application/json

Body: Rawa -> json
{
  "firstName": "Neeraj",
  "lastName": "Kumar",
  "email": "amck.sharma@gmail.com",
  "password": "Neeraj@123"
}

Use a new email for each successful registration test.

Expected successful result: `2xx`.

If you see: 429 Too Many Requests

the authentication rate limiter has been reached. Wait for the configured local window or restart the local in-memory limiter if that is how the current development configuration works.

## 1.2 Login
POST {{baseUrl}}/auth/login
Content-Type: application/json

Body: Rawa -> json
{
  "email": "amck.sharma@gmail.com",
  "password": "Neeraj@123"
}

Save the returned access token as: accessToken

The refresh token is expected to be managed through the HttpOnly cookie.

## 1.3 Refresh
POST {{baseUrl}}/auth/refresh

No JSON body.

Ensure Postman cookie handling is enabled.

## 1.4 Logout
POST {{baseUrl}}/auth/logout
Authorization: Bearer {{accessToken}}

No JSON body.

## 1.5 Logout All Devices
POST {{baseUrl}}/auth/logout-all
Authorization: Bearer {{accessToken}}

No JSON body.

This invalidates all active sessions.

## 1.6 Forgot Password
POST {{baseUrl}}/auth/forgot-password
Content-Type: application/json

Body: Raw -> json
{
  "email": "amck.sharma@gmail.com"
}

The UI/backend uses a generic response to avoid user enumeration.

## 1.7 Reset Password
POST {{baseUrl}}/auth/reset-password
Content-Type: application/json

Body: Raw -> json
{
  "token": "{{resetToken}}",
  "newPassword": "Neeraj@12345"
}

Use the reset token produced by the project's mock reset-password flow.

# 2. Dashboard

## 2.1 Get Dashboard
GET {{baseUrl}}/dashboard
Authorization: Bearer {{accessToken}}

No body.

Returns:
profile
connectedAccounts
securityStatus
recentActivities
connectedDevices

# 3. Profile

## 3.1 Get Profile
GET {{baseUrl}}/profile
Authorization: Bearer {{accessToken}}

No body.

## 3.2 Update Profile
PATCH {{baseUrl}}/profile
Authorization: Bearer {{accessToken}}
Content-Type: application/json

Body: Raw -> json
{
  "firstName": "Neeraj",
  "lastName": "Kumar",
  "dateOfBirth": "1995-05-15",
  "profilePicture": "https://example.com/profile.jpg"
}

Only use fields supported by the current profile contract.

## 3.3 Change Password
POST {{baseUrl}}/profile/change-password
Authorization: Bearer {{accessToken}}
Content-Type: application/json

Body: Raw -> json
{
  "currentPassword": "Demo@12345",
  "newPassword": "NewDemo@12345"
}

Security effect:
All active sessions are revoked.
Frontend should clear authentication and return to login.

## 3.4 Change Email
PATCH {{baseUrl}}/profile/email
Authorization: Bearer {{accessToken}}
Content-Type: application/json

Body:Raw -> json
{
  "email": "neeraj.updated@example.com"
}

Security effect:
All active sessions are revoked.

## 3.5 Change Phone
PATCH {{baseUrl}}/profile/phone
Authorization: Bearer {{accessToken}}
Content-Type: application/json

Body: Raw -> json
{
  "phone": "+919876543210"
}
To remove the phone number, use the value supported by the current validator/service contract (normally `null`).

## 3.6 Change Profile Picture

PATCH {{baseUrl}}/profile/profile-picture
Authorization: Bearer {{accessToken}}
Content-Type: application/json

Body: Raw -> json
{
  "profilePicture": "https://example.com/profile.jpg"
}

HTTPS is required by the frontend/backend security contract.

# 4. Connected Accounts

## 4.1 Get Connected Accounts
GET {{baseUrl}}/connected-accounts
Authorization: Bearer {{accessToken}}

No body.

## 4.2 Connect Mock Account
POST {{baseUrl}}/connected-accounts
Authorization: Bearer {{accessToken}}
Content-Type: application/json

Facebook example: Raw -> json
{
  "provider": "FACEBOOK",
  "providerUserId": "facebook-demo-10001",
  "displayName": "Neeraj Kumar",
  "username": "neeraj.demo",
  "profilePicture": "https://example.com/facebook.jpg"
}

Instagram example:Raw -> json
{
  "provider": "INSTAGRAM",
  "providerUserId": "instagram-demo-10001",
  "displayName": "Neeraj Kumar",
  "username": "neeraj.demo",
  "profilePicture": "https://example.com/instagram.jpg"
}

WhatsApp example: Raw -> json
{
  "provider": "WHATSAPP",
  "providerUserId": "whatsapp-demo-10001",
  "displayName": "Neeraj Kumar",
  "username": "neeraj.demo",
  "profilePicture": "https://example.com/whatsapp.jpg"
}

Allowed providers:
FACEBOOK
INSTAGRAM
WHATSAPP

There is no real OAuth flow.

## 4.3 Disconnect Account
DELETE {{baseUrl}}/connected-accounts/{{connectedAccountId}}
Authorization: Bearer {{accessToken}}

No body.

The account is physically removed.

Active user sessions remain valid.

# 5. Privacy Settings

## 5.1 Get Privacy Settings
GET {{baseUrl}}/privacy
Authorization: Bearer {{accessToken}}

No body.

## 5.2 Update Privacy Settings
PATCH {{baseUrl}}/privacy
Authorization: Bearer {{accessToken}}
Content-Type: application/json

Body: Raw -> json
{
  "profileVisibility": "FRIENDS",
  "emailVisibility": "PRIVATE",
  "phoneVisibility": "PRIVATE",
  "personalizedAds": true,
  "dataSharing": false
}

Allowed visibility: 
PUBLIC
FRIENDS
PRIVATE

Privacy changes do not revoke sessions.

# 6. Security Settings

## 6.1 Get Security Settings
GET {{baseUrl}}/security/settings
Authorization: Bearer {{accessToken}}

No body.

Response includes:
twoFactorEnabled
twoFactorMethod
lastPasswordChangedAt

## 6.2 Enable 2FA Configuration
PATCH {{baseUrl}}/security/settings
Authorization: Bearer {{accessToken}}
Content-Type: application/json

Body:Raw -> json
{
  "twoFactorEnabled": true,
  "twoFactorMethod": "AUTHENTICATOR_APP"
}

Other valid methods: Raw -> json
{
  "twoFactorEnabled": true,
  "twoFactorMethod": "SMS"
}

or: Raw -> json
{
  "twoFactorEnabled": true,
  "twoFactorMethod": "EMAIL"
}

Changing 2FA configuration revokes all active sessions.

## 6.3 Disable 2FA
PATCH {{baseUrl}}/security/settings
Authorization: Bearer {{accessToken}}
Content-Type: application/json

Body: Raw -> json
{
  "twoFactorEnabled": false,
  "twoFactorMethod": null
}

Important:

This is configuration-only 2FA. There is no OTP/secret/recovery-code verification flow.

# 7. Activity History

## 7.1 Get Activity Logs
GET {{baseUrl}}/activity-logs
Authorization: Bearer {{accessToken}}

Default:
page=1
limit=20

## 7.2 Activity Pagination
GET {{baseUrl}}/activity-logs?page=1&limit=20
Authorization: Bearer {{accessToken}}

Maximum limit: 100

## 7.3 Activity Category Filter
GET {{baseUrl}}/activity-logs?page=1&limit=20&category=SECURITY
Authorization: Bearer {{accessToken}}

Allowed categories:
AUTHENTICATION
SESSION
PROFILE
CONNECTED_ACCOUNT
SECURITY
PRIVACY

# 8. Device Management

## 8.1 Get Active Devices
GET {{baseUrl}}/devices
Authorization: Bearer {{accessToken}}

No body.

Only active sessions are returned.

## 8.2 Revoke Device Session
DELETE {{baseUrl}}/devices/{{sessionId}}
Authorization: Bearer {{accessToken}}

No body.

The `sessionId` is the UUID returned by the device endpoint.

If the current session is revoked:
current authentication becomes invalid
refresh cookie is cleared
frontend returns to login

If another device is revoked: current session remains active

# 9. Negative/Security Tests

## Missing token

Call: GET {{baseUrl}}/profile

without Authorization.

Expected: 401 Unauthorized

## Invalid provider
Raw -> Json
{
  "provider": "GOOGLE",
  "providerUserId": "google-1",
  "displayName": "Demo"
}

Expected: 400 Bad Request

## HTTP profile picture
Raw -> json
{
  "profilePicture": "http://example.com/a.jpg"
}

Expected rejection.

HTTPS is required.

## 2FA contradictory state
Raw -> json
{
  "twoFactorEnabled": false,
  "twoFactorMethod": "SMS"
}

Expected rejection.

## 2FA missing method
Raw -> json
{
  "twoFactorEnabled": true,
  "twoFactorMethod": null
}

Expected rejection.

## Mass assignment attempt

Example: Raw -> json
{
  "firstName": "Neeraj",
  "userId": "another-user-id",
  "role": "ADMIN",
  "passwordHash": "fake",
  "createdAt": "2026-01-01T00:00:00.000Z"
}

Expected behavior:
Protected fields are rejected or ignored according to the endpoint validator.
They must never change ownership/security fields.

## Duplicate connected account

Send the same: provider + providerUserId

twice.

Expected: 409 Conflict

# 10. Recommended Postman Test Order

Use this order for a clean demo:
1. Register
2. Login
3. Dashboard
4. Get Profile
5. Update Profile
6. Get Connected Accounts
7. Connect Facebook
8. Connect Instagram
9. Get Privacy
10. Update Privacy
11. Get Security Settings
12. Enable 2FA
13. Login again after session revocation
14. Get Activity Logs
15. Get Devices
16. Revoke another device
17. Disconnect Facebook
18. Dashboard again
19. Logout
20. Login again
21. Logout All

For password/email/2FA security operations that revoke all sessions, perform the next protected request only after logging in again.

# 11. Expected HTTP Statuses

Situation | Expected
Successful GET | 200
Successful POST/PATCH | 200/201 depending on endpoint contract 
Successful DELETE | 200/204 depending on endpoint contract 
Validation error | 400 
Missing/invalid authentication | 401 
Authenticated but not allowed | 403 
Resource/duplicate conflict | 409 
Rate limit exceeded | 429 
Unexpected server error | 500 

Always use the actual response status returned by the current backend contract when documenting a specific endpoint.