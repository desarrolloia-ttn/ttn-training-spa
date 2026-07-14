import type { SVGProps } from 'react';

type SvgProps = SVGProps<SVGSVGElement>;

const base: SvgProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const HomeIcon = (p: SvgProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M3 10.5L12 3l9 7.5" />
    <path d="M5 9.5V20h14V9.5" />
    <path d="M9.5 20v-6h5v6" />
  </svg>
);

export const ProjIcon = (p: SvgProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 4v5" />
  </svg>
);

export const LearnIcon = (p: SvgProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M3 7l9-4 9 4-9 4-9-4z" />
    <path d="M7 9.5V14c0 1.5 2.5 3 5 3s5-1.5 5-3V9.5" />
    <path d="M21 7v6" />
  </svg>
);

export const CertIcon = (p: SvgProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="9" r="6" />
    <path d="M9 14l-1.5 7L12 19l4.5 2L15 14" />
  </svg>
);

export const ReportIcon = (p: SvgProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 20V4" />
    <path d="M4 20h16" />
    <rect x="7" y="11" width="3" height="6" />
    <rect x="12" y="7" width="3" height="10" />
    <rect x="17" y="13" width="3" height="4" />
  </svg>
);

export const DocsIcon = (p: SvgProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </svg>
);

export const SparkIcon = (p: SvgProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4z" />
  </svg>
);

export const SparkRichIcon = (p: SvgProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4z" />
    <path d="M19 14l.8 2 .2.8 2 .8-2 .8-.2.8-.8 1.6-.8-1.6-.2-.8-2-.8 2-.8.2-.8z" />
  </svg>
);

export const LogoIcon = (p: SvgProps) => (
  <svg viewBox="0 0 24 24" {...base} strokeWidth={2} {...p}>
    <path d="M3 7l9-4 9 4-9 4-9-4z" />
    <path d="M7 9.5V14c0 1.6 2.5 3 5 3s5-1.4 5-3V9.5" />
  </svg>
);

export const SendIcon = (p: SvgProps) => (
  <svg viewBox="0 0 24 24" {...base} strokeWidth={1.9} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const XIcon = (p: SvgProps) => (
  <svg viewBox="0 0 24 24" {...base} strokeWidth={2} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const BookIcon = (p: SvgProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z" />
    <path d="M19 3v16" />
  </svg>
);

export const TargetIcon = (p: SvgProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

export const QuizIcon = (p: SvgProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 015 .2c0 1.8-2.5 2-2.5 3.3" />
    <path d="M12 17h.01" />
  </svg>
);

export const DocIcon = (p: SvgProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </svg>
);

export const SearchIcon = (p: SvgProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4-4" />
  </svg>
);

export const BellIcon = (p: SvgProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" />
    <path d="M10 20a2 2 0 004 0" />
  </svg>
);

export const PlayIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path d="M8 5v14l11-7z" fill="currentColor" />
  </svg>
);
