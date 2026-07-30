import { useEffect, useState } from 'react';
import { getPublishedQuiz, submitQuiz, type QuizPublic, type QuizResult } from '../lib/api';

export function QuizPanel({ moduleId, onCertified }: { moduleId: number; onCertified?: () => void }) {
  const [quiz, setQuiz] = useState<QuizPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setResult(null);
    setError('');
    getPublishedQuiz(moduleId)
      .then((q) => {
        setQuiz(q);
        setAnswers(q ? new Array(q.questions.length).fill(-1) : []);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error al cargar la evaluación'))
      .finally(() => setLoading(false));
  }, [moduleId]);

  if (loading) return <p className="tiny muted">Cargando evaluación…</p>;
  if (error) return <div className="card" style={{ padding: 14, color: 'var(--danger-600)' }}>{error}</div>;
  if (!quiz) return <p className="tiny muted">Este módulo aún no tiene evaluación disponible.</p>;

  const answered = answers.filter((a) => a >= 0).length;
  const allAnswered = answered === quiz.questions.length;

  const send = async () => {
    setError('');
    setSubmitting(true);
    try {
      const r = await submitQuiz(moduleId, answers);
      setResult(r);
      if (r.passed && onCertified) onCertified();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar la evaluación');
    } finally {
      setSubmitting(false);
    }
  };

  const retry = () => {
    setResult(null);
    setAnswers(new Array(quiz.questions.length).fill(-1));
  };

  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
        <h3 style={{ fontSize: 17 }}>Evaluación del módulo</h3>
        <span className="tiny muted">Aprobación: {quiz.passingScore}% · {quiz.questions.length} preguntas</span>
      </div>

      {result && (
        <div
          className="card"
          style={{
            padding: 16,
            marginBottom: 18,
            borderColor: result.passed ? 'var(--ok-600)' : 'var(--danger-600)',
            background: result.passed ? 'var(--ok-50, #ecfdf5)' : 'var(--danger-50, #fef2f2)',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 20, color: result.passed ? 'var(--ok-600)' : 'var(--danger-600)' }}>
            {result.passed ? '¡Aprobado!' : 'No aprobado'} · {result.score}%
          </div>
          <div className="tiny muted" style={{ marginTop: 2 }}>
            {result.correct} de {result.total} correctas · mínimo {result.passingScore}%
          </div>
          {result.passed ? (
            <div className="tiny" style={{ marginTop: 8, color: 'var(--ok-600)', fontWeight: 700 }}>
              Módulo certificado.
            </div>
          ) : (
            <button className="btn sm" style={{ marginTop: 10 }} onClick={retry}>Reintentar</button>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gap: 16, maxWidth: 820 }}>
        {quiz.questions.map((q, qi) => {
          const res = result?.results[qi];
          return (
            <div key={qi} className="card" style={{ padding: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>{qi + 1}. {q.question}</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {q.options.map((opt, oi) => {
                  const chosen = answers[qi] === oi;
                  let tone: React.CSSProperties = {};
                  if (res) {
                    if (oi === res.correctIndex) tone = { borderColor: 'var(--ok-600)', background: 'var(--ok-50, #ecfdf5)' };
                    else if (oi === res.yourIndex) tone = { borderColor: 'var(--danger-600)', background: 'var(--danger-50, #fef2f2)' };
                  }
                  return (
                    <label
                      key={oi}
                      className="row"
                      style={{
                        gap: 10, alignItems: 'flex-start', padding: '9px 12px',
                        border: `1px solid ${chosen && !res ? 'var(--brand-400, #818cf8)' : 'var(--line)'}`,
                        borderRadius: 10, cursor: result ? 'default' : 'pointer', ...tone,
                      }}
                    >
                      <input
                        type="radio"
                        name={`q${qi}`}
                        checked={chosen}
                        disabled={!!result}
                        onChange={() => setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))}
                        style={{ marginTop: 3 }}
                      />
                      <span className="tiny" style={{ fontSize: 14 }}>{opt}</span>
                    </label>
                  );
                })}
              </div>
              {res && res.explanation && (
                <div className="tiny muted" style={{ marginTop: 8 }}>
                  {res.isCorrect ? '' : ''} {res.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!result && (
        <div className="row" style={{ gap: 12, alignItems: 'center', marginTop: 18 }}>
          <button className="btn pri" onClick={send} disabled={!allAnswered || submitting}>
            {submitting ? 'Enviando…' : 'Enviar evaluación'}
          </button>
          <span className="tiny muted">{answered} / {quiz.questions.length} respondidas</span>
        </div>
      )}
    </div>
  );
}
