# Deployment Guide

This guide explains how to build and run the Pensieve application in production/preview mode.

## Overview

The `start-app.sh` script automates the entire build and deployment process for both backend and frontend components. It builds production-ready artifacts and runs them on the appropriate ports.

## Prerequisites

### Required Software
- Java 17 or higher
- Maven 3.6+
- Node.js 18+ and npm
- PostgreSQL database (running on localhost:5432)

### Required Environment Variables

Before running the application, you must set the following environment variables:

```bash
# Google OAuth2 credentials
export GOOGLE_CLIENT_ID="your-google-client-id"
export GOOGLE_CLIENT_SECRET="your-google-client-secret"

# JWT secret (minimum 256 bits, base64 encoded)
export JWT_SECRET=$(openssl rand -base64 64)
```

**Note**: These variables need to be set in your shell session before running the script.

## Database Setup

Ensure PostgreSQL is running with the following configuration:

- **Host**: localhost
- **Port**: 5432
- **Database**: db_pensieve
- **Username**: postgres
- **Password**: Password123

To create the database:
```bash
psql -U postgres -c "CREATE DATABASE db_pensieve;"
```

## Running the Application

### Quick Start

```bash
# Navigate to project root
cd /Users/i320626/git/pensieve

# Run the startup script
./start-app.sh
```

### What the Script Does

1. **Environment Validation**
   - Sets `FRONTEND_URL=http://localhost:4173` for preview mode
   - Validates that required environment variables are set
   - Displays masked values for verification

2. **Backend Build**
   - Runs `mvn clean package -DskipTests` in the `pensieve/` directory
   - Creates `target/pensieve-1.0.0.jar` executable JAR

3. **Frontend Build**
   - Runs `npm run build` in the `pensieve_web/` directory
   - Creates optimized production bundle in `pensieve_web/dist/`

4. **Backend Startup**
   - Starts backend: `java -jar target/pensieve-1.0.0.jar`
   - Runs in background with PID tracking
   - Logs output to `pensieve/backend.log`
   - Waits 10 seconds for startup

5. **Frontend Startup**
   - Starts frontend: `npm run preview`
   - Runs in foreground (blocking)
   - Serves production build from `dist/`

## Application URLs

Once started, the application will be available at:

- **Frontend**: http://localhost:4173
- **Backend API**: http://localhost:8080/api/v1
- **OAuth2 Endpoint**: http://localhost:8080/oauth2/authorization/google

## Stopping the Application

Press `Ctrl+C` in the terminal where the script is running. This will:
1. Stop the frontend preview server
2. Automatically terminate the backend process

## Logs and Debugging

### Backend Logs
Backend output is written to `pensieve/backend.log`:
```bash
tail -f pensieve/backend.log
```

### Frontend Logs
Frontend logs appear directly in the terminal.

### Manual Process Management

If you need to manually stop the backend:
```bash
# Find the backend PID
ps aux | grep pensieve-1.0.0.jar

# Kill the process
kill <PID>
```

## Port Configuration

The application uses the following ports:

| Component | Port | Configurable Via |
|-----------|------|------------------|
| Frontend  | 4173 | `FRONTEND_URL` env var |
| Backend   | 8080 | `application.yml` (`server.port`) |
| Database  | 5432 | `application.yml` (`spring.datasource.url`) |

### Changing Frontend Port

To use a different frontend port:

1. Update the `FRONTEND_URL` in `start-app.sh`:
   ```bash
   export FRONTEND_URL=http://localhost:<YOUR_PORT>
   ```

2. Update Vite preview port in `pensieve_web/vite.config.js`:
   ```javascript
   export default defineConfig({
     preview: {
       port: <YOUR_PORT>
     }
   })
   ```

## Development vs Preview Mode

| Aspect | Development (`npm run dev`) | Preview (`npm run preview`) |
|--------|----------------------------|----------------------------|
| Port | 5173 | 4173 |
| Build | No build, hot reload | Production build required |
| Performance | Slower, dev optimizations | Faster, production optimized |
| Source Maps | Full | Minimal/none |
| Environment | Development | Production-like |

**When to use Preview Mode:**
- Testing production builds locally
- Performance testing
- Pre-deployment validation
- Demonstrating to stakeholders

**When to use Dev Mode:**
- Active development
- Debugging
- Rapid iteration

## Troubleshooting

### Backend fails to start

**Check PostgreSQL:**
```bash
psql -U postgres -d db_pensieve -c "SELECT 1;"
```

**Check environment variables:**
```bash
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET
echo $JWT_SECRET
```

**Check backend logs:**
```bash
cat pensieve/backend.log
```

### Port already in use

If port 4173 or 8080 is already in use:
```bash
# Find process using port 4173
lsof -i :4173

# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>
```

### OAuth2 redirect fails

Ensure `FRONTEND_URL` matches the actual frontend port:
```bash
# Check backend logs for redirect URL
grep "oauth2/redirect" pensieve/backend.log
```

### Build failures

**Backend build fails:**
```bash
cd pensieve
mvn clean install -U  # Force update dependencies
```

**Frontend build fails:**
```bash
cd pensieve_web
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Production Deployment

For actual production deployment:

1. **Update `FRONTEND_URL`** to your production domain:
   ```bash
   export FRONTEND_URL=https://your-domain.com
   ```

2. **Use production database credentials** in `application.yml` or via environment variables

3. **Configure reverse proxy** (nginx/Apache) to serve frontend and proxy API requests

4. **Use process manager** (systemd/PM2) instead of the startup script

5. **Enable HTTPS** for both frontend and backend

6. **Set secure JWT_SECRET** (store in secrets manager, not in scripts)

7. **Configure CORS** for production domain in `SecurityConfig.java`

## Script Customization

To modify the startup script behavior, edit `start-app.sh`:

- **Skip tests during build**: Already configured with `-DskipTests`
- **Change wait time**: Modify `sleep 10` to adjust backend startup wait
- **Different log location**: Change `backend.log` path
- **Run in different order**: Reorder the script sections

## Manual Build and Run

If you prefer to run components separately:

**Backend:**
```bash
cd pensieve
mvn clean package
export FRONTEND_URL=http://localhost:4173
java -jar target/pensieve-1.0.0.jar
```

**Frontend:**
```bash
cd pensieve_web
npm run build
npm run preview
```

## Notes

- The startup script is designed for **local testing** of production builds
- Backend runs in **background** to allow simultaneous frontend execution
- Frontend runs in **foreground** so you can see logs and stop easily with Ctrl+C
- Backend is automatically cleaned up when frontend stops
- All builds skip tests by default for faster startup (run tests separately)
