import { memo } from 'react';
import { COLOR, FONT, RADIUS } from '../../styles/tokens';

interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  color?: string;
  /** Optional trend text e.g. "+12٪" */
  trend?: string;
  trendUp?: boolean;
}

export const StatCard = memo(function StatCard({ icon, value, label, color = COLOR.gold, trend, trendUp }: StatCardProps) {
  return (
    <div style={{
      background: COLOR.surface,
      border: `1px solid ${COLOR.border}`,
      borderRadius: RADIUS.lg,
      padding: '18px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 64, height: 64,
        background: color + '44',
        filter: 'blur(28px)',
        transform: 'translate(12px,-18px)',
        pointerEvents: 'none',
      }} />
      <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: FONT.xxl, fontWeight: 900, color, lineHeight: 1, marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      <div style={{ fontSize: FONT.sm, color: COLOR.textMuted, fontWeight: 600 }}>{label}</div>
      {trend != null && (
        <div style={{ fontSize: FONT.xs + 1, color: trendUp ? COLOR.green : COLOR.red, marginTop: 4 }}>{trend}</div>
      )}
    </div>
  );
});
