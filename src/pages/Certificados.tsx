import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../components/Topbar';
import { ProgressBar } from '../components/ProgressBar';
import { useAssistantContext } from '../hooks/useAssistantContext';
import { CertIcon } from '../icons';

import './Certificados.css';

interface CertObtained {
  kind: 'obtained';
  trackUpper: string;
  miniTitle: string;
  upperLabel: string;
  title: string;
  meta: string;
}

interface CertLocked {
  kind: 'locked';
  miniTitle: string;
  upperLabel: string;
  title: string;
  progress: number;
  hint: string;
  to?: string;
}

type Cert = CertObtained | CertLocked;

const CERTS: Cert[] = [
  {
    kind: 'obtained',
    trackUpper: 'CERTIFICADO',
    miniTitle: 'Higiene de manos',
    upperLabel: 'SEGURIDAD DEL PACIENTE · M1',
    title: 'Cultura de seguridad e higiene',
    meta: 'Emitido 28 may · ID 8F3A-22K',
  },
  {
    kind: 'obtained',
    trackUpper: 'CERTIFICADO',
    miniTitle: 'Registro en HCE',
    upperLabel: 'HISTORIA CLÍNICA · M3',
    title: 'Buenas prácticas de registro',
    meta: 'Emitido 24 may · ID 1B7C-90X',
  },
  {
    kind: 'locked',
    miniTitle: 'Eventos adversos',
    upperLabel: 'SEGURIDAD DEL PACIENTE · M2',
    title: 'Prevención de eventos adversos',
    progress: 60,
    hint: 'Completa el módulo (60%) para emitirlo',
    to: '/modulo',
  },
  {
    kind: 'locked',
    miniTitle: 'Identificación',
    upperLabel: 'SEGURIDAD DEL PACIENTE · M3',
    title: 'Identificación correcta del paciente',
    progress: 0,
    hint: 'Se desbloquea al terminar el módulo 2',
  },
  {
    kind: 'obtained',
    trackUpper: 'CERTIFICADO',
    miniTitle: 'Consentimiento',
    upperLabel: 'HABEAS DATA · M1',
    title: 'Consentimiento informado',
    meta: 'Emitido 20 may · ID 5T2D-43Q',
  },
  {
    kind: 'obtained',
    trackUpper: 'CERTIFICADO',
    miniTitle: 'Firma digital',
    upperLabel: 'HISTORIA CLÍNICA · M2',
    title: 'Firma digital y trazabilidad',
    meta: 'Emitido 18 may · ID 9C4R-11M',
  },
];

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

interface DiplomaProps {
  open: boolean;
  onClose: () => void;
}

