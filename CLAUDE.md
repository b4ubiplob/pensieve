# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pensieve is a task management application inspired by Trello, with a Spring Boot backend and React frontend. It supports hierarchical project organization (Projects → Lists → Tasks → Subtasks) with both local authentication and Google OAuth2.

## Architecture

### Backend (Java/Spring Boot)
- **Framework**: Spring Boot 4.0.1 with Java 17
- **Database**: PostgreSQL with JPA/Hibernate
- **Authentication**: Dual-mode authentication system:
  - Local: Username/password with bcrypt (migrates legacy MD5 passwords on login)
  - OAuth2: Google OAuth with automatic account linking by email
- **Security**: JWT tokens (1-hour access token, 7-day refresh token) with stateless sessions
- **Package Structure**: `com.tan90.projects.pensieve`
  - `entity/`: JPA entities with manual String IDs
  - `repository/`: Spring Data JPA repositories
  - `service/`: Business logic layer
  - `controller/`: REST controllers under `/api/v1/`
  - `config/`: Security, JWT, and OAuth configuration
  - `security/`: JWT filter and OAuth handlers
  - `dto/`: Data transfer objects

### Frontend (React/Vite)
- **Framework**: React 19 with Vite, React Router v7
- **State Management**: localStorage for refresh tokens, in-memory for access tokens
- **API Layer**: `src/services/api.js` with automatic JWT refresh on 401
- **Auth Flow**: OAuth2 handled via backend redirect to `/oauth2/redirect` with tokens in URL params
- **Protected Routes**: `ProtectedRoute` component wraps authenticated pages

### Data Model Hierarchy
```
User (owns multiple Projects)
  └─ Project (contains multiple Lists)
      └─ ProjectList (contains multiple Tasks)
          └─ Task (can have Subtasks via self-referential parent_id)
              ├─ Attachments
              └─ TaskTags (many-to-many)
```

**Critical Pattern**: All entity IDs are manually generated Strings (typically UUIDs), NOT auto-incremented. Services must generate IDs using `UUID.randomUUID().toString()` before persisting.

## Development Commands

### Backend Setup
```bash
# Navigate to backend
cd pensieve

# Install dependencies and build
mvn clean install

# Run application (requires PostgreSQL and env vars)
mvn spring-boot:run

# Run tests
mvn test

# Package for production
mvn clean package
```

### Frontend Setup
```bash
# Navigate to frontend
cd pensieve_web

# Install dependencies
npm install

# Start dev server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm preview
```

### Database
- **Connection**: `jdbc:postgresql://localhost:5432/db_pensieve`
- **Default credentials**: username `postgres`, password `Password123`
- **Schema**: Uses `public` schema
- **DDL**: Hibernate auto-update enabled (see application.yml)

## Environment Variables

Required for backend to run:
```bash
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
JWT_SECRET="base64-encoded-secret-min-256-bits"  # Generate with: openssl rand -base64 64
```

## Key Implementation Details

### Authentication Flow
1. **Local login**: `POST /api/v1/auth/login` → returns JWT tokens
2. **OAuth2 login**: Frontend redirects to `/oauth2/authorization/google` → backend handles OAuth flow → redirects to frontend `/oauth2/redirect` with tokens in URL params
3. **Account linking**: If Google email matches existing local user, accounts are automatically linked (provider updated to GOOGLE, providerId added)
4. **Password migration**: Login attempts with MD5 passwords automatically migrate to bcrypt

### JWT Token Management
- **JwtAuthenticationFilter** (line 72 in SecurityConfig.java): Intercepts all requests, validates JWT from `Authorization: Bearer <token>` header
- **Frontend auto-refresh**: On 401 response, `api.js` calls `/auth/refresh` with refresh token and retries the original request
- **Token storage**: Access tokens in memory (not persisted), refresh tokens in localStorage

### ID Generation Pattern
- Entities use String IDs, not auto-increment
- Services generate IDs: `user.setId(UUID.randomUUID().toString())` before save
- Never rely on database auto-generation for primary keys

### CORS Configuration
- Backend allows `http://localhost:5173` (frontend dev server)
- Configured in SecurityConfig.java line 80
- For production, update allowed origins to production domain

### Task Status Values
- `CREATED`: To Do
- `IN_PROGRESS`: In Progress
- `BLOCKED`: Blocked
- `COMPLETED`: Done
- `PAUSED`: Paused (exists in entity but not documented in API)

### Trello Migration
- `TrelloMigrationRunner` has `@Component` enabled but migration methods are commented out
- Used to import legacy Trello data from JSON files in `pensieve/src/main/resources/trello/`
- Comment out `@Component` annotation to disable automatic migration on startup

## Testing the Application

1. Start PostgreSQL database
2. Set environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET)
3. Start backend: `cd pensieve && mvn spring-boot:run`
4. Start frontend: `cd pensieve_web && npm run dev`
5. Access app at `http://localhost:5173`

See OAUTH_SETUP.md for detailed OAuth2 testing scenarios.

## API Reference

Full API documentation available in API_DOCUMENTATION.md. Base URL: `http://localhost:8080/api/v1`

Protected endpoints require `Authorization: Bearer <token>` header.
