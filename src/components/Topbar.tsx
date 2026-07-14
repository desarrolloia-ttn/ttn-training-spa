import type { ReactNode } from 'react';
import { BellIcon, SearchIcon } from '../icons';

interface Props {
  crumb: ReactNode;
  searchPlaceholder?: string;
  right?: ReactNode;
}

export function Topbar({ crumb, searchPlaceholder = 'Buscar proyectos, módulos o documentos…', right }: Props) {
  return (
    <header className="topbar">
      <div className="crumb">{crumb}</div>
      <div className="top-spacer" />
      {right ?? (
        <>
          <div className="search">
            <SearchIcon />
            <input placeholder={searchPlaceholder} />
          </div>
          <button className="icon-btn" aria-label="Notificaciones">
            <span className="dot" />
            <BellIcon />
          </button>
        </>
      )}
    </header>
  );
}
