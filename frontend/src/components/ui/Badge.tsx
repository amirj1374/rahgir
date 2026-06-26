import { memo } from 'react';
import { FONT, RADIUS } from '../../styles/tokens';

interface BadgeProps {
  label: string;
  color: string;
  /** defaults to color at 13% opacity */
  bg?: string;
}

export const Badge = memo(function Badge({ label, color, bg }: BadgeProps) {
  return (
    <span style={{
      display: 'inline-block',
      background: bg ?? color + '22',
      color,
      padding: '3px 10px',
      borderRadius: RADIUS.full,
      fontSize: FONT.xs + 1,
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
});

/** Quick stock-status badge */
export function stockBadge(stock: number) {
  if (stock === 0) return <Badge label="ناموجود" color="#ef4444" />;
  if (stock < 10)  return <Badge label="کم‌موجودی" color="#f59e0b" />;
  return <Badge label="موجود" color="#4ade80" />;
}
