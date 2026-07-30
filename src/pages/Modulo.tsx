import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Topbar } from '../components/Topbar';
import { ProgressBar } from '../components/ProgressBar';
import { useAssistant } from '../context/AssistantContext';
import { useAuth } from '../context/AuthContext';
import { getCatalog, getMe, getPublishedLesson, getPublishedManual, getPublishedVersions, saveProgress, type CatalogModule, type LessonManualDoc, type PublishedVersion } from '../lib/api';
import { openManualWindow } from '../lib/manualPrint';
import { QuizPanel } from '../components/QuizPanel';
import { BellIcon, CertIcon, SparkIcon } from '../icons';
import { getModuleContent, toModuleContent } from '../data/modules';
import { lessonsOf, type ContentBlock, type ModuleContent, type ReviewQ } from '../data/moduleTypes';

import './Modulo.css';

type Tab = 'leccion' | 'docs' | 'notas' | 'evaluacion';

/** Formatea segundos como "2:10" (m:ss) o "1h 05min". */
function fmtDur(s: number): string {
  if (!isFinite(s) || s <= 0) return '';
  const t = Math.round(s);
  if (t >= 3600) return `${Math.floor(t / 3600)}h ${String(Math.floor((t % 3600) / 60)).padStart(2, '0')}min`;
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

function ContentBlockView({ block }: { block: ContentBlock }) {
  if (block.type === 'h') return <h4>{block.text}</h4>;
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

function ReviewQuestions({ items }: { items: ReviewQ[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [open, setOpen] = useState<Set<number>>(new Set());
  return (
    <div style={{ marginTop: 28, maxWidth: 880 }}>
      <h4 style={{ fontFamily: "'Sora'", fontSize: 15, fontWeight: 700, color: 'var(--brand-700, #4338ca)', margin: '0 0 12px', paddingBottom: 6, borderBottom: '1px solid var(--line)' }}>
        Preguntas de repaso
      </h4>
      <div style={{ display: 'grid', gap: 12 }}>
        {items.map((q, i) => {
          const opts = q.options ?? [];
          const hasOptions = opts.length >= 2;
          const chosen = answers[i];
          const answered = chosen !== undefined;
          const correctIdx = q.correctIndex ?? 0;
          return (
            <div key={i} className="card" style={{ padding: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: hasOptions ? 10 : 8 }}>{i + 1}. {q.question}</div>
              {hasOptions ? (
                <>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {opts.map((opt, oi) => {
                      const isCorrect = oi === correctIdx;
                      let border = 'var(--line)';
                      let bg = 'transparent';
                      let mark = '';
                      if (answered) {
                        if (isCorrect) { border = 'var(--ok-600)'; bg = 'var(--ok-50, #ecfdf5)'; mark = ''; }
                        else if (oi === chosen) { border = 'var(--danger-600)'; bg = 'var(--danger-50, #fef2f2)'; mark = ''; }
                      }
                      return (
                        <button
                          key={oi}
                          type="button"
                          disabled={answered}
                          onClick={() => setAnswers((prev) => ({ ...prev, [i]: oi }))}
                          className="row"
                          style={{ gap: 10, alignItems: 'flex-start', textAlign: 'left', padding: '9px 12px', border: `1px solid ${border}`, background: bg, borderRadius: 10, cursor: answered ? 'default' : 'pointer', font: 'inherit', fontSize: 14 }}
                        >
                          <span style={{ width: 14, fontWeight: 800, color: mark === '' ? 'var(--ok-600)' : 'var(--danger-600)' }}>{mark}</span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                  {answered && (
                    <div className="tiny" style={{ marginTop: 8, fontWeight: 600, color: chosen === correctIdx ? 'var(--ok-600)' : 'var(--danger-600)' }}>
                      {chosen === correctIdx ? '¡Correcto! ' : 'Incorrecto. '}
                      <span style={{ color: 'var(--ink-600, #4b5563)', fontWeight: 400 }}>{q.explanation || q.answer || ''}</span>
                    </div>
                  )}
                </>
              ) : open.has(i) ? (
                <div className="tiny" style={{ marginTop: 8, color: 'var(--ok-600)', fontWeight: 600 }}>{q.answer}</div>
              ) : (
                <button className="btn sm" style={{ marginTop: 8 }} onClick={() => setOpen((prev) => new Set(prev).add(i))}>Ver respuesta</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Modulo() {
  const { open, setContext, setDetail, setModuleId } = useAssistant();
  const { user, applyUser, isAdmin } = useAuth();
  const { hash } = useLocation();
  const { moduleId: moduleIdParam } = useParams();
  const moduleId = Number(moduleIdParam);
  const hardcoded = getModuleContent(moduleId);
  const ORIGINAL = '__original__';
  // Nombre del módulo desde el catálogo (fijo; no cambia con la versión).
  const [catalogEntry, setCatalogEntry] = useState<CatalogModule | null>(null);
  useEffect(() => {
    getCatalog()
      .then((cat) => setCatalogEntry(cat.find((m) => m.id === moduleId) ?? null))
      .catch(() => {});
  }, [moduleId]);
  const moduleName = catalogEntry
    ? `${catalogEntry.code} · ${catalogEntry.title.toUpperCase()}`
    : undefined;
  // Manual de usuario del módulo (versión publicada), si existe y el alumno tiene acceso.
  const [manual, setManual] = useState<LessonManualDoc | null>(null);
  useEffect(() => {
    setManual(null);
    getPublishedManual(moduleId).then(setManual).catch(() => {});
  }, [moduleId]);
  // Versiones publicadas del módulo + contenido resuelto de la versión elegida.
  const [versions, setVersions] = useState<PublishedVersion[]>([]);
  const [versionsLoaded, setVersionsLoaded] = useState(false);
  const [selectedKey, setSelectedKey] = useState('');
  const [module, setModule] = useState<ModuleContent | undefined>(hardcoded);
  const [contentLoading, setContentLoading] = useState(false);

  // Opciones del selector: "Original" (contenido curado, si existe) + versiones publicadas.
  const versionOptions = useMemo(
    () => [
      ...(hardcoded ? [{ key: ORIGINAL, label: 'Original' }] : []),
      ...versions.map((v) => ({ key: v.id, label: `Versión ${v.version}` })),
    ],
    [hardcoded, versions],
  );

  // 1) Cargar las versiones publicadas y elegir la selección por defecto (la más reciente).
  useEffect(() => {
    let cancelled = false;
    setVersionsLoaded(false);
    getPublishedVersions(moduleId)
      .then((vs) => {
        if (cancelled) return;
        setVersions(vs);
        setSelectedKey(vs.length ? vs[0].id : hardcoded ? ORIGINAL : '');
        setVersionsLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setVersions([]);
        setSelectedKey(hardcoded ? ORIGINAL : '');
        setVersionsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [moduleId, hardcoded]);

  // 2) Resolver el contenido de la versión seleccionada.
  useEffect(() => {
    if (!versionsLoaded) return;
    let cancelled = false;
    if (selectedKey === ORIGINAL || selectedKey === '') {
      setModule(selectedKey === ORIGINAL ? hardcoded : undefined);
      return;
    }
    setContentLoading(true);
    getPublishedLesson(selectedKey)
      .then((dto) => {
        if (!cancelled) setModule(toModuleContent(dto));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setContentLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [versionsLoaded, selectedKey, hardcoded]);

  const remoteLoading = !versionsLoaded || contentLoading;

  const blocks = module?.blocks ?? [];
  const lessons = useMemo(() => (module ? lessonsOf(module) : []), [module]);
  const total = lessons.length;

  const [tab, setTab] = useState<Tab>(hash === '#docs' ? 'docs' : 'leccion');
  const [videoError, setVideoError] = useState(false);
  const [videoDuration, setVideoDuration] = useState<string | null>(null);
  const [activeId, setActiveId] = useState(() => lessons[0]?.id ?? '');
  const [completed, setCompleted] = useState<Set<string>>(
    () => new Set(user?.progress?.[String(moduleId)] ?? []),
  );

  useEffect(() => {
    if (hash === '#docs') setTab('docs');
  }, [hash]);

  // Al cargar el módulo (posiblemente async desde el backend), fija la primera lección.
  useEffect(() => {
    if (lessons.length && !lessons.some((l) => l.id === activeId)) {
      setActiveId(lessons[0].id);
    }
  }, [lessons, activeId]);

  const activeIndex = lessons.findIndex((l) => l.id === activeId);
  const active = lessons[activeIndex];
  const activeBlock = blocks.find((b) => b.lessons.some((l) => l.id === activeId));
  const progress = useMemo(
    () => (total ? Math.round((completed.size / total) * 100) : 0),
    [completed, total],
  );
  // La evaluación solo se habilita cuando se han visto todas las lecciones (el admin la ve siempre).
  const allLessonsDone = isAdmin || (total > 0 && completed.size >= total);

  // Bloqueo secuencial: se desbloquea hasta la primera lección no completada (frontera).
  // El admin ve todo desbloqueado.
  const firstIncomplete = useMemo(
    () => lessons.findIndex((l) => !completed.has(l.id)),
    [lessons, completed],
  );
  const isUnlocked = (index: number) => isAdmin || firstIncomplete === -1 || index <= firstIncomplete;

  useEffect(() => {
    if (!module || !active) return;
    setModuleId(module.id);
    setContext(`${module.title} — Lección ${active.code}`);

    const onScreen = active.content
      ? active.content
          .map((b) => (b.type === 'p' || b.type === 'h' ? b.text : b.items.map((i) => `• ${i}`).join('\n')))
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
            <h1 style={{ fontSize: 24, marginBottom: 10 }}>
              {remoteLoading ? 'Cargando módulo…' : 'Contenido en preparación'}
            </h1>
            <p className="muted" style={{ margin: '0 0 20px' }}>
              {remoteLoading
                ? 'Buscando las lecciones publicadas de este módulo.'
                : 'Este módulo todavía no tiene lecciones cargadas en la plataforma.'}
            </p>
            {!remoteLoading && <Link className="btn pri" to="/proyecto/biowel">← Volver al producto</Link>}
          </section>
        </div>
      </>
    );
  }

  const poster = module.cover ?? '/modules/asistencial.png';
  const docs = module.docs ?? [];

  const navTo = (id: string) => {
    setActiveId(id);
    setVideoError(false);
    setVideoDuration(null);
    setTab('leccion');
  };
  const goTo = (id: string) => {
    const idx = lessons.findIndex((l) => l.id === id);
    if (idx < 0 || !isUnlocked(idx)) return; // no navegar a lecciones bloqueadas (clic en temario)
    navTo(id);
  };
  const goPrev = () => {
    if (activeIndex > 0) navTo(lessons[activeIndex - 1].id);
  };
  const markViewed = () => {
    if (completed.has(activeId)) return;
    const next = new Set(completed).add(activeId);
    setCompleted(next);
    void saveProgress(moduleId, [...next]).then(applyUser).catch(() => {});
  };
  const completeAndNext = () => {
    markViewed();
    if (activeIndex < total - 1) {
      navTo(lessons[activeIndex + 1].id); // avanza sin bloqueo (recién completada la actual)
    } else {
      // Última lección completada → se presenta la evaluación del módulo.
      setTab('evaluacion');
    }
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
      <div className="content" style={{ maxWidth: 1600 }}>
        <div className="grid module-grid" style={{ gridTemplateColumns: 'minmax(0,1fr) 360px', alignItems: 'start', gap: 30 }}>
          <div style={{ minWidth: 0 }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div className="tiny" style={{ color: 'var(--brand-600)', fontWeight: 700 }}>
                {moduleName ?? module.code}
              </div>
              {versionOptions.length > 1 && (
                <label className="row" style={{ gap: 8, alignItems: 'center' }}>
                  <span className="tiny muted" style={{ fontWeight: 700 }}>Versión</span>
                  <select
                    value={selectedKey}
                    onChange={(e) => setSelectedKey(e.target.value)}
                    style={{ padding: '6px 10px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }}
                  >
                    {versionOptions.map((o) => (
                      <option key={o.key} value={o.key}>{o.label}</option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            <h1 style={{ fontSize: 26, marginBottom: 10 }}>Lección {active.code} · {active.title}</h1>
            <div className="row" style={{ gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
              {(active.video ? videoDuration ?? active.duration : active.duration) && (
                <span className="chip">{active.video ? videoDuration ?? active.duration : active.duration}</span>
              )}
              <span className="chip brand">{active.video ? 'Video' : 'Lectura'}</span>
            </div>

            {active.video && (
              <div className="player">
                {!videoError ? (
                  <video
                    key={active.id}
                    className="vid"
                    src={active.video}
                    poster={poster}
                    controls
                    controlsList="nodownload"
                    onEnded={markViewed}
                    onLoadedMetadata={(e) => setVideoDuration(fmtDur(e.currentTarget.duration))}
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
                )}
              </div>
            )}

            <div className="tabs2">
              {(['leccion', 'docs', 'evaluacion', 'notas'] as Tab[]).map((t) => {
                const locked = t === 'evaluacion' && !allLessonsDone;
                return (
                  <button
                    key={t}
                    className={tab === t ? 'on' : ''}
                    disabled={locked}
                    title={locked ? 'Completa todas las lecciones para presentar la evaluación' : undefined}
                    onClick={() => { if (!locked) setTab(t); }}
                    style={locked ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                  >
                    {t === 'leccion' && 'Lección'}
                    {t === 'docs' && (
                      <>
                        Documentación{' '}
                        <span className="chip brand" style={{ marginLeft: 4, padding: '0 7px' }}>{docs.length}</span>
                      </>
                    )}
                    {t === 'evaluacion' && 'Evaluación'}
                    {t === 'notas' && 'Mis notas'}
                  </button>
                );
              })}
            </div>

            {tab === 'evaluacion' && (
              <div className="tab-pane on">
                {allLessonsDone ? (
                  <QuizPanel moduleId={moduleId} onCertified={() => { void getMe().then(applyUser).catch(() => {}); }} />
                ) : (
                  <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 17, marginBottom: 6 }}>Evaluación bloqueada</h3>
                    <p className="tiny muted" style={{ margin: 0 }}>
                      Completa todas las lecciones del módulo ({completed.size} / {total}) para presentar la evaluación.
                    </p>
                  </div>
                )}
              </div>
            )}

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
                      <span style={{ color: 'var(--ok-600)' }}></span>
                      <span className="tiny">{t}</span>
                    </div>
                  ))}
                </div>

                {active.content && active.content.length > 0 && (
                  <article className="lesson-body" style={{ maxWidth: 880, marginTop: 28 }}>
                    {active.content.map((b, i) => (
                      <ContentBlockView key={i} block={b} />
                    ))}
                  </article>
                )}

                {active.reviewQuestions && active.reviewQuestions.length > 0 && (
                  <ReviewQuestions key={active.id} items={active.reviewQuestions} />
                )}

                <div className="row" style={{ gap: 12, marginTop: 26 }}>
                  <button className="btn" onClick={goPrev} disabled={activeIndex === 0}>◂ Lección anterior</button>
                  <button className="btn pri" onClick={completeAndNext}>
                    {activeIndex === total - 1 ? 'Marcar completada' : 'Marcar completada y seguir ▸'}
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
                {manual && (
                  <div
                    className="card"
                    style={{ padding: '14px 16px', marginBottom: 16, maxWidth: 680, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap',
                      background: 'linear-gradient(135deg,#eef4ff,#e6edfb)', border: '1px solid var(--brand-200, #cdddf7)' }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--brand-600)', color: '#fff', display: 'grid', placeItems: 'center', flex: 'none', fontWeight: 800 }}>
                      PDF
                    </div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-900)' }}>Manual de usuario</div>
                      <div className="tiny muted">Guía completa de este módulo · versión {manual.version}</div>
                    </div>
                    <button className="btn pri sm" onClick={() => openManualWindow(manual)}>Descargar PDF</button>
                  </div>
                )}
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
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-900)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.title}</div>
                            <div className="tiny muted">{d.sub}</div>
                          </div>
                          {d.href ? (
                            <>
                              <a className="chip" href={d.href} target="_blank" rel="noreferrer">{cta}</a>
                              <a className="btn sm" href={d.href} target="_blank" rel="noreferrer" title="Descargar / abrir"></a>
                            </>
                          ) : (
                            <span className="chip">{cta}</span>
                          )}
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
                      const locked = !isUnlocked(lessons.findIndex((x) => x.id === l.id));
                      const status = isActive ? 'now' : isDone ? 'done' : 'pending';
                      const marker = isDone ? '' : isActive ? '▸' : l.code;
                      return (
                        <button
                          type="button"
                          className={`lessrow${isActive ? ' now' : ''}`}
                          key={l.id}
                          onClick={() => goTo(l.id)}
                          disabled={locked}
                          title={locked ? 'Completa la lección anterior para desbloquear' : undefined}
                          style={{ width: '100%', background: 'none', border: 0, textAlign: 'left', cursor: locked ? 'not-allowed' : 'pointer', font: 'inherit', opacity: locked ? 0.5 : 1 }}
                        >
                          <span className={`st${status === 'done' ? ' done' : status === 'now' ? ' now' : ''}`}>
                            {locked ? (
                              <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                                <rect x="5" y="11" width="14" height="9" rx="2" />
                                <path d="M8 11V8a4 4 0 018 0v3" />
                              </svg>
                            ) : marker}
                          </span>
                          <span className="nm">{l.title}</span>
                          <span className="dur">{l.duration}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </section>

            {(() => {
              const cert = user?.certifications?.[String(moduleId)];
              return (
                <section className="card" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div
                      style={{
                        width: 48, height: 48, borderRadius: 12, flex: 'none', display: 'grid', placeItems: 'center',
                        background: cert ? 'var(--ok-50, #ecfdf5)' : 'var(--gold-50)',
                        color: cert ? 'var(--ok-600)' : 'var(--gold)',
                      }}
                    >
                      <CertIcon width={24} height={24} strokeWidth={1.7} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-900)' }}>Certificado del módulo</div>
                      <div className="tiny muted">
                        {cert
                          ? `Certificado · ${cert.score}%`
                          : allLessonsDone
                            ? 'Se emite al aprobar la evaluación del módulo.'
                            : `Completa las lecciones (${completed.size} / ${total}) para habilitarla.`}
                      </div>
                    </div>
                  </div>
                  <button
                    className={`btn sm ${cert ? '' : 'pri'}`}
                    disabled={!allLessonsDone}
                    title={!allLessonsDone ? 'Completa todas las lecciones primero' : undefined}
                    style={{ width: '100%', justifyContent: 'center', marginTop: 12, ...(!allLessonsDone ? { opacity: 0.55, cursor: 'not-allowed' } : {}) }}
                    onClick={() => { if (allLessonsDone) setTab('evaluacion'); }}
                  >
                    {cert ? 'Repetir evaluación' : allLessonsDone ? 'Presentar evaluación' : 'Evaluación bloqueada'}
                  </button>
                </section>
              );
            })()}

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
