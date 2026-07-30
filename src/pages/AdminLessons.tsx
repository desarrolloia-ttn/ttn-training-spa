import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../components/Topbar';
import { openManualWindow } from '../lib/manualPrint';
import {
  deleteAsset,
  deleteLesson,
  deleteLessonCertificate,
  deleteLessonManual,
  generateLessons,
  generateManual,
  generateQuiz,
  getCatalog,
  getLessonManual,
  setLessonCertificate,
  getLesson,
  listAssets,
  listClients,
  listLessons,
  mediaUrl,
  publishLesson,
  updateLesson,
  uploadAsset,
  type Asset,
  type CatalogModule,
  type Client,
  type GeneratedModule,
  type GeneratedModuleSummary,
  type ModuleContentDto,
} from '../lib/api';

const fieldStyle: React.CSSProperties = {
  padding: '9px 11px',
  border: '1px solid var(--line)',
  borderRadius: 10,
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const KIND_META: Record<Asset['kind'], { icon: string; label: string }> = {
  document: { icon: '', label: 'Documento' },
  audio: { icon: '', label: 'Voz / narración' },
  video: { icon: '', label: 'Video' },
};

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminLessons() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lessons, setLessons] = useState<GeneratedModuleSummary[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<string>('');
  const [modules, setModules] = useState<CatalogModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Subida
  const [uploading, setUploading] = useState(false);

  // Formulario de generación
  const [title, setTitle] = useState('');
  const [moduleId, setModuleId] = useState<string>('');
  const [version, setVersion] = useState('1.0');
  const [instructions, setInstructions] = useState('');
  const [runReview, setRunReview] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genOk, setGenOk] = useState('');

  // Detalle / edición
  const [active, setActive] = useState<GeneratedModule | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listAssets(), listLessons(), listClients()])
      .then(([a, l, cs]) => {
        setAssets(a);
        setLessons(l);
        setClients(cs);
        if (cs.length) setClientId((prev) => prev || String(cs[0].id));
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setLoading(false));
  }, []);

  // Al elegir cliente, se cargan sus módulos y se resetea el módulo seleccionado.
  useEffect(() => {
    if (!clientId) return;
    setModuleId('');
    getCatalog(Number(clientId)).then(setModules).catch(() => {});
  }, [clientId]);

  const readySelected = useMemo(
    () => assets.filter((a) => selected.has(a.id) && a.status === 'ready' && a.hasText),
    [assets, selected],
  );

  const refreshLessons = async () => setLessons(await listLessons());

  const onFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setError('');
    setUploading(true);
    try {
      for (const f of files) {
        const asset = await uploadAsset(f);
        setAssets((prev) => [asset, ...prev]);
        setSelected((prev) => {
          const next = new Set(prev);
          if (asset.status === 'ready' && asset.hasText) next.add(asset.id);
          return next;
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo subir el insumo');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeAsset = async (a: Asset) => {
    if (!window.confirm(`¿Eliminar el insumo "${a.filename}"?`)) return;
    try {
      await deleteAsset(a.id);
      setAssets((prev) => prev.filter((x) => x.id !== a.id));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(a.id);
        return next;
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar');
    }
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const onGenerate = async () => {
    setError('');
    setGenOk('');
    setGenerating(true);
    try {
      const gen = await generateLessons({
        assetIds: readySelected.map((a) => a.id),
        title: title.trim() || null,
        clientId: clientId ? Number(clientId) : null,
        moduleId: moduleId ? Number(moduleId) : null,
        version: version.trim() || '1.0',
        instructions: instructions.trim() || null,
        runReview,
      });
      setActive(gen);
      setGenOk(`Se generó "${gen.title}" con ${gen.content.blocks.reduce((n, b) => n + b.lessons.length, 0)} lecciones. Revísala abajo antes de publicar.`);
      await refreshLessons();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo generar');
    } finally {
      setGenerating(false);
    }
  };

  const openLesson = async (id: string) => {
    setError('');
    try {
      setActive(await getLesson(id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo abrir la lección');
    }
  };

  const togglePublish = async (id: string, status: GeneratedModuleSummary['status']) => {
    setBusyId(id);
    try {
      const updated = await publishLesson(id, status !== 'published');
      await refreshLessons();
      if (active?.id === id) setActive(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar el estado');
    } finally {
      setBusyId(null);
    }
  };

  const removeLesson = async (l: GeneratedModuleSummary) => {
    if (!window.confirm(`¿Eliminar la lección "${l.title}"? Esta acción no se puede deshacer.`)) return;
    setBusyId(l.id);
    try {
      await deleteLesson(l.id);
      await refreshLessons();
      if (active?.id === l.id) setActive(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <Topbar crumb={<>Administración · <b>Lecciones</b></>} />
      <div className="content">
        <section className="page-head" style={{ marginBottom: 20 }}>
          <h1>Crear lecciones con IA</h1>
          <p>
            Sube los insumos (manual/PDF, voz o video), y el asistente analizará el material y
            redactará las lecciones. Revísalas y edítalas antes de publicarlas a los alumnos.
          </p>
        </section>

        {error && (
          <div className="card" style={{ padding: 14, marginBottom: 16, color: 'var(--danger-600)' }}>{error}</div>
        )}

        {/* Paso 1: insumos */}
        <section className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>1 · Sube los insumos</h3>
          <p className="tiny muted" style={{ margin: '0 0 14px' }}>
            PDF o texto para el contenido; audio de voz o video (se transcribe). El video además queda
            asociado como recurso reproducible.
          </p>
          <div className="row" style={{ gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".pdf,.txt,.md,audio/*,video/*"
              onChange={onFiles}
              disabled={uploading}
              style={{ fontSize: 14 }}
            />
            {uploading && <span className="tiny muted">Subiendo y procesando… (la transcripción puede tardar)</span>}
          </div>

          {assets.length > 0 && (
            <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
              {assets.map((a) => {
                const meta = KIND_META[a.kind];
                const on = selected.has(a.id);
                return (
                  <div
                    key={a.id}
                    className="row"
                    style={{
                      gap: 12,
                      alignItems: 'center',
                      padding: '10px 12px',
                      border: '1px solid var(--line)',
                      borderRadius: 10,
                      opacity: a.status === 'error' ? 0.7 : 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={a.status !== 'ready' || !a.hasText}
                      onChange={() => toggleSelect(a.id)}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                      title={a.status === 'ready' && a.hasText ? 'Usar para generar' : 'No disponible'}
                    />
                    <span style={{ fontSize: 20 }}>{meta.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: 'var(--ink-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.filename}
                      </div>
                      <div className="tiny muted">
                        {meta.label} · {humanSize(a.sizeBytes)}
                        {a.textPreview && a.status === 'ready' && <> · “{a.textPreview}”</>}
                        {a.status === 'error' && <span style={{ color: 'var(--danger-600)' }}> · {a.error}</span>}
                      </div>
                    </div>
                    <StatusChip status={a.status} hasText={a.hasText} />
                    <button className="btn sm" onClick={() => removeAsset(a)} style={{ color: 'var(--danger-600)' }}>
                      Eliminar
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Paso 2: generar */}
        <section className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>2 · Genera la lección</h3>
          <p className="tiny muted" style={{ margin: '0 0 14px' }}>
            Insumos seleccionados: <b>{readySelected.length}</b>. El agente analizará todo y redactará
            bloques y lecciones fieles al material.
          </p>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <label style={{ display: 'grid', gap: 5 }}>
              <span className="tiny" style={{ fontWeight: 700 }}>Cliente</span>
              <select style={fieldStyle} value={clientId} onChange={(e) => setClientId(e.target.value)}>
                {clients.length === 0 && <option value="">— No hay clientes —</option>}
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label style={{ display: 'grid', gap: 5 }}>
              <span className="tiny" style={{ fontWeight: 700 }}>Módulo del cliente (opcional)</span>
              <select style={fieldStyle} value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
                <option value="">— Sin asociar —</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </label>
            <label style={{ display: 'grid', gap: 5 }}>
              <span className="tiny" style={{ fontWeight: 700 }}>Título sugerido (opcional)</span>
              <input style={fieldStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="p. ej. Agendamiento de citas" />
            </label>
            <label style={{ display: 'grid', gap: 5 }}>
              <span className="tiny" style={{ fontWeight: 700 }}>Versión</span>
              <input style={fieldStyle} value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0" />
            </label>
          </div>
          <label style={{ display: 'grid', gap: 5, marginBottom: 12 }}>
            <span className="tiny" style={{ fontWeight: 700 }}>Indicaciones para el agente (opcional)</span>
            <textarea
              style={{ ...fieldStyle, minHeight: 70, resize: 'vertical' }}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="p. ej. Enfócate en el flujo de admisiones; usa un tono para personal nuevo."
            />
          </label>
          <div className="row" style={{ gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <label className="row" style={{ gap: 8, alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" checked={runReview} onChange={(e) => setRunReview(e.target.checked)} style={{ width: 16, height: 16 }} />
              <span className="tiny">Revisión de fidelidad (llamada extra; el auditor de cobertura ya reporta faltantes)</span>
            </label>
            <button
              className="btn pri"
              disabled={generating || readySelected.length === 0}
              onClick={onGenerate}
            >
              {generating ? 'Generando… (puede tardar)' : ' Generar lecciones'}
            </button>
            {genOk && <span className="tiny" style={{ color: 'var(--ok-600)', fontWeight: 600 }}>{genOk}</span>}
          </div>
        </section>

        {/* Detalle / revisión */}
        {active && (
          <LessonReview
            key={active.id}
            data={active}
            assets={assets}
            busy={busyId === active.id}
            onSaved={(m) => {
              setActive(m);
              void refreshLessons();
            }}
            onPublishToggle={() => togglePublish(active.id, active.status)}
            onClose={() => setActive(null)}
          />
        )}

        {/* Paso 3: listado */}
        <section className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>3 · Lecciones generadas</h3>
          {loading ? (
            <p className="tiny muted">Cargando…</p>
          ) : lessons.length === 0 ? (
            <p className="tiny muted">Aún no hay lecciones. Sube insumos y genera la primera.</p>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {lessons.map((l) => (
                <div key={l.id} className="row" style={{ gap: 12, alignItems: 'center', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: 'var(--ink-900)' }}>{l.title}</div>
                    <div className="tiny muted">
                      {l.clientName ? <><b style={{ color: 'var(--brand-600)' }}>{l.clientName}</b> · </> : <span style={{ color: 'var(--danger-600)' }}>Sin cliente · </span>}
                      {l.code} · {l.blockCount} bloques · {l.lessonCount} lecciones
                    </div>
                  </div>
                  <span className="chip" title="Versión">v{l.version}</span>
                  <span className={`chip${l.status === 'published' ? ' brand' : ''}`}>
                    {l.status === 'published' ? 'Publicada' : 'Borrador'}
                  </span>
                  <button className="btn sm" onClick={() => openLesson(l.id)}>Revisar</button>
                  <button className="btn sm" disabled={busyId === l.id} onClick={() => togglePublish(l.id, l.status)}>
                    {l.status === 'published' ? 'Despublicar' : 'Publicar'}
                  </button>
                  <button className="btn sm" disabled={busyId === l.id} onClick={() => removeLesson(l)} style={{ color: 'var(--danger-600)' }}>
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div style={{ marginTop: 8 }}>
          <Link className="btn ghost sm" to="/">← Volver al inicio</Link>
        </div>
      </div>
    </>
  );
}

function StatusChip({ status, hasText }: { status: Asset['status']; hasText: boolean }) {
  if (status === 'processing') return <span className="chip">Procesando…</span>;
  if (status === 'error') return <span className="chip" style={{ color: 'var(--danger-600)' }}>Error</span>;
  if (status === 'ready' && !hasText) return <span className="chip">Sin texto</span>;
  return <span className="chip brand">Listo</span>;
}

/** Panel de revisión: preview estructurado + edición de título/descripción + edición avanzada (JSON). */
function LessonReview({
  data,
  assets,
  busy,
  onSaved,
  onPublishToggle,
  onClose,
}: {
  data: GeneratedModule;
  assets: Asset[];
  busy: boolean;
  onSaved: (m: GeneratedModule) => void;
  onPublishToggle: () => void;
  onClose: () => void;
}) {
  // Insumos fuente resueltos contra la lista cargada (para conocer su tipo).
  const sourceAssets = data.sourceAssetIds
    .map((id) => assets.find((a) => a.id === id))
    .filter((a): a is Asset => Boolean(a));
  const mediaAssets = sourceAssets.filter((a) => a.kind === 'video' || a.kind === 'audio');
  const docAssets = sourceAssets.filter((a) => a.kind === 'document');
  const [title, setTitle] = useState(data.content.title);
  const [description, setDescription] = useState(data.content.description);
  const [version, setVersion] = useState(data.version);
  const [advanced, setAdvanced] = useState(false);
  const [json, setJson] = useState(() => JSON.stringify(data.content, null, 2));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [quizCount, setQuizCount] = useState(data.quizCount ?? 0);
  const [quizBusy, setQuizBusy] = useState(false);
  const [hasCert, setHasCert] = useState<boolean>(data.hasCertificate ?? false);
  const [certBusy, setCertBusy] = useState(false);
  const certRef = useRef<HTMLInputElement>(null);
  const [hasManual, setHasManual] = useState<boolean>(data.hasManual ?? false);
  const [manualBusy, setManualBusy] = useState(false);

  const genManual = async () => {
    setErr('');
    setMsg('');
    setManualBusy(true);
    try {
      const updated = await generateManual(data.id);
      setHasManual(updated.hasManual ?? true);
      onSaved(updated);
      setMsg('Manual de usuario generado.');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'No se pudo generar el manual');
    } finally {
      setManualBusy(false);
    }
  };

  const viewManual = async () => {
    setErr('');
    setManualBusy(true);
    try {
      openManualWindow(await getLessonManual(data.id));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'No se pudo abrir el manual');
    } finally {
      setManualBusy(false);
    }
  };

  const removeManual = async () => {
    if (!window.confirm('¿Eliminar el manual de esta versión?')) return;
    setErr('');
    setMsg('');
    setManualBusy(true);
    try {
      const updated = await deleteLessonManual(data.id);
      setHasManual(updated.hasManual ?? false);
      onSaved(updated);
      setMsg('Manual eliminado.');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'No se pudo eliminar el manual');
    } finally {
      setManualBusy(false);
    }
  };

  const uploadCert = async (file: File) => {
    setErr('');
    setMsg('');
    setCertBusy(true);
    try {
      const updated = await setLessonCertificate(data.id, file);
      setHasCert(updated.hasCertificate ?? true);
      onSaved(updated);
      setMsg('Documento de certificado cargado.');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'No se pudo subir el certificado');
    } finally {
      setCertBusy(false);
      if (certRef.current) certRef.current.value = '';
    }
  };

  const removeCert = async () => {
    if (!window.confirm('¿Quitar el documento de certificado de esta versión?')) return;
    setErr('');
    setMsg('');
    setCertBusy(true);
    try {
      const updated = await deleteLessonCertificate(data.id);
      setHasCert(updated.hasCertificate ?? false);
      onSaved(updated);
      setMsg('Documento de certificado quitado.');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'No se pudo quitar el certificado');
    } finally {
      setCertBusy(false);
    }
  };

  const genQuiz = async () => {
    setErr('');
    setMsg('');
    setQuizBusy(true);
    try {
      const updated = await generateQuiz(data.id);
      setQuizCount(updated.quizCount ?? 0);
      onSaved(updated);
      setMsg(`Evaluación generada: ${updated.quizCount ?? 0} preguntas.`);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'No se pudo generar la evaluación');
    } finally {
      setQuizBusy(false);
    }
  };

  const save = async () => {
    setErr('');
    setMsg('');
    setSaving(true);
    try {
      let content: ModuleContentDto;
      if (advanced) {
        content = JSON.parse(json) as ModuleContentDto;
      } else {
        content = { ...data.content, title: title.trim(), description: description.trim() };
      }
      const updated = await updateLesson(data.id, content, version.trim() || '1.0');
      onSaved(updated);
      setJson(JSON.stringify(updated.content, null, 2));
      setTitle(updated.content.title);
      setDescription(updated.content.description);
      setVersion(updated.version);
      setMsg('Cambios guardados.');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'No se pudo guardar (¿JSON inválido?)');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card" style={{ padding: 20, marginBottom: 20, borderColor: 'var(--brand-300, #c7d2fe)' }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 10, flexWrap: 'wrap' }}>
        <h3 style={{ fontSize: 16 }}>
          Revisión del borrador{' '}
          <span className={`chip${data.status === 'published' ? ' brand' : ''}`}>
            {data.status === 'published' ? 'Publicada' : 'Borrador'}
          </span>
        </h3>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn sm" onClick={genQuiz} disabled={quizBusy || busy} title="Generar evaluación con IA">
            {quizBusy ? 'Generando…' : quizCount > 0 ? `Evaluación (${quizCount})` : 'Generar evaluación'}
          </button>
          <button className="btn sm" onClick={hasManual ? viewManual : genManual} disabled={manualBusy || busy} title="Manual de usuario con IA">
            {manualBusy ? 'Procesando…' : hasManual ? 'Ver manual (PDF)' : 'Generar manual'}
          </button>
          <button className="btn sm" onClick={onPublishToggle} disabled={busy}>
            {data.status === 'published' ? 'Despublicar' : 'Publicar'}
          </button>
          <button className="btn ghost sm" onClick={onClose}>Cerrar</button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr 0.5fr', gap: 12, marginBottom: 12 }}>
        <label style={{ display: 'grid', gap: 5 }}>
          <span className="tiny" style={{ fontWeight: 700 }}>Título</span>
          <input style={fieldStyle} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label style={{ display: 'grid', gap: 5 }}>
          <span className="tiny" style={{ fontWeight: 700 }}>Descripción</span>
          <input style={fieldStyle} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label style={{ display: 'grid', gap: 5 }}>
          <span className="tiny" style={{ fontWeight: 700 }}>Versión</span>
          <input style={fieldStyle} value={version} onChange={(e) => setVersion(e.target.value)} />
        </label>
      </div>

      {/* Documento de certificado */}
      <div className="card" style={{ padding: '12px 14px', marginBottom: 12, background: 'var(--brand-50)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Documento de certificado</div>
          <div className="tiny muted">
            {hasCert
              ? 'Documento cargado. El alumno lo descargará al aprobar la evaluación de este módulo.'
              : 'Sube el PDF o imagen del certificado que recibirá el alumno al aprobar.'}
          </div>
        </div>
        <input
          ref={certRef}
          type="file"
          accept=".pdf,image/*"
          style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadCert(f); }}
        />
        <div className="row" style={{ gap: 6 }}>
          <button className="btn sm" disabled={certBusy} onClick={() => certRef.current?.click()}>
            {certBusy ? 'Subiendo…' : hasCert ? 'Reemplazar' : 'Subir certificado'}
          </button>
          {hasCert && (
            <button className="btn sm" disabled={certBusy} onClick={removeCert} style={{ color: 'var(--danger-600)' }}>
              Quitar
            </button>
          )}
        </div>
      </div>

      {/* Manual de usuario */}
      <div className="card" style={{ padding: '12px 14px', marginBottom: 12, background: 'var(--brand-50)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Manual de usuario</div>
          <div className="tiny muted">
            {hasManual
              ? 'Manual generado para esta versión. Ábrelo para leerlo y guardarlo como PDF desde el navegador.'
              : 'Genera con IA un manual profesional a partir del contenido de esta versión. No inventa: marca los pasos sin datos suficientes.'}
          </div>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn sm" disabled={manualBusy || busy} onClick={genManual} title="Generar/regenerar con IA">
            {manualBusy ? 'Procesando…' : hasManual ? 'Regenerar' : 'Generar manual'}
          </button>
          {hasManual && (
            <button className="btn sm" disabled={manualBusy} onClick={viewManual}>Ver / PDF</button>
          )}
          {hasManual && (
            <button className="btn sm" disabled={manualBusy} onClick={removeManual} style={{ color: 'var(--danger-600)' }}>Quitar</button>
          )}
        </div>
      </div>

      {data.reviewNotes && (
        <details style={{ marginBottom: 12 }} open>
          <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 13 }}> Cobertura y notas del auditor</summary>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, background: 'var(--brand-50)', padding: 12, borderRadius: 8, marginTop: 8 }}>
            {data.reviewNotes}
          </pre>
        </details>
      )}

      {/* Preview estructurado */}
      <div style={{ display: 'grid', gap: 14 }}>
        {data.content.blocks.map((b) => (
          <div key={b.id}>
            <div style={{ fontFamily: "'Sora'", fontWeight: 700, fontSize: 14, color: 'var(--brand-700, #4338ca)', marginBottom: 6 }}>
              {b.title}
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {b.lessons.map((l) => (
                <div key={l.id} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontWeight: 700 }}>{l.code} · {l.title} <span className="tiny muted">({l.duration})</span></div>
                  <p className="tiny" style={{ margin: '4px 0 8px', color: 'var(--ink-700, #374151)' }}>{l.summary}</p>
                  {l.objectives.length > 0 && (
                    <div className="tiny muted" style={{ marginBottom: 6 }}> {l.objectives.join(' · ')}</div>
                  )}
                  {l.sections.map((s, i) => (
                    <div key={i} style={{ marginBottom: 6 }}>
                      <div className="tiny" style={{ fontWeight: 700 }}>{s.heading}</div>
                      <ol className="tiny" style={{ margin: '2px 0 0 18px' }}>
                        {s.steps.map((st, j) => <li key={j}>{st}</li>)}
                      </ol>
                    </div>
                  ))}
                  {l.keyPoints.length > 0 && (
                    <div className="tiny" style={{ marginTop: 6 }}> <b>Clave:</b> {l.keyPoints.join(' · ')}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Insumos fuente: reproductor solo para video/voz; los documentos se listan aparte */}
      {(mediaAssets.length > 0 || docAssets.length > 0) && (
        <details style={{ marginTop: 14 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
            Insumos usados ({sourceAssets.length})
          </summary>
          {mediaAssets.length > 0 && (
            <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
              {mediaAssets.map((a) =>
                a.kind === 'video' ? (
                  <video key={a.id} src={mediaUrl(a.id)} controls style={{ width: '100%', maxWidth: 480, borderRadius: 8 }}>
                    Tu navegador no puede reproducir este recurso.
                  </video>
                ) : (
                  <audio key={a.id} src={mediaUrl(a.id)} controls style={{ width: '100%', maxWidth: 480 }}>
                    Tu navegador no puede reproducir este recurso.
                  </audio>
                ),
              )}
            </div>
          )}
          {docAssets.length > 0 && (
            <ul className="tiny muted" style={{ margin: '8px 0 0 18px' }}>
              {docAssets.map((a) => (
                <li key={a.id}> {a.filename}</li>
              ))}
            </ul>
          )}
        </details>
      )}

      {/* Edición avanzada */}
      <details style={{ marginTop: 14 }} open={advanced} onToggle={(e) => setAdvanced((e.target as HTMLDetailsElement).open)}>
        <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 13 }}> Edición avanzada (JSON del contenido)</summary>
        <textarea
          style={{ ...fieldStyle, minHeight: 240, fontFamily: 'monospace', fontSize: 12, marginTop: 8 }}
          value={json}
          onChange={(e) => setJson(e.target.value)}
        />
      </details>

      <div className="row" style={{ gap: 10, alignItems: 'center', marginTop: 12 }}>
        <button className="btn pri sm" onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
        {msg && <span className="tiny" style={{ color: 'var(--ok-600)', fontWeight: 600 }}>{msg}</span>}
        {err && <span className="tiny" style={{ color: 'var(--danger-600)', fontWeight: 600 }}> {err}</span>}
      </div>
    </section>
  );
}
