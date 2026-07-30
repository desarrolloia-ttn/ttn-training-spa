import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../components/Topbar';
import {
  assetUrl,
  createClient,
  deleteClient,
  deleteClientCover,
  listClients,
  setClientCover,
  updateClient,
  type Client,
} from '../lib/api';

const fieldStyle: React.CSSProperties = {
  padding: '9px 11px', border: '1px solid var(--line)', borderRadius: 10, fontSize: 14,
  fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box',
};

const PRODUCTS = [
  { slug: 'biowel', name: 'Biowel' },
  { slug: 'activos-fijos', name: 'Activos Fijos' },
];

export function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [product, setProduct] = useState('biowel');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [ok, setOk] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const reload = () => listClients().then(setClients);

  useEffect(() => {
    reload()
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setOk('');
    setCreating(true);
    try {
      const c = await createClient(product, name.trim(), description.trim(), image);
      setOk(`Cliente "${c.name}" creado.`);
      setName('');
      setDescription('');
      setImage(null);
      if (fileRef.current) fileRef.current.value = '';
      await reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el cliente');
    } finally {
      setCreating(false);
    }
  };

  const save = async (c: Client, name: string, description: string) => {
    setBusyId(c.id);
    try {
      await updateClient(c.id, { name: name.trim(), description: description.trim() });
      await reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar');
    } finally {
      setBusyId(null);
    }
  };

  const changeCover = async (c: Client, file: File) => {
    setBusyId(c.id);
    try {
      await setClientCover(c.id, file);
      await reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la portada');
    } finally {
      setBusyId(null);
    }
  };

  const removeCover = async (c: Client) => {
    if (!window.confirm(`¿Quitar la imagen del cliente "${c.name}"?`)) return;
    setBusyId(c.id);
    try {
      await deleteClientCover(c.id);
      await reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo quitar la imagen');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (c: Client) => {
    if (!window.confirm(`¿Eliminar el cliente "${c.name}"? Sus módulos quedarán sin cliente.`)) return;
    setBusyId(c.id);
    try {
      await deleteClient(c.id);
      await reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <Topbar crumb={<>Administración · <b>Clientes</b></>} />
      <div className="content">
        <section className="page-head" style={{ marginBottom: 20 }}>
          <h1>Clientes</h1>
          <p>Cada producto puede tener varios clientes (p. ej. Biowel Colombia, Biowel RD), cada uno con sus propios módulos y lecciones.</p>
        </section>

        {error && <div className="card" style={{ padding: 14, marginBottom: 16, color: 'var(--danger-600)' }}>{error}</div>}

        <section className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Crear cliente</h3>
          <form onSubmit={submit} className="grid" style={{ gap: 12 }}>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1.2fr 1fr', gap: 12 }}>
              <label style={{ display: 'grid', gap: 5 }}>
                <span className="tiny" style={{ fontWeight: 700 }}>Producto</span>
                <select style={fieldStyle} value={product} onChange={(e) => setProduct(e.target.value)}>
                  {PRODUCTS.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
                </select>
              </label>
              <label style={{ display: 'grid', gap: 5 }}>
                <span className="tiny" style={{ fontWeight: 700 }}>Nombre</span>
                <input style={fieldStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="p. ej. Biowel RD" required />
              </label>
              <label style={{ display: 'grid', gap: 5 }}>
                <span className="tiny" style={{ fontWeight: 700 }}>Imagen (opcional)</span>
                <input ref={fileRef} type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} style={{ fontSize: 13 }} />
              </label>
            </div>
            <label style={{ display: 'grid', gap: 5 }}>
              <span className="tiny" style={{ fontWeight: 700 }}>Descripción</span>
              <textarea style={{ ...fieldStyle, minHeight: 54, resize: 'vertical' }} value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
            <div className="row" style={{ gap: 10, alignItems: 'center' }}>
              <button className="btn pri" type="submit" disabled={creating}>{creating ? 'Creando…' : 'Crear cliente'}</button>
              {ok && <span className="tiny" style={{ color: 'var(--ok-600)', fontWeight: 600 }}>{ok}</span>}
            </div>
          </form>
        </section>

        {loading ? (
          <div className="card" style={{ padding: 20 }}>Cargando clientes…</div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {clients.map((c) => (
              <ClientCard key={c.id} client={c} busy={busyId === c.id} onSave={save} onCover={changeCover} onRemoveCover={removeCover} onRemove={remove} />
            ))}
          </div>
        )}

        <div style={{ marginTop: 18 }}><Link className="btn ghost sm" to="/">← Volver al inicio</Link></div>
      </div>
    </>
  );
}

function ClientCard({
  client, busy, onSave, onCover, onRemoveCover, onRemove,
}: {
  client: Client;
  busy: boolean;
  onSave: (c: Client, name: string, description: string) => void;
  onCover: (c: Client, file: File) => void;
  onRemoveCover: (c: Client) => void;
  onRemove: (c: Client) => void;
}) {
  const [name, setName] = useState(client.name);
  const [description, setDescription] = useState(client.description);
  const coverRef = useRef<HTMLInputElement>(null);
  const cover = client.cover ? `${assetUrl(client.cover)}?v=${Date.now()}` : null;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 110, background: cover ? `#eef2f8 url(${cover}) center / cover no-repeat` : 'linear-gradient(135deg,#1492E6,#0E45AE)', position: 'relative' }}>
        <div className="row" style={{ gap: 6, position: 'absolute', right: 8, bottom: 8 }}>
          {client.cover && (
            <button type="button" className="btn sm" onClick={() => onRemoveCover(client)} disabled={busy} style={{ background: 'rgba(255,255,255,.92)', color: 'var(--danger-600)' }}>
              Quitar imagen
            </button>
          )}
          <button type="button" className="btn sm" onClick={() => coverRef.current?.click()} disabled={busy} style={{ background: 'rgba(255,255,255,.92)' }}>
            {client.cover ? 'Cambiar imagen' : 'Subir imagen'}
          </button>
        </div>
        <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onCover(client, f); }} />
      </div>
      <div style={{ padding: 14, display: 'grid', gap: 8, flex: 1 }}>
        <div className="tiny" style={{ color: 'var(--ink-400)', fontWeight: 700 }}>{client.product} · {client.moduleCount} módulos</div>
        <input style={fieldStyle} value={name} onChange={(e) => setName(e.target.value)} />
        <textarea style={{ ...fieldStyle, minHeight: 48, resize: 'vertical' }} value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn sm" disabled={busy} onClick={() => onRemove(client)} style={{ color: 'var(--danger-600)' }}>Eliminar</button>
          <button className="btn pri sm" disabled={busy} onClick={() => onSave(client, name, description)}>{busy ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </div>
    </div>
  );
}
