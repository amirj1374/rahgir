import { memo, type ReactNode } from 'react';
import { COLOR, FONT, RADIUS } from '../../styles/tokens';

interface Column<T> {
  key: string;
  header: string;
  width?: string | number;
  render?: (row: T, i: number) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyField?: keyof T;
  emptyText?: string;
}

function DataTableInner<T extends Record<string, unknown>>({
  columns, rows, keyField, emptyText = 'داده‌ای موجود نیست',
}: DataTableProps<T>) {
  return (
    <div style={{ background: COLOR.surface, borderRadius: RADIUS.lg, overflow: 'hidden', border: `1px solid ${COLOR.border}` }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: COLOR.surfaceAlt }}>
            {columns.map(c => (
              <th key={c.key} style={{ padding: '11px 14px', textAlign: 'right', fontSize: FONT.xs + 2, color: COLOR.textFaint, fontWeight: 600, borderBottom: `1px solid ${COLOR.border}`, width: c.width }}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ padding: 28, textAlign: 'center', color: COLOR.textFaint, fontSize: FONT.base }}>{emptyText}</td></tr>
          ) : (
            rows.map((row, i) => (
              <tr key={keyField ? String(row[keyField as string]) : i} style={{ background: i % 2 !== 0 ? 'rgba(255,255,255,.015)' : 'transparent', borderBottom: `1px solid rgba(255,255,255,.03)` }}>
                {columns.map(c => (
                  <td key={c.key} style={{ padding: '11px 14px', fontSize: FONT.base }}>
                    {c.render ? c.render(row, i) : String(row[c.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export const DataTable = memo(DataTableInner) as typeof DataTableInner;
