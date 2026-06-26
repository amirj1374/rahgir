import { useState } from 'react';

interface Props { onBack: () => void; }

const P = '#a78bfa';

const TX = [
  { id: 1, date: '۱۴۰۳/۰۴/۰۶', desc: 'دریافت از شرکت آلفا', type: 'دریافت', amount: 12000000, account: 'بانک ملت', ref: 'INV-2048' },
  { id: 2, date: '۱۴۰۳/۰۴/۰۵', desc: 'پرداخت اجاره انبار', type: 'پرداخت', amount: 8000000, account: 'صندوق', ref: 'EXP-101' },
  { id: 3, date: '۱۴۰۳/۰۴/۰۴', desc: 'خرید کالا از تامین‌کننده', type: 'پرداخت', amount: 25000000, account: 'بانک ملت', ref: 'PO-1015' },
  { id: 4, date: '۱۴۰۳/۰۴/۰۳', desc: 'دریافت از پخش گاما', type: 'دریافت', amount: 18500000, account: 'بانک ملت', ref: 'INV-2046' },
  { id: 5, date: '۱۴۰۳/۰۴/۰۲', desc: 'حقوق کارکنان', type: 'پرداخت', amount: 42000000, account: 'بانک ملت', ref: 'SAL-0403' },
];

const CHECKS = [
  { id: 1, issuer: 'شرکت آلفا', bank: 'ملت', number: '۱۲۳۴۵۶', due: '۱۴۰۳/۰۵/۱۵', amount: 15000000, type: 'دریافتنی', status: 'در انتظار' },
  { id: 2, issuer: 'فروشگاه بتا', bank: 'صادرات', number: '۹۸۷۶۵۴', due: '۱۴۰۳/۰۴/۳۰', amount: 8500000, type: 'دریافتنی', status: 'وصول‌شده' },
  { id: 3, issuer: 'شرکت ما', bank: 'ملی', number: '۵۵۴۴۳۳', due: '۱۴۰۳/۰۵/۰۱', amount: 20000000, type: 'پرداختنی', status: 'در انتظار' },
  { id: 4, issuer: 'پخش گاما', bank: 'تجارت', number: '۱۱۲۲۳۳', due: '۱۴۰۳/۰۴/۲۵', amount: 5000000, type: 'دریافتنی', status: 'برگشتی' },
];

const PNL = [
  { row: 'درآمد فروش', value: 485000000, bold: false },
  { row: 'بهای تمام‌شده کالا', value: -285000000, bold: false },
  { row: 'سود ناخالص', value: 200000000, bold: true },
  { row: 'هزینه حقوق', value: -84000000, bold: false },
  { row: 'هزینه اجاره', value: -24000000, bold: false },
  { row: 'هزینه بازاریابی', value: -15000000, bold: false },
  { row: 'سایر هزینه‌ها', value: -8500000, bold: false },
  { row: 'سود خالص', value: 68500000, bold: true },
];

