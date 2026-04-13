# Pensieve Application - Startup Scripts

This directory contains scripts to run the Pensieve application in different modes.

## Prerequisites

Before running the application, set the required environment variables:

```bash
# Google OAuth credentials
export GOOGLE_CLIENT_ID="your-google-client-id"
export GOOGLE_CLIENT_SECRET="your-google-client-secret"

# JWT Secret (generate a secure random key)
export JWT_SECRET=$(openssl rand -base64 64)
```

**Tip**: Add these to your `~/.bashrc` or `~/.zshrc` to persist across terminal sessions.

## Available Scripts

### 1. Development Mode (`start-dev.sh`)

**Use this for active development with hot reload.**

```bash
./start-dev.sh
```

**Features:**
- Frontend runs on `http://localhost:5173` with Vite dev server (hot module replacement)
- Backend runs with `mvn spring-boot:run` (auto-recompiles on file changes)
- OAuth redirects to port **5173**
- No build step required - starts immediately
- Press `Ctrl+C` to stop both services

**When to use:**
- During active development
- When you need hot reload for code changes
- For rapid iteration and testing

---

### 2. Production Preview Mode (`start-app.sh`)

**Use this to test the production build locally.**

```bash
./start-app.sh
```

**Features:**
- Frontend runs on `http://localhost:4173` with Vite preview server (production build)
- Backend runs the packaged JAR file (`java -jar target/pensieve-1.0.0.jar`)
- OAuth redirects to port **4173**
- Builds both frontend and backend before starting
- Simulates production environment
- Press `Ctrl+C` to stop both services

**When to use:**
- Before deploying to production
- To test production build optimizations
- To verify everything works with compiled artifacts

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_CLIENT_ID` | ✅ Yes | - | Google OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ Yes | - | Google OAuth 2.0 Client Secret |
| `JWT_SECRET` | ✅ Yes | - | Base64-encoded secret for JWT signing (min 256 bits) |
| `FRONTEND_URL` | ⚠️ Auto | 5173 (dev)<br>4173 (preview) | Frontend URL for OAuth redirects |

---

## Quick Start

### First Time Setup

1. **Install dependencies:**
   ```bash
   # Backend (Maven)
   cd pensieve && mvn clean install
   
   # Frontend (npm)
   cd ../pensieve_web && npm install
   ```

2. **Set environment variables** (see Prerequisites above)

3. **Start PostgreSQL** (ensure database `db_pensieve` exists)

4. **Run development mode:**
   ```bash
   ./start-dev.sh
   ```

5. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080

---

## Troubleshooting

### "Backend failed to start"
- Check `pensieve/backend.log` for error details
- Ensure PostgreSQL is running on port 5432
- Verify database credentials in `pensieve/src/main/resources/application.yml`

### OAuth redirects to wrong port
- **Dev mode:** Make sure you're using `./start-dev.sh` (redirects to 5173)
- **Preview mode:** Use `./start-app.sh` (redirects to 4173)
- Check Google OAuth console: authorized redirect URIs should include:
  - `http://localhost:8080/login/oauth2/code/google`

### Backend doesn't stop with Ctrl+C
- The scripts now have proper signal handling
- If backend is still running: `pkill -f pensieve-1.0.0.jar`
- Or find PID: `ps aux | grep java` then `kill <PID>`

### Port already in use
- Frontend ports (5173 or 4173): `lsof -ti:5173 | xargs kill -9`
- Backend port (8080): `lsof -ti:8080 | xargs kill -9`

---

## Additional Notes

### OAuth Configuration in Google Cloud Console

Make sure your Google OAuth 2.0 credentials have these authorized redirect URIs:

```
http://localhost:8080/login/oauth2/code/google
https://your-production-domain.com/login/oauth2/code/google
```

The frontend URL (`5173` or `4173`) is handled automatically by the backend - you don't need to add frontend URLs to Google's configuration.

### Script Behavior

Both scripts:
- ✅ Validate required environment variables before starting
- ✅ Handle `Ctrl+C` gracefully (stops both frontend and backend)
- ✅ Show real-time status messages
- ✅ Log backend output to `pensieve/backend.log`
- ✅ Force-kill processes if graceful shutdown fails

---

## Manual Startup (Advanced)

If you prefer to run services separately:

### Backend Only
```bash
cd pensieve
export FRONTEND_URL=http://localhost:5173  # or 4173
mvn spring-boot:run
```

### Frontend Only (Dev)
```bash
cd pensieve_web
npm run dev
```

### Frontend Only (Preview)
```bash
cd pensieve_web
npm run build
npm run preview
```

---

For more information, see:
- `CLAUDE.md` - Project architecture and conventions
- `DEPLOYMENT.md` - Production deployment guide
- `API_DOCUMENTATION.md` - API reference
