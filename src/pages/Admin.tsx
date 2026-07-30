import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import {
  createUser,
  deleteUser,
  getCatalog,
  listClients,
  listUsers,
  setModuleAccess,
  updateUser,
  type CatalogModule,
  type Client,
  type Role,
  type UserPublic,
} from '../lib/api';
import { PRODUCTS } from '../data/products';

const emptyForm = { name: '', username: '', password: '', role: 'usuario' as Role };
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

/** Módulos de un cliente. */
interface ClientModules {
  client: Client;
  modules: CatalogModule[];
}
/** Agrupación Producto → clientes (con sus módulos). */
interface ProductGroup {
  slug: string;
  name: string;
  clients: ClientModules[];
}

export function Admin() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<UserPublic[]>([]);
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Estado de guardado de accesos.
  const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set());
  const [bulkKey, setBulkKey] = useState<string | null>(null);

  // Paneles abiertos (permisos / edición) por usuario.
  const [openId, setOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', role: 'usuario' as Role, password: '' });
  const [editError, setEditError] = useState('');
  const [rowBusy, setRowBusy] = useState<string | null>(null);

  // Alta de usuario
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [formOk, setFormOk] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [u, clients] = await Promise.all([listUsers(), listClients()]);
        setUsers(u);
        const withMods = await Promise.all(
          clients.map(async (c) => ({ client: c, modules: await getCatalog(c.id) }) as ClientModules),
        );
        // Agrupa por producto respetando el orden de PRODUCTS y añade extras al final.
        const byProduct = new Map<string, ClientModules[]>();
        for (const cm of withMods) {
          const arr = byProduct.get(cm.client.product) ?? [];
          arr.push(cm);
          byProduct.set(cm.client.product, arr);
        }
        const ordered: ProductGroup[] = [];
        const seen = new Set<string>();
        for (const p of PRODUCTS) {
          const arr = byProduct.get(p.slug);
          if (arr) {
            ordered.push({ slug: p.slug, name: p.name, clients: arr });
            seen.add(p.slug);
          }
        }
        for (const [slug, arr] of byProduct) {
          if (!seen.has(slug)) ordered.push({ slug, name: slug, clients: arr });
        }
        setGroups(ordered);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Error al cargar');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q),
    );
  }, [users, search]);

  const totalModules = useMemo(
    () => groups.reduce((n, g) => n + g.clients.reduce((k, c) => k + c.modules.length, 0), 0),
    [groups],
  );

  const submitNewUser = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormOk('');
    setCreating(true);
    try {
      const created = await createUser({
        name: form.name.trim(),
        username: form.username.trim(),
        password: form.password,
        role: form.role,
      });
      setUsers((prev) => [...prev, created]);
      setFormOk(`Usuario "${created.name}" creado como ${created.role}.`);
      setForm(emptyForm);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'No se pudo crear el usuario');
    } finally {
      setCreating(false);
    }
  };

  const toggle = async (u: UserPublic, moduleId: number, unlocked: boolean) => {
    const key = `${u.id}:${moduleId}`;
    setSavingKeys((prev) => new Set(prev).add(key));
    try {
      const updated = await setModuleAccess(u.id, moduleId, unlocked);
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar el acceso');
    } finally {
      setSavingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  // Habilita/quita todos los módulos de un cliente para un usuario (secuencial: el store escribe archivo).
  const setClientAccess = async (u: UserPublic, client: Client, modules: CatalogModule[], unlocked: boolean) => {
    setBulkKey(`${u.id}:${client.id}`);
    try {
      let latest = u;
      for (const m of modules) {
        if (latest.unlockedModules.includes(m.id) === unlocked) continue;
        latest = await setModuleAccess(u.id, m.id, unlocked);
      }
      setUsers((prev) => prev.map((x) => (x.id === latest.id ? latest : x)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar el acceso');
    } finally {
      setBulkKey(null);
    }
  };

  const startEdit = (u: UserPublic) => {
    setEditError('');
    setEditingId(editingId === u.id ? null : u.id);
    setEditForm({ name: u.name, role: u.role, password: '' });
  };

  const saveEdit = async (u: UserPublic) => {
    setEditError('');
    setRowBusy(u.id);
    try {
      const patch: { name?: string; role?: Role; password?: string } = {
        name: editForm.name.trim(),
        role: editForm.role,
      };
      if (editForm.password) patch.password = editForm.password;
      const updated = await updateUser(u.id, patch);
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      setEditingId(null);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'No se pudo actualizar');
    } finally {
      setRowBusy(null);
    }
  };

  const removeUser = async (u: UserPublic) => {
    if (!window.confirm(`¿Eliminar a "${u.name}" (@${u.username})? Esta acción no se puede deshacer.`)) return;
    setError('');
    setRowBusy(u.id);
    try {
      await deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el usuario');
    } finally {
      setRowBusy(null);
    }
  };

  return (
    <>
      <Topbar crumb={<>Administración · <b>Usuarios</b></>} />
      <div className="content">
        <section className="page-head" style={{ marginBottom: 20 }}>
          <h1>Usuarios y permisos</h1>
          <p>Registra, edita y elimina usuarios, y habilita los módulos de cada proyecto. Los administradores tienen acceso a todo.</p>
        </section>

        {error && (
          <div className="card" style={{ padding: 14, marginBottom: 16, color: 'var(--danger-600)' }}>{error}</div>
        )}

        {/* Alta */}
        <section className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>Registrar usuario</h3>
          <p className="tiny muted" style={{ margin: '0 0 14px' }}>
            El usuario nace con todos los módulos bloqueados; habilítalos en su ficha.
          </p>
          <form onSubmit={submitNewUser} className="grid" style={{ gridTemplateColumns: '1.3fr 1fr 1fr .9fr auto', gap: 10, alignItems: 'end' }}>
            <label style={{ display: 'grid', gap: 5 }}>
              <span className="tiny" style={{ fontWeight: 700 }}>Nombre</span>
              <input style={fieldStyle} type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre completo" required />
            </label>
            <label style={{ display: 'grid', gap: 5 }}>
              <span className="tiny" style={{ fontWeight: 700 }}>Usuario</span>
              <input style={fieldStyle} type="text" autoComplete="off" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="usuario" required />
            </label>
            <label style={{ display: 'grid', gap: 5 }}>
              <span className="tiny" style={{ fontWeight: 700 }}>Contraseña</span>
              <input style={fieldStyle} type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="mín. 4 caracteres" required />
            </label>
            <label style={{ display: 'grid', gap: 5 }}>
              <span className="tiny" style={{ fontWeight: 700 }}>Rol</span>
              <select style={fieldStyle} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
                <option value="usuario">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </label>
            <button className="btn pri" type="submit" disabled={creating} style={{ justifyContent: 'center' }}>
              {creating ? 'Creando…' : 'Crear'}
            </button>
          </form>
          {formError && <div className="tiny" style={{ color: 'var(--danger-600)', fontWeight: 600, marginTop: 10 }}>{formError}</div>}
          {formOk && <div className="tiny" style={{ color: 'var(--ok-600)', fontWeight: 600, marginTop: 10 }}>{formOk}</div>}
        </section>

        {/* Búsqueda */}
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
          <input
            style={{ ...fieldStyle, maxWidth: 320 }}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o usuario…"
          />
          <span className="tiny muted">{filtered.length} de {users.length} usuarios</span>
        </div>

        {loading ? (
          <div className="card" style={{ padding: 20 }}>Cargando usuarios…</div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--ink-500)' }}>Sin resultados</div>
        ) : (
          <div className="grid" style={{ gap: 12 }}>
            {filtered.map((u) => {
              const isAdmin = u.role === 'admin';
              const isSelf = u.id === me?.id;
              const busy = rowBusy === u.id;
              const permsOpen = openId === u.id;
              const editOpen = editingId === u.id;
              return (
                <section className="card" key={u.id} style={{ padding: 0, overflow: 'hidden' }}>
                  <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '14px 18px', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 200, flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--ink-900)' }}>
                        {u.name}{isSelf && <span className="tiny muted"> (tú)</span>}
                      </div>
                      <div className="tiny muted">@{u.username}</div>
                    </div>
                    <span className={`chip${isAdmin ? ' brand' : ''}`}>{isAdmin ? 'Admin' : 'Usuario'}</span>
                    <span className="tiny muted" style={{ minWidth: 150, textAlign: 'right' }}>
                      {isAdmin
                        ? 'Acceso total a todos los módulos'
                        : `${u.unlockedModules.length} de ${totalModules} módulos habilitados`}
                    </span>
                    <div className="row" style={{ gap: 6 }}>
                      {!isAdmin && (
                        <button className={`btn sm${permsOpen ? ' pri' : ''}`} disabled={busy} onClick={() => setOpenId(permsOpen ? null : u.id)}>
                          {permsOpen ? 'Ocultar permisos' : 'Permisos'}
                        </button>
                      )}
                      <button className="btn sm" disabled={busy} onClick={() => startEdit(u)}>Editar</button>
                      <button
                        className="btn sm"
                        disabled={busy || isSelf}
                        onClick={() => removeUser(u)}
                        title={isSelf ? 'No puedes eliminar tu propia cuenta' : 'Eliminar'}
                        style={{ color: isSelf ? 'var(--ink-400)' : 'var(--danger-600)' }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {editOpen && (
                    <div style={{ background: 'var(--brand-50)', padding: '14px 18px', borderTop: '1px solid var(--line)' }}>
                      <div className="row" style={{ gap: 10, flexWrap: 'wrap', alignItems: 'end' }}>
                        <label style={{ display: 'grid', gap: 5, minWidth: 200 }}>
                          <span className="tiny" style={{ fontWeight: 700 }}>Nombre</span>
                          <input style={fieldStyle} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                        </label>
                        <label style={{ display: 'grid', gap: 5, minWidth: 150 }}>
                          <span className="tiny" style={{ fontWeight: 700 }}>Rol</span>
                          <select style={fieldStyle} value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value as Role })}>
                            <option value="usuario">Usuario</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </label>
                        <label style={{ display: 'grid', gap: 5, minWidth: 200 }}>
                          <span className="tiny" style={{ fontWeight: 700 }}>Nueva contraseña (opcional)</span>
                          <input style={fieldStyle} type="password" autoComplete="new-password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} placeholder="dejar vacío para no cambiar" />
                        </label>
                        <button className="btn pri sm" disabled={busy} onClick={() => saveEdit(u)}>{busy ? 'Guardando…' : 'Guardar'}</button>
                        <button className="btn sm" disabled={busy} onClick={() => setEditingId(null)}>Cancelar</button>
                        {editError && <span className="tiny" style={{ color: 'var(--danger-600)', fontWeight: 600 }}>{editError}</span>}
                      </div>
                    </div>
                  )}

                  {permsOpen && !isAdmin && (
                    <PermissionsPanel
                      user={u}
                      groups={groups}
                      savingKeys={savingKeys}
                      bulkBusy={bulkKey}
                      onToggle={toggle}
                      onBulk={setClientAccess}
                    />
                  )}
                </section>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <Link className="btn ghost sm" to="/">← Volver al inicio</Link>
        </div>
      </div>
    </>
  );
}

function PermissionsPanel({
  user,
  groups,
  savingKeys,
  bulkBusy,
  onToggle,
  onBulk,
}: {
  user: UserPublic;
  groups: ProductGroup[];
  savingKeys: Set<string>;
  bulkBusy: string | null;
  onToggle: (u: UserPublic, moduleId: number, unlocked: boolean) => void;
  onBulk: (u: UserPublic, client: Client, modules: CatalogModule[], unlocked: boolean) => void;
}) {
  const hasAny = groups.some((g) => g.clients.some((c) => c.modules.length > 0));
  return (
    <div style={{ borderTop: '1px solid var(--line)', padding: '16px 18px', display: 'grid', gap: 18, background: 'var(--brand-50)' }}>
      {!hasAny ? (
        <span className="tiny muted">Aún no hay módulos configurados. Créalos en Administración · Módulos.</span>
      ) : (
        groups.map((g) => (
          <div key={g.slug} style={{ display: 'grid', gap: 10 }}>
            <div className="tiny" style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--ink-500)' }}>
              {g.name}
            </div>
            {g.clients.map(({ client, modules }) => {
              const unlockedCount = modules.filter((m) => user.unlockedModules.includes(m.id)).length;
              const allOn = modules.length > 0 && unlockedCount === modules.length;
              const busy = bulkBusy === `${user.id}:${client.id}`;
              return (
                <div key={client.id} className="card" style={{ padding: '12px 14px', display: 'grid', gap: 10, background: '#fff' }}>
                  <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{client.name}</div>
                      <div className="tiny muted">{modules.length ? `${unlockedCount} de ${modules.length} habilitados` : 'Sin módulos'}</div>
                    </div>
                    {modules.length > 0 && (
                      <div className="row" style={{ gap: 6 }}>
                        <button className="btn sm" disabled={busy || allOn} onClick={() => onBulk(user, client, modules, true)}>
                          {busy ? 'Guardando…' : 'Habilitar todo'}
                        </button>
                        <button className="btn sm" disabled={busy || unlockedCount === 0} onClick={() => onBulk(user, client, modules, false)}>
                          Quitar todo
                        </button>
                      </div>
                    )}
                  </div>
                  {modules.length > 0 && (
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 8 }}>
                      {modules.map((m) => {
                        const on = user.unlockedModules.includes(m.id);
                        const saving = savingKeys.has(`${user.id}:${m.id}`) || busy;
                        return (
                          <label
                            key={m.id}
                            className="row"
                            style={{
                              gap: 8,
                              alignItems: 'center',
                              padding: '8px 10px',
                              border: `1px solid ${on ? 'var(--brand-300, #c7d2fe)' : 'var(--line)'}`,
                              borderRadius: 10,
                              cursor: saving ? 'default' : 'pointer',
                              background: on ? 'var(--brand-50)' : '#fff',
                              opacity: saving ? 0.6 : 1,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={on}
                              disabled={saving}
                              onChange={(e) => onToggle(user, m.id, e.target.checked)}
                              style={{ width: 16, height: 16, cursor: 'inherit' }}
                            />
                            <span className="tiny" style={{ fontWeight: 600 }}>{m.title}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}
