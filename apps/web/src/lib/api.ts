export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

/** Passe par le proxy Next.js (port 3000) — évite localhost:3001 direct */
export const API_PROXY = "/api";

export async function checkApiAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${API_PROXY}/auth/me`, {
      credentials: "include",
      signal: AbortSignal.timeout(3000),
    });
    return res.ok || res.status === 401;
  } catch {
    return false;
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_PROXY}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(
      (err as { message?: string }).message ?? "Erreur API"
    );
  }
  return res.json();
}
