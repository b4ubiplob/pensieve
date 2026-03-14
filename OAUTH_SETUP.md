# Pensieve - Google OAuth2 Authentication Setup

This document provides instructions for setting up and testing the Google OAuth2 authentication feature.

## Overview

The application now supports **two authentication methods**:
1. **Local Authentication**: Username/password with JWT tokens
2. **Google OAuth2**: Sign in with Google account

Key features:
- JWT-based authentication (1-hour access tokens, 7-day refresh tokens)
- Automatic password migration from MD5 to bcrypt
- Account linking (Google accounts automatically linked to existing local accounts by email)
- Protected routes with automatic token refresh
- Spring Security integration

---

## Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL database
- Google Cloud Console account

---

## Backend Setup

### 1. Database Migration

The User table now has two additional columns. Run this SQL to add them:

```sql
ALTER TABLE public.users
ADD COLUMN provider VARCHAR(50) DEFAULT 'LOCAL',
ADD COLUMN provider_id VARCHAR(256);

-- Make password and username nullable for OAuth users
ALTER TABLE public.users
ALTER COLUMN password DROP NOT NULL,
ALTER COLUMN username DROP NOT NULL;
```

### 2. Google OAuth2 Configuration

#### Step 1: Create OAuth2 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure OAuth consent screen if prompted:
   - User Type: External (for testing)
   - App name: Pensieve
   - User support email: Your email
   - Developer contact: Your email
6. Application type: **Web application**
7. Name: Pensieve OAuth
8. **Authorized redirect URIs**:
   - `http://localhost:8080/login/oauth2/code/google`
9. Click **Create**
10. Copy the **Client ID** and **Client Secret**

#### Step 2: Set Environment Variables

Create a `.env` file or set environment variables:

```bash
export GOOGLE_CLIENT_ID="your-google-client-id"
export GOOGLE_CLIENT_SECRET="your-google-client-secret"
export JWT_SECRET="$(openssl rand -base64 64)"
```

**For Windows (PowerShell):**
```powershell
$env:GOOGLE_CLIENT_ID="your-google-client-id"
$env:GOOGLE_CLIENT_SECRET="your-google-client-secret"
$env:JWT_SECRET="your-random-jwt-secret-at-least-64-chars"
```

**Generate JWT Secret:**
```bash
# Linux/Mac
openssl rand -base64 64

# Or use any long random string (min 64 characters)
```

### 3. Install Dependencies and Run

```bash
cd pensieve
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd pensieve_web
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

---

## Testing the Application

### Test Case 1: Local Username/Password Login

1. Register a new user at `http://localhost:5173/register`
2. Login with username and password
3. Verify you're redirected to `/projects`
4. Refresh the page - should stay logged in (JWT tokens)
5. Check browser DevTools > Application > Local Storage:
   - `user`: User data
   - `refreshToken`: 7-day refresh token
6. Logout and verify tokens are cleared

### Test Case 2: MD5 Password Migration

If you have existing users with MD5 passwords:

1. Login with an old user account (with MD5 password)
2. Login should succeed
3. Check database - password should now be bcrypt hash (starts with `$2a$` or `$2b$`)
4. Logout and login again - should still work

### Test Case 3: Google OAuth2 Login (New User)

1. Navigate to `http://localhost:5173/login`
2. Click **"Sign in with Google"**
3. You'll be redirected to Google sign-in
4. Authorize the application
5. You'll be redirected back and logged in
6. Check database - new user created with:
   - `provider = 'GOOGLE'`
   - `provider_id = <Google sub>`
   - `password = NULL`
   - `username = NULL` (optional)

### Test Case 4: Account Linking

1. Create a local user with email `test@example.com`
2. Logout
3. Click "Sign in with Google" and use the same `test@example.com` Google account
4. Accounts should be linked automatically
5. Check database - user should have:
   - `provider = 'GOOGLE'`
   - `provider_id = <Google sub>`
   - Original `password` and `username` still present
6. Verify you can login with **either** method (local or Google)

### Test Case 5: Protected Routes

1. Logout (or clear localStorage)
2. Try to access `http://localhost:5173/projects` directly
3. Should be redirected to `/login`
4. Login and access `/projects` - should work

### Test Case 6: Token Refresh

1. Login and get access token (expires in 1 hour)
2. Make API calls - should work
3. After access token expires (or manually delete it from memory):
   - API calls should automatically refresh using refresh token
   - New access token obtained without re-login
4. After refresh token expires (7 days):
   - User should be redirected to login

### Test Case 7: Multiple Sessions

1. Login on two different browsers
2. Both should work independently
3. Logout on one - other session stays active

---

## Security Considerations

### Production Checklist

1. **HTTPS Required**: OAuth2 requires HTTPS in production
   - Update redirect URIs in Google Console to `https://your-domain.com/login/oauth2/code/google`
   - Update frontend redirect URL in `OAuth2AuthenticationSuccessHandler.java`

