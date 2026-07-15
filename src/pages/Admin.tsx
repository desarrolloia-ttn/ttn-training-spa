import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Topbar } from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import { BIOWEL_MODULES } from '../data/products';
import {
  createUser,
  deleteUser,
  listUsers,
  setModuleAccess,
  updateUser,
  type Role,
  type UserPublic,
} from '../lib/api';

const MODULES = BIOWEL_MODULES.map((m) => ({ id: m.id, title: m.title }));
const COLS = 3 + MODULES.length; // Usuario + Rol + módulos + Acciones

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

export function Admin() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<UserPublic[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Alta de usuario
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [formOk, setFormOk] = useState('');
  const [creating, setCreating] = useState(false);

  // Edición en línea
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', role: 'usuario' as Role, password: '' });
  const [editError, setEditError] = useState('');
  const [rowBusy, setRowBusy] = useState<string | null>(null);

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error al cargar usuarios'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q),
    );
  }, [users, search]);

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
    setSavingKey(key);
    try {
      const updated = await setModuleAccess(u.id, moduleId, unlocked);
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar el acceso');
    } finally {
      setSavingKey(null);
    }
  };

  const startEdit = (u: UserPublic) => {
    setEditError('');
    setEditingId(u.id);
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
          <p>Registra, edita, elimina usuarios y controla el acceso a cada módulo. Los administradores tienen acceso a todo.</p>
        </section>

        {error && (
          <div className="card" style={{ padding: 14, marginBottom: 16, color: 'var(--danger-600)' }}>⚠️ {error}</div>
        )}

        {/* Alta */}
        <section className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>Registrar usuario</h3>
          <p className="tiny muted" style={{ margin: '0 0 14px' }}>
            El usuario nace con todos los módulos bloqueados; habilítalos abajo.
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
          {formError && <div className="tiny" style={{ color: 'var(--danger-600)', fontWeight: 600, marginTop: 10 }}>⚠️ {formError}</div>}
          {formOk && <div className="tiny" style={{ color: 'var(--ok-600)', fontWeight: 600, marginTop: 10 }}>✓ {formOk}</div>}
        </section>

        {/* Búsqueda */}
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
          <input
            style={{ ...fieldStyle, maxWidth: 320 }}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍  Buscar por nombre o usuario…"
          />
          <span className="tiny muted">{filtered.length} de {users.length} usuarios</span>
        </div>

        {loading ? (
          <div className="card" style={{ padding: 20 }}>Cargando usuarios…</div>
        ) : (
          <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                <thead>
                  <tr style={{ background: 'var(--brand-50)', textAlign: 'left' }}>
                    <th style={thStyle}>Usuario</th>
                    <th style={thStyle}>Rol</th>
                    {MODULES.map((m) => (
                      <th key={m.id} style={{ ...thStyle, textAlign: 'center' }}>{m.title}</th>
                    ))}
                    <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={COLS} style={{ ...tdStyle, textAlign: 'center', color: 'var(--ink-500)' }}>Sin resultados</td></tr>
                  )}
                  {filtered.map((u) => {
                    const isAdmin = u.role === 'admin';
                    const isSelf = u.id === me?.id;
                    const busy = rowBusy === u.id;
                    return (
                      <FragmentRow key={u.id}>
                        <tr style={{ borderTop: '1px solid var(--line)' }}>
                          <td style={tdStyle}>
                            <div style={{ fontWeight: 700, color: 'var(--ink-900)' }}>{u.name}{isSelf && <span className="tiny muted"> (tú)</span>}</div>
                            <div className="tiny muted">@{u.username}</div>
                          </td>
                          <td style={tdStyle}><span className={`chip${isAdmin ? ' brand' : ''}`}>{isAdmin ? 'Admin' : 'Usuario'}</span></td>
                          {isAdmin ? (
                            <td style={{ ...tdStyle, textAlign: 'center' }} colSpan={MODULES.length}>
                              <span className="tiny muted">Acceso total a todos los módulos</span>
                            </td>
                          ) : (
                            MODULES.map((m) => {
                              const on = u.unlockedModules.includes(m.id);
                              const key = `${u.id}:${m.id}`;
                              return (
                                <td key={m.id} style={{ ...tdStyle, textAlign: 'center' }}>
                                  <input
                                    type="checkbox"
                                    checked={on}
                                    disabled={savingKey === key}
                                    onChange={(e) => toggle(u, m.id, e.target.checked)}
                                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                                    title={on ? 'Desbloqueado' : 'Bloqueado'}
                                  />
                                </td>
                              );
                            })
                          )}
                          <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <button className="btn sm" disabled={busy} onClick={() => startEdit(u)} style={{ marginRight: 6 }}>Editar</button>
                            <button
                              className="btn sm"
                              disabled={busy || isSelf}
                              onClick={() => removeUser(u)}
                              title={isSelf ? 'No puedes eliminar tu propia cuenta' : 'Eliminar'}
                              style={{ color: isSelf ? 'var(--ink-400)' : 'var(--danger-600)' }}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>

                        {editingId === u.id && (
                          <tr>
                            <td colSpan={COLS} style={{ background: 'var(--brand-50)', padding: '14px 16px' }}>
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
                                {editError && <span className="tiny" style={{ color: 'var(--danger-600)', fontWeight: 600 }}>⚠️ {editError}</span>}
                              </div>
                            </td>
                          </tr>
                        )}
                      </FragmentRow>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <div style={{ marginTop: 16 }}>
          <Link className="btn ghost sm" to="/">← Volver al inicio</Link>
        </div>
      </div>
    </>
  );
}

// Agrupa la fila y su editor sin envoltorio extra en el DOM de la tabla.
function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontFamily: "'Sora'",
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '.04em',
  color: 'var(--ink-600, #4b5563)',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: 14,
  verticalAlign: 'middle',
};
