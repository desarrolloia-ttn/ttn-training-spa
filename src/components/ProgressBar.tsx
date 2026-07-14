import { useEffect, useRef } from 'react';

interface Props {
  value: number;
  ok?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function ProgressBar({ value, ok, className, style }: Props) {
  const ref = useRef<HTMLElement>(null);
  const pct = `${Math.max(0, Math.min(100, value))}%`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.width = '0';
    const raf = requestAnimationFrame(() => {
      el.style.transition = 'width .9s cubic-bezier(.2,.7,.2,1)';
      el.style.width = pct;
    });
    return () => cancelAnimationFrame(raf);
  }, [pct]);

  return (
    <div className={`bar${ok ? ' ok' : ''}${className ? ` ${className}` : ''}`} style={style}>
      <i ref={ref} style={{ width: pct }} />
    </div>
  );
}
