# Frontend Token Authentication Debugging Guide

## Issue
Backend responds with: `{"error": "authentication_required", "message": "Valid JWT token required in Authorization header"}`

## What I've Fixed in Frontend

### 1. Phone Number Consistency (src/services/api.ts)
- Both `sendOTP` and `verifyOTP` now send phone with `+91` prefix

### 2. Import Statements (src/app/screens/otp-verification.tsx)
- Removed `.js` extensions from imports

### 3. Enhanced Debugging (src/services/api.ts)
- Added comprehensive console logs to track token flow
- Token storage verification
- Request header logging

## How to Debug This Issue

### Step 1: Check Browser Console
Open the browser console and complete the OTP flow. You should see logs like:

```
Verifying OTP for: 1234567890
OTP verification response: { ... }
Storing tokens...
Token stored successfully. First 20 chars: eyJhbGciOiJIUzI1NiIs...
=== Making authenticated request ===
URL: /onboarding/start/
Token present: YES
Token (first 20 chars): eyJhbGciOiJIUzI1NiIs...
Request headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
}
```

### Step 2: Check Backend Response Structure
**CRITICAL**: Verify the OTP verification endpoint returns:
```json
{
  "access": "JWT_TOKEN_HERE",
  "refresh": "REFRESH_TOKEN_HERE",
  "tenant_id": "...",
  "user_id": "..."
}
```

If the backend returns different field names (e.g., `token` instead of `access`), update src/services/api.ts line 43.

### Step 3: Check Backend CORS Configuration
The backend MUST allow:
- Authorization header in CORS
- OPTIONS preflight requests

**Django Example:**
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',  # ← MUST BE INCLUDED
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_CREDENTIALS = True
```

### Step 4: Check Backend Token Validation
In the backend `/onboarding/start/` endpoint:
- Verify it's checking for `Authorization: Bearer <token>` header
- Verify the JWT token validation logic is working
- Check backend logs for any token parsing errors

### Step 5: Network Tab Inspection
1. Open Browser DevTools → Network tab
2. Filter for "onboarding/start"
3. Check Request Headers - should include:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
   ```
4. If Authorization header is missing, it's a CORS issue

## Common Issues & Solutions

### Issue 1: Token not in response
**Symptom**: Console shows "No access token in response!"
**Solution**: Check backend OTP verification endpoint response structure

### Issue 2: Token is undefined/null
**Symptom**: Console shows "Token present: NO"
**Solution**: The token wasn't stored. Check Step 1 logs to see if storage failed

### Issue 3: CORS blocking Authorization header
**Symptom**: Authorization header doesn't appear in Network tab
**Solution**: Configure backend CORS (see Step 3)

### Issue 4: Token format mismatch
**Symptom**: Backend receives token but rejects it
**Solution**: Check backend JWT validation logic and secret key

## Backend Checklist

Ask the backend team to verify:

- [ ] OTP verification endpoint returns `access` field with JWT token
- [ ] CORS is configured to allow Authorization header
- [ ] CORS allows requests from http://localhost:5173
- [ ] `/onboarding/start/` endpoint requires authentication
- [ ] JWT validation middleware is correctly extracting token from `Authorization: Bearer <token>` header
- [ ] JWT secret key matches between token generation and validation
- [ ] Token hasn't expired (check expiry time)

## Quick Test

Run this in browser console after OTP verification:
```javascript
console.log('Access Token:', localStorage.getItem('access_token'));
console.log('Refresh Token:', localStorage.getItem('refresh_token'));
console.log('Tenant ID:', localStorage.getItem('tenant_id'));
console.log('User ID:', localStorage.getItem('user_id'));
```

All should show valid values, not `null` or `undefined`.
