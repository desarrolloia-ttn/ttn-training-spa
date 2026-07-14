import { Link } from 'react-router-dom';
import { Topbar } from '../components/Topbar';
import { ProgressBar } from '../components/ProgressBar';
import { useAssistant } from '../context/AssistantContext';
import { useAssistantContext } from '../hooks/useAssistantContext';
import { CertIcon, PlayIcon, SparkIcon } from '../icons';

interface ProjectCard {
  to: string;
  cover: string;
  background: string;
  modulesLabel: string;
  title: string;
  desc: string;
  progress: number;
  done?: boolean;
  progressLabel: string;
}

const PROJECTS: ProjectCard[] = [
  {
    to: '/proyecto/biowel',
    cover: 'cv-blue',
    background: '/modules/administracion.png',
    modulesLabel: '4 flujos',
    title: 'ADMINISTRACIÓN',
    desc: 'Configuración institucional, parametrización y maestros.',
    progress: 100,
    done: true,
    progressLabel: 'Completado ✓',
  },
  {
    to: '/proyecto/biowel',
    cover: 'cv-rose',
    background: '/modules/asistencial.png',
    modulesLabel: '15 lecciones',
    title: 'ASISTENCIAL',
    desc: 'Agendamiento, admisión, atención (HCE) y ordenamiento clínico.',
    progress: 0,
    progressLabel: 'Sin empezar',
  },
  {
    to: '/proyecto/biowel',
    cover: 'cv-amber',
    background: '/modules/cuentas-medicas.png',
    modulesLabel: '3 flujos',
    title: 'CUENTAS MÉDICAS',
    desc: 'Facturación, conciliación y radicación de cuentas.',
    progress: 0,
    progressLabel: 'Sin empezar',
  },
  {
    to: '/proyecto/biowel',
    cover: 'cv-teal',
    background: '/modules/dispensacion.png',
    modulesLabel: '6 flujos',
    title: 'DISPENSACIÓN',
    desc: 'Gestión farmacéutica, dispensación y control de inventario clínico.',
    progress: 0,
    progressLabel: 'Bloqueado',
  },
];

