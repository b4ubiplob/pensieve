# Plan: Expose Pensieve REST API as MCP Server

## Context

Pensieve has REST endpoints (Projects, Lists, Tasks, Analytics, Backup) running on Spring Boot 4.0.1. We want Claude Code / Claude Desktop to interact with these endpoints directly via MCP tools, enabling natural-language task management (e.g., "list my projects", "create a task", "what did I work on yesterday").

## Chosen Approach: TypeScript stdio MCP Server

A lightweight TypeScript project using `@modelcontextprotocol/sdk` that proxies tool calls to the running Pensieve REST API.

**Why not Spring AI MCP Server?** Spring AI's stable MCP support targets Spring Boot 3.4.x — incompatible with Pensieve's Spring Boot 4.0.1. The TypeScript SDK is mature, first-party, and keeps the MCP layer fully decoupled from the Java backend.

## Project Structure

```
pensieve-mcp/              (new, at repo root)
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts           MCP server entry point (tool registration, stdio transport)
    ├── auth.ts            Auth manager (password login + Google OAuth with local callback server)
    ├── api-client.ts      HTTP client wrapping Pensieve REST API
    └── tools.ts           All tool definitions grouped together
```

## Authentication Strategy

Supports two modes, selected by which environment variables are provided:

### Mode 1: Username/Password (simple)
- Env vars: `PENSIEVE_USERNAME`, `PENSIEVE_PASSWORD`
- On first API call: `POST /api/v1/auth/login` → stores access + refresh tokens in memory
- Before each subsequent call: checks token expiry, refreshes if needed via `POST /api/v1/auth/refresh`

