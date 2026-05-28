const KEY = 'pp.adminToken';

export function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string): void {
  try {
    sessionStorage.setItem(KEY, token);
  } catch {
    /* sessionStorage unavailable (e.g. SSR) — token simply not persisted */
  }
}

export function clearAdminToken(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
