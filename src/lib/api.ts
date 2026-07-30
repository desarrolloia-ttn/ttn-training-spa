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
  /** Certificaciones por módulo: { "2": { score, passedAt } } */
  certifications?: Record<string, { score: number; passedAt: string }>;
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

// ---------- Lecciones generadas con IA (panel admin) ----------
export type AssetKind = 'document' | 'audio' | 'video';
export type AssetStatus = 'uploaded' | 'processing' | 'ready' | 'error';
export type LessonStatus = 'draft' | 'published';

export interface Asset {
  id: string;
  kind: AssetKind;
  filename: string;
  mime?: string | null;
  sizeBytes: number;
  status: AssetStatus;
  hasText: boolean;
  textPreview?: string | null;
  error?: string | null;
  createdAt: string;
}

export interface LessonSection {
  heading: string;
  steps: string[];
}

export interface Concept {
  term: string;
  definition: string;
}

export interface FunctionalExplanation {
  what: string;
  why: string;
  when: string;
  who: string;
  impact: string;
}

export interface CaseStudy {
  scenario: string;
  task: string;
}

export interface ReviewQuestion {
  question: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
  answer?: string;
}

export interface LessonContent {
  id: string;
  code: string;
  title: string;
  duration: string;
  summary: string;
  objectives: string[];
  video?: string | null;
  intro?: string;
  concepts?: Concept[];
  functional?: FunctionalExplanation | null;
  sections: LessonSection[];
  recommendations?: string[];
  commonErrors?: string[];
  errorConsequences?: string;
  caseStudy?: CaseStudy | null;
  keyPoints: string[];
  reviewQuestions?: ReviewQuestion[];
}

export interface ModuleBlock {
  id: string;
  title: string;
  lessons: LessonContent[];
}

export interface ModuleDocDto {
  kind: 'PDF' | 'DOC' | 'LINK';
  title: string;
  sub: string;
  assetId?: string | null;
}

export interface ModuleContentDto {
  product: string;
  moduleId: number;
  code: string;
  title: string;
  description: string;
  source?: string | null;
  scope?: string | null;
  prerequisites: string[];
  docs?: ModuleDocDto[];
  blocks: ModuleBlock[];
}

export interface GeneratedModuleSummary {
  id: string;
  product: string;
  moduleId: number | null;
  clientId?: number | null;
  clientName?: string | null;
  code: string;
  title: string;
  version: string;
  status: LessonStatus;
  blockCount: number;
  lessonCount: number;
  updatedAt: string;
}