2. **CORS Configuration**: Update `SecurityConfig.java` to whitelist only your production domain
   ```java
   configuration.setAllowedOrigins(Arrays.asList("https://your-domain.com"));
   ```

3. **JWT Secret**: Use a strong, randomly generated secret (min 64 characters)
   - Store in environment variables, never commit to Git

4. **Refresh Token Storage**: Consider using httpOnly cookies instead of localStorage
   - More secure against XSS attacks
   - Requires backend changes to set cookies

5. **Token Blacklist**: Implement token blacklist for logout
   - Currently, logout only clears tokens on client
   - Add Redis or database-based blacklist for revoked tokens

6. **Rate Limiting**: Add rate limiting to authentication endpoints

7. **OAuth Scopes**: Currently requesting `email, profile`
   - Add more scopes if needed (e.g., Google Calendar)

---

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Ensure redirect URI in Google Console exactly matches: `http://localhost:8080/login/oauth2/code/google`
- No trailing slashes, case-sensitive

### Error: "Invalid JWT Secret"
- JWT secret must be at least 256 bits (32 bytes)
- Use `openssl rand -base64 64` to generate

### Error: "CORS policy"
- Check backend CORS configuration in `SecurityConfig.java`
- Frontend should be `http://localhost:5173` (not 5174)

### Error: "User not found" after OAuth2
- Check `CustomOAuth2UserService` logs
- Ensure user is being created in database
- Verify `provider` and `provider_id` fields exist

### Database Migration Issues
- If columns don't exist, run the ALTER TABLE scripts above
- Check Spring Boot logs for Hibernate DDL errors

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login with username/password |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout (clear tokens) |
| GET | `/api/v1/auth/me` | Get current user |

### OAuth2

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/oauth2/authorization/google` | Initiate Google OAuth2 flow |
| GET | `/login/oauth2/code/google` | OAuth2 callback (handled by Spring) |

### Protected Endpoints

All endpoints under `/api/v1/projects/**`, `/api/v1/tasks/**`, `/api/v1/lists/**` require JWT authentication.

---

## Architecture Overview

### Backend Flow

1. **Local Login**:
   - User submits username/password → `AuthController.login()`
   - MD5 password check → migrate to bcrypt if needed
   - Generate JWT tokens (access + refresh)
   - Return tokens + user data

2. **Google OAuth2**:
   - User clicks "Sign in with Google" → redirect to `/oauth2/authorization/google`
   - Google authenticates → redirect to `/login/oauth2/code/google`
   - `CustomOAuth2UserService` processes user data
   - Account linking if email exists
   - `OAuth2AuthenticationSuccessHandler` generates JWT tokens
   - Redirect to frontend with tokens

3. **JWT Validation**:
   - `JwtAuthenticationFilter` intercepts all requests
   - Extract JWT from `Authorization: Bearer <token>` header
   - Validate signature and expiration
   - Load user and set SecurityContext

### Frontend Flow

1. **Login**: Store access token (in-memory), refresh token (localStorage)
2. **API Calls**: Include `Authorization: Bearer <token>` header
3. **Auto-Refresh**: On 401 error, call `/auth/refresh` and retry
4. **Protected Routes**: Check token existence before rendering

---

## File Structure

### Backend (New/Modified Files)

```
pensieve/src/main/java/com/tan90/projects/pensieve/
├── config/
│   ├── JwtConfig.java (new)
│   └── SecurityConfig.java (new)
├── controller/
│   └── AuthController.java (new)
├── dto/
│   ├── AuthResponse.java (new)
│   ├── LoginRequest.java (new)
│   └── UserDto.java (new)
├── entity/
│   └── User.java (modified - added provider, providerId)
├── security/
│   ├── JwtAuthenticationFilter.java (new)
│   ├── OAuth2AuthenticationSuccessHandler.java (new)
│   └── OAuth2AuthenticationFailureHandler.java (new)
├── service/
│   ├── CustomOAuth2UserService.java (new)
│   ├── CustomUserDetailsService.java (new)
│   ├── JwtService.java (new)
│   └── UserService.java (modified - bcrypt migration)
└── resources/
    └── application.yml (modified - OAuth2 config)
```

### Frontend (New/Modified Files)

```
pensieve_web/src/
├── components/
│   ├── Login.jsx (modified - Google button)
│   ├── OAuth2Redirect.jsx (new)
│   ├── ProtectedRoute.jsx (new)
│   └── Projects.jsx (modified - localStorage)
├── services/
│   ├── api.js (modified - JWT interceptor)
│   └── auth.js (new)
└── App.jsx (modified - protected routes)
```

---

## Support

For issues or questions:
1. Check console logs (browser + Spring Boot)
2. Verify environment variables are set
3. Ensure database migrations ran successfully
4. Check Google OAuth2 redirect URIs match exactly

---

## License

MIT