export default function AccountingModule({ onBack }: Props) {
  const [section, setSection] = useState<'dashboard' | 'checks' | 'pnl'>('dashboard');

  const fmtN = (n: number) => Math.abs(n).toLocaleString('fa-IR');
  const fmtM = (n: number) => (Math.abs(n) / 1000000).toFixed(1) + 'M';
  const btnStyle = (color: string): React.CSSProperties => ({ background: color + '22', border: `1px solid ${color}44`, color, borderRadius: 8, padding: '8px 18px', fontFamily: 'Vazirmatn', fontSize: 13, cursor: 'pointer' });

  const navItems = [
    { id: 'dashboard', label: 'داشبورد مالی', icon: '📊' },
    { id: 'checks', label: 'مدیریت چک', icon: '📄' },
    { id: 'pnl', label: 'سود و زیان', icon: '📈' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#060a13', color: '#e8edf5', fontFamily: 'Vazirmatn', direction: 'rtl' }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: '#0a1120', borderLeft: '1px solid #1a2540', display: 'flex', flexDirection: 'column', padding: '20px 0' }}>
        <div style={{ padding: '0 16px 20px', borderBottom: '1px solid #1a2540' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13 }}>← بازگشت</button>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: P + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💜</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: P }}>حسابداری</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>مدیریت مالی</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setSection(n.id as any)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: section === n.id ? P + '18' : 'none', color: section === n.id ? P : '#94a3b8', cursor: 'pointer', fontFamily: 'Vazirmatn', fontSize: 13, marginBottom: 2, textAlign: 'right' }}>
              <span>{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {section === 'dashboard' && (
          <div>
            <h2 style={{ margin: '0 0 20px', fontSize: 20, color: P }}>داشبورد مالی</h2>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
              {[['درآمد این ماه', '۴۸.۵M', '+۱۲٪', '#4ade80'], ['هزینه‌ها', '۳۲.۱M', '-۵٪', '#ef4444'], ['سود خالص', '۱۶.۴M', '+۲۳٪', P], ['مانده کل', '۸۵.۲M', '', '#f59e0b']].map(([k, v, ch, c]) => (
                <div key={k} style={{ background: '#0a1120', borderRadius: 12, padding: '18px 20px', border: '1px solid #1a2540' }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{k}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: c as string }}>{v}</div>
                  {ch && <div style={{ fontSize: 12, color: ch.startsWith('+') ? '#4ade80' : '#ef4444', marginTop: 4 }}>{ch} vs ماه قبل</div>}
                </div>
              ))}
            </div>
            {/* Account cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              {[['صندوق', '۱۲,۵۰۰,۰۰۰', '💵'], ['بانک ملت', '۷۲,۸۰۰,۰۰۰', '🏦']].map(([name, bal, ic]) => (
                <div key={name} style={{ background: '#0a1120', borderRadius: 12, padding: '20px 24px', border: '1px solid #1a2540', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 28 }}>{ic}</div>
                    <div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>{name}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: '#e8edf5', marginTop: 2 }}>{bal}</div>
                    </div>
                  </div>
                  <button style={btnStyle(P)}>تراکنش</button>
                </div>
              ))}
            </div>
            {/* Recent TX */}
            <h3 style={{ fontSize: 15, marginBottom: 12, color: '#94a3b8' }}>تراکنش‌های اخیر</h3>
            <div style={{ background: '#0a1120', borderRadius: 12, overflow: 'hidden', border: '1px solid #1a2540' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#0d1320' }}>{['تاریخ','شرح','نوع','مبلغ','حساب','مرجع'].map(h => <th key={h} style={{ padding: '11px 14px', textAlign: 'right', fontSize: 12, color: '#64748b', borderBottom: '1px solid #1a2540' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {TX.map((t, i) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #1a254020', background: i % 2 === 0 ? 'transparent' : '#0d132015' }}>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{t.date}</td>
                      <td style={{ padding: '11px 14px', fontSize: 13 }}>{t.desc}</td>
                      <td style={{ padding: '11px 14px' }}><span style={{ background: t.type === 'دریافت' ? '#4ade8022' : '#ef444422', color: t.type === 'دریافت' ? '#4ade80' : '#ef4444', padding: '3px 10px', borderRadius: 20, fontSize: 11 }}>{t.type}</span></td>
                      <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: t.type === 'دریافت' ? '#4ade80' : '#ef4444' }}>{t.type === 'دریافت' ? '+' : '-'}{fmtN(t.amount)}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: '#94a3b8' }}>{t.account}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{t.ref}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === 'checks' && (
          <div>
            <h2 style={{ margin: '0 0 20px', fontSize: 20, color: P }}>مدیریت چک</h2>
            {/* Check stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
              {[['چک‌های دریافتنی', '۳', P], ['چک‌های پرداختنی', '۱', '#ef4444'], ['وصول‌شده', '۱', '#4ade80'], ['برگشتی', '۱', '#f59e0b']].map(([k, v, c]) => (
                <div key={k} style={{ background: '#0a1120', borderRadius: 12, padding: '16px 20px', border: `1px solid ${c}22` }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{k}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: c as string }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#0a1120', borderRadius: 12, overflow: 'hidden', border: '1px solid #1a2540' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#0d1320' }}>{['صادرکننده','بانک','شماره','سررسید','مبلغ','نوع','وضعیت'].map(h => <th key={h} style={{ padding: '11px 14px', textAlign: 'right', fontSize: 12, color: '#64748b', borderBottom: '1px solid #1a2540' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {CHECKS.map((c, i) => {
                    const stColor: Record<string, string> = { 'در انتظار': '#f59e0b', 'وصول‌شده': '#4ade80', 'برگشتی': '#ef4444' };
                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid #1a254020', background: i % 2 === 0 ? 'transparent' : '#0d132015' }}>
                        <td style={{ padding: '11px 14px', fontSize: 13 }}>{c.issuer}</td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#94a3b8' }}>{c.bank}</td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{c.number}</td>
                        <td style={{ padding: '11px 14px', fontSize: 12 }}>{c.due}</td>
                        <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600 }}>{fmtN(c.amount)}</td>
                        <td style={{ padding: '11px 14px' }}><span style={{ background: c.type === 'دریافتنی' ? '#4ade8022' : '#ef444422', color: c.type === 'دریافتنی' ? '#4ade80' : '#ef4444', padding: '3px 10px', borderRadius: 20, fontSize: 11 }}>{c.type}</span></td>
                        <td style={{ padding: '11px 14px' }}><span style={{ background: stColor[c.status] + '22', color: stColor[c.status], padding: '3px 10px', borderRadius: 20, fontSize: 11 }}>{c.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === 'pnl' && (
          <div style={{ maxWidth: 640 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 20, color: P }}>صورت سود و زیان — فروردین ۱۴۰۳</h2>
            <div style={{ background: '#0a1120', borderRadius: 12, overflow: 'hidden', border: '1px solid #1a2540' }}>
              {PNL.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: i < PNL.length - 1 ? '1px solid #1a254030' : 'none', background: r.bold ? P + '0a' : 'transparent' }}>
                  <span style={{ fontSize: r.bold ? 15 : 13, fontWeight: r.bold ? 700 : 400, color: r.bold ? '#e8edf5' : '#94a3b8' }}>{r.row}</span>
                  <span style={{ fontSize: r.bold ? 16 : 13, fontWeight: r.bold ? 700 : 400, color: r.value < 0 ? '#ef4444' : r.bold ? P : '#e8edf5' }}>
                    {r.value < 0 ? '(' + fmtM(r.value) + ')' : fmtM(r.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
