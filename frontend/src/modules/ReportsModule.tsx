import { useState } from 'react';

interface Props { onBack: () => void; }

const O = '#fb923c';

const DAILY = [
  { day: 'ش', val: 42 }, { day: 'ی', val: 68 }, { day: 'د', val: 55 }, { day: 'س', val: 80 },
  { day: 'چ', val: 73 }, { day: 'پ', val: 91 }, { day: 'ج', val: 38 },
];

const TOP_PRODUCTS = [
  { name: 'تی‌شرت مشکی', qty: 124, revenue: 18600000, pct: 85 },
  { name: 'کاپشن قرمز', qty: 87, revenue: 13050000, pct: 62 },
  { name: 'کفش آبی', qty: 65, revenue: 19500000, pct: 55 },
  { name: 'هودی بنفش', qty: 54, revenue: 10800000, pct: 42 },
  { name: 'شلوار سبز', qty: 43, revenue: 8600000, pct: 30 },
];

const CATEGORIES = [
  { name: 'پوشاک', pct: 62, revenue: 58000000 },
  { name: 'کفش', pct: 28, revenue: 26200000 },
  { name: 'لوازم جانبی', pct: 10, revenue: 9300000 },
];

const TOP_CUSTOMERS = [
  { name: 'پخش گاما', orders: 12, revenue: 88000000 },
  { name: 'شرکت آلفا', orders: 9, revenue: 62000000 },
  { name: 'تجارت دلتا', orders: 7, revenue: 38000000 },
  { name: 'فروشگاه بتا', orders: 5, revenue: 21000000 },
];

const STOCK_REPORT = [
  { name: 'تی‌شرت مشکی', total: 65, wh1: 45, wh2: 20, val: 9750000, status: 'موجود' },
  { name: 'تی‌شرت سفید', total: 13, wh1: 8, wh2: 5, val: 1950000, status: 'کم' },
  { name: 'کفش آبی', total: 0, wh1: 0, wh2: 0, val: 0, status: 'ناموجود' },
  { name: 'کاپشن قرمز', total: 32, wh1: 22, wh2: 10, val: 6400000, status: 'موجود' },
  { name: 'شلوار سبز', total: 3, wh1: 3, wh2: 0, val: 600000, status: 'کم' },
];

const MONTHLY = [
  { month: 'فر', rev: 68, cost: 42 }, { month: 'ار', rev: 75, cost: 48 }, { month: 'خر', rev: 82, cost: 52 },
  { month: 'تی', rev: 91, cost: 58 }, { month: 'مر', rev: 88, cost: 54 }, { month: 'شه', rev: 95, cost: 61 },
];