function Diploma({ open, onClose }: DiplomaProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

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
              Ana Martínez Rojas
            </div>
            <div className="tiny muted" style={{ margin: '14px 0 2px' }}>completó y aprobó satisfactoriamente el módulo</div>
            <div style={{ fontFamily: "'Sora'", fontWeight: 700, fontSize: 21, color: 'var(--brand-600)', marginBottom: 6 }}>
              Cultura de seguridad e higiene de manos
            </div>
            <div className="tiny muted">
              del proyecto <b style={{ color: 'var(--ink-700)' }}>Seguridad del Paciente</b> · 3 lecciones · 1h 10m
            </div>

            <div className="row" style={{ justifyContent: 'space-between', gap: 30, marginTop: 34 }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ height: 1, background: 'var(--ink-300)', marginBottom: 8 }} />
                <div className="tiny muted">28 de mayo, 2026</div>
                <div className="tiny" style={{ fontWeight: 700, color: 'var(--ink-700)' }}>Fecha de emisión</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Sora'", fontStyle: 'italic', color: 'var(--ink-700)', marginBottom: 4 }}>
                  Dr. R. Bernal
                </div>
                <div style={{ height: 1, background: 'var(--ink-300)', marginBottom: 8 }} />
                <div className="tiny" style={{ fontWeight: 700, color: 'var(--ink-700)' }}>Dirección de Calidad</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ height: 1, background: 'var(--ink-300)', marginBottom: 8 }} />
                <div className="tiny muted">8F3A-22K</div>
                <div className="tiny" style={{ fontWeight: 700, color: 'var(--ink-700)' }}>ID verificable</div>
              </div>
            </div>
          </div>
        </div>
        <div className="row" style={{ justifyContent: 'center', gap: 10, padding: 16, borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
          <button className="btn pri">⤓ Descargar PDF</button>
          <button className="btn">Compartir en LinkedIn</button>
          <button className="btn">🔗 Link verificable</button>
          <button className="btn ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export function Certificados() {
  useAssistantContext('Mis certificados');
  const [dipOpen, setDipOpen] = useState(false);

  return (
    <>
      <Topbar crumb={<>Logros · <b>Certificados</b></>} searchPlaceholder="Buscar certificados…" />
      <div className="content">
        <section className="page-head" style={{ display: 'flex', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <h1>Mis certificados</h1>
            <p>Cada módulo aprobado emite su propio certificado. Al completar todos los módulos obtienes el certificado del proyecto.</p>
          </div>
          <div className="row" style={{ gap: 10 }}>
            <div className="card" style={{ padding: '12px 18px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Sora'", fontWeight: 800, fontSize: 22, color: 'var(--gold)' }}>5</div>
              <div className="tiny muted">obtenidos</div>
            </div>
            <div className="card" style={{ padding: '12px 18px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Sora'", fontWeight: 800, fontSize: 22, color: 'var(--ink-300)' }}>7</div>
              <div className="tiny muted">por desbloquear</div>
            </div>
          </div>
        </section>

        <section className="card" style={{ display: 'flex', gap: 0, overflow: 'hidden', marginBottom: 26 }}>
          <div style={{ width: 8, background: 'linear-gradient(var(--gold),#A8761A)' }} />
          <div style={{ flex: 1, padding: '22px 26px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: 'var(--gold-50)',
                display: 'grid',
                placeItems: 'center',
                flex: 'none',
                color: 'var(--gold)',
              }}
            >
              <CertIcon width={28} height={28} strokeWidth={1.6} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="chip gold" style={{ marginBottom: 6 }}>Certificado de proyecto</div>
              <h3 style={{ fontSize: 18 }}>Inducción Clínica · Programa completo</h3>
              <div className="tiny muted">6 de 6 módulos · emitido el 02 jun 2026 · ID 4K9P-77A</div>
            </div>
            <div className="row" style={{ gap: 10 }}>
              <button className="btn" onClick={() => setDipOpen(true)}>Ver diploma</button>
              <button className="btn pri">⤓ Descargar PDF</button>
            </div>
          </div>
        </section>

        <h2 style={{ fontSize: 19, marginBottom: 16 }}>Certificados por módulo</h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {CERTS.map((c, idx) => {
            if (c.kind === 'obtained') {
              return (
                <div className="card cert-card" key={`${c.title}-${idx}`}>
                  <div className="cert-top">
                    <div className="seal"><CheckIcon /></div>
                    <div className="cert-mini">
                      <div className="tiny" style={{ color: 'var(--gold)', fontWeight: 800, letterSpacing: '.08em' }}>{c.trackUpper}</div>
                      <div className="ln" style={{ width: '60%', margin: '8px auto' }} />
                      <div style={{ fontFamily: "'Sora'", fontWeight: 700, fontSize: 13, color: 'var(--ink-900)', margin: '8px 0 4px' }}>
                        {c.miniTitle}
                      </div>
                      <div className="ln" style={{ width: '40%' }} />
                    </div>
                  </div>
                  <div style={{ padding: '16px 18px' }}>
                    <div className="tiny" style={{ color: 'var(--brand-600)', fontWeight: 700 }}>{c.upperLabel}</div>
                    <h3 style={{ fontSize: 15, margin: '4px 0 3px' }}>{c.title}</h3>
                    <div className="tiny muted" style={{ marginBottom: 14 }}>{c.meta}</div>
                    <div className="row" style={{ gap: 8 }}>
                      <button className="btn sm" onClick={() => setDipOpen(true)}>Ver</button>
                      <button className="btn sm pri">⤓ PDF</button>
                      <button className="btn sm ghost">Compartir</button>
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <div className="card cert-card locked" key={`${c.title}-${idx}`}>
                <div className="cert-top">
                  <div className="seal" style={{ borderColor: 'var(--ink-300)', color: 'var(--ink-400)' }}>
                    <LockIcon />
                  </div>
                  <div className="cert-mini" style={{ opacity: 0.6 }}>
                    <div className="tiny" style={{ color: 'var(--ink-400)', fontWeight: 800, letterSpacing: '.08em' }}>PENDIENTE</div>
                    <div className="ln" style={{ width: '60%', margin: '8px auto' }} />
                    <div style={{ fontFamily: "'Sora'", fontWeight: 700, fontSize: 13, color: 'var(--ink-500)', margin: '8px 0 4px' }}>
                      {c.miniTitle}
                    </div>
                    <div className="ln" style={{ width: '40%' }} />
                  </div>
                </div>
                <div style={{ padding: '16px 18px' }}>
                  <div className="tiny" style={{ color: 'var(--ink-400)', fontWeight: 700 }}>{c.upperLabel}</div>
                  <h3 style={{ fontSize: 15, margin: '4px 0 8px', color: 'var(--ink-700)' }}>{c.title}</h3>
                  <ProgressBar value={c.progress} style={{ marginBottom: 7 }} />
                  <div className="tiny muted" style={{ marginBottom: 14 }}>{c.hint}</div>
                  {c.to ? (
                    <Link className="btn sm pri" to={c.to} style={{ width: '100%', justifyContent: 'center' }}>
                      Continuar módulo ▸
                    </Link>
                  ) : (
                    <button className="btn sm" style={{ width: '100%', justifyContent: 'center' }} disabled>Bloqueado</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Diploma open={dipOpen} onClose={() => setDipOpen(false)} />
    </>
  );
}
