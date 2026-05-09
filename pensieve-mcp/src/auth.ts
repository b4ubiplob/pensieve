import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const TOKEN_CACHE_PATH = join(homedir(), ".pensieve-mcp-tokens.json");

interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix ms
  userId?: string;
}

interface AuthConfig {
  baseUrl: string;
  mode: "password" | "google";
  username?: string;
  password?: string;
  googleClientId?: string;
  googleClientSecret?: string;
}

let cachedTokens: Tokens | null = null;
let cachedUserId: string | null = null;

function getConfig(): AuthConfig {
  const baseUrl = process.env.PENSIEVE_BASE_URL || "http://localhost:8083";
  const mode = process.env.PENSIEVE_AUTH_MODE === "google" ? "google" : "password";

  return {
    baseUrl,
    mode,
    username: process.env.PENSIEVE_USERNAME,
    password: process.env.PENSIEVE_PASSWORD,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  };
}

async function loadCachedTokens(): Promise<Tokens | null> {
  try {
    const data = await readFile(TOKEN_CACHE_PATH, "utf-8");
    const tokens: Tokens = JSON.parse(data);
    if (tokens.refreshToken) {
      return tokens;
    }
  } catch {
    // No cached tokens or invalid file
  }
  return null;
}

async function saveCachedTokens(tokens: Tokens): Promise<void> {
  try {
    await writeFile(TOKEN_CACHE_PATH, JSON.stringify(tokens, null, 2), "utf-8");
  } catch {
    // Non-fatal: caching is best-effort
  }
}

async function loginWithPassword(config: AuthConfig): Promise<Tokens> {
  if (!config.username || !config.password) {
    throw new Error(
      "PENSIEVE_USERNAME and PENSIEVE_PASSWORD must be set for password auth mode"
    );
  }

  const res = await fetch(`${config.baseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: config.username,
      password: config.password,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Login failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const tokens: Tokens = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: Date.now() + (data.expiresIn || 3600) * 1000 - 60000, // 1 min buffer
  };

  return tokens;
}

async function loginWithGoogle(config: AuthConfig): Promise<Tokens> {
  if (!config.googleClientId || !config.googleClientSecret) {
    throw new Error(
      "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set for Google auth mode"
    );
  }

  // Try to load cached tokens first
  const cached = await loadCachedTokens();
  if (cached && cached.refreshToken) {
    // Try to refresh
    try {
      const refreshed = await refreshAccessToken(config.baseUrl, cached.refreshToken);
      return refreshed;
    } catch {
      // Cached refresh token invalid, proceed with full OAuth flow
    }
  }

  // Start local callback server and do OAuth flow
  const { code, redirectUri } = await performOAuthBrowserFlow(config);

  // Exchange auth code for Google tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.googleClientId!,
      client_secret: config.googleClientSecret!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    throw new Error(`Google token exchange failed (${tokenRes.status}): ${body}`);
  }

  const googleTokens = await tokenRes.json();
  const idToken = googleTokens.id_token;

  if (!idToken) {
    throw new Error("No id_token received from Google");
  }

  // Send ID token to Pensieve backend
  const pensieveRes = await fetch(`${config.baseUrl}/api/v1/auth/google-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!pensieveRes.ok) {
    const body = await pensieveRes.text();
    throw new Error(`Pensieve Google token login failed (${pensieveRes.status}): ${body}`);
  }

  const data = await pensieveRes.json();
  const tokens: Tokens = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: Date.now() + (data.expiresIn || 3600) * 1000 - 60000,
  };

  return tokens;
}

async function performOAuthBrowserFlow(
  config: AuthConfig
): Promise<{ code: string; redirectUri: string }> {
  return new Promise((resolve, reject) => {
    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      const url = new URL(req.url || "/", `http://localhost`);

      if (url.pathname === "/callback") {
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        if (error) {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(
            "<html><body><h2>Authentication failed</h2><p>You can close this window.</p></body></html>"
          );
          server.close();
          reject(new Error(`OAuth error: ${error}`));
          return;
        }

        if (code) {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(
            "<html><body><h2>Authentication successful!</h2><p>You can close this window and return to the terminal.</p></body></html>"
          );
          server.close();
          const address = server.address();
          const port = typeof address === "object" && address ? address.port : 0;
          resolve({ code, redirectUri: `http://localhost:${port}/callback` });
          return;
        }

        res.writeHead(400);
        res.end("Missing code parameter");
      } else {
        res.writeHead(404);
        res.end("Not found");
      }
    });

    server.listen(0, "127.0.0.1", async () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      const redirectUri = `http://localhost:${port}/callback`;

      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.searchParams.set("client_id", config.googleClientId!);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", "openid email profile");
      authUrl.searchParams.set("access_type", "offline");
      authUrl.searchParams.set("prompt", "consent");

      // Open browser
      try {
        const open = (await import("open")).default;
        await open(authUrl.toString());
      } catch {
        // If open fails, print the URL for manual copy
        process.stderr.write(
          `\nOpen this URL in your browser to authenticate:\n${authUrl.toString()}\n\n`
        );
      }
    });

    // Timeout after 2 minutes
    setTimeout(() => {
      server.close();
      reject(new Error("OAuth flow timed out (2 minutes). Please try again."));
    }, 120000);
  });
}

async function refreshAccessToken(baseUrl: string, refreshToken: string): Promise<Tokens> {
  const res = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    throw new Error(`Token refresh failed (${res.status})`);
  }

  const data = await res.json();
  return {
    accessToken: data.accessToken,
    refreshToken, // keep the same refresh token
    expiresAt: Date.now() + (data.expiresIn || 3600) * 1000 - 60000,
  };
}

export async function ensureAuthenticated(): Promise<void> {
  const config = getConfig();

  // If we have valid tokens, nothing to do
  if (cachedTokens && cachedTokens.expiresAt > Date.now()) {
    return;
  }

  // Try to refresh if we have a refresh token
  if (cachedTokens && cachedTokens.refreshToken) {
    try {
      cachedTokens = await refreshAccessToken(config.baseUrl, cachedTokens.refreshToken);
      await saveCachedTokens(cachedTokens);
      return;
    } catch {
      // Refresh failed, need full login
      cachedTokens = null;
    }
  }

  // Try loading from disk cache (for Google OAuth sessions)
  if (!cachedTokens) {
    const diskTokens = await loadCachedTokens();
    if (diskTokens) {
      if (diskTokens.expiresAt > Date.now()) {
        cachedTokens = diskTokens;
        return;
      }
      // Try refresh with disk-cached refresh token
      try {
        cachedTokens = await refreshAccessToken(config.baseUrl, diskTokens.refreshToken);
        await saveCachedTokens(cachedTokens);
        return;
      } catch {
        // Disk cache invalid
      }
    }
  }

  // Full login
  if (config.mode === "google") {
    cachedTokens = await loginWithGoogle(config);
  } else {
    cachedTokens = await loginWithPassword(config);
  }

  await saveCachedTokens(cachedTokens);
}

export function getAuthHeaders(): Record<string, string> {
  if (!cachedTokens) {
    throw new Error("Not authenticated. Call ensureAuthenticated() first.");
  }
  return {
    Authorization: `Bearer ${cachedTokens.accessToken}`,
    "Content-Type": "application/json",
  };
}

export async function getUserId(): Promise<string> {
  if (cachedUserId) {
    return cachedUserId;
  }

  await ensureAuthenticated();
  const config = getConfig();

  const res = await fetch(`${config.baseUrl}/api/v1/auth/me`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to get current user (${res.status})`);
  }

  const user = await res.json();
  cachedUserId = user.id;
  return user.id;
}
