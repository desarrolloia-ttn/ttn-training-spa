import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useAssistant } from '../context/AssistantContext';
import { sendChat, type ApiChatMessage } from '../lib/api';
import { BookIcon, DocIcon, QuizIcon, SendIcon, SparkRichIcon, TargetIcon, XIcon } from '../icons';

type Role = 'ai' | 'me';

interface Message {
  id: number;
  role: Role;
  text: string;
  pending?: boolean;
}

const SUGGESTIONS = [
  { q: 'Resume los puntos clave de este módulo', icon: <BookIcon /> },
  { q: 'Hazme una pregunta de práctica', icon: <QuizIcon /> },
  { q: '¿Qué documento debo leer primero?', icon: <DocIcon /> },
] as const;

const GREETING: Message = {
  id: 0,
  role: 'ai',
  text:
    'Hola Ana 👋 Soy tu asistente de capacitación. Puedo resolver dudas del módulo, resumir la documentación o prepararte para la evaluación. ¿En qué te ayudo?',
};

export function Assistant() {
  const { isOpen, close, context, detail } = useAssistant();
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    if (!isOpen) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 250);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [close]);

  const ask = (question: string): void => {
    // Historial de la conversación hasta ahora (sin el marcador "escribiendo…").
    const history: ApiChatMessage[] = messages
      .filter((m) => !m.pending)
      .map((m) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }));

    const userId = nextId.current++;
    const placeholderId = nextId.current++;
    setMessages((prev) => [
      ...prev,
      { id: userId, role: 'me', text: question },
      { id: placeholderId, role: 'ai', text: 'escribiendo…', pending: true },
    ]);

    const resolve = (text: string) =>
      setMessages((prev) => prev.map((m) => (m.id === placeholderId ? { ...m, text, pending: false } : m)));

    // El detalle (lección actual) es más rico que la etiqueta; se prefiere para la IA.
    sendChat(question, detail || context, history)
      .then(({ reply }) => resolve(reply))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'No se pudo contactar al asistente.';
        resolve(`⚠️ ${msg}`);
      });
  };

  const submit = (): void => {
    const v = draft.trim();
    if (!v) return;
    setDraft('');
    ask(v);
  };

  const onInputKey = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') submit();
  };

  const hasUserAsked = messages.some((m) => m.role === 'me');

  return (
    <>
      <div className={`ai-overlay${isOpen ? ' open' : ''}`} onClick={close} />
      <aside className={`ai-panel${isOpen ? ' open' : ''}`} aria-hidden={!isOpen}>
        <div className="ai-head">
          <div className="ai-ic">
            <SparkRichIcon />
          </div>
          <div>
            <h4>Asistente Capacita+</h4>
            <p>IA de apoyo al aprendizaje</p>
          </div>
          <button className="x" aria-label="Cerrar" onClick={close}>
            <XIcon />
          </button>
        </div>
        <div className="ai-ctx">
          <TargetIcon />
          <span>Contexto: {context}</span>
        </div>
        <div className="ai-body" ref={bodyRef}>
          {messages.map((m) => (
            <div className={`msg ${m.role}`} key={m.id}>
              <div className="who">
                {m.role === 'ai' ? (
                  <>
                    <SparkRichIcon /> Asistente
                  </>
                ) : (
                  'Tú'
                )}
              </div>
              <div className="bub">
                {m.pending ? (
                  <span style={{ opacity: 0.5 }}>{m.text}</span>
                ) : (
                  m.text.split('\n').map((line, i, arr) => (
                    <span key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))
                )}
              </div>
            </div>
          ))}
          {!hasUserAsked && (
            <div className="ai-sugg">
              {SUGGESTIONS.map((s) => (
                <button key={s.q} onClick={() => ask(s.q)}>
                  {s.icon}
                  <span>{s.q}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="ai-foot">
          <div className="ai-input">
            <input
              ref={inputRef}
              type="text"
              placeholder="Escríbele al asistente…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onInputKey}
            />
            <button className="send" aria-label="Enviar" onClick={submit}>
              <SendIcon />
            </button>
          </div>
          <div className="hint">La IA puede cometer errores. Verifica la información importante.</div>
        </div>
      </aside>
    </>
  );
}

export function AssistantFab() {
  const { open } = useAssistant();
  return (
    <button className="fab" onClick={open}>
      <SparkRichIcon />
      <span>Asistente IA</span>
    </button>
  );
}
