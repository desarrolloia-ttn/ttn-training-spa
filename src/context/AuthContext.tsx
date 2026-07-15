import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  clearToken,
  getMe,
  getToken,
  login as apiLogin,
  type UserPublic,
} from '../lib/api';

interface AuthState {
  user: UserPublic | null;
  loading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  /** Reemplaza el usuario actual en memoria (p. ej. tras guardar progreso). */
  applyUser: (user: UserPublic) => void;
  /** Refresca el usuario actual desde el backend (p. ej. tras cambios de permisos). */
  refresh: () => Promise<void>;
  /** ¿El usuario actual puede acceder a este módulo? Admin siempre puede. */
  canAccess: (moduleId: number) => boolean;
}

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setUser(await getMe());
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMe();
  }, [loadMe]);

  const login = useCallback(async (username: string, password: string) => {
    setUser(await apiLogin(username, password));
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const applyUser = useCallback((u: UserPublic) => setUser(u), []);

  const refresh = useCallback(async () => {
    try {
      setUser(await getMe());
    } catch {
      // ignorar; una sesión inválida se limpia en el próximo loadMe
    }
  }, []);

  // Refresca permisos en vivo: al volver a la pestaña y periódicamente,
  // para que un (des)bloqueo del admin se refleje sin re-loguear.
  useEffect(() => {
    const onFocus = () => {
      if (getToken()) void refresh();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    const id = window.setInterval(onFocus, 45000);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
      window.clearInterval(id);
    };
  }, [refresh]);

  const canAccess = useCallback(
    (moduleId: number) =>
      !!user && (user.role === 'admin' || user.unlockedModules.includes(moduleId)),
    [user],
  );

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'admin',
      login,
      logout,
      applyUser,
      refresh,
      canAccess,
    }),
    [user, loading, login, logout, applyUser, refresh, canAccess],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
