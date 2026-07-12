const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });
  const body = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!response.ok) throw new ApiError(response.status, body?.error || 'Request failed');
  return body as T;
}

export function apiWebSocketUrl(path: string) {
  const url = new URL(`${apiBaseUrl}${path}`, window.location.origin);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}
