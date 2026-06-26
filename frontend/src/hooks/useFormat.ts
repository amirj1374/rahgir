/** Shared Persian number / currency formatting hook */
export function useFormat() {
  const num  = (n: number) => n.toLocaleString('fa-IR');
  const mil  = (n: number) => (Math.abs(n) / 1_000_000).toFixed(1) + 'M';
  const pct  = (n: number) => n.toLocaleString('fa-IR') + '٪';
  return { num, mil, pct } as const;
}

/** Standalone helpers (use when hook is overkill) */
export const fmtNum = (n: number) => n.toLocaleString('fa-IR');
export const fmtMil = (n: number) => (Math.abs(n) / 1_000_000).toFixed(1) + 'M';
