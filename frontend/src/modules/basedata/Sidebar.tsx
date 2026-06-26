import { memo } from 'react';
import type { Section } from './shared';
import { useAuth } from '../../auth/AuthContext';

function SidebarInner({ sec, onNav }: { sec: Section; onNav: (s: Section) => void }) {
  const { has, hasFeature, user, logout } = useAuth();
  const item = (id: Section, icon: string, label: string, badge?: string, bbg?: string, bc?: string) => (
    <button
      key={id}
      onClick={() => onNav(id)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
        borderRadius: 8, border: 'none', cursor: 'pointer',
        background: sec === id ? 'rgba(232,169,76,.09)' : 'transparent',
        fontFamily: "'Vazirmatn',sans-serif", fontSize: 12.5,
        fontWeight: sec === id ? 700 : 500,
        color: sec === id ? '#e8a94c' : '#8892a4',
        textAlign: 'right', marginBottom: 1,
      }}
    >
      <span style={{ fontSize: 14, width: 17, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge && (
        <span style={{ background: bbg || 'rgba(255,255,255,.08)', color: bc || '#8892a4', fontSize: 9, padding: '1px 6px', borderRadius: 20, fontWeight: 800 }}>
          {badge}
        </span>
      )}
    </button>
  );

  const accessItems = [
    has('USER_MANAGE') ? item('users', '👤', 'کاربران') : null,
    has('ROLE_MANAGE') ? item('roles', '🔑', 'نقش‌ها و دسترسی‌ها') : null,
  ].filter(Boolean);

  const groups = [
    { label: 'داشبورد', items: [item('dashboard', '🏠', 'پیشخوان')] },
    { label: 'تنظیمات کسب‌وکار', items: [
      item('company', '🏢', 'اطلاعات شرکت'),
      item('warehouses', '🏭', 'انبارها', '۲'),
    ]},
    { label: 'داده‌های پایه', items: [
      item('products', '🏷️', 'محصولات'),
      item('categories', '📂', 'دسته‌بندی‌ها'),
      item('customers', '👥', 'مشتریان'),
      item('suppliers', '🤝', 'تامین‌کنندگان', '۲۳'),
    ]},
    { label: 'تنظیمات مالی', items: [
      item('units', '📐', 'واحدها'),
      item('tax', '💹', 'تنظیمات مالیاتی'),
    ]},
    ...(accessItems.length ? [{ label: 'مدیریت دسترسی', items: accessItems }] : []),
    ...(hasFeature('WOOCOMMERCE') ? [{ label: 'یکپارچه‌سازی', items: [
      item('woocommerce', '🔗', 'ووکامرس'),
    ]}] : []),
  ];

  return (
    <aside style={{ width: 244, flexShrink: 0, background: '#070d1a', borderLeft: '1px solid rgba(255,255,255,.05)', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <div style={{ padding: '15px 14px', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#e8a94c,#f5c842)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 900, color: '#060a13', flexShrink: 0 }}>B</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#f0f4ff', letterSpacing: '-.3px' }}>بیزنس‌کور</div>
          <div style={{ fontSize: 10, color: '#e8a94c', fontWeight: 700 }}>ماژول اطلاعات پایه</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '8px 6px', overflowY: 'auto' }}>
        {groups.map(g => (
          <div key={g.label} style={{ marginBottom: 2 }}>
            <div style={{ fontSize: 9, color: '#1f2937', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', padding: '9px 10px 4px' }}>{g.label}</div>
            {g.items}
          </div>
        ))}
      </nav>

      <div style={{ padding: '11px 12px', borderTop: '1px solid rgba(255,255,255,.05)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 29, height: 29, background: 'rgba(232,169,76,.15)', border: '1.5px solid rgba(232,169,76,.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#e8a94c', flexShrink: 0 }}>
          {(user?.fullName || user?.username || '؟').charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#e8edf5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.fullName || user?.username}</div>
          <div style={{ fontSize: 9, color: '#e8a94c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.roleName} · {user?.tenantName}</div>
        </div>
        <button onClick={logout} title="خروج" style={{ background: 'none', border: 'none', fontSize: 14, color: '#64748b', cursor: 'pointer' }}>⎋</button>
      </div>
    </aside>
  );
}

export const Sidebar = memo(SidebarInner);