export function Dashboard() {
  useAssistantContext('Dashboard general');
  const { open } = useAssistant();

  return (
    <>
      <Topbar crumb={<>Inicio · <b>Dashboard</b></>} />
      <div className="content">
        <section className="page-head" style={{ display: 'flex', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div className="chip brand" style={{ marginBottom: 12 }}>Lunes 3 de junio · Buenos días</div>
            <h1>Hola, Ana 👋</h1>
            <p>
              Vas muy bien este mes. Tienes <b style={{ color: 'var(--ink-800)' }}>2 módulos</b> por terminar y{' '}
              <b style={{ color: 'var(--ink-800)' }}>1 evaluación</b> esta semana.
            </p>
          </div>
          <div className="row" style={{ gap: 14 }}>
            <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="ring" style={{ ['--p' as string]: 72 } as React.CSSProperties}>
                <div className="v"><b>72%</b><small>global</small></div>
              </div>
              <div>
                <div className="tiny muted" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  Progreso total
                </div>
                <div style={{ fontFamily: "'Sora'", fontWeight: 800, fontSize: 20, color: 'var(--ink-900)', marginTop: 2 }}>
                  13 de 18 módulos
                </div>
                <div className="tiny muted">en 4 proyectos activos</div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 24 }}>
          {[
            { label: 'Cursando', chip: ['brand', 'Activo'], v: '3', sub: 'módulos en progreso' },
            { label: 'Certificados', chip: ['gold', 'Emitidos'], v: '5', sub: 'descargables en PDF' },
            { label: 'Horas', chip: ['ok', '+3.5h'], v: '28h', sub: 'de formación acumuladas' },
            { label: 'Vence pronto', chip: ['warn', '2 días'], v: '1', sub: 'evaluación pendiente' },
          ].map((k) => (
            <div className="card" style={{ padding: 18 }} key={k.label}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="tiny muted" style={{ fontWeight: 700 }}>{k.label}</span>
                <span className={`chip ${k.chip[0]}`}>{k.chip[1]}</span>
              </div>
              <div style={{ fontFamily: "'Sora'", fontWeight: 800, fontSize: 30, color: 'var(--ink-900)', marginTop: 8 }}>
                {k.v}
              </div>
              <div className="tiny muted">{k.sub}</div>
            </div>
          ))}
        </section>

        <div className="grid" style={{ gridTemplateColumns: '1.7fr 1fr', alignItems: 'start' }}>
          <div className="grid" style={{ gap: 24 }}>
            <section>
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontSize: 19 }}>Continúa donde quedaste</h2>
              </div>
              <Link className="card" to="/modulo" style={{ display: 'flex', overflow: 'hidden', gap: 0 }}>
                <div
                  style={{
                    width: 236,
                    flex: 'none',
                    position: 'relative',
                    backgroundImage: 'url(/modules/asistencial.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(135deg, rgba(46,107,240,.55), rgba(14,69,174,.55))',
                    }}
                  />
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,.95)',
                      display: 'grid',
                      placeItems: 'center',
                      position: 'relative',
                      zIndex: 1,
                      boxShadow: '0 8px 22px rgba(0,0,0,.25)',
                      color: 'var(--brand-600)',
                    }}
                  >
                    <PlayIcon width={24} height={24} />
                  </div>
                  <span
                    className="chip"
                    style={{
                      position: 'absolute',
                      bottom: 12,
                      left: 12,
                      zIndex: 1,
                      background: 'rgba(0,0,0,.45)',
                      color: '#fff',
                    }}
                  >
                    Lección 1 · 3:00
                  </span>
                </div>
                <div style={{ padding: '20px 22px', flex: 1 }}>
                  <div className="tiny" style={{ color: 'var(--brand-600)', fontWeight: 700, marginBottom: 6 }}>
                    PRODUCTO · BIOWEL
                  </div>
                  <h3 style={{ fontSize: 19, marginBottom: 6 }}>Módulo 2 · Asistencial</h3>
                  <p className="tiny muted" style={{ margin: '0 0 16px' }}>
                    Agendamiento, admisión, atención (HCE) y ordenamiento clínico.
                  </p>
                  <div className="row" style={{ justifyContent: 'space-between', marginBottom: 7 }}>
                    <span className="tiny muted" style={{ fontWeight: 700 }}>Progreso del módulo</span>
                    <span className="tiny" style={{ fontWeight: 700, color: 'var(--ink-800)' }}>0%</span>
                  </div>
                  <ProgressBar value={0} />
                  <div className="row" style={{ marginTop: 16, gap: 10 }}>
                    <span className="btn pri sm">Empezar módulo ▸</span>
                    <span className="chip">0 / 15 lecciones</span>
                  </div>
                </div>
              </Link>
            </section>

            <section>
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontSize: 19 }}>Tus proyectos activos</h2>
                <Link className="btn ghost sm" to="/proyectos">Ver todos →</Link>
              </div>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                {PROJECTS.map((p) => (
                  <Link className="card" to={p.to} style={{ overflow: 'hidden' }} key={p.title}>
                    <div
                      className={`cover ${p.cover}`}
                      style={{
                        height: 120,
                        position: 'relative',
                        backgroundImage: `url(${p.background})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                    <div style={{ padding: '16px 18px' }}>
                      <h3 style={{ fontSize: 16 }}>{p.title}</h3>
                      <p className="tiny muted" style={{ margin: '4px 0 14px' }}>{p.desc}</p>
                      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                        <span className={`tiny${p.done ? '' : ' muted'}`} style={{ fontWeight: 700, color: p.done ? 'var(--ok-600)' : undefined }}>
                          {p.progressLabel}
                        </span>
                        <span className="tiny" style={{ fontWeight: 700 }}>{p.progress}%</span>
                      </div>
                      <ProgressBar value={p.progress} ok={p.done} />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <div className="grid" style={{ gap: 20 }}>
            <section
              className="card"
              onClick={open}
              style={{
                padding: 20,
                background: 'linear-gradient(155deg,#0E2A63,#1457D6)',
                color: '#fff',
                border: 0,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div className="dotgrid" style={{ opacity: 0.18 }} />
              <div className="row" style={{ gap: 10, position: 'relative' }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255,255,255,.18)', display: 'grid', placeItems: 'center' }}>
                  <SparkIcon width={20} height={20} stroke="#fff" />
                </div>
                <h3 style={{ color: '#fff', fontSize: 16 }}>Asistente IA</h3>
              </div>
              <p style={{ margin: '12px 0 16px', fontSize: 13.5, color: 'rgba(255,255,255,.85)', position: 'relative' }}>
                “¿Quieres que te prepare un repaso de <b style={{ color: '#fff' }}>Prevención de eventos adversos</b> antes de tu evaluación?”
              </p>
              <span className="btn sm" style={{ background: '#fff', color: 'var(--brand-700)', border: 0, position: 'relative' }}>
                Pregúntale al asistente →
              </span>
            </section>

            <section className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 16, marginBottom: 14 }}>Próximas fechas</h3>
              <div className="grid" style={{ gap: 12 }}>
                {[
                  { d: '05', m: 'JUN', tone: 'danger', t: 'Evaluación · Eventos adversos', s: 'Seguridad del Paciente · vence en 2 días' },
                  { d: '12', m: 'JUN', tone: 'brand', t: 'Cierre módulo HCE', s: 'Historia Clínica Electrónica' },
                  { d: '20', m: 'JUN', tone: 'brand', t: 'Nuevo proyecto asignado', s: 'Atención Humanizada' },
                ].map((d, i, arr) => (
                  <div key={d.t}>
                    <div className="row" style={{ gap: 13 }}>
                      <div
                        style={{
                          width: 46,
                          flex: 'none',
                          textAlign: 'center',
                          background: `var(--${d.tone}-50)`,
                          borderRadius: 10,
                          padding: '7px 0',
                        }}
                      >
                        <div style={{ fontFamily: "'Sora'", fontWeight: 800, fontSize: 17, color: `var(--${d.tone}-600)` }}>
                          {d.d}
                        </div>
                        <div className="tiny" style={{ color: `var(--${d.tone}-600)`, fontWeight: 700 }}>{d.m}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-900)' }}>{d.t}</div>
                        <div className="tiny muted">{d.s}</div>
                      </div>
                    </div>
                    {i < arr.length - 1 && <div className="divider" style={{ margin: '2px 0' }} />}
                  </div>
                ))}
              </div>
            </section>

            <section className="card" style={{ padding: 20 }}>
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ fontSize: 16 }}>Últimos certificados</h3>
                <Link className="tiny" style={{ color: 'var(--brand-600)', fontWeight: 700 }} to="/certificados">Ver todos</Link>
              </div>
              <div className="grid" style={{ gap: 10 }}>
                {[
                  { t: 'Inducción Clínica', s: 'Proyecto completo · 02 jun' },
                  { t: 'Módulo · Higiene de manos', s: 'Seguridad del Paciente · 28 may' },
                ].map((c) => (
                  <Link
                    className="row"
                    to="/certificados"
                    key={c.t}
                    style={{ gap: 12, padding: 10, border: '1px solid var(--line)', borderRadius: 12 }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: 'var(--gold-50)',
                        display: 'grid',
                        placeItems: 'center',
                        flex: 'none',
                        color: 'var(--gold)',
                      }}
                    >
                      <CertIcon width={19} height={19} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink-900)' }}>{c.t}</div>
                      <div className="tiny muted">{c.s}</div>
                    </div>
                    <span className="chip gold">PDF</span>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
