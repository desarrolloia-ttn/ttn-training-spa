import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  ProjIcon,
  LearnIcon,
  CertIcon,
  LogoIcon,
} from '../icons';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ClientsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21V8l9-5 9 5v13" />
    <path d="M9 21v-6h6v6" />
    <path d="M3 21h18" />
  </svg>
);

const ModulesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const LessonsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5M21 12H9" />
  </svg>
);

interface Item {
  label: string;
  to: string;
  icon: ReactNode;
  badge?: string;
  match?: RegExp;
}

interface Group {
  title: string;
  items: Item[];
}

export function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const groups: Group[] = [
    {
      title: 'Principal',
      items: [
        { label: 'Dashboard', to: '/', icon: <HomeIcon />, match: /^\/$/ },
        { label: 'Proyectos', to: '/proyectos', icon: <ProjIcon />, match: /^\/proyectos?($|\/)/ },
        { label: 'Mi aprendizaje', to: '/proyecto/biowel', icon: <LearnIcon /> },
      ],
    },
    {
      title: 'Logros',
      items: [{ label: 'Certificados', to: '/certificados', icon: <CertIcon /> }],
    },
  ];

  if (isAdmin) {
    groups.push({
      title: 'Administración',
      items: [
        { label: 'Usuarios', to: '/usuarios', icon: <UsersIcon />, match: /^\/usuarios/ },
        { label: 'Clientes', to: '/admin/clientes', icon: <ClientsIcon />, match: /^\/admin\/clientes/ },
        { label: 'Módulos', to: '/admin/modulos', icon: <ModulesIcon />, match: /^\/admin\/modulos/ },
        { label: 'Lecciones', to: '/admin/lecciones', icon: <LessonsIcon />, match: /^\/admin\/lecciones/ },
      ],
    });
  }

  const initials = (user?.name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const roleLabel = user?.role === 'admin' ? 'Administrador' : 'Profesional';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar">
      <a className="logo" href="/">
        <span className="mk">
          <LogoIcon />
        </span>
        <b>Capacitacion</b>
      </a>

      <div className="sb-scroll" style={{ flex: 1 }}>
        {groups.map((g) => (
          <div className="nav-group" key={g.title}>
            <div className="lbl">{g.title}</div>
            {g.items.map((it) => {
              const isActive = it.match ? it.match.test(pathname) : pathname === it.to;
              return (
                <NavLink
                  key={it.label}
                  to={it.to}
                  className={`nav-item${isActive ? ' active' : ''}`}
                  end={it.to === '/'}
                >
                  {it.icon}
                  <span>{it.label}</span>
                  {it.badge && <span className="badge">{it.badge}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      <div className="me-row">
        <div className="av">{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="nm">{user?.name ?? 'Invitado'}</div>
          <div className="rl">{roleLabel}</div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--ink-500)', display: 'grid', placeItems: 'center', padding: 6 }}
        >
          <LogoutIcon />
        </button>
      </div>
    </aside>
  );
}
