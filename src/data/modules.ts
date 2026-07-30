// Registro de módulos con contenido disponible en el SPA.
import { ASISTENCIAL } from './asistencial';
import { DISPENSACION } from './dispensacion';
import type { ContentBlock, ModuleContent, ModuleDoc } from './moduleTypes';
import { assetUrl, mediaUrl, type LessonContent, type ModuleContentDto } from '../lib/api';

const REGISTRY: Record<number, ModuleContent> = {
  [ASISTENCIAL.id]: ASISTENCIAL,
  [DISPENSACION.id]: DISPENSACION,
};

export function getModuleContent(id: number): ModuleContent | undefined {
  return REGISTRY[id];
}

/** Construye el cuerpo enriquecido de una lección (concepto→lógica→procedimiento→ejemplo→errores). */
function lessonToContent(l: LessonContent): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  if (l.intro?.trim()) blocks.push({ type: 'p', text: l.intro });

  if (l.concepts?.length) {
    blocks.push({ type: 'h', text: 'Conceptos clave' });
    blocks.push({ type: 'ul', items: l.concepts.map((c) => `${c.term}: ${c.definition}`) });
  }

  if (l.functional) {
    const f = l.functional;
    const rows = [
      f.what && `Qué hace: ${f.what}`,
      f.why && `Por qué existe: ${f.why}`,
      f.when && `Cuándo se usa: ${f.when}`,
      f.who && `Quién lo usa: ${f.who}`,
      f.impact && `Impacto: ${f.impact}`,
    ].filter(Boolean) as string[];
    if (rows.length) {
      blocks.push({ type: 'h', text: 'Explicación funcional' });
      blocks.push({ type: 'ul', items: rows });
    }
  }

  if (l.sections.length) {
    blocks.push({ type: 'h', text: 'Procedimiento paso a paso' });
    for (const s of l.sections) {
      if (s.heading) blocks.push({ type: 'p', text: s.heading });
      if (s.steps.length) blocks.push({ type: 'ol', items: s.steps });
    }
  }

  if (l.recommendations?.length) {
    blocks.push({ type: 'h', text: 'Recomendaciones' });
    blocks.push({ type: 'ul', items: l.recommendations });
  }

  if (l.commonErrors?.length) {
    blocks.push({ type: 'h', text: 'Errores comunes' });
    blocks.push({ type: 'ul', items: l.commonErrors });
  }

  if (l.errorConsequences?.trim()) {
    blocks.push({ type: 'h', text: 'Consecuencias de un error' });
    blocks.push({ type: 'p', text: l.errorConsequences });
  }

  if (l.caseStudy && (l.caseStudy.scenario?.trim() || l.caseStudy.task?.trim())) {
    blocks.push({ type: 'h', text: 'Caso práctico' });
    if (l.caseStudy.scenario?.trim()) blocks.push({ type: 'p', text: l.caseStudy.scenario });
    if (l.caseStudy.task?.trim()) blocks.push({ type: 'p', text: `Tu tarea: ${l.caseStudy.task}` });
  }

  if (l.keyPoints.length) {
    blocks.push({ type: 'h', text: 'Puntos clave' });
    blocks.push({ type: 'ul', items: l.keyPoints });
  }

  // Las preguntas de repaso NO van en el artículo estático: se renderizan interactivas.
  return blocks;
}

/** Adapta un módulo publicado del backend al formato de contenido del SPA. */
export function toModuleContent(dto: ModuleContentDto): ModuleContent {
  const docs: ModuleDoc[] = (dto.docs ?? []).map((d) => ({
    kind: d.kind,
    title: d.title,
    sub: d.sub,
    href: d.assetId ? mediaUrl(d.assetId) : undefined,
  }));
  return {
    id: dto.moduleId,
    code: `MÓDULO ${dto.moduleId} · ${dto.title.toUpperCase()}`,
    title: dto.title,
    docs,
    blocks: dto.blocks.map((b) => ({
      title: b.title,
      lessons: b.lessons.map((l) => ({
        id: l.id,
        code: l.code,
        title: l.title,
        duration: l.duration,
        summary: l.summary,
        objectives: l.objectives,
        video: l.video ? assetUrl(l.video) ?? undefined : undefined,
        content: lessonToContent(l),
        reviewQuestions: l.reviewQuestions ?? [],
      })),
    })),
  };
}
