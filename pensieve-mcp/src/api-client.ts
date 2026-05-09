import { ensureAuthenticated, getAuthHeaders } from "./auth.js";

const BASE_URL = process.env.PENSIEVE_BASE_URL || "http://localhost:8083";

interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

async function request<T = unknown>(
  method: string,
  path: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  await ensureAuthenticated();

  const url = `${BASE_URL}${path}`;
  const headers = getAuthHeaders();

  const options: RequestInit = { method, headers };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, options);

    if (res.status === 204) {
      return { ok: true, status: 204 };
    }

    const contentType = res.headers.get("content-type") || "";
    let data: unknown;

    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const errorMsg =
        typeof data === "object" && data !== null && "error" in data
          ? (data as { error: string }).error
          : typeof data === "string"
            ? data
            : `HTTP ${res.status}`;
      return { ok: false, status: res.status, error: errorMsg };
    }

    return { ok: true, status: res.status, data: data as T };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, status: 0, error: `Network error: ${message}` };
  }
}

export async function get<T = unknown>(path: string): Promise<ApiResponse<T>> {
  return request<T>("GET", path);
}

export async function post<T = unknown>(path: string, body?: unknown): Promise<ApiResponse<T>> {
  return request<T>("POST", path, body);
}

export async function put<T = unknown>(path: string, body?: unknown): Promise<ApiResponse<T>> {
  return request<T>("PUT", path, body);
}

export async function del<T = unknown>(path: string): Promise<ApiResponse<T>> {
  return request<T>("DELETE", path);
}
