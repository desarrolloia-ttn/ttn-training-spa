import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Topbar } from '../components/Topbar';
import { ProgressBar } from '../components/ProgressBar';
import { useAssistant } from '../context/AssistantContext';
import { useAuth } from '../context/AuthContext';
import { saveProgress } from '../lib/api';
import { BellIcon, CertIcon, SparkIcon } from '../icons';
import { getModuleContent } from '../data/modules';
import { lessonsOf, type ContentBlock } from '../data/moduleTypes';

import './Modulo.css';

type Tab = 'leccion' | 'docs' | 'notas';

function ContentBlockView({ block }: { block: ContentBlock }) {
  if (block.type === 'p') return <p>{block.text}</p>;
  if (block.type === 'ul') {
    return (
      <ul>
        {block.items.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    );
  }
  return (
    <ol>
      {block.items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ol>
  );
}

export function Modulo() {
  const { open, setContext, setDetail, setModuleId } = useAssistant();
  const { user, applyUser } = useAuth();
  const { hash } = useLocation();
  const { moduleId: moduleIdParam } = useParams();
  const moduleId = Number(moduleIdParam);
  const module = getModuleContent(moduleId);

  const blocks = module?.blocks ?? [];
  const lessons = useMemo(() => (module ? lessonsOf(module) : []), [module]);
  const total = lessons.length;

  const [tab, setTab] = useState<Tab>(hash === '#docs' ? 'docs' : 'leccion');
  const [videoError, setVideoError] = useState(false);
  const [activeId, setActiveId] = useState(() => lessons[0]?.id ?? '');
  const [completed, setCompleted] = useState<Set<string>>(
    () => new Set(user?.progress?.[String(moduleId)] ?? []),
  );

  useEffect(() => {
    if (hash === '#docs') setTab('docs');
  }, [hash]);

  const activeIndex = lessons.findIndex((l) => l.id === activeId);
  const active = lessons[activeIndex];
  const activeBlock = blocks.find((b) => b.lessons.some((l) => l.id === activeId));
  const progress = useMemo(
    () => (total ? Math.round((completed.size / total) * 100) : 0),
    [completed, total],
  );

  useEffect(() => {
    if (!module || !active) return;
    setModuleId(module.id);
    setContext(`${module.title} — Lección ${active.code}`);

    const onScreen = active.content
      ? active.content
          .map((b) => (b.type === 'p' ? b.text : b.items.map((i) => `• ${i}`).join('\n')))
          .join('\n')
      : active.video
        ? '(Lección en video sobre este flujo del software)'
        : '';

    setDetail(
      [
        `El alumno está en la plataforma de capacitación de Biowel, ${module.code}.`,
        activeBlock ? `Bloque actual: ${activeBlock.title}.` : '',
        `Lección actual: ${active.code} · ${active.title}.`,
        `Resumen de la lección: ${active.summary}`,
        `Objetivos:\n${active.objectives.map((o) => `- ${o}`).join('\n')}`,
        onScreen ? `Contenido en pantalla:\n${onScreen}` : '',
        'Responde con foco en esta lección; si preguntan algo general, relaciónalo con dónde está el alumno.',
      ]
        .filter(Boolean)
        .join('\n'),
    );
  }, [module, active, activeBlock, setContext, setDetail, setModuleId]);

  if (!module || !active) {
    return (
      <>
        <Topbar crumb={<><Link to="/proyecto/biowel">Biowel</Link> · <b>Módulo</b></>} />
        <div className="content">
          <section className="card" style={{ padding: '48px 32px', textAlign: 'center', maxWidth: 560, margin: '40px auto' }}>
            <h1 style={{ fontSize: 24, marginBottom: 10 }}>Contenido en preparación</h1>
            <p className="muted" style={{ margin: '0 0 20px' }}>
              Este módulo todavía no tiene lecciones cargadas en la plataforma.
            </p>
            <Link className="btn pri" to="/proyecto/biowel">← Volver al producto</Link>
          </section>
        </div>
      </>
    );
  }

  const poster = module.cover ?? '/modules/asistencial.png';
  const docs = module.docs ?? [];

  const goTo = (id: string) => {
    setActiveId(id);
    setVideoError(false);
    setTab('leccion');
  };
  const goPrev = () => {
    if (activeIndex > 0) goTo(lessons[activeIndex - 1].id);
  };
  const markViewed = () => {
    if (completed.has(activeId)) return;
    const next = new Set(completed).add(activeId);
    setCompleted(next);
    void saveProgress(moduleId, [...next]).then(applyUser).catch(() => {});
  };
  const completeAndNext = () => {
    markViewed();
    if (activeIndex < total - 1) goTo(lessons[activeIndex + 1].id);
  };

  return (
    <>
      <Topbar
        crumb={
          <>
            <Link to="/proyectos">Productos</Link> · <Link to="/proyecto/biowel">Biowel</Link> ·{' '}
            <b>Módulo {module.id}</b>
          </>
        }
        right={
          <div className="row" style={{ gap: 14 }}>
            <div className="row" style={{ gap: 10 }}>
              <span className="tiny muted" style={{ fontWeight: 700 }}>Progreso</span>
              <ProgressBar value={progress} style={{ width: 130 }} />
              <span className="tiny" style={{ fontWeight: 700, color: 'var(--ink-800)' }}>{progress}%</span>
            </div>
            <button className="icon-btn" aria-label="Notificaciones">
              <BellIcon />
            </button>
          </div>
        }
      />
      <div className="content">
        <div className="grid" style={{ gridTemplateColumns: '1.9fr 1fr', alignItems: 'start', gap: 26 }}>
          <div>
            <div className="tiny" style={{ color: 'var(--brand-600)', fontWeight: 700, marginBottom: 8 }}>
              {module.code}
            </div>
            <h1 style={{ fontSize: 24, marginBottom: 18 }}>Lección {active.code} · {active.title}</h1>

            <div className="player">
              {active.video ? (
                !videoError ? (
                  <video
                    key={active.id}
                    className="vid"
                    src={active.video}
                    poster={poster}
                    controls
                    controlsList="nodownload"
                    onEnded={markViewed}
                    onError={() => setVideoError(true)}
                  />
                ) : (
                  <>
                    <div className="deco" />
                    <div className="dotgrid" style={{ opacity: 0.2 }} />
                    <div className="ph">
                      <div className="play" aria-hidden>
                        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                      <div className="tiny" style={{ maxWidth: 320 }}>
                        Video en preparación · aún no se ha subido la grabación de esta lección.
                      </div>
                    </div>
                    <div className="ttl">
                      <div className="tiny" style={{ opacity: 0.8 }}>Pendiente de grabación</div>
                      <div style={{ fontFamily: "'Sora'", fontWeight: 700, fontSize: 17 }}>{active.title}</div>
                    </div>
                  </>
                )
              ) : (
                <>
                  <div className="deco" />
                  <div className="dotgrid" style={{ opacity: 0.2 }} />
                  <div className="stage-text">
                    <div className="stage-label">Instrucciones · {active.title}</div>
                    {active.content?.map((b, i) => (
                      <ContentBlockView key={i} block={b} />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="tabs2">
              {(['leccion', 'docs', 'notas'] as Tab[]).map((t) => (
                <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
                  {t === 'leccion' && 'Lección'}
                  {t === 'docs' && (
                    <>
                      Documentación{' '}
                      <span className="chip brand" style={{ marginLeft: 4, padding: '0 7px' }}>{docs.length}</span>
                    </>
                  )}
                  {t === 'notas' && 'Mis notas'}
                </button>
              ))}
            </div>

            {tab === 'leccion' && (
              <div className="tab-pane on">
                <h3 style={{ fontSize: 17, marginBottom: 10 }}>Sobre esta lección</h3>
                <p className="muted" style={{ maxWidth: 660 }}>{active.summary}</p>
                <h4 style={{ fontFamily: "'Sora'", fontSize: 14, margin: '20px 0 10px', color: 'var(--ink-900)' }}>
                  En esta lección verás
                </h4>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 10, maxWidth: 660 }}>
                  {active.objectives.map((t) => (
                    <div className="row" key={t} style={{ gap: 10 }}>
                      <span style={{ color: 'var(--ok-600)' }}>✓</span>
                      <span className="tiny">{t}</span>
                    </div>
                  ))}
                </div>
                <div className="row" style={{ gap: 12, marginTop: 26 }}>
                  <button className="btn" onClick={goPrev} disabled={activeIndex === 0}>◂ Lección anterior</button>
                  <button className="btn pri" onClick={completeAndNext}>
                    {activeIndex === total - 1 ? 'Marcar completada ✓' : 'Marcar completada y seguir ▸'}
                  </button>
                  <button className="btn ghost" onClick={open}>
                    <SparkIcon width={14} height={14} /> Preguntar a la IA
                  </button>
                </div>
              </div>
            )}

            {tab === 'docs' && (
              <div className="tab-pane on">
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <h3 style={{ fontSize: 17 }}>Documentación de apoyo del módulo</h3>
                    <p className="tiny muted" style={{ margin: '3px 0 0' }}>
                      Material complementario para reforzar y consultar durante la lección.
                    </p>
                  </div>
                  {docs.length > 0 && <button className="btn sm" onClick={open}>Resumir con IA</button>}
                </div>
                {docs.length === 0 ? (
                  <div className="tiny muted">La documentación de apoyo se agregará aquí.</div>
                ) : (
                  <div className="grid" style={{ gap: 11, maxWidth: 680 }}>
                    {docs.map((d) => {
                      const tone = d.kind === 'PDF' ? 'danger' : d.kind === 'DOC' ? 'brand' : 'warn';
                      const cta = d.kind === 'LINK' ? 'Visitar' : d.kind === 'DOC' ? 'Abrir' : 'Leer';
                      return (
                        <div className="docrow" key={d.title}>
                          <div className="ico" style={{ background: `var(--${tone}-50)`, color: `var(--${tone}-600)` }}>{d.kind}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-900)' }}>{d.title}</div>
                            <div className="tiny muted">{d.sub}</div>
                          </div>
                          <span className="chip">{cta}</span>
                          {d.kind !== 'LINK' && <button className="btn sm">⤓</button>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {tab === 'notas' && (
              <div className="tab-pane on">
                <div className="card" style={{ padding: 18, maxWidth: 680 }}>
                  <div className="tiny muted" style={{ marginBottom: 8 }}>
                    Tus notas se guardan automáticamente en este módulo.
                  </div>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    style={{
                      border: '1px dashed var(--line)',
                      borderRadius: 12,
                      padding: 16,
                      minHeight: 120,
                      color: 'var(--ink-400)',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  >
                    Escribe aquí tus apuntes de la lección…
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid" style={{ gap: 18 }}>
            <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--line)' }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: 15 }}>Contenido del módulo</h3>
                  <span className="chip">{completed.size} / {total}</span>
                </div>
                <ProgressBar value={progress} style={{ marginTop: 10 }} />
              </div>
              <div style={{ padding: '8px 8px 12px', maxHeight: 430, overflowY: 'auto' }}>
                {blocks.map((b) => (
                  <div key={b.title}>
                    <div className="modgrp">{b.title}</div>
                    {b.lessons.map((l) => {
                      const isActive = l.id === activeId;
                      const isDone = completed.has(l.id);
                      const status = isActive ? 'now' : isDone ? 'done' : 'pending';
                      const marker = isDone ? '✓' : isActive ? '▸' : l.code;
                      return (
                        <button
                          type="button"
                          className={`lessrow${isActive ? ' now' : ''}`}
                          key={l.id}
                          onClick={() => goTo(l.id)}
                          style={{ width: '100%', background: 'none', border: 0, textAlign: 'left', cursor: 'pointer', font: 'inherit' }}
                        >
                          <span className={`st${status === 'done' ? ' done' : status === 'now' ? ' now' : ''}`}>{marker}</span>
                          <span className="nm">{l.title}</span>
                          <span className="dur">{l.duration}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </section>

            <section className="card" style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'center' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'var(--gold-50)',
                  display: 'grid',
                  placeItems: 'center',
                  flex: 'none',
                  color: 'var(--gold)',
                }}
              >
                <CertIcon width={24} height={24} strokeWidth={1.7} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-900)' }}>Certificado del módulo</div>
                <div className="tiny muted">Se emite al completar las {total} lecciones y aprobar la evaluación.</div>
              </div>
            </section>

            <section
              className="card"
              onClick={open}
              style={{
                padding: 18,
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
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,.18)', display: 'grid', placeItems: 'center' }}>
                  <SparkIcon width={18} height={18} stroke="#fff" />
                </div>
                <div style={{ fontFamily: "'Sora'", fontWeight: 700, fontSize: 14.5 }}>Asistente del módulo</div>
              </div>
              <p style={{ margin: '10px 0 13px', fontSize: 12.5, color: 'rgba(255,255,255,.85)', position: 'relative' }}>
                Resuelvo dudas de esta lección, resumo la documentación y te preparo para la evaluación.
              </p>
              <span className="btn sm" style={{ background: '#fff', color: 'var(--brand-700)', border: 0, position: 'relative' }}>
                Abrir asistente →
              </span>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
