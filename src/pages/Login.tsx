import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogoIcon } from '../icons';

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid var(--line)',
  borderRadius: 10,
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

export function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(username.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(135deg,#0E2A63,#1457D6)',
        padding: 20,
        overflowY: 'auto',
      }}
    >
      <div className="card" style={{ width: 380, maxWidth: '100%', padding: 32 }}>
        <div className="row" style={{ gap: 12, marginBottom: 22, alignItems: 'center' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--brand-50, #E6F3FD)',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--brand-600)',
            }}
          >
            <LogoIcon />
          </div>
          <div>
            <div style={{ fontFamily: "'Sora'", fontWeight: 800, fontSize: 18, color: 'var(--ink-900)' }}>
              Capacitación
            </div>
            <div className="tiny muted">Inicia sesión para continuar</div>
          </div>
        </div>

        <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span className="tiny" style={{ fontWeight: 700, color: 'var(--ink-800)' }}>Usuario</span>
            <input
              style={inputStyle}
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="usuario"
              required
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span className="tiny" style={{ fontWeight: 700, color: 'var(--ink-800)' }}>Contraseña</span>
            <input
              style={inputStyle}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error && (
            <div className="tiny" style={{ color: 'var(--danger-600, #dc2626)', fontWeight: 600 }}>
               {error}
            </div>
          )}

          <button className="btn pri" type="submit" disabled={busy} style={{ justifyContent: 'center', marginTop: 4 }}>
            {busy ? 'Entrando…' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
