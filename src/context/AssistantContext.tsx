import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface AssistantState {
  isOpen: boolean;
  /** Etiqueta corta del contexto, mostrada en el panel. */
  context: string;
  /** Contexto detallado (lección actual, etc.) que se envía a la IA. */
  detail: string;
  open: () => void;
  close: () => void;
  setContext: (ctx: string) => void;
  setDetail: (detail: string) => void;
}

const AssistantCtx = createContext<AssistantState | null>(null);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [context, setContext] = useState('Capacita+');
  const [detail, setDetail] = useState('');

  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  const value = useMemo<AssistantState>(
    () => ({ isOpen, context, detail, open, close, setContext, setDetail }),
    [isOpen, context, detail, open, close],
  );

  return <AssistantCtx.Provider value={value}>{children}</AssistantCtx.Provider>;
}

export function useAssistant(): AssistantState {
  const ctx = useContext(AssistantCtx);
  if (!ctx) throw new Error('useAssistant must be used within AssistantProvider');
  return ctx;
}
