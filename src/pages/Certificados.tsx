import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../components/Topbar';
import { ProgressBar } from '../components/ProgressBar';
import { useAssistantContext } from '../hooks/useAssistantContext';
import { useAuth } from '../context/AuthContext';
import { downloadCertificate, getCatalog, getMe, type CatalogModule, type UserPublic } from '../lib/api';
import { CertIcon } from '../icons';

import './Certificados.css';

/** ID verificable estable derivado de (usuario, módulo, fecha de emisión). */
function certId(userId: string, moduleId: number, passedAt: string): string {
  const s = `${userId}:${moduleId}:${passedAt}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const hex = h.toString(16).toUpperCase().padStart(8, '0');
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface ObtainedCert {
  module: CatalogModule;
  score: number;
  passedAt: string;
  id: string;
}

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 018 0v3" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

interface DiplomaData {
  name: string;
  moduleTitle: string;
  moduleCode: string;
  lessons: number;
  date: string;
  id: string;
  score: number;
}

function Diploma({ data, onClose }: { data: DiplomaData | null; onClose: () => void }) {
  const open = !!data;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!data) return null;

  return (
    <div
      className={`modal-ov${open ? ' open' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="diploma">
        <div className="dip-paper">
          <div className="dip-inner">
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                border: '3px solid var(--gold)',
                background: 'var(--gold-50)',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
                color: 'var(--gold)',
              }}
            >
              <CertIcon width={28} height={28} strokeWidth={1.6} />
            </div>
            <div style={{ fontFamily: "'Sora'", fontWeight: 800, letterSpacing: '.18em', fontSize: 12, color: 'var(--gold)' }}>
              CAPACITA+ · CERTIFICADO
            </div>
            <div className="tiny muted" style={{ margin: '14px 0 4px' }}>Se certifica que</div>
            <div style={{ fontFamily: "'Sora'", fontWeight: 800, fontSize: 30, color: 'var(--ink-900)' }}>
              {data.name}
            </div>
            <div className="tiny muted" style={{ margin: '14px 0 2px' }}>completó y aprobó satisfactoriamente el módulo</div>
            <div style={{ fontFamily: "'Sora'", fontWeight: 700, fontSize: 21, color: 'var(--brand-600)', marginBottom: 6 }}>
              {data.moduleTitle}
            </div>
            <div className="tiny muted">
              {data.moduleCode} · {data.lessons} {data.lessons === 1 ? 'lección' : 'lecciones'} · calificación <b style={{ color: 'var(--ink-700)' }}>{data.score}%</b>
            </div>

            <div className="row" style={{ justifyContent: 'space-between', gap: 30, marginTop: 34 }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ height: 1, background: 'var(--ink-300)', marginBottom: 8 }} />
                <div className="tiny muted">{data.date}</div>
                <div className="tiny" style={{ fontWeight: 700, color: 'var(--ink-700)' }}>Fecha de emisión</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ height: 1, background: 'var(--ink-300)', marginBottom: 8 }} />
                <div className="tiny muted" style={{ fontFamily: 'monospace' }}>{data.id}</div>
                <div className="tiny" style={{ fontWeight: 700, color: 'var(--ink-700)' }}>ID verificable</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row" style={{ justifyContent: 'center', gap: 10, padding: 16, borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
          <button className="btn pri" onClick={() => window.print()}>Descargar / Imprimir</button>
          <button className="btn ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export function Certificados() {
  useAssistantContext('Mis certificados');
  const { user } = useAuth();
  const [me, setMe] = useState<UserPublic | null>(user);
  const [modules, setModules] = useState<CatalogModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [diploma, setDiploma] = useState<DiplomaData | null>(null);
  const [dlBusy, setDlBusy] = useState<number | null>(null);
  const [dlError, setDlError] = useState('');

  const download = async (moduleId: number) => {
    setDlError('');
    setDlBusy(moduleId);
    try {
      await downloadCertificate(moduleId);
    } catch (e: unknown) {
      setDlError(e instanceof Error ? e.message : 'No se pudo descargar el certificado');
    } finally {
      setDlBusy(null);
    }
  };

  useEffect(() => {
    Promise.all([getMe(), getCatalog()])
      .then(([u, cat]) => {
        setMe(u);
        setModules(cat);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const certs = me?.certifications ?? {};

  // Módulos con certificado obtenido (aprobó la evaluación).
  const obtained = useMemo<ObtainedCert[]>(() => {
    if (!me) return [];
    return modules
      .filter((m) => certs[String(m.id)])
      .map((m) => {
        const c = certs[String(m.id)];
        return { module: m, score: c.score, passedAt: c.passedAt, id: certId(me.id, m.id, c.passedAt) };
      })
      .sort((a, b) => b.passedAt.localeCompare(a.passedAt));
  }, [me, modules, certs]);

  // Módulos con contenido aún sin certificar.
  const pending = useMemo(
    () => modules.filter((m) => !certs[String(m.id)] && (m.lessonCount > 0 || m.published)),
    [modules, certs],
  );

  const openDiploma = (c: ObtainedCert) => {
    setDiploma({
      name: me?.name ?? '',
      moduleTitle: c.module.title,
      moduleCode: c.module.code,
      lessons: c.module.lessonCount,
      date: fmtDate(c.passedAt),
      id: c.id,
      score: c.score,
    });
  };

  return (
    <>
      <Topbar crumb={<>Logros · <b>Certificados</b></>} searchPlaceholder="Buscar certificados…" />
      <div className="content">
        <section className="page-head" style={{ display: 'flex', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <h1>Mis certificados</h1>
            <p>Cada módulo aprobado emite su propio certificado. Aprueba la evaluación de un módulo (mín. 80%) para obtenerlo.</p>
          </div>
          <div className="row" style={{ gap: 10 }}>
            <div className="card" style={{ padding: '12px 18px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Sora'", fontWeight: 800, fontSize: 22, color: 'var(--gold)' }}>{obtained.length}</div>
              <div className="tiny muted">obtenidos</div>
            </div>
            <div className="card" style={{ padding: '12px 18px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Sora'", fontWeight: 800, fontSize: 22, color: 'var(--ink-300)' }}>{pending.length}</div>
              <div className="tiny muted">por obtener</div>
            </div>
          </div>
        </section>

        {dlError && (
          <div className="card" style={{ padding: 14, marginBottom: 16, color: 'var(--danger-600)' }}>{dlError}</div>
        )}

        {loading ? (
          <div className="card" style={{ padding: 20 }}>Cargando certificados…</div>
        ) : obtained.length === 0 && pending.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--gold-50)', color: 'var(--gold)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
              <CertIcon width={28} height={28} strokeWidth={1.6} />
            </div>
            <h3 style={{ fontSize: 17 }}>Aún no tienes certificados</h3>
            <p className="tiny muted" style={{ margin: '6px 0 0' }}>
              Cuando el administrador publique módulos con evaluación, aparecerán aquí para que los obtengas.
            </p>
          </div>
        ) : (
          <>
            {obtained.length > 0 && (
              <>
                <h2 style={{ fontSize: 19, marginBottom: 16 }}>Certificados obtenidos</h2>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 28 }}>
                  {obtained.map((c) => (
                    <div className="card cert-card" key={c.module.id}>
                      <div className="cert-top">
                        <div className="seal"><CheckIcon /></div>
                        <div className="cert-mini">
                          <div className="tiny" style={{ color: 'var(--gold)', fontWeight: 800, letterSpacing: '.08em' }}>CERTIFICADO</div>
                          <div className="ln" style={{ width: '60%', margin: '8px auto' }} />
                          <div style={{ fontFamily: "'Sora'", fontWeight: 700, fontSize: 13, color: 'var(--ink-900)', margin: '8px 0 4px' }}>
                            {c.score}% aprobado
                          </div>
                          <div className="ln" style={{ width: '40%' }} />
                        </div>
                      </div>
                      <div style={{ padding: '16px 18px' }}>
                        <div className="tiny" style={{ color: 'var(--brand-600)', fontWeight: 700 }}>{c.module.code}</div>
                        <h3 style={{ fontSize: 15, margin: '4px 0 3px' }}>{c.module.title}</h3>
                        <div className="tiny muted" style={{ marginBottom: 14 }}>Emitido {fmtDate(c.passedAt)} · ID {c.id}</div>
                        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                          <button className="btn sm pri" onClick={() => openDiploma(c)}>Ver diploma</button>
                          {c.module.hasCertificate && (
                            <button className="btn sm" disabled={dlBusy === c.module.id} onClick={() => download(c.module.id)}>
                              {dlBusy === c.module.id ? 'Descargando…' : 'Descargar certificado'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {pending.length > 0 && (
              <>
                <h2 style={{ fontSize: 19, marginBottom: 16 }}>Por obtener</h2>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
                  {pending.map((m) => {
                    const accessible = m.accessible;
                    return (
                      <div className="card cert-card locked" key={m.id}>
                        <div className="cert-top">
                          <div className="seal" style={{ borderColor: 'var(--ink-300)', color: 'var(--ink-400)' }}>
                            <LockIcon />
                          </div>
                          <div className="cert-mini" style={{ opacity: 0.6 }}>
                            <div className="tiny" style={{ color: 'var(--ink-400)', fontWeight: 800, letterSpacing: '.08em' }}>PENDIENTE</div>
                            <div className="ln" style={{ width: '60%', margin: '8px auto' }} />
                            <div style={{ fontFamily: "'Sora'", fontWeight: 700, fontSize: 13, color: 'var(--ink-500)', margin: '8px 0 4px' }}>
                              {accessible ? `${m.progress}% del módulo` : 'Bloqueado'}
                            </div>
                            <div className="ln" style={{ width: '40%' }} />
                          </div>
                        </div>
                        <div style={{ padding: '16px 18px' }}>
                          <div className="tiny" style={{ color: 'var(--ink-400)', fontWeight: 700 }}>{m.code}</div>
                          <h3 style={{ fontSize: 15, margin: '4px 0 8px', color: 'var(--ink-700)' }}>{m.title}</h3>
                          <ProgressBar value={accessible ? m.progress : 0} style={{ marginBottom: 7 }} />
                          <div className="tiny muted" style={{ marginBottom: 14 }}>
                            {accessible
                              ? 'Completa el módulo y aprueba su evaluación para emitirlo.'
                              : 'Pídele acceso a este módulo a tu administrador.'}
                          </div>
                          {accessible ? (
                            <Link className="btn sm pri" to={`/modulo/${m.id}`} style={{ width: '100%', justifyContent: 'center' }}>
                              Ir al módulo ▸
                            </Link>
                          ) : (
                            <button className="btn sm" style={{ width: '100%', justifyContent: 'center' }} disabled>Bloqueado</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <Diploma data={diploma} onClose={() => setDiploma(null)} />
    </>
  );
}
