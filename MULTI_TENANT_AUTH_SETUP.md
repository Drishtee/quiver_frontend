# Multi-Tenant Authentication System - Setup Guide

## Overview

Quiver is a **multi-tenant SaaS platform** where each organization has isolated data and users. The authentication system supports:

- **Login with OTP** - Secure phone-based authentication
- **Sign up with OTP** - New user registration
- **Multi-tenant isolation** - Data segregation by tenant_id
- **Session management** - Token-based authentication
- **Logout** - Secure session termination

---

## Frontend Components

### 1. **Login Screen** (`src/app/screens/login.tsx`)
Features:
- Phone number input with OTP verification
- "Remember me" option
- Switch to sign up
- Multi-tenant notice
- Error handling with user feedback

### 2. **Landing Page** (`src/app/screens/landing.tsx`)
Updated with:
- **Login button** in header
- Sign up flow (existing)
- Multi-language support

### 3. **User Menu Component** (`src/app/components/user-menu.tsx`)
Features:
- User avatar with initials
- Display user name and email
- Show organization (tenant) name
- Logout button
- Profile and settings options

### 4. **Auth Context** (`src/contexts/AuthContext.tsx`)
Centralized authentication state:
- `user` - Current user data
- `isAuthenticated` - Boolean auth status
- `login()` - Set user as logged in
- `logout()` - Clear user session
- `updateUser()` - Update user profile

### 5. **Logout API** (`src/services/api.ts`)
```typescript
export const logout = async () => {
  // Call backend logout endpoint
  // Clear all localStorage
  // Return success
}
```

---

## Authentication Flow

### Sign Up Flow
```
Landing Page
    ↓ Click "Get Started"
Enter Phone Number
    ↓ Send OTP
Enter OTP
    ↓ Verify OTP
    ↓ (Backend creates user + tenant)
Onboarding Consent
    ↓
Profile Creation
    ↓
... (rest of onboarding)
    ↓
Dashboard
```

### Login Flow
```
Landing Page
    ↓ Click "Login"
Login Screen
    ↓ Enter Phone Number
    ↓ Send OTP
Enter OTP
    ↓ Verify OTP
    ↓ (Backend validates user)
Dashboard (if onboarding complete)
    OR
Onboarding (if not complete)
```

### Logout Flow
```
Dashboard
    ↓ Click User Menu
    ↓ Click "Logout"
Call Logout API
    ↓ Backend invalidates token
Clear localStorage
    ↓
Landing Page
```

---

## Multi-Tenant Data Structure

### User Data (stored in localStorage)
```javascript
{
  access_token: "eyJhbGciOiJIUzI1NiIs...",
  refresh_token: "eyJhbGciOiJIUzI1NiIs...",
  user_id: "1",
  tenant_id: "89dfda4e-a70e-4da4-871f-bfea5c769d53",
  user_phone: "+919643393874",
  user_name: "John Doe",
  user_email: "john@example.com",
  tenant_name: "Acme Corporation"
}
```

### JWT Token Payload
```json
{
  "user_id": 1,
  "tenant_id": "89dfda4e-a70e-4da4-871f-bfea5c769d53",
  "exp": 1767193721,
  "iat": 1767191921,
  "type": "access"
}
```

---

## Backend Implementation Required

### 1. **Tenant Model**
```python
# Django Example
class Tenant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'tenants'
```

### 2. **User Model** (Multi-tenant aware)
```python
# Django Example
class User(AbstractUser):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15, unique=True)
    email = models.EmailField(blank=True, null=True)
    full_name = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = 'users'
        unique_together = [['phone', 'tenant']]
```

### 3. **Sign Up Endpoint** (`POST /auth/send-otp/`)
For NEW users (sign up):
```python
@api_view(['POST'])
def send_otp(request):
    phone = request.data.get('phone')

    # Check if user exists
    user = User.objects.filter(phone=phone).first()

    if not user:
        # NEW USER - Sign up flow
        # Create OTP (don't create user yet, wait for verification)
        otp = generate_otp()
        cache.set(f'otp_{phone}', otp, timeout=300)  # 5 min expiry

        # Send OTP via Twilio SMS
        send_sms(phone, f"Your Quiver OTP is: {otp}")

        return Response({'success': True, 'is_new_user': True})
    else:
        # EXISTING USER - Login flow
        otp = generate_otp()
        cache.set(f'otp_{phone}', otp, timeout=300)
        send_sms(phone, f"Your Quiver OTP is: {otp}")

        return Response({'success': True, 'is_new_user': False})
```

### 4. **Verify OTP Endpoint** (`POST /auth/verify-otp/`)
```python
@api_view(['POST'])
def verify_otp(request):
    phone = request.data.get('phone')
    otp = request.data.get('otp')

    # Verify OTP
    stored_otp = cache.get(f'otp_{phone}')
    if not stored_otp or stored_otp != otp:
        return Response({'error': 'Invalid OTP'}, status=400)

    # Check if user exists
    user = User.objects.filter(phone=phone).first()

    if not user:
        # NEW USER - Create user and tenant
        tenant = Tenant.objects.create(name=f"Organization {phone[-4:]}")
        user = User.objects.create(
            phone=phone,
            tenant=tenant,
            username=phone  # or generate unique username
        )

    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    refresh['tenant_id'] = str(user.tenant.id)

    return Response({
        'success': True,
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'tenant_id': str(user.tenant.id),
        'user_id': user.id,
        'tenant_name': user.tenant.name
    })
```

