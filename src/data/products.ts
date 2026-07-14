export type ProductSlug = 'biowel' | 'activos-fijos';

export type ModuleArt = 'admin' | 'medical' | 'invoice' | 'pill';

export interface BiowelModule {
  id: number;
  code: string;
  title: string;
  description: string;
  status: 'done' | 'progress' | 'idle' | 'locked';
  progress: number;
  meta: string;
  cover: 'cv-blue' | 'cv-rose' | 'cv-amber' | 'cv-teal' | 'cv-violet' | 'cv-green';
  art: ModuleArt;
  background: string;
}

export interface ProductSummary {
  slug: ProductSlug;
  name: string;
  tagline: string;
  description: string;
  status: 'active' | 'soon';
  moduleCount: number;
  progress: number;
  progressLabel: string;
  accent: string;
  accentSoft: string;
}

export const PRODUCTS: ProductSummary[] = [
  {
    slug: 'biowel',
    name: 'Biowel',
    tagline: 'Software clínico-administrativo',
    description: 'Gestiona la operación clínica, asistencial y de cuentas médicas en una sola plataforma.',
    status: 'active',
    moduleCount: 4,
    progress: 55,
    progressLabel: '2 / 4 módulos',
    accent: '#1492E6',
    accentSoft: '#E6F3FD',
  },
  {
    slug: 'activos-fijos',
    name: 'Activos Fijos',
    tagline: 'Software de control de activos',
    description: 'Control, inventario y trazabilidad de activos fijos de la organización.',
    status: 'soon',
    moduleCount: 0,
    progress: 0,
    progressLabel: 'Próximamente',
    accent: '#0E2A63',
    accentSoft: '#EAEEF7',
  },
];

export const BIOWEL_MODULES: BiowelModule[] = [
  {
    id: 1,
    code: 'MÓDULO 1',
    title: 'Administración',
    description: 'Configuración institucional, parametrización y maestros.',
    status: 'done',
    progress: 100,
    meta: 'Completado · 4 lecciones · 1h 20m',
    cover: 'cv-blue',
    art: 'admin',
    background: '/modules/administracion.png',
  },
  {
    id: 2,
    code: 'MÓDULO 2',
    title: 'Asistencial',
    description: 'Agendamiento de citas, admisión, atención al paciente (HCE) y ordenamiento clínico.',
    status: 'idle',
    progress: 0,
    meta: '0 / 15 lecciones · Nuevo',
    cover: 'cv-rose',
    art: 'medical',
    background: '/modules/asistencial.png',
  },
  {
    id: 3,
    code: 'MÓDULO 3',
    title: 'Cuentas Médicas',
    description: 'Facturación, conciliación y radicación de cuentas.',
    status: 'idle',
    progress: 0,
    meta: '0 / 8 lecciones · 2h 10m',
    cover: 'cv-amber',
    art: 'invoice',
    background: '/modules/cuentas-medicas.png',
  },
  {
    id: 4,
    code: 'MÓDULO 4',
    title: 'Dispensación',
    description: 'Gestión farmacéutica, dispensación y control de inventario clínico.',
    status: 'locked',
    progress: 0,
    meta: 'Se desbloquea al completar el módulo 3',
    cover: 'cv-teal',
    art: 'pill',
    background: '/modules/dispensacion.png',
  },
];

export function getProduct(slug: string): ProductSummary | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
