import type { ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Requiere sesión iniciada; si no, redirige a /login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Requiere rol admin; si no, redirige al inicio. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

/** Requiere acceso al módulo de la ruta (:moduleId); si no, vuelve al producto. */
export function RequireModuleRoute({ children }: { children: ReactNode }) {
  const { canAccess, loading } = useAuth();
  const { moduleId } = useParams();
  if (loading) return null;
  const id = Number(moduleId);
  if (!Number.isFinite(id) || !canAccess(id)) return <Navigate to="/proyecto/biowel" replace />;
  return <>{children}</>;
}
