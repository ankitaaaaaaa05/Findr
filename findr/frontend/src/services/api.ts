// Thin fetch wrapper. Keeps a single place for the base URL and auth header
// so screens can stay focused on UI logic.
import { storage } from '@/src/utils/storage';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';
const TOKEN_KEY = 'lf.auth.token';

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const token = await storage.secureGet(TOKEN_KEY, '' as string);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(await authHeader()),
    ...((init.headers as Record<string, string>) || {}),
  };
  const res = await fetch(`${BASE_URL}/api${path}`, { ...init, headers });
  const text = await res.text();
  let body: unknown = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) {
    const msg = (body as { message?: string })?.message || res.statusText || 'Request failed';
    throw new ApiError(res.status, msg, body);
  }
  return body as T;
}

export const api = {
  get: <T,>(p: string) => request<T>(p),
  post: <T,>(p: string, b?: unknown) => request<T>(p, { method: 'POST', body: b ? JSON.stringify(b) : undefined }),
  put: <T,>(p: string, b?: unknown) => request<T>(p, { method: 'PUT', body: b ? JSON.stringify(b) : undefined }),
  del: <T,>(p: string) => request<T>(p, { method: 'DELETE' }),
  saveToken: (t: string) => storage.secureSet(TOKEN_KEY, t),
  clearToken: () => storage.secureRemove(TOKEN_KEY),
  getToken: () => storage.secureGet(TOKEN_KEY, '' as string),
};