export interface GeneratedModule {
  id: string;
  product: string;
  moduleId: number | null;
  code: string;
  title: string;
  description: string;
  version: string;
  status: LessonStatus;
  content: ModuleContentDto;
  reviewNotes?: string | null;
  sourceAssetIds: string[];
  hasQuiz?: boolean;
  quizCount?: number;
  hasCertificate?: boolean;
  hasManual?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------- Manual de usuario (estructurado, se exporta a PDF en el navegador) ----------
export interface ManualStep {
  titulo: string;
  explicacion: string;
  resultado: string;
  advertencias: string[];
  insuficiente: boolean;
}
export interface ManualSection {
  titulo: string;
  pasos: ManualStep[];
}
export interface ManualFaq {
  pregunta: string;
  respuesta: string;
}
export interface GenManualDoc {
  titulo: string;
  subtitulo: string;
  objetivo: string;
  alcance: string;
  requisitos: string[];
  procedimiento: ManualSection[];
  buenas_practicas: string[];
  errores_frecuentes: string[];
  recomendaciones: string[];
  glosario: Concept[];
  faq: ManualFaq[];
  resumen: string;
}
export interface LessonManualDoc {
  moduleId: number | null;
  code: string;
  title: string;
  version: string;
  date: string;
  doc: GenManualDoc;
}

// ---------- Evaluación / certificación ----------
export interface QuizQuestionPublic {
  question: string;
  options: string[];
}

export interface QuizPublic {
  moduleId: number;
  passingScore: number;
  questions: QuizQuestionPublic[];
}

export interface QuizResultItem {
  correctIndex: number;
  yourIndex: number;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizResult {
  moduleId: number;
  total: number;
  correct: number;
  score: number;
  passingScore: number;
  passed: boolean;
  certified: boolean;
  results: QuizResultItem[];
}

/** Admin: genera (o regenera) la evaluación de una versión de lección. */
export async function generateQuiz(uid: string): Promise<GeneratedModule> {
  const res = await fetch(`${LESSONS_BASE}/${uid}/quiz`, { method: 'POST', headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as GeneratedModule;
}

/** Admin: genera (o regenera) el manual de usuario estructurado de una versión. */
export async function generateManual(uid: string): Promise<GeneratedModule> {
  const res = await fetch(`${LESSONS_BASE}/${uid}/manual`, { method: 'POST', headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as GeneratedModule;
}

/** Admin: obtiene el manual estructurado de una versión (para renderizar / exportar a PDF). */
export async function getLessonManual(uid: string): Promise<LessonManualDoc> {
  const res = await fetch(`${LESSONS_BASE}/${uid}/manual`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as LessonManualDoc;
}

/** Admin: elimina el manual generado de una versión. */
export async function deleteLessonManual(uid: string): Promise<GeneratedModule> {
  const res = await fetch(`${LESSONS_BASE}/${uid}/manual`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as GeneratedModule;
}

/** Alumno: manual de la versión publicada más reciente del módulo (si existe y tiene acceso). */
export async function getPublishedManual(moduleId: number): Promise<LessonManualDoc | null> {
  const res = await fetch(`${API_URL}/api/published/modules/${moduleId}/manual`, { headers: authHeaders() });
  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as LessonManualDoc;
}

/** Admin: sube el documento de certificado (PDF/imagen) de una versión de lección. */
export async function setLessonCertificate(uid: string, file: File): Promise<GeneratedModule> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${LESSONS_BASE}/${uid}/certificate`, { method: 'POST', headers: { ...authHeaders() }, body: fd });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as GeneratedModule;
}

/** Admin: quita el documento de certificado de una versión de lección. */
export async function deleteLessonCertificate(uid: string): Promise<GeneratedModule> {
  const res = await fetch(`${LESSONS_BASE}/${uid}/certificate`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as GeneratedModule;
}

/** Alumno: descarga el documento de certificado de un módulo (solo si lo aprobó). */
export async function downloadCertificate(moduleId: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/published/modules/${moduleId}/certificate`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  const blob = await res.blob();
  const cd = res.headers.get('Content-Disposition');
  const m = cd ? /filename="?([^";]+)"?/.exec(cd) : null;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = m ? m[1] : `certificado-modulo-${moduleId}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Alumno: evaluación del módulo (sin respuestas); null si no hay. */
export async function getPublishedQuiz(moduleId: number): Promise<QuizPublic | null> {
  const res = await fetch(`${API_URL}/api/published/modules/${moduleId}/quiz`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as QuizPublic;
}

/** Alumno: envía respuestas y obtiene resultado + certificación. */
export async function submitQuiz(moduleId: number, answers: number[]): Promise<QuizResult> {
  const res = await fetch(`${API_URL}/api/published/modules/${moduleId}/quiz/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as QuizResult;
}

export interface GenerateParams {
  assetIds: string[];
  product?: string;
  clientId?: number | null;
  moduleId?: number | null;
  version?: string;
  title?: string | null;
  instructions?: string | null;
  runReview?: boolean;
}

/** Versión publicada de un módulo, para el selector del alumno. */
export interface PublishedVersion {
  id: string;
  version: string;
  title: string;
  lessonCount: number;
  updatedAt: string;
}

export type ModuleStatus = 'done' | 'progress' | 'idle' | 'locked';

/** Módulo del catálogo con estado (acceso/progreso) calculado para el usuario. */
export interface CatalogModule {
  id: number;
  code: string;
  title: string;
  description: string;
  lessonCount: number;
  cover?: string | null;
  published: boolean;
  hasCertificate?: boolean;
  accessible: boolean;
  completed: number;
  progress: number;
  status: ModuleStatus;
}

/** Convierte una ruta relativa del backend en URL absoluta (p. ej. portadas). */
export function assetUrl(path: string | null | undefined): string | null {
  return path ? `${API_URL}${path}` : null;
}

/** Módulo del catálogo para administración. */
export interface CatalogModuleAdmin {
  id: number;
  code: string;
  title: string;
  description: string;
  hasCover: boolean;
}

export async function listCatalogAdmin(clientId?: number): Promise<CatalogModuleAdmin[]> {
  const q = clientId != null ? `?clientId=${clientId}` : '';
  const res = await fetch(`${API_URL}/api/admin/catalog${q}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as CatalogModuleAdmin[];
}

export async function createModule(
  clientId: number,
  title: string,
  description: string,
  image: File | null,
): Promise<CatalogModuleAdmin> {
  const fd = new FormData();
  fd.append('clientId', String(clientId));
  fd.append('title', title);
  fd.append('description', description);
  if (image) fd.append('image', image);
  const res = await fetch(`${API_URL}/api/admin/catalog`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: fd,
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as CatalogModuleAdmin;
}

export async function updateModule(
  id: number,
  patch: { title?: string; description?: string; code?: string },
): Promise<CatalogModuleAdmin> {
  const res = await fetch(`${API_URL}/api/admin/catalog/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as CatalogModuleAdmin;
}

export async function setModuleCover(id: number, image: File): Promise<CatalogModuleAdmin> {
  const fd = new FormData();
  fd.append('image', image);
  const res = await fetch(`${API_URL}/api/admin/catalog/${id}/cover`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: fd,
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as CatalogModuleAdmin;
}

export async function deleteModule(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/catalog/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

/** Catálogo de módulos con estado para el usuario. Filtra por cliente si se indica. */
export async function getCatalog(clientId?: number): Promise<CatalogModule[]> {
  const q = clientId != null ? `?clientId=${clientId}` : '';
  const res = await fetch(`${API_URL}/api/catalog${q}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as CatalogModule[];
}

// ---------- Clientes (facetas de un producto) ----------
export interface Client {
  id: number;
  product: string;
  name: string;
  description: string;
  cover?: string | null;
  moduleCount: number;
}

export async function listClients(product?: string): Promise<Client[]> {
  const q = product ? `?product=${encodeURIComponent(product)}` : '';
  const res = await fetch(`${API_URL}/api/clients${q}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as Client[];
}

export async function getClient(id: number): Promise<Client> {
  const res = await fetch(`${API_URL}/api/clients/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as Client;
}

export async function createClient(product: string, name: string, description: string, image: File | null): Promise<Client> {
  const fd = new FormData();
  fd.append('product', product);
  fd.append('name', name);
  fd.append('description', description);
  if (image) fd.append('image', image);
  const res = await fetch(`${API_URL}/api/admin/clients`, { method: 'POST', headers: { ...authHeaders() }, body: fd });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as Client;
}

export async function updateClient(id: number, patch: { name?: string; description?: string }): Promise<Client> {
  const res = await fetch(`${API_URL}/api/admin/clients/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as Client;
}

export async function setClientCover(id: number, image: File): Promise<Client> {
  const fd = new FormData();
  fd.append('image', image);
  const res = await fetch(`${API_URL}/api/admin/clients/${id}/cover`, { method: 'POST', headers: { ...authHeaders() }, body: fd });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as Client;
}

export async function deleteClientCover(id: number): Promise<Client> {
  const res = await fetch(`${API_URL}/api/admin/clients/${id}/cover`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as Client;
}

export async function deleteClient(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/clients/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
}

/** Módulo publicado (visible para el alumno) por moduleId del catálogo; null si no hay. */
export async function getPublishedModule(moduleId: number): Promise<ModuleContentDto | null> {
  const res = await fetch(`${API_URL}/api/published/modules/${moduleId}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as ModuleContentDto;
}

/** Versiones publicadas de un módulo (para el selector del alumno). */
export async function getPublishedVersions(moduleId: number): Promise<PublishedVersion[]> {
  const res = await fetch(`${API_URL}/api/published/modules/${moduleId}/versions`);
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as PublishedVersion[];
}

/** Contenido de una versión publicada concreta, por su id. */
export async function getPublishedLesson(uid: string): Promise<ModuleContentDto> {
  const res = await fetch(`${API_URL}/api/published/lessons/${uid}`);
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as ModuleContentDto;
}

const LESSONS_BASE = `${API_URL}/api/admin/lessons`;

/** URL pública para reproducir el video/voz de un insumo. */
export function mediaUrl(assetId: string): string {
  return `${API_URL}/api/media/${assetId}`;
}

/** Sube un insumo (documento/voz/video); el backend lo procesa y devuelve su estado. */
export async function uploadAsset(file: File): Promise<Asset> {
  const fd = new FormData();
  fd.append('file', file);
  // No fijar Content-Type: el navegador añade el boundary de multipart.
  const res = await fetch(`${LESSONS_BASE}/assets`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: fd,
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as Asset;
}

export async function listAssets(): Promise<Asset[]> {
  const res = await fetch(`${LESSONS_BASE}/assets`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as Asset[];
}

export async function deleteAsset(assetId: string): Promise<void> {
  const res = await fetch(`${LESSONS_BASE}/assets/${assetId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function generateLessons(params: GenerateParams): Promise<GeneratedModule> {
  const res = await fetch(`${LESSONS_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ runReview: true, product: 'biowel', ...params }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as GeneratedModule;
}

export async function listLessons(): Promise<GeneratedModuleSummary[]> {
  const res = await fetch(LESSONS_BASE, { headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as GeneratedModuleSummary[];
}

export async function getLesson(id: string): Promise<GeneratedModule> {
  const res = await fetch(`${LESSONS_BASE}/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as GeneratedModule;
}

export async function updateLesson(
  id: string,
  content: ModuleContentDto,
  version?: string,
): Promise<GeneratedModule> {
  const res = await fetch(`${LESSONS_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ content, version: version ?? null }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as GeneratedModule;
}

export async function publishLesson(id: string, publish: boolean): Promise<GeneratedModule> {
  const res = await fetch(`${LESSONS_BASE}/${id}/${publish ? 'publish' : 'unpublish'}`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as GeneratedModule;
}

export async function deleteLesson(id: string): Promise<void> {
  const res = await fetch(`${LESSONS_BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await parseError(res));
}
