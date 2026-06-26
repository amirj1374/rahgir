import { useState } from 'react';

interface Props { onBack: () => void; }

const CUSTOMERS = [
  { id: 1, name: 'شرکت آلفا تجارت', group: 'VIP', phone: '۰۲۱-۴۴۵۵۶۶۷۷', city: 'تهران', email: 'alpha@example.com', joinDate: '۱۴۰۱/۰۳/۱۵', balance: -2500000, purchases: 48, totalSpent: 185000000 },
  { id: 2, name: 'فروشگاه بتا', group: 'عمده', phone: '۰۳۱-۳۳۴۴۵۵۶۶', city: 'اصفهان', email: 'beta@example.com', joinDate: '۱۴۰۱/۰۷/۲۰', balance: 0, purchases: 22, totalSpent: 62000000 },
  { id: 3, name: 'رضا محمدی', group: 'خرده', phone: '۰۹۱۲۱۲۳۴۵۶۷', city: 'تهران', email: 'reza@example.com', joinDate: '۱۴۰۲/۰۱/۰۵', balance: 500000, purchases: 9, totalSpent: 8500000 },
  { id: 4, name: 'پخش گاما', group: 'VIP', phone: '۰۲۱-۸۸۹۹۰۰۱۱', city: 'تهران', email: 'gamma@example.com', joinDate: '۱۴۰۰/۱۱/۱۰', balance: -8000000, purchases: 74, totalSpent: 310000000 },
  { id: 5, name: 'سارا احمدی', group: 'خرده', phone: '۰۹۳۵۹۸۷۶۵۴۳', city: 'شیراز', email: 'sara@example.com', joinDate: '۱۴۰۲/۰۵/۱۸', balance: 0, purchases: 5, totalSpent: 3200000 },
  { id: 6, name: 'تجارت دلتا', group: 'عمده', phone: '۰۴۱-۳۵۵۶۶۷۷۸', city: 'تبریز', email: 'delta@example.com', joinDate: '۱۴۰۱/۱۰/۲۵', balance: -1500000, purchases: 31, totalSpent: 95000000 },
];

const HISTORY: Record<number, Array<{date:string; inv:string; items:string; total:number; status:string}>> = {
  1: [
    { date: '۱۴۰۳/۰۴/۰۵', inv: 'INV-2048', items: '۳ قلم', total: 8500000, status: 'پرداخت‌شده' },
    { date: '۱۴۰۳/۰۳/۲۸', inv: 'INV-2035', items: '۵ قلم', total: 12000000, status: 'پرداخت‌شده' },
    { date: '۱۴۰۳/۰۳/۱۰', inv: 'INV-2021', items: '۲ قلم', total: 4500000, status: 'معوق' },
  ],
  4: [
    { date: '۱۴۰۳/۰۴/۰۶', inv: 'INV-2050', items: '۸ قلم', total: 22000000, status: 'پرداخت‌شده' },
    { date: '۱۴۰۳/۰۴/۰۱', inv: 'INV-2043', items: '۴ قلم', total: 9800000, status: 'معوق' },
  ],
};

const LEDGER: Record<number, Array<{date:string; desc:string; debit:number; credit:number}>> = {
  1: [
    { date: '۱۴۰۳/۰۴/۰۵', desc: 'فاکتور INV-2048', debit: 8500000, credit: 0 },
    { date: '۱۴۰۳/۰۴/۰۳', desc: 'پرداخت نقدی', debit: 0, credit: 6000000 },
    { date: '۱۴۰۳/۰۳/۲۸', desc: 'فاکتور INV-2035', debit: 12000000, credit: 0 },
  ],
  4: [
    { date: '۱۴۰۳/۰۴/۰۶', desc: 'فاکتور INV-2050', debit: 22000000, credit: 0 },
    { date: '۱۴۰۳/۰۴/۰۲', desc: 'چک برگشتی', debit: 3000000, credit: 0 },
    { date: '۱۴۰۳/۰۳/۳۰', desc: 'پرداخت بانکی', debit: 0, credit: 17000000 },
  ],
};

