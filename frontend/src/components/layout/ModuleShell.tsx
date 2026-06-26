import { memo, type ReactNode } from 'react';
import { COLOR, FONT, RADIUS } from '../../styles/tokens';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

interface SidebarStat {
  label: string;
  value: string;
}

interface ModuleShellProps {
  accent: string;
  icon: string;
  title: string;
  subtitle: string;
  navItems: NavItem[];
  section: string;
  onSection: (s: string) => void;
  onBack: () => void;
  sidebarFooter?: SidebarStat[];
  children: ReactNode;
}

export const ModuleShell = memo(function ModuleShell({
  accent, icon, title, subtitle,
  navItems, section, onSection, onBack,
  sidebarFooter,
  children,
}: ModuleShellProps) {
  return (
    <div style={{ display: 'flex', height: '100vh', background: COLOR.bg, color: COLOR.textSecondary, fontFamily: "'Vazirmatn', sans-serif", direction: 'rtl' }}>
      {/* Sidebar */}
      <aside style={{ width: 224, background: COLOR.surface, borderLeft: `1px solid ${COLOR.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Header */}
        <div style={{ padding: '18px 16px 16px', borderBottom: `1px solid ${COLOR.border}` }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: COLOR.textFaint, cursor: 'pointer', fontSize: FONT.sm, fontFamily: 'inherit', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
            ← بازگشت
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: RADIUS.md, background: accent + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize: FONT.md, fontWeight: 700, color: accent }}>{title}</div>
              <div style={{ fontSize: FONT.xs, color: COLOR.textFaint, marginTop: 1 }}>{subtitle}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {navItems.map(n => (
            <button
              key={n.id}
              onClick={() => onSection(n.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                padding: '9px 11px', borderRadius: RADIUS.md, border: 'none',
                background: section === n.id ? accent + '18' : 'transparent',
                color: section === n.id ? accent : COLOR.textMuted,
                cursor: 'pointer', fontFamily: 'inherit', fontSize: FONT.base,
                marginBottom: 2, textAlign: 'right',
                fontWeight: section === n.id ? 700 : 500,
                transition: 'background .15s, color .15s',
              }}
            >
              <span style={{ fontSize: 15, width: 18, textAlign: 'center', flexShrink: 0 }}>{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer stats */}
        {sidebarFooter && (
          <div style={{ padding: 14, borderTop: `1px solid ${COLOR.border}` }}>
            {sidebarFooter.map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: FONT.xs + 1, color: COLOR.textFaint }}>{s.label}</span>
                <span style={{ fontSize: FONT.base, fontWeight: 600 }}>{s.value}</span>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Content */}
      <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {children}
      </main>
    </div>
  );
});

/** Reusable page header row */
export const PageHeader = memo(function PageHeader({ title, color, action }: { title: string; color: string; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <h2 style={{ margin: 0, fontSize: FONT.xl, fontWeight: 700, color }}>{title}</h2>
      {action && <div style={{ display: 'flex', gap: 8 }}>{action}</div>}
    </div>
  );
});
