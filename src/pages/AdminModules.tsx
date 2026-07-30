import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../components/Topbar';
import {
  assetUrl,
  createModule,
  deleteModule,
  listCatalogAdmin,
  listClients,
  setModuleCover,
  updateModule,
  type CatalogModuleAdmin,
  type Client,
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

export function AdminModules() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<number | null>(null);
  const [modules, setModules] = useState<CatalogModuleAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Alta
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [ok, setOk] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [busyId, setBusyId] = useState<number | null>(null);

  const reload = () => (clientId != null ? listCatalogAdmin(clientId).then(setModules) : Promise.resolve());

  useEffect(() => {
    listClients()
      .then((cs) => {
        setClients(cs);
        if (cs.length) setClientId((prev) => prev ?? cs[0].id);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (clientId != null) listCatalogAdmin(clientId).then(setModules).catch(() => {});
  }, [clientId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (clientId == null) {
      setError('Primero crea o selecciona un cliente.');
      return;
    }
    setError('');
    setOk('');
    setCreating(true);
    try {
      const m = await createModule(clientId, title.trim(), description.trim(), image);
      setOk(`Módulo "${m.title}" creado.`);
      setTitle('');
      setDescription('');
      setImage(null);
      if (fileRef.current) fileRef.current.value = '';
      await reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el módulo');
    } finally {
      setCreating(false);
    }
  };

  const saveEdit = async (m: CatalogModuleAdmin, title: string, description: string) => {
    setBusyId(m.id);
    try {
      await updateModule(m.id, { title: title.trim(), description: description.trim() });
      await reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar');
    } finally {
      setBusyId(null);
    }
  };

  const changeCover = async (m: CatalogModuleAdmin, file: File) => {
    setBusyId(m.id);
    try {
      await setModuleCover(m.id, file);
      await reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la portada');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (m: CatalogModuleAdmin) => {
    if (!window.confirm(`¿Eliminar el módulo "${m.title}"? El contenido publicado con ese módulo dejará de mostrarse.`)) return;
    setBusyId(m.id);
    try {
      await deleteModule(m.id);
      await reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <Topbar crumb={<>Administración · <b>Módulos</b></>} />
      <div className="content">
        <section className="page-head" style={{ marginBottom: 20 }}>
          <h1>Módulos del catálogo</h1>
          <p>Los módulos pertenecen a un cliente. Elige el cliente y crea/edita sus módulos.</p>
        </section>

        {error && (
          <div className="card" style={{ padding: 14, marginBottom: 16, color: 'var(--danger-600)' }}>{error}</div>
        )}

        {clients.length === 0 ? (
          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <span className="tiny muted">Aún no hay clientes. Crea uno primero en </span>
            <Link to="/admin/clientes" className="tiny" style={{ fontWeight: 700 }}>Administración · Clientes</Link>.
          </div>
        ) : (
          <div className="card" style={{ padding: 16, marginBottom: 20 }}>
            <label className="row" style={{ gap: 10, alignItems: 'center' }}>
              <span className="tiny" style={{ fontWeight: 700 }}>Cliente:</span>
              <select style={{ ...fieldStyle, maxWidth: 360 }} value={clientId ?? ''} onChange={(e) => setClientId(Number(e.target.value))}>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          </div>
        )}

        <section className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Crear módulo</h3>
          <form onSubmit={submit} className="grid" style={{ gap: 12 }}>
            <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
              <label style={{ display: 'grid', gap: 5 }}>
                <span className="tiny" style={{ fontWeight: 700 }}>Título</span>
                <input style={fieldStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="p. ej. Dispensación" required />
              </label>
              <label style={{ display: 'grid', gap: 5 }}>
                <span className="tiny" style={{ fontWeight: 700 }}>Imagen de portada (opcional)</span>
                <input ref={fileRef} type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} style={{ fontSize: 13 }} />
              </label>
            </div>
            <label style={{ display: 'grid', gap: 5 }}>
              <span className="tiny" style={{ fontWeight: 700 }}>Descripción</span>
              <textarea style={{ ...fieldStyle, minHeight: 60, resize: 'vertical' }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descripción del módulo" />
            </label>
            <div className="row" style={{ gap: 10, alignItems: 'center' }}>
              <button className="btn pri" type="submit" disabled={creating}>{creating ? 'Creando…' : 'Crear módulo'}</button>
              {ok && <span className="tiny" style={{ color: 'var(--ok-600)', fontWeight: 600 }}>{ok}</span>}
            </div>
          </form>
        </section>

        {loading ? (
          <div className="card" style={{ padding: 20 }}>Cargando módulos…</div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {modules.map((m) => (
              <ModuleAdminCard
                key={m.id}
                mod={m}
                busy={busyId === m.id}
                onSave={saveEdit}
                onCover={changeCover}
                onRemove={remove}
              />
            ))}
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <Link className="btn ghost sm" to="/">← Volver al inicio</Link>
        </div>
      </div>
    </>
  );
}

function ModuleAdminCard({
  mod,
  busy,
  onSave,
  onCover,
  onRemove,
}: {
  mod: CatalogModuleAdmin;
  busy: boolean;
  onSave: (m: CatalogModuleAdmin, title: string, description: string) => void;
  onCover: (m: CatalogModuleAdmin, file: File) => void;
  onRemove: (m: CatalogModuleAdmin) => void;
}) {
  const [title, setTitle] = useState(mod.title);
  const [description, setDescription] = useState(mod.description);
  const coverRef = useRef<HTMLInputElement>(null);
  const cover = mod.hasCover ? `${assetUrl(`/api/catalog/modules/${mod.id}/cover`)}?v=${Date.now()}` : null;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          height: 120,
          background: cover ? `#eef2f8 url(${cover}) center / cover no-repeat` : 'linear-gradient(135deg,#1492E6,#0E45AE)',
          position: 'relative',
        }}
      >
        <button
          type="button"
          className="btn sm"
          onClick={() => coverRef.current?.click()}
          disabled={busy}
          style={{ position: 'absolute', right: 8, bottom: 8, background: 'rgba(255,255,255,.92)' }}
        >
          {mod.hasCover ? 'Cambiar imagen' : 'Subir imagen'}
        </button>
        <input
          ref={coverRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onCover(mod, f);
          }}
        />
      </div>
      <div style={{ padding: 14, display: 'grid', gap: 8, flex: 1 }}>
        <div className="tiny" style={{ color: 'var(--ink-400)', fontWeight: 700 }}>{mod.code}</div>
        <input style={fieldStyle} value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea style={{ ...fieldStyle, minHeight: 54, resize: 'vertical' }} value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="row" style={{ gap: 8, justifyContent: 'flex-end', marginTop: 2 }}>
          <button className="btn sm" disabled={busy} onClick={() => onRemove(mod)} style={{ color: 'var(--danger-600)' }}>Eliminar</button>
          <button className="btn pri sm" disabled={busy} onClick={() => onSave(mod, title, description)}>{busy ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </div>
    </div>
  );
}
