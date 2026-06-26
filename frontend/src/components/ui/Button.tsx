import { memo, type ButtonHTMLAttributes } from 'react';
import { RADIUS, FONT } from '../../styles/tokens';

type Variant = 'primary' | 'ghost' | 'tinted';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { padding: '4px 12px', fontSize: FONT.xs + 1 },
  md: { padding: '8px 18px', fontSize: FONT.base },
  lg: { padding: '11px 26px', fontSize: FONT.md },
};

export const Button = memo(function Button({ variant = 'tinted', color = '#e8a94c', size = 'md', style, children, ...rest }: ButtonProps) {
  const base: React.CSSProperties = {
    borderRadius: RADIUS.md,
    fontFamily: "'Vazirmatn', sans-serif",
    cursor: 'pointer',
    fontWeight: 600,
    border: 'none',
    ...sizes[size],
  };

  const variants: Record<Variant, React.CSSProperties> = {
    primary: { background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: '#060a13', border: 'none' },
    ghost:   { background: 'rgba(255,255,255,.04)', color: '#8892a4', border: '1px solid rgba(255,255,255,.07)' },
    tinted:  { background: color + '22', color, border: `1px solid ${color}44` },
  };

  return (
    <button style={{ ...base, ...variants[variant], ...style }} {...rest}>
      {children}
    </button>
  );
});
