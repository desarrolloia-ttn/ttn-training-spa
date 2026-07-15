import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface AssistantState {
  isOpen: boolean;
  /** Etiqueta corta del contexto, mostrada en el panel. */
  context: string;
  /** Contexto detallado (lección actual, etc.) que se envía a la IA. */
  detail: string;
  /** Módulo actual (para que la IA use el manual correcto). null fuera de un módulo. */
  moduleId: number | null;
  open: () => void;
  close: () => void;
  setContext: (ctx: string) => void;
  setDetail: (detail: string) => void;
  setModuleId: (id: number | null) => void;
}

const AssistantCtx = createContext<AssistantState | null>(null);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [context, setContext] = useState('Capacita+');
  const [detail, setDetail] = useState('');
  const [moduleId, setModuleId] = useState<number | null>(null);

  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  const value = useMemo<AssistantState>(
    () => ({ isOpen, context, detail, moduleId, open, close, setContext, setDetail, setModuleId }),
    [isOpen, context, detail, moduleId, open, close],
  );

  return <AssistantCtx.Provider value={value}>{children}</AssistantCtx.Provider>;
}

export function useAssistant(): AssistantState {
  const ctx = useContext(AssistantCtx);
  if (!ctx) throw new Error('useAssistant must be used within AssistantProvider');
  return ctx;
}
