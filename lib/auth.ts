const TOKEN_KEY = "admin_token";
const USER_KEY = "admin_user";

export type StoredUser = {
  id: number;
  name: string;
  email: string;
  role: string;
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

export function isSuperadmin(): boolean {
  return getUser()?.role === "superadmin";
}

export function clearAuth(): void {
  removeToken();
  removeUser();
}
