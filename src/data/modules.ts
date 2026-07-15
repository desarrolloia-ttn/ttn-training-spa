// Registro de módulos con contenido disponible en el SPA.
import { ASISTENCIAL } from './asistencial';
import { DISPENSACION } from './dispensacion';
import type { ModuleContent } from './moduleTypes';

const REGISTRY: Record<number, ModuleContent> = {
  [ASISTENCIAL.id]: ASISTENCIAL,
  [DISPENSACION.id]: DISPENSACION,
};

export function getModuleContent(id: number): ModuleContent | undefined {
  return REGISTRY[id];
}