### Mode 2: Google OAuth (browser-based)
- Env var: `PENSIEVE_AUTH_MODE=google`
- On first tool call, the MCP server:
  1. Starts a temporary local HTTP server on a random port (e.g., `http://localhost:9876/callback`)
  2. Opens the user's browser to: `http://localhost:8083/oauth2/authorization/google`
  3. The backend's existing OAuth2 flow authenticates with Google and redirects to the frontend's `/oauth2/redirect?token=...&refresh=...`
  4. **Backend change required**: Add a new redirect URI option. We'll add a `POST /api/v1/auth/oauth2/token-exchange` endpoint OR modify the success handler to support a configurable callback URL.
  
  **Simpler alternative (recommended)**: Add a new backend endpoint `POST /api/v1/auth/google-token` that accepts a Google ID token (obtained by the MCP server using Google's OAuth2 device flow or a local browser redirect) and returns Pensieve JWT tokens directly. This avoids modifying the existing OAuth2 flow.

**Backend endpoint to add** (`AuthController`):
```java
@PostMapping("/google-token")
public ResponseEntity<?> loginWithGoogleToken(@RequestBody Map<String, String> request) {
    // 1. Verify the Google ID token using Google's token verifier
    // 2. Extract email from the verified token
    // 3. Find or create user by email (same logic as CustomOAuth2UserService)
    // 4. Generate and return Pensieve JWT access + refresh tokens
}
```

**MCP server Google auth flow**:
1. MCP server starts a local HTTP server (port picked dynamically)
2. Opens browser to Google's OAuth consent: `https://accounts.google.com/o/oauth2/auth?client_id=...&redirect_uri=http://localhost:{port}/callback&response_type=code&scope=openid+email+profile`
3. User consents in browser → Google redirects to local callback with auth code
4. MCP server exchanges auth code for Google ID token (calling Google's token endpoint directly)
5. Sends ID token to `POST /api/v1/auth/google-token` → receives Pensieve JWT tokens
6. Shuts down local HTTP server, stores tokens in memory
7. Tokens are cached to `~/.pensieve-mcp-tokens.json` so re-auth isn't needed every session

### Shared behavior (both modes)
- Resolves `userId` from `GET /api/v1/auth/me` and caches it for user-scoped queries
- Auto-refreshes expired access tokens via `POST /api/v1/auth/refresh`

## MCP Tools to Implement

### Project Tools
| Tool | Description | Parameters |
|------|-------------|------------|
| `list_projects` | List all projects for authenticated user | — |
| `get_project` | Get project details | `projectId` |
| `create_project` | Create a project | `name`, `description?` |
| `update_project` | Update project | `projectId`, `name?`, `description?` |
| `delete_project` | Delete a project | `projectId` |

### List Tools
| Tool | Description | Parameters |
|------|-------------|------------|
| `list_project_lists` | Get all lists in a project | `projectId` |
| `create_list` | Create a list | `projectId`, `name`, `description?` |
| `update_list` | Update a list | `listId`, `name?`, `description?` |
| `delete_list` | Delete a list | `listId` |

### Task Tools
| Tool | Description | Parameters |
|------|-------------|------------|
| `list_tasks` | Get tasks in a list | `listId` |
| `get_task` | Get task with subtasks | `taskId` |
| `create_task` | Create a task in a list | `listId`, `title`, `description?`, `status?`, `priority?`, `dueDate?` |
| `create_subtask` | Create subtask under parent | `parentTaskId`, `title`, `description?`, `status?`, `priority?` |
| `update_task` | Update a task | `taskId`, `title?`, `description?`, `status?`, `priority?`, `dueDate?` |
| `delete_task` | Delete a task | `taskId` |
| `list_tasks_by_status` | Query tasks by status | `status` (CREATED\|IN_PROGRESS\|COMPLETED\|BLOCKED\|PAUSED) |

### Analytics Tools
| Tool | Description | Parameters |
|------|-------------|------------|
| `get_task_duration` | Get time tracking for a task | `taskId` |
| `get_tasks_by_date` | Tasks active on a specific date | `date` (YYYY-MM-DD) |
| `get_tasks_by_date_range` | Tasks active in a range | `startDate`, `endDate` |

## Implementation Steps

1. **Create `pensieve-mcp/` project** — package.json (deps: `@modelcontextprotocol/sdk`, `open`), tsconfig.json
2. **Implement `src/auth.ts`** — dual-mode auth manager:
   - Password mode: login(), refresh(), getHeaders(), getUserId()
   - Google mode: startLocalCallbackServer(), openBrowser(), exchangeCodeForToken(), callGoogleTokenEndpoint()
   - Token persistence: save/load tokens from `~/.pensieve-mcp-tokens.json`
3. **Add backend endpoint** — `POST /api/v1/auth/google-token` in `AuthController.java`:
   - Accepts `{ "idToken": "..." }`
   - Verifies ID token with Google (`GoogleIdTokenVerifier`)
   - Finds/creates user by email
   - Returns Pensieve JWT tokens
   - Add `google-api-client` dependency (already in pom.xml)
4. **Implement `src/api-client.ts`** — generic get/post/put/delete with auto-auth and error handling
5. **Implement `src/tools.ts`** — all tool handler functions calling the api-client
6. **Implement `src/index.ts`** — create McpServer, register tools with schemas (zod), connect stdio transport
7. **Build & test** — `npm run build`, test with `npx @modelcontextprotocol/inspector`
8. **Register with Claude Code** — `claude mcp add` with env vars

## Claude Code Configuration (after build)

**For password auth:**
```bash
claude mcp add --transport stdio \
  --env PENSIEVE_BASE_URL=http://localhost:8083 \
  --env PENSIEVE_USERNAME=<email> \
  --env PENSIEVE_PASSWORD=<password> \
  pensieve -- node /Users/i320626/git/pensieve/pensieve-mcp/dist/index.js
```

**For Google OAuth:**
```bash
claude mcp add --transport stdio \
  --env PENSIEVE_BASE_URL=http://localhost:8083 \
  --env PENSIEVE_AUTH_MODE=google \
  --env GOOGLE_CLIENT_ID=<your-google-client-id> \
  --env GOOGLE_CLIENT_SECRET=<your-google-client-secret> \
  pensieve -- node /Users/i320626/git/pensieve/pensieve-mcp/dist/index.js
```
(On first use, the MCP server will open the browser for Google consent. Tokens are cached after that.)

## Dependencies

**MCP Server (pensieve-mcp/package.json):**
```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.12.0",
    "zod": "^3.23.0",
    "open": "^10.0.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/node": "^22.0.0"
  }
}
```

**Backend (no new Maven dependencies needed)** — `google-api-client` is already in pom.xml, which includes `GoogleIdTokenVerifier`.

## Backend Changes Required

**File**: `pensieve/src/main/java/com/tan90/projects/pensieve/controller/AuthController.java`

Add endpoint `POST /api/v1/auth/google-token`:
- Input: `{ "idToken": "<google-id-token>" }`
- Verify token with `GoogleIdTokenVerifier` (using existing `GOOGLE_CLIENT_ID`)
- Extract email from payload
- Find existing user by email OR create new user (provider=GOOGLE)
- Generate Pensieve JWT access + refresh tokens
- Return `AuthResponse`

**File**: `pensieve/src/main/java/com/tan90/projects/pensieve/config/SecurityConfig.java`

Add `/api/v1/auth/google-token` to the public endpoints list (it's already covered by `/api/v1/auth/**` pattern, so no change needed).

## Verification

1. Start the Pensieve backend (`cd pensieve && mvn spring-boot:run`)
2. Build the MCP server (`cd pensieve-mcp && npm install && npm run build`)
3. Test with MCP Inspector: `npx @modelcontextprotocol/inspector node dist/index.js`
4. Register with Claude Code and verify tools appear via `/mcp`
5. Test end-to-end: ask Claude to "list my projects" or "create a task called 'Test MCP' in my first project"
