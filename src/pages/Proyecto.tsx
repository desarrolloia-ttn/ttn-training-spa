import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Topbar } from '../components/Topbar';
import { ProgressBar } from '../components/ProgressBar';
import { ActivosFijosLogo, BiowelLogo } from '../components/ProductLogos';
import { useAssistantContext } from '../hooks/useAssistantContext';
import { assetUrl, listClients, type CatalogModule, type Client, type ModuleStatus } from '../lib/api';
import { moduleStyle, getProduct, type ProductSummary } from '../data/products';

const LockIcon = () => (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#fff" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 018 0v3" />
  </svg>
);

function statusChip(status: ModuleStatus): { className: string; label: string } {
  switch (status) {
    case 'done':
      return { className: 'chip ok', label: 'Completado' };
    case 'progress':
      return { className: 'chip warn', label: 'En progreso' };
    case 'idle':
      return { className: 'chip brand', label: 'Sin empezar' };
    case 'locked':
      return { className: 'chip', label: 'Bloqueado' };
  }
}

function ctaLabel(status: ModuleStatus): string {
  if (status === 'done') return 'Repasar →';
  if (status === 'progress') return 'Continuar →';
  if (status === 'idle') return 'Empezar →';
  return 'Bloqueado';
}

function moduleMeta(mod: CatalogModule): string {
  if (mod.lessonCount === 0) return 'Contenido en preparación';
  return `${mod.completed} / ${mod.lessonCount} lecciones`;
}

export function ModuleCard({ mod }: { mod: CatalogModule }) {
  const style = moduleStyle(mod.id);
  const cover = assetUrl(mod.cover);
  const isLocked = !mod.accessible;
  const isCurrent = mod.accessible && mod.status === 'progress';
  const chip = statusChip(mod.status);

  const cardStyle: React.CSSProperties = {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    ...(isCurrent
      ? { border: '2px solid var(--brand-300)', boxShadow: '0 12px 28px rgba(20,87,214,.14)' }
      : {}),
    ...(isLocked ? { opacity: 0.78 } : {}),
  };

  const body = (
    <>
      <div
        className={`cover ${style.cover}`}
        style={{
          height: 140,
          position: 'relative',
          backgroundImage: `url(${cover ?? style.background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {isLocked && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(12,27,51,.45)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(255,255,255,.18)',
                border: '1px solid rgba(255,255,255,.4)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <LockIcon />
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="tiny" style={{ color: isCurrent ? 'var(--brand-600)' : 'var(--ink-400)', fontWeight: 700, letterSpacing: '.04em' }}>
            {mod.code}
          </div>
          <span className={chip.className}>{chip.label}</span>
        </div>
        <h3 style={{ fontSize: 18, margin: 0 }}>{mod.title}</h3>
        <p className="tiny muted" style={{ margin: 0 }}>{mod.description}</p>

        {!isLocked && (
          <div style={{ marginTop: 4 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="tiny muted" style={{ fontWeight: 700 }}>{moduleMeta(mod)}</span>
              <span className="tiny" style={{ fontWeight: 700, color: 'var(--ink-800)' }}>{mod.progress}%</span>
            </div>
            <ProgressBar value={mod.progress} ok={mod.status === 'done'} />
          </div>
        )}
        {isLocked && (
          <div className="tiny muted" style={{ marginTop: 4 }}>{moduleMeta(mod)}</div>
        )}

        <div className="divider" />
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <span
            className="tiny"
            style={{
              fontWeight: 700,
              color: isLocked ? 'var(--ink-400)' : 'var(--brand-600)',
            }}
          >
            {isLocked ? 'Bloqueado' : ctaLabel(mod.status)}
          </span>
        </div>
      </div>
    </>
  );

  if (isLocked) {
    return <div className="card" style={cardStyle}>{body}</div>;
  }

  return (
    <Link className="card" to={`/modulo/${mod.id}`} style={cardStyle}>
      {body}
    </Link>
  );
}

function ProductLogo({ slug, size }: { slug: string; size: number }) {
  return slug === 'activos-fijos'
    ? <ActivosFijosLogo width={size} height={size} />
    : <BiowelLogo width={size} height={size} />;
}

/** Estado vacío: producto sin clientes todavía. */
function EmptyProduct({ product }: { product: ProductSummary }) {
  return (
    <section
      className="card"
      style={{
        padding: '60px 40px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
        maxWidth: 640,
        margin: '40px auto',
      }}
    >
      <div style={{ width: 120, height: 120, borderRadius: 24, background: product.accentSoft, display: 'grid', placeItems: 'center' }}>
        <ProductLogo slug={product.slug} size={84} />
      </div>
      <span className="chip">Próximamente</span>
      <h1 style={{ fontSize: 28 }}>{product.name}</h1>
      <p className="muted" style={{ maxWidth: 460, margin: 0 }}>
        Aún no hay clientes para este producto. Créalos desde Administración · Clientes.
      </p>
      <Link to="/proyectos" className="btn pri">← Volver a productos</Link>
    </section>
  );
}

function ProductDetail({ product }: { product: ProductSummary }) {
  useAssistantContext(`Producto · ${product.name}`);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listClients(product.slug)
      .then(setClients)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [product.slug]);

  return (
    <>
      <Topbar
        crumb={<><Link to="/proyectos">Productos</Link> · <b>{product.name}</b></>}
        searchPlaceholder="Buscar en este producto…"
      />
      <div className="content">
        {loading ? (
          <div className="card" style={{ padding: 20 }}>Cargando clientes…</div>
        ) : clients.length === 0 ? (
          <EmptyProduct product={product} />
        ) : (
          <>
            <section className="card" style={{ overflow: 'hidden', marginBottom: 26, border: 0 }}>
              <div style={{ padding: '30px 32px', background: `linear-gradient(135deg, ${product.accent} 0%, #0E45AE 100%)`, color: '#fff', position: 'relative' }}>
                <div className="dotgrid" style={{ opacity: 0.22 }} />
                <div style={{ position: 'relative' }}>
                  <div className="row" style={{ gap: 14, marginBottom: 14, alignItems: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,.95)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                      <ProductLogo slug={product.slug} size={40} />
                    </div>
                  </div>
                  <h1 style={{ color: '#fff', fontSize: 30 }}>{product.name}</h1>
                  <p style={{ color: 'rgba(255,255,255,.9)', maxWidth: 560, margin: '10px 0 0' }}>
                    Elige la implementación (cliente) para ver sus módulos de capacitación.
                  </p>
                </div>
              </div>
            </section>

            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 20 }}>Clientes</h2>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
              {clients.map((c) => (
                <Link key={c.id} className="card" to={`/cliente/${c.id}`} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div
                    className="cover cv-blue"
                    style={{ height: 130, backgroundImage: `url(${assetUrl(c.cover) ?? '/modules/administracion.png'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  />
                  <div style={{ padding: '16px 18px' }}>
                    <h3 style={{ fontSize: 17, margin: 0 }}>{c.name}</h3>
                    <p className="tiny muted" style={{ margin: '4px 0 10px' }}>{c.description}</p>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <span className="tiny muted">{c.moduleCount} módulos</span>
                      <span className="tiny" style={{ color: 'var(--brand-600)', fontWeight: 700 }}>Entrar →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export function Proyecto() {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProduct(slug) : undefined;

  if (!product) return <Navigate to="/proyectos" replace />;
  return <ProductDetail product={product} />;
}
