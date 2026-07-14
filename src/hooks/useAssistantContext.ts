import { useEffect } from 'react';
import { useAssistant } from '../context/AssistantContext';

/** Fija la etiqueta de contexto de la pantalla y limpia el detalle de lección. */
export function useAssistantContext(ctx: string): void {
  const { setContext, setDetail } = useAssistant();
  useEffect(() => {
    setContext(ctx);
    setDetail('');
  }, [ctx, setContext, setDetail]);
}
