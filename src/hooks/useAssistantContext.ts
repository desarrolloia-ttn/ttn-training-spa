import { useEffect } from 'react';
import { useAssistant } from '../context/AssistantContext';

/** Fija la etiqueta de contexto de la pantalla y limpia el detalle de lección. */
export function useAssistantContext(ctx: string): void {
  const { setContext, setDetail, setModuleId } = useAssistant();
  useEffect(() => {
    setContext(ctx);
    setDetail('');
    setModuleId(null);
  }, [ctx, setContext, setDetail, setModuleId]);
}