### 5. **Logout Endpoint** (`POST /auth/logout/`)
```python
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()  # Requires 'rest_framework_simplejwt.token_blacklist'

        return Response({'success': True, 'message': 'Logged out successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=400)
```

### 6. **Authentication Middleware**
```python
# Ensure all API requests include tenant_id from JWT
class TenantMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            # Set tenant_id from user
            request.tenant_id = request.user.tenant.id

        response = self.get_response(request)
        return response
```

### 7. **Data Isolation**
```python
# All queries must filter by tenant_id
class Meeting(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # ... other fields

    class Meta:
        db_table = 'meetings'

# In views, always filter by tenant
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_meetings(request):
    meetings = Meeting.objects.filter(tenant=request.user.tenant)
    # ... serialize and return
```

---

## Environment Variables

### Backend
```bash
# JWT Settings
SECRET_KEY=your_django_secret_key
JWT_SIGNING_KEY=your_jwt_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_LIFETIME=30  # minutes
REFRESH_TOKEN_LIFETIME=7  # days

# Twilio (for OTP SMS)
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

---

## Security Considerations

### 1. **Tenant Isolation**
✅ **Every database query must filter by tenant_id**
```python
# GOOD
Meeting.objects.filter(tenant=request.user.tenant)

# BAD - Security vulnerability!
Meeting.objects.all()  # Returns all tenants' data
```

### 2. **Token Security**
- Use HTTPS in production
- Store tokens securely (httpOnly cookies or localStorage)
- Implement token refresh
- Blacklist tokens on logout

### 3. **OTP Security**
- OTP expires after 5 minutes
- Rate limit OTP requests (max 3 per hour per phone)
- Use Twilio or similar trusted SMS provider
- Hash OTPs before storing in cache

### 4. **Cross-Tenant Access Prevention**
```python
# Middleware to prevent cross-tenant access
class TenantAccessMiddleware:
    def process_view(self, request, view_func, view_args, view_kwargs):
        # Check if URL contains tenant_id
        url_tenant_id = view_kwargs.get('tenant_id')

        if url_tenant_id and request.user.is_authenticated:
            if str(request.user.tenant.id) != url_tenant_id:
                raise PermissionDenied("Access to this tenant is forbidden")

        return None
```

---

## Testing

### Test Sign Up Flow
1. Open landing page
2. Click "Get Started"
3. Enter phone: `9876543210`
4. Receive OTP via SMS
5. Enter OTP
6. Complete onboarding
7. Should see dashboard

### Test Login Flow
1. Open landing page
2. Click "Login"
3. Enter registered phone
4. Receive OTP
5. Enter OTP
6. Should see dashboard directly (skip onboarding)

### Test Logout
1. From dashboard
2. Click user menu (avatar)
3. Click "Logout"
4. Should return to landing page
5. Try accessing dashboard URL - should redirect to login

### Test Multi-Tenant Isolation
1. Create two users with different phones
2. User A creates a meeting
3. Login as User B
4. User B should NOT see User A's meeting

---

## Database Migrations

### Django Example
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Enable token blacklist (for logout)
python manage.py migrate token_blacklist
```

---

## API Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/send-otp/` | POST | No | Send OTP to phone |
| `/auth/verify-otp/` | POST | No | Verify OTP, get tokens |
| `/auth/logout/` | POST | Yes | Logout user |
| `/auth/refresh/` | POST | No | Refresh access token |
| `/onboarding/start/` | POST | Yes | Start onboarding |
| `/meetings/` | GET | Yes | Get user's meetings (tenant-filtered) |

---

## Frontend State Management

### Using Auth Context
```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h1>Welcome {user.fullName}</h1>
      <p>Organization: {user.tenantName}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## Troubleshooting

### Login not working
- Check if OTP is being sent
- Verify phone format: `+91XXXXXXXXXX`
- Check backend logs for errors
- Ensure user exists in database

### Logout not clearing session
- Check if logout API is called
- Verify localStorage is cleared
- Check browser console for errors

### Cross-tenant data visible
- **CRITICAL**: Review all database queries
- Ensure `tenant_id` filter is applied
- Check middleware is active
- Audit API endpoints

---

## Production Checklist

- [ ] Enable HTTPS
- [ ] Use environment variables for secrets
- [ ] Enable token blacklisting
- [ ] Implement rate limiting on OTP
- [ ] Set up monitoring for cross-tenant access attempts
- [ ] Regular security audits
- [ ] Backup strategy for multi-tenant data
- [ ] Data retention policies per tenant
- [ ] GDPR compliance for user data

---

## Support

For questions or issues:
1. Check this documentation
2. Review backend logs
3. Test with Postman/curl
4. Check browser console for frontend errors
