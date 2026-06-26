import type { Section } from './shared';
import { products as productsHooks, customers as customersHooks, categories as categoriesHooks } from '../../hooks/queries';
import { fmtNum } from './shared';

export function Dashboard({ onNav }: { onNav: (s: Section) => void }) {
  // Live counts from the API (fall back to mock-backed cache).
  const { data: products } = productsHooks.useList();
  const { data: customers } = customersHooks.useList();
  const { data: categories } = categoriesHooks.useList();

  const count = (v?: unknown[]) => (v ? fmtNum(v.length) : '–');

  const dashStats = [
    { icon: '🏷️', value: count(products), label: 'محصول', color: '#e8a94c', glow: 'rgba(232,169,76,.25)' },
    { icon: '👥', value: count(customers), label: 'مشتری', color: '#38bdf8', glow: 'rgba(56,189,248,.22)' },
    { icon: '📦', value: '۲', label: 'انبار تعریف‌شده', color: '#4ade80', glow: 'rgba(74,222,128,.22)' },
    { icon: '🤝', value: '۲۳', label: 'تامین‌کننده', color: '#a78bfa', glow: 'rgba(167,139,250,.22)' },
    { icon: '📂', value: count(categories), label: 'دسته‌بندی', color: '#fb923c', glow: 'rgba(251,146,60,.22)' },
    { icon: '📋', value: '–', label: 'سفارش (WC)', color: '#f472b6', glow: 'rgba(244,114,182,.2)' },
    { icon: '👤', value: '۵', label: 'کاربر فعال', color: '#22d3ee', glow: 'rgba(34,211,238,.2)' },
    { icon: '🏢', value: '۱', label: 'کسب‌وکار', color: '#94a3b8', glow: 'rgba(148,163,184,.18)' },
  ];

  const quickActions: { icon: string; label: string; sec: Section }[] = [
    { icon: '🔗', label: 'تنظیم اتصال ووکامرس', sec: 'woocommerce' },
    { icon: '🏷️', label: 'مدیریت محصولات', sec: 'products' },
    { icon: '👥', label: 'مدیریت مشتریان', sec: 'customers' },
    { icon: '🏢', label: 'اطلاعات شرکت', sec: 'company' },
    { icon: '👤', label: 'کاربران و دسترسی‌ها', sec: 'users' },
  ];

  const checklist = [
    { label: 'اطلاعات شرکت', status: 'تکمیل شده', icon: '✅', done: true },
    { label: 'اتصال ووکامرس', status: 'در انتظار', icon: '⏳', done: false },
    { label: 'تعریف انبار', status: 'تکمیل شده', icon: '✅', done: true },
    { label: 'محصولات', status: 'در انتظار WC', icon: '⏳', done: false },
    { label: 'تنظیمات مالیاتی', status: 'در انتظار', icon: '⏳', done: false },
    { label: 'کاربران', status: 'تکمیل شده', icon: '✅', done: true },
  ];

  return (
    <div style={{ animation: 'fadeSlide .3s ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 11, marginBottom: 14 }}>
        {dashStats.map(ds => (
          <div key={ds.label} style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 16, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 64, height: 64, background: ds.glow, filter: 'blur(24px)', transform: 'translate(12px,-18px)', pointerEvents: 'none' }} />
            <div style={{ fontSize: 20, marginBottom: 7 }}>{ds.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: ds.color, lineHeight: 1, marginBottom: 4, fontVariantNumeric: 'tabular-nums', letterSpacing: -1 }}>{ds.value}</div>
            <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{ds.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 14 }}>
        <div style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ height: 3, background: 'rgba(255,255,255,.06)' }} />
          <div style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#f0f4ff' }}>وضعیت ووکامرس</div>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444' }}>قطع</span>
            </div>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ fontSize: 26, marginBottom: 7, opacity: .35 }}>🔗</div>
              <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 11px', lineHeight: 1.7 }}>ووکامرس را متصل کنید تا<br />داده‌ها خودکار دریافت شوند.</p>
              <button onClick={() => onNav('woocommerce')} style={{ background: 'rgba(232,169,76,.1)', border: '1px solid rgba(232,169,76,.28)', color: '#e8a94c', padding: '6px 13px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>تنظیم اتصال ←</button>
            </div>
          </div>
        </div>

        <div style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#f0f4ff', marginBottom: 12 }}>اقدام سریع</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {quickActions.map(qa => (
              <button key={qa.sec} onClick={() => onNav(qa.sec)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.055)', borderRadius: 8, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif", color: '#b8c0cc', fontSize: 12, fontWeight: 600, textAlign: 'right', width: '100%' }}>
                <span style={{ fontSize: 15, flexShrink: 0 }}>{qa.icon}</span>
                <span style={{ flex: 1 }}>{qa.label}</span>
                <span style={{ fontSize: 10, color: '#374151' }}>←</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#f0f4ff', marginBottom: 12 }}>چک‌لیست راه‌اندازی</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {checklist.map(cl => (
            <div key={cl.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: cl.done ? 'rgba(74,222,128,.05)' : 'rgba(255,255,255,.03)', border: `1px solid ${cl.done ? 'rgba(74,222,128,.15)' : 'rgba(255,255,255,.06)'}`, borderRadius: 9 }}>
              <span style={{ fontSize: 13, flexShrink: 0 }}>{cl.icon}</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: cl.done ? '#4ade80' : '#e8edf5' }}>{cl.label}</div>
                <div style={{ fontSize: 9, color: '#6b7280', marginTop: 1 }}>{cl.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