const B = '#38bdf8';

export default function CRMModule({ onBack }: Props) {
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [selId, setSelId] = useState<number>(1);
  const [tab, setTab] = useState<'history' | 'ledger' | 'notes'>('history');
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<string[]>(['مشتری VIP - اولویت بالا در ارسال', 'تخفیف ۵٪ دارد']);

  const fmtN = (n: number) => n.toLocaleString('fa-IR');
  const fmtM = (n: number) => (n / 1000000).toFixed(1) + 'M';

  const filtered = CUSTOMERS.filter(c => {
    if (groupFilter !== 'all' && c.group !== groupFilter) return false;
    if (search && !c.name.includes(search) && !c.phone.includes(search)) return false;
    return true;
  });

  const sel = CUSTOMERS.find(c => c.id === selId)!;

  const inputStyle: React.CSSProperties = { background: '#0d1320', border: '1px solid #1e2d45', borderRadius: 8, color: '#e8edf5', padding: '8px 12px', fontFamily: 'Vazirmatn', fontSize: 13, width: '100%' };

  const avatar = (name: string) => name.charAt(0);
  const groupColor = (g: string) => g === 'VIP' ? '#f59e0b' : g === 'عمده' ? B : '#94a3b8';

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#060a13', color: '#e8edf5', fontFamily: 'Vazirmatn', direction: 'rtl' }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: '#0a1120', borderLeft: '1px solid #1a2540', display: 'flex', flexDirection: 'column', padding: '20px 0' }}>
        <div style={{ padding: '0 16px 20px', borderBottom: '1px solid #1a2540' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13 }}>← بازگشت</button>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: B + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👥</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: B }}>مشتریان</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>مدیریت CRM</div>
            </div>
          </div>
        </div>
        {/* Search + filter */}
        <div style={{ padding: '12px 10px', borderBottom: '1px solid #1a2540' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجو..." style={{ ...inputStyle, marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {['all', 'VIP', 'عمده', 'خرده'].map(g => (
              <button key={g} onClick={() => setGroupFilter(g)} style={{ padding: '4px 10px', borderRadius: 20, border: 'none', background: groupFilter === g ? B + '22' : '#0d1320', color: groupFilter === g ? B : '#64748b', fontFamily: 'Vazirmatn', fontSize: 11, cursor: 'pointer' }}>
                {g === 'all' ? 'همه' : g}
              </button>
            ))}
          </div>
        </div>
        {/* Customer list */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {filtered.map(c => (
            <div key={c.id} onClick={() => setSelId(c.id)} style={{ padding: '12px 14px', cursor: 'pointer', background: selId === c.id ? B + '12' : 'none', borderRight: selId === c.id ? `3px solid ${B}` : '3px solid transparent', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: groupColor(c.group) + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: groupColor(c.group), flexShrink: 0 }}>{avatar(c.name)}</div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{c.group} • {c.city}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {/* Profile header */}
        <div style={{ background: '#0a1120', borderRadius: 12, padding: 24, border: '1px solid #1a2540', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: groupColor(sel.group) + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: groupColor(sel.group) }}>{avatar(sel.name)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h2 style={{ margin: 0, fontSize: 18 }}>{sel.name}</h2>
                <span style={{ background: groupColor(sel.group) + '22', color: groupColor(sel.group), padding: '2px 10px', borderRadius: 20, fontSize: 11 }}>{sel.group}</span>
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{sel.phone} • {sel.email} • {sel.city}</div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>عضو از {sel.joinDate}</div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>مانده حساب</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: sel.balance < 0 ? '#ef4444' : sel.balance > 0 ? '#4ade80' : '#94a3b8' }}>{fmtM(Math.abs(sel.balance))} ت</div>
              <div style={{ fontSize: 11, color: sel.balance < 0 ? '#ef4444' : '#94a3b8' }}>{sel.balance < 0 ? 'بدهکار' : sel.balance > 0 ? 'بستانکار' : 'تسویه'}</div>
            </div>
          </div>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 20 }}>
            {[['تعداد خرید', fmtN(sel.purchases), '🛍️'], ['مجموع خرید', fmtM(sel.totalSpent), '💰'], ['میانگین سبد', fmtM(sel.totalSpent / sel.purchases), '📊'], ['شهر', sel.city, '📍']].map(([k, v, ic]) => (
              <div key={k} style={{ background: '#0d1320', borderRadius: 8, padding: '12px 14px', border: '1px solid #1a2540' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{ic}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: B }}>{v}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{k}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
          {[['history','تاریخچه خرید'], ['ledger','دفتر حساب'], ['notes','یادداشت‌ها']].map(([v, l]) => (
            <button key={v} onClick={() => setTab(v as any)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: tab === v ? B + '22' : '#0a1120', color: tab === v ? B : '#64748b', fontFamily: 'Vazirmatn', fontSize: 13, cursor: 'pointer' }}>{l}</button>
          ))}
        </div>

        {tab === 'history' && (
          <div style={{ background: '#0a1120', borderRadius: 12, overflow: 'hidden', border: '1px solid #1a2540' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#0d1320' }}>{['تاریخ','شماره فاکتور','اقلام','مبلغ','وضعیت'].map(h => <th key={h} style={{ padding: '12px 14px', textAlign: 'right', fontSize: 12, color: '#64748b', borderBottom: '1px solid #1a2540' }}>{h}</th>)}</tr></thead>
              <tbody>
                {(HISTORY[sel.id] || []).map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1a254020' }}>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{r.date}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: B }}>{r.inv}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12 }}>{r.items}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600 }}>{fmtN(r.total)}</td>
                    <td style={{ padding: '11px 14px' }}><span style={{ background: r.status === 'پرداخت‌شده' ? '#4ade8022' : '#f59e0b22', color: r.status === 'پرداخت‌شده' ? '#4ade80' : '#f59e0b', padding: '3px 10px', borderRadius: 20, fontSize: 11 }}>{r.status}</span></td>
                  </tr>
                ))}
                {!(HISTORY[sel.id]?.length) && <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 13 }}>سابقه‌ای موجود نیست</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'ledger' && (
          <div style={{ background: '#0a1120', borderRadius: 12, overflow: 'hidden', border: '1px solid #1a2540' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#0d1320' }}>{['تاریخ','شرح','بدهکار','بستانکار'].map(h => <th key={h} style={{ padding: '12px 14px', textAlign: 'right', fontSize: 12, color: '#64748b', borderBottom: '1px solid #1a2540' }}>{h}</th>)}</tr></thead>
              <tbody>
                {(LEDGER[sel.id] || []).map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1a254020' }}>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{r.date}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13 }}>{r.desc}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: '#ef4444', fontWeight: r.debit ? 600 : 400 }}>{r.debit ? fmtN(r.debit) : '-'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: '#4ade80', fontWeight: r.credit ? 600 : 400 }}>{r.credit ? fmtN(r.credit) : '-'}</td>
                  </tr>
                ))}
                {!(LEDGER[sel.id]?.length) && <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 13 }}>تراکنشی موجود نیست</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'notes' && (
          <div>
            <div style={{ background: '#0a1120', borderRadius: 12, padding: 20, border: '1px solid #1a2540', marginBottom: 16 }}>
              {notes.map((n, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < notes.length - 1 ? '1px solid #1a254030' : 'none' }}>
                  <span style={{ fontSize: 13 }}>• {n}</span>
                  <button onClick={() => setNotes(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#ef444466', cursor: 'pointer', fontSize: 16 }}>×</button>
                </div>
              ))}
              {!notes.length && <div style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>یادداشتی ثبت نشده</div>}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="یادداشت جدید..." style={{ ...inputStyle, flex: 1 }} />
              <button onClick={() => { if (note.trim()) { setNotes(p => [...p, note.trim()]); setNote(''); } }} style={{ background: B + '22', border: `1px solid ${B}44`, color: B, borderRadius: 8, padding: '8px 18px', fontFamily: 'Vazirmatn', fontSize: 13, cursor: 'pointer' }}>افزودن</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