export default function ReportsModule({ onBack }: Props) {
  const [section, setSection] = useState<'sales' | 'inventory' | 'financial'>('sales');

  const fmtN = (n: number) => n.toLocaleString('fa-IR');
  const fmtM = (n: number) => (n / 1000000).toFixed(1) + 'M';

  const navItems = [
    { id: 'sales', label: 'گزارش فروش', icon: '📈' },
    { id: 'inventory', label: 'گزارش انبار', icon: '📦' },
    { id: 'financial', label: 'گزارش مالی', icon: '💰' },
  ];

  const maxDay = Math.max(...DAILY.map(d => d.val));
  const maxMonth = Math.max(...MONTHLY.map(m => Math.max(m.rev, m.cost)));

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#060a13', color: '#e8edf5', fontFamily: 'Vazirmatn', direction: 'rtl' }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: '#0a1120', borderLeft: '1px solid #1a2540', display: 'flex', flexDirection: 'column', padding: '20px 0' }}>
        <div style={{ padding: '0 16px 20px', borderBottom: '1px solid #1a2540' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13 }}>← بازگشت</button>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: O + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📊</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: O }}>گزارشات</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>تحلیل داده</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setSection(n.id as any)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: section === n.id ? O + '18' : 'none', color: section === n.id ? O : '#94a3b8', cursor: 'pointer', fontFamily: 'Vazirmatn', fontSize: 13, marginBottom: 2, textAlign: 'right' }}>
              <span>{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {section === 'sales' && (
          <div>
            <h2 style={{ margin: '0 0 20px', fontSize: 20, color: O }}>گزارش فروش</h2>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
              {[['مجموع فروش', '۴۸۵M', '+۱۴٪'], ['تعداد فاکتور', '۱۸۶', '+۸٪'], ['میانگین سبد', '۲.۶M', '+۵٪'], ['مشتریان جدید', '۲۳', '+۳۱٪']].map(([k, v, ch]) => (
                <div key={k} style={{ background: '#0a1120', borderRadius: 12, padding: '16px 20px', border: '1px solid #1a2540' }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{k}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: O }}>{v}</div>
                  <div style={{ fontSize: 12, color: '#4ade80', marginTop: 4 }}>{ch}</div>
                </div>
              ))}
            </div>
            {/* Bar chart */}
            <div style={{ background: '#0a1120', borderRadius: 12, padding: 24, border: '1px solid #1a2540', marginBottom: 20 }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 14, color: '#94a3b8' }}>فروش ۷ روز گذشته</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
                {DAILY.map(d => (
                  <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{d.val}</div>
                    <div style={{ width: '100%', background: O + '22', borderRadius: '4px 4px 0 0', height: (d.val / maxDay) * 80, border: `1px solid ${O}44`, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflow: 'hidden' }}>
                      <div style={{ width: '100%', height: '100%', background: `linear-gradient(to top, ${O}66, ${O}22)` }} />
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{d.day}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Top products + categories */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, marginBottom: 20 }}>
              <div style={{ background: '#0a1120', borderRadius: 12, padding: 20, border: '1px solid #1a2540' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 14, color: '#94a3b8' }}>محصولات برتر</h3>
                {TOP_PRODUCTS.map(p => (
                  <div key={p.name} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13 }}>{p.name}</span>
                      <span style={{ fontSize: 12, color: '#64748b' }}>{fmtN(p.qty)} عدد</span>
                    </div>
                    <div style={{ height: 6, background: '#0d1320', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: p.pct + '%', background: O, borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{fmtM(p.revenue)}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#0a1120', borderRadius: 12, padding: 20, border: '1px solid #1a2540' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 14, color: '#94a3b8' }}>دسته‌بندی</h3>
                {CATEGORIES.map(c => (
                  <div key={c.name} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13 }}>{c.name}</span>
                      <span style={{ fontSize: 12, color: O }}>{c.pct}٪</span>
                    </div>
                    <div style={{ height: 6, background: '#0d1320', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: c.pct + '%', background: O + 'aa', borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{fmtM(c.revenue)}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Top customers */}
            <div style={{ background: '#0a1120', borderRadius: 12, overflow: 'hidden', border: '1px solid #1a2540' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #1a2540' }}><span style={{ fontSize: 14, color: '#94a3b8' }}>مشتریان برتر</span></div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#0d1320' }}>{['مشتری','تعداد سفارش','مجموع خرید'].map(h => <th key={h} style={{ padding: '10px 16px', textAlign: 'right', fontSize: 12, color: '#64748b', borderBottom: '1px solid #1a2540' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {TOP_CUSTOMERS.map((c, i) => (
                    <tr key={c.name} style={{ borderBottom: '1px solid #1a254020' }}>
                      <td style={{ padding: '11px 16px', fontSize: 13 }}><span style={{ color: O, marginLeft: 8 }}>#{i + 1}</span>{c.name}</td>
                      <td style={{ padding: '11px 16px', fontSize: 13, textAlign: 'center' }}>{fmtN(c.orders)}</td>
                      <td style={{ padding: '11px 16px', fontSize: 14, fontWeight: 700, color: O }}>{fmtM(c.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === 'inventory' && (
          <div>
            <h2 style={{ margin: '0 0 20px', fontSize: 20, color: O }}>گزارش انبار</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
              {[['کل اقلام', '۸', ''], ['ارزش موجودی', '۱۸.۷M', ''], ['ناموجود', '۱', '#ef4444'], ['کم‌موجود', '۲', '#f59e0b']].map(([k, v, c]) => (
                <div key={k} style={{ background: '#0a1120', borderRadius: 12, padding: '16px 20px', border: '1px solid #1a2540' }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{k}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: (c as string) || O }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#0a1120', borderRadius: 12, overflow: 'hidden', border: '1px solid #1a2540' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#0d1320' }}>{['نام کالا','انبار ۱','انبار ۲','جمع','ارزش','وضعیت'].map(h => <th key={h} style={{ padding: '11px 14px', textAlign: 'right', fontSize: 12, color: '#64748b', borderBottom: '1px solid #1a2540' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {STOCK_REPORT.map((s, i) => {
                    const sc: Record<string, string> = { 'موجود': '#4ade80', 'کم': '#f59e0b', 'ناموجود': '#ef4444' };
                    return (
                      <tr key={s.name} style={{ borderBottom: '1px solid #1a254020', background: i % 2 === 0 ? 'transparent' : '#0d132015' }}>
                        <td style={{ padding: '11px 14px', fontSize: 13 }}>{s.name}</td>
                        <td style={{ padding: '11px 14px', fontSize: 13, textAlign: 'center' }}>{fmtN(s.wh1)}</td>
                        <td style={{ padding: '11px 14px', fontSize: 13, textAlign: 'center' }}>{fmtN(s.wh2)}</td>
                        <td style={{ padding: '11px 14px', fontSize: 14, fontWeight: 700, textAlign: 'center' }}>{fmtN(s.total)}</td>
                        <td style={{ padding: '11px 14px', fontSize: 13, color: O }}>{s.val ? fmtM(s.val) : '-'}</td>
                        <td style={{ padding: '11px 14px' }}><span style={{ background: sc[s.status] + '22', color: sc[s.status], padding: '3px 10px', borderRadius: 20, fontSize: 11 }}>{s.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === 'financial' && (
          <div>
            <h2 style={{ margin: '0 0 20px', fontSize: 20, color: O }}>گزارش مالی</h2>
            <div style={{ background: '#0a1120', borderRadius: 12, padding: 24, border: '1px solid #1a2540', marginBottom: 20 }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 14, color: '#94a3b8' }}>درآمد و هزینه ۶ ماه گذشته</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 140 }}>
                {MONTHLY.map(m => (
                  <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: '100%', display: 'flex', gap: 3, alignItems: 'flex-end', height: 100 }}>
                      <div style={{ flex: 1, background: O + '66', borderRadius: '3px 3px 0 0', height: (m.rev / maxMonth) * 90 }} />
                      <div style={{ flex: 1, background: '#ef444466', borderRadius: '3px 3px 0 0', height: (m.cost / maxMonth) * 90 }} />
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{m.month}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: 2, background: O }} /><span style={{ fontSize: 12, color: '#94a3b8' }}>درآمد</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: 2, background: '#ef4444' }} /><span style={{ fontSize: 12, color: '#94a3b8' }}>هزینه</span></div>
              </div>
            </div>
            {/* Cost breakdown */}
            <div style={{ background: '#0a1120', borderRadius: 12, padding: 24, border: '1px solid #1a2540' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 14, color: '#94a3b8' }}>تجزیه هزینه‌ها</h3>
              {[['حقوق و دستمزد', 84, '#a78bfa'], ['اجاره', 24, '#38bdf8'], ['بازاریابی', 15, '#4ade80'], ['سایر', 8.5, '#f59e0b']].map(([k, v, c]) => (
                <div key={k} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13 }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: c as string }}>{v}M</span>
                  </div>
                  <div style={{ height: 8, background: '#0d1320', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: ((v as number) / 84 * 100) + '%', background: c as string, borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
