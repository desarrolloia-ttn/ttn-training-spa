// Cliente del backend ttn-training-core.

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');

const TOKEN_KEY = 'ttn_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { detail?: string };
    if (body?.detail) return body.detail;
  } catch {
    // sin cuerpo JSON
  }
  return `Error ${res.status}`;
}

// ---------- Tipos ----------
export type Role = 'admin' | 'usuario';

export interface UserPublic {
  id: string;
  username: string;
  name: string;
  role: Role;
  unlockedModules: number[];
  /** Lecciones completadas por módulo: { "2": ["obj", "acceso", ...] } */
  progress: Record<string, string[]>;
}

export interface ApiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResult {
  reply: string;
  model: string;
}

// ---------- Asistente ----------
export async function sendChat(
  message: string,
  context: string,
  history: ApiChatMessage[],
  moduleId?: number | null,
): Promise<ChatResult> {
  const res = await fetch(`${API_URL}/api/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context, history, moduleId: moduleId ?? null }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as ChatResult;
}

// ---------- Autenticación / usuarios ----------
interface LoginResult {
  token: string;
  user: UserPublic;
}

export async function login(username: string, password: string): Promise<UserPublic> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as LoginResult;
  setToken(data.token);
  return data.user;
}

export async function getMe(): Promise<UserPublic> {
  const res = await fetch(`${API_URL}/api/auth/me`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as UserPublic;
}

export async function listUsers(): Promise<UserPublic[]> {
  const res = await fetch(`${API_URL}/api/users`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as UserPublic[];
}

export async function setModuleAccess(
  userId: string,
  moduleId: number,
  unlocked: boolean,
): Promise<UserPublic> {
  const res = await fetch(`${API_URL}/api/users/${userId}/modules`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ moduleId, unlocked }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as UserPublic;
}

export interface NewUser {
  username: string;
  name: string;
  password: string;
  role: Role;
}

export async function createUser(u: NewUser): Promise<UserPublic> {
  const res = await fetch(`${API_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ ...u, unlockedModules: [] }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as UserPublic;
}

export interface UserPatch {
  name?: string;
  role?: Role;
  password?: string;
}

export async function updateUser(userId: string, patch: UserPatch): Promise<UserPublic> {
  const res = await fetch(`${API_URL}/api/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as UserPublic;
}

export async function deleteUser(userId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/users/${userId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

/** Guarda las lecciones completadas del usuario actual para un módulo. */
export async function saveProgress(moduleId: number, completed: string[]): Promise<UserPublic> {
  const res = await fetch(`${API_URL}/api/auth/me/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ moduleId, completed }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as UserPublic;
}
