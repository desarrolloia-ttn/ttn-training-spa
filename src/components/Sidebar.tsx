import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ProjIcon,
  LearnIcon,
  CertIcon,
  ReportIcon,
  DocsIcon,
  SparkIcon,
  LogoIcon,
} from '../icons';
import { useAssistant } from '../context/AssistantContext';
import type { ReactNode } from 'react';

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

const groups: Group[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', to: '/', icon: <HomeIcon />, match: /^\/$/ },
      { label: 'Proyectos', to: '/proyectos', icon: <ProjIcon />, badge: '4', match: /^\/proyectos?($|\/)/ },
      { label: 'Mi aprendizaje', to: '/proyecto/biowel', icon: <LearnIcon /> },
    ],
  },
  {
    title: 'Logros',
    items: [{ label: 'Certificados', to: '/certificados', icon: <CertIcon />, badge: '5' }],
  },
  {
    title: 'Gestión',
    items: [
      { label: 'Documentación', to: '/modulo#docs', icon: <DocsIcon /> },
      { label: 'Reportes', to: '#', icon: <ReportIcon /> },
    ],
  },
];

export function Sidebar() {
  const { open } = useAssistant();
  const { pathname } = useLocation();

  return (
    <aside className="sidebar">
      <a className="logo" href="/">
        <span className="mk">
          <LogoIcon />
        </span>
        <b>
          Capacitacion
        </b>
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

      <button
        type="button"
        className="ai-cta"
        onClick={open}
        style={{ background: 'none', border: 0, textAlign: 'left', cursor: 'pointer', width: '100%' }}
      >
        <div className="t">
          <SparkIcon />
          <span>Asistente IA</span>
        </div>
        <p>Resuelve dudas y prepárate para tus evaluaciones.</p>
      </button>

      <div className="me-row">
        <div className="av">AM</div>
        <div>
          <div className="nm">Ana Martínez</div>
          <div className="rl">Profesional · Enfermería</div>
        </div>
      </div>
    </aside>
  );
}
