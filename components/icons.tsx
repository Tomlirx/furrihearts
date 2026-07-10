// Lightweight inline-SVG icon set (Lucide-derived paths, ISC-licensed).
// Uses currentColor so icons inherit text color and theme automatically —
// replaces emoji glyphs that render inconsistently across platforms.
import type { CSSProperties } from 'react';

type IconProps = {
  size?: number;
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
  'aria-hidden'?: boolean;
};

function base(size = 20, strokeWidth = 2) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

export function Bell({ size, className, style, strokeWidth, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} style={style} aria-hidden {...rest}>
      <path d="M10.268 21a2 2 0 0 0 3.464 0" />
      <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
    </svg>
  );
}

export function MessageSquare({ size, className, style, strokeWidth, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} style={style} aria-hidden {...rest}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function X({ size, className, style, strokeWidth, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} style={style} aria-hidden {...rest}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function ChevronLeft({ size, className, style, strokeWidth, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} style={style} aria-hidden {...rest}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function ChevronRight({ size, className, style, strokeWidth, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} style={style} aria-hidden {...rest}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function ArrowLeft({ size, className, style, strokeWidth, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} style={style} aria-hidden {...rest}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

export function ArrowRight({ size, className, style, strokeWidth, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} style={style} aria-hidden {...rest}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function Sun({ size, className, style, strokeWidth, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} style={style} aria-hidden {...rest}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

export function Moon({ size, className, style, strokeWidth, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} style={style} aria-hidden {...rest}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export function Camera({ size, className, style, strokeWidth, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} style={style} aria-hidden {...rest}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

export function Crop({ size, className, style, strokeWidth, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} style={style} aria-hidden {...rest}>
      <path d="M6 2v14a2 2 0 0 0 2 2h14" />
      <path d="M18 22V8a2 2 0 0 0-2-2H2" />
    </svg>
  );
}

export function Star({ size, className, style, strokeWidth, filled, ...rest }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base(size, strokeWidth)} className={className} style={style} fill={filled ? 'currentColor' : 'none'} aria-hidden {...rest}>
      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z" />
    </svg>
  );
}

export function Search({ size, className, style, strokeWidth, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} style={style} aria-hidden {...rest}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function Sparkles({ size, className, style, strokeWidth, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} style={style} aria-hidden {...rest}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}

export function Check({ size, className, style, strokeWidth, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} style={style} aria-hidden {...rest}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function Plus({ size, className, style, strokeWidth, ...rest }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className} style={style} aria-hidden {...rest}>
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  );
}

// Brand paw mark — filled beans + pad (not a stroke icon).
export function Paw({ size = 20, className, style, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden {...rest}>
      <ellipse cx="6" cy="11" rx="2" ry="2.6" />
      <ellipse cx="18" cy="11" rx="2" ry="2.6" />
      <ellipse cx="9.7" cy="6.6" rx="1.9" ry="2.4" />
      <ellipse cx="14.3" cy="6.6" rx="1.9" ry="2.4" />
      <path d="M12 12.5c-2.6 0-4.7 2-4.7 4.2 0 1.7 1.3 2.8 3 2.8.9 0 1.3-.3 1.7-.3s.8.3 1.7.3c1.7 0 3-1.1 3-2.8 0-2.2-2.1-4.2-4.7-4.2z" />
    </svg>
  );
}
