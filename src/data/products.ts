export type ProductSlug = 'biowel' | 'activos-fijos';

export type ModuleArt = 'admin' | 'medical' | 'invoice' | 'pill';

/** Estilo visual de una tarjeta de módulo (presentación, no contenido). */
export interface ModuleStyle {
  cover: 'cv-blue' | 'cv-rose' | 'cv-amber' | 'cv-teal' | 'cv-violet' | 'cv-green';
  art: ModuleArt;
  background: string;
}

const DEFAULT_MODULE_STYLE: ModuleStyle = {
  cover: 'cv-violet',
  art: 'admin',
  background: '/modules/administracion.png',
};

const MODULE_STYLE: Record<number, ModuleStyle> = {
  1: { cover: 'cv-blue', art: 'admin', background: '/modules/administracion.png' },
  2: { cover: 'cv-rose', art: 'medical', background: '/modules/asistencial.png' },
  3: { cover: 'cv-amber', art: 'invoice', background: '/modules/cuentas-medicas.png' },
  4: { cover: 'cv-teal', art: 'pill', background: '/modules/dispensacion.png' },
};

/** Estilo visual por id de módulo (con un estilo por defecto para ids nuevos). */
export function moduleStyle(id: number): ModuleStyle {
  return MODULE_STYLE[id] ?? DEFAULT_MODULE_STYLE;
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

export function getProduct(slug: string): ProductSummary | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
