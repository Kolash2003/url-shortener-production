const API_BASE = "http://localhost:3001/api/v1";

export { API_BASE };

export function getToken(): string | null {
  return localStorage.getItem("snipdev_auth_token");
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem("snipdev_auth_token", token);
  else localStorage.removeItem("snipdev_auth_token");
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    const message = data?.message || data?.error?.message || "Request failed";
    throw new Error(message);
  }

  return data;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
