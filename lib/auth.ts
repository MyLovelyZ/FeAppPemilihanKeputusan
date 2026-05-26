const TOKEN_KEY = "admin_token";
const USER_KEY = "admin_user";

export type StoredUser = {
  id: number;
  name: string;
  email: string;
  role: unknown;
};

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const u = localStorage.getItem(USER_KEY);
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

export function setUser(user: StoredUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeUser(): void {
  localStorage.removeItem(USER_KEY);
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[\s_-]/g, "");
}

function roleMatchesSuperadmin(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    if (value === "1") return true;
    return normalize(value) === "superadmin";
  }
  if (Array.isArray(value)) return value.some(roleMatchesSuperadmin);
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return (
      roleMatchesSuperadmin(obj.name) ||
      roleMatchesSuperadmin(obj.role) ||
      roleMatchesSuperadmin(obj.slug) ||
      roleMatchesSuperadmin(obj.role_name)
    );
  }
  return false;
}

export function isSuperadmin(): boolean {
  const user = getUser();
  if (!user) return false;
  if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
    const w = window as unknown as { __roleDebugLogged?: boolean };
    if (!w.__roleDebugLogged) {
      console.log("[auth] stored user.role shape:", user.role);
      w.__roleDebugLogged = true;
    }
  }
  return roleMatchesSuperadmin(user.role);
}

export function clearAuth(): void {
  removeToken();
  removeUser();
}
