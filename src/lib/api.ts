// Cliente del backend ttn-training-core.

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');

export interface ApiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResult {
  reply: string;
  model: string;
}

/** Envía una pregunta al asistente y devuelve la respuesta del modelo. */
export async function sendChat(
  message: string,
  context: string,
  history: ApiChatMessage[],
): Promise<ChatResult> {
  const res = await fetch(`${API_URL}/api/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context, history }),
  });

  if (!res.ok) {
    let detail = `Error ${res.status}`;
    try {
      const body = (await res.json()) as { detail?: string };
      if (body?.detail) detail = body.detail;
    } catch {
      // respuesta sin cuerpo JSON; se mantiene el mensaje por defecto
    }
    throw new Error(detail);
  }

  return (await res.json()) as ChatResult;
}
