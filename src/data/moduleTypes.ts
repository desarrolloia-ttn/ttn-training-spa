// Tipos compartidos para el contenido de los módulos de capacitación.

/** Bloque de contenido para lecciones de solo texto (sin video). */
export type ContentBlock =
  | { type: 'h'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] };

export interface ReviewQ {
  question: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
  answer?: string;
}

export interface Lesson {
  id: string;
  code: string;
  title: string;
  duration: string;
  summary: string;
  objectives: string[];
  /** Ruta del mp4 self-hosted (lecciones con video). */
  video?: string;
  /** Contenido de texto (lecciones de lectura, sin video). */
  content?: ContentBlock[];
  /** Preguntas de repaso interactivas (pregunta + respuesta a revelar). */
  reviewQuestions?: ReviewQ[];
}

export interface Block {
  title: string;
  lessons: Lesson[];
}

export interface ModuleDoc {
  kind: 'PDF' | 'DOC' | 'LINK';
  title: string;
  sub: string;
  /** URL de descarga/visualización del documento (si aplica). */
  href?: string;
}

export interface ModuleContent {
  id: number;
  code: string; // p. ej. "MÓDULO 4 · DISPENSACIÓN"
  title: string; // p. ej. "Dispensación"
  cover?: string; // ruta del poster/imagen del módulo
  docs?: ModuleDoc[];
  blocks: Block[];
}

/** Lista plana de todas las lecciones de un módulo. */
export function lessonsOf(m: ModuleContent): Lesson[] {
  return m.blocks.flatMap((b) => b.lessons);
}
