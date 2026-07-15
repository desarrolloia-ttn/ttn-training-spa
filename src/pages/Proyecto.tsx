import { Link, Navigate, useParams } from 'react-router-dom';
import { Topbar } from '../components/Topbar';
import { ProgressBar } from '../components/ProgressBar';
import { ActivosFijosLogo, BiowelLogo } from '../components/ProductLogos';
import { useAssistantContext } from '../hooks/useAssistantContext';
import { useAuth } from '../context/AuthContext';
import { BIOWEL_MODULES, type BiowelModule, getProduct } from '../data/products';
import { CertIcon } from '../icons';

const LockIcon = () => (
  <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#fff" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 018 0v3" />
  </svg>
);

function statusChip(status: BiowelModule['status']): { className: string; label: string } {
  switch (status) {
    case 'done':
      return { className: 'chip ok', label: 'Completado ✓' };
    case 'progress':
      return { className: 'chip warn', label: 'En progreso' };
    case 'idle':
      return { className: 'chip brand', label: 'Sin empezar' };
    case 'locked':
      return { className: 'chip', label: 'Bloqueado' };
  }
}

function ctaLabel(status: BiowelModule['status']): string {
  if (status === 'done') return 'Repasar →';
  if (status === 'progress') return 'Continuar →';
  if (status === 'idle') return 'Empezar →';
  return 'Bloqueado';
}

