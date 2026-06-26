/** Design tokens — single source of truth for all colours, radii, and shadows */

export const COLOR = {
  // Base
  bg:        '#060a13',
  surface:   '#0a1120',
  surfaceAlt:'#0d1320',
  border:    'rgba(255,255,255,.06)',
  borderMid: 'rgba(255,255,255,.10)',

  // Text
  textPrimary:   '#f0f4ff',
  textSecondary: '#e8edf5',
  textMuted:     '#8892a4',
  textFaint:     '#64748b',
  textGhost:     '#374151',

  // Brand / accent
  gold:    '#e8a94c',
  goldDim: 'rgba(232,169,76,.1)',

  // Semantic
  green:   '#4ade80',
  greenDim:'rgba(74,222,128,.1)',
  red:     '#ef4444',
  redDim:  'rgba(239,68,68,.1)',
  yellow:  '#f59e0b',
  yellowDim:'rgba(245,158,11,.1)',
  blue:    '#38bdf8',
  blueDim: 'rgba(56,189,248,.1)',
  purple:  '#a78bfa',
  purpleDim:'rgba(167,139,250,.1)',
  orange:  '#fb923c',
  orangeDim:'rgba(251,146,60,.1)',
  cyan:    '#22d3ee',
  cyanDim: 'rgba(34,211,238,.1)',
  pink:    '#f472b6',

  // Module accent colours
  module: {
    sales:      '#f43f5e',
    inventory:  '#4ade80',
    crm:        '#38bdf8',
    accounting: '#a78bfa',
    reports:    '#fb923c',
    suppliers:  '#22d3ee',
    basedata:   '#e8a94c',
  },
} as const;

export const RADIUS = {
  sm:  6,
  md:  8,
  lg:  12,
  xl:  16,
  full: 9999,
} as const;

export const FONT = {
  family: "'Vazirmatn', sans-serif",
  xs:   10,
  sm:   11,
  base: 13,
  md:   14,
  lg:   16,
  xl:   20,
  xxl:  24,
} as const;

/** Common inline-style presets */
export const CARD: React.CSSProperties = {
  background: COLOR.surface,
  border: `1px solid ${COLOR.border}`,
  borderRadius: RADIUS.lg,
};

export const INPUT: React.CSSProperties = {
  background: COLOR.surfaceAlt,
  border: `1px solid ${COLOR.borderMid}`,
  borderRadius: RADIUS.md,
  color: COLOR.textSecondary,
  padding: '8px 12px',
  fontFamily: FONT.family,
  fontSize: FONT.base,
  width: '100%',
  outline: 'none',
};

export const TABLE_HEADER: React.CSSProperties = {
  background: COLOR.surfaceAlt,
};

export const TABLE_TH: React.CSSProperties = {
  padding: '11px 14px',
  textAlign: 'right' as const,
  fontSize: FONT.xs + 2,
  color: COLOR.textFaint,
  fontWeight: 600,
  borderBottom: `1px solid ${COLOR.border}`,
};

export const TABLE_TD: React.CSSProperties = {
  padding: '11px 14px',
  fontSize: FONT.base,
  borderBottom: `1px solid rgba(255,255,255,.03)`,
};