function ModuleCard({ mod, accessible }: { mod: BiowelModule; accessible: boolean }) {
  const isLocked = !accessible;
  const isCurrent = accessible && mod.status === 'progress';
  const chip = isLocked ? { className: 'chip', label: 'Bloqueado' } : statusChip(mod.status);

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
        className={`cover ${mod.cover}`}
        style={{
          height: 140,
          position: 'relative',
          backgroundImage: `url(${mod.background})`,
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
              <span className="tiny muted" style={{ fontWeight: 700 }}>{mod.meta}</span>
              <span className="tiny" style={{ fontWeight: 700, color: 'var(--ink-800)' }}>{mod.progress}%</span>
            </div>
            <ProgressBar value={mod.progress} ok={mod.status === 'done'} />
          </div>
        )}
        {isLocked && (
          <div className="tiny muted" style={{ marginTop: 4 }}>{mod.meta}</div>
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

function BiowelDetail() {
  useAssistantContext('Producto · Biowel');
  const { canAccess, user } = useAuth();

  // Progreso real del módulo 2 (Asistencial) desde el progreso guardado del usuario.
  const asistDone = user?.progress?.['2']?.length ?? 0;
  const asistTotal = 15;
  const asistPct = Math.round((asistDone / asistTotal) * 100);

  const completed = BIOWEL_MODULES.filter((m) => m.status === 'done').length;
  const total = BIOWEL_MODULES.length;
  const pct = Math.round((completed / total) * 100);

  return (
    <>
      <Topbar
        crumb={<><Link to="/proyectos">Productos</Link> · <b>Biowel</b></>}
        searchPlaceholder="Buscar en este producto…"
      />
      <div className="content">
        <section className="card" style={{ overflow: 'hidden', marginBottom: 26, border: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <div
              style={{
                flex: 1,
                minWidth: 300,
                padding: '30px 32px',
                background: 'linear-gradient(135deg,#1492E6 0%,#0E45AE 100%)',
                color: '#fff',
                position: 'relative',
              }}
            >
              <div className="dotgrid" style={{ opacity: 0.22 }} />
              <div style={{ position: 'relative' }}>
                <div className="row" style={{ gap: 14, marginBottom: 14, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background: 'rgba(255,255,255,.95)',
                      display: 'grid',
                      placeItems: 'center',
                      flex: 'none',
                    }}
                  >
                    <BiowelLogo width={40} height={40} />
                  </div>
                  <div className="row" style={{ gap: 8 }}>
                    <span className="chip" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>Clínico</span>
                    <span className="chip" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>Obligatorio</span>
                  </div>
                </div>
                <h1 style={{ color: '#fff', fontSize: 30, maxWidth: 540 }}>Biowel</h1>
                <p style={{ color: 'rgba(255,255,255,.9)', maxWidth: 560, margin: '10px 0 22px' }}>
                  Software clínico-administrativo. Domina administración, asistencial, cuentas médicas y dispensación.
                </p>
                <div className="row wrap" style={{ gap: 22 }}>
                  {[
                    [String(total), 'módulos'],
                    ['28', 'lecciones'],
                    ['9H', 'duración'],
                    [String(total), 'certificados'],
                  ].map(([v, l]) => (
                    <div key={l}>
                      <div style={{ fontFamily: "'Sora'", fontWeight: 800, fontSize: 22 }}>{v}</div>
                      <div className="tiny" style={{ color: 'rgba(255,255,255,.8)' }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div
              style={{
                width: 300,
                flex: 'none',
                padding: '28px 30px',
                background: 'var(--card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                gap: 6,
              }}
            >
              <div className="ring" style={{ ['--p' as string]: pct, ['--sz' as string]: '120px' } as React.CSSProperties}>
                <div className="v"><b style={{ fontSize: 28 }}>{pct}%</b><small>completado</small></div>
              </div>
              <div className="tiny muted" style={{ marginTop: 8 }}>{completed} de {total} módulos finalizados</div>
              {canAccess(2) ? (
                <Link className="btn pri lg" to="/modulo/2" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>
                  Empezar módulo 2 ▸
                </Link>
              ) : (
                <button className="btn lg" disabled style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>
                  🔒 Módulo 2 bloqueado
                </button>
              )}
              <span className="tiny muted">Última actividad: hoy</span>
            </div>
          </div>
        </section>

        <div className="grid" style={{ gridTemplateColumns: '1.7fr 1fr', alignItems: 'start', gap: 26 }}>
          <div>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 20 }}>Módulos del producto</h2>
              <span className="chip">Ruta secuencial</span>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
              {BIOWEL_MODULES.map((m) => {
                const mod =
                  m.id === 2
                    ? {
                        ...m,
                        progress: asistPct,
                        status: asistPct === 100 ? 'done' : asistDone > 0 ? 'progress' : 'idle',
                        meta: `${asistDone} / ${asistTotal} lecciones`,
                      } as BiowelModule
                    : m;
                return <ModuleCard mod={mod} accessible={canAccess(m.id)} key={m.id} />;
              })}
            </div>
          </div>

          <div className="grid" style={{ gap: 20 }}>
            <section className="card" style={{ padding: 22, textAlign: 'center' }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 14,
                  background: 'var(--gold-50)',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 12px',
                  color: 'var(--gold)',
                }}
              >
                <CertIcon width={26} height={26} strokeWidth={1.7} />
              </div>
              <h3 style={{ fontSize: 16 }}>Certificado del producto</h3>
              <p className="tiny muted" style={{ margin: '7px 0 14px' }}>
                Obtén los {total} certificados de módulo para desbloquear el certificado completo de <b>Biowel</b>.
              </p>
              <ProgressBar value={pct} style={{ marginBottom: 8 }} />
              <div className="tiny muted" style={{ marginBottom: 14 }}>{completed} de {total} certificados de módulo</div>
              <button className="btn" style={{ width: '100%', justifyContent: 'center' }} disabled>Bloqueado · {pct}%</button>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

function ActivosFijosDetail() {
  useAssistantContext('Producto · Activos Fijos (próximamente)');

  return (
    <>
      <Topbar
        crumb={<><Link to="/proyectos">Productos</Link> · <b>Activos Fijos</b></>}
        searchPlaceholder="Buscar…"
      />
      <div className="content">
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
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 24,
              background: '#EAEEF7',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <ActivosFijosLogo width={84} height={84} />
          </div>
          <span className="chip">Próximamente</span>
          <h1 style={{ fontSize: 28 }}>Activos Fijos</h1>
          <p className="muted" style={{ maxWidth: 460, margin: 0 }}>
            Estamos preparando los módulos de capacitación para el software de control de activos fijos. Te avisaremos
            cuando estén disponibles.
          </p>
          <Link to="/proyectos" className="btn pri">← Volver a productos</Link>
        </section>
      </div>
    </>
  );
}

export function Proyecto() {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProduct(slug) : undefined;

  if (!product) return <Navigate to="/proyectos" replace />;
  if (product.slug === 'biowel') return <BiowelDetail />;
  return <ActivosFijosDetail />;
}
