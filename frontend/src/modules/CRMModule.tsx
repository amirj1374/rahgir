import { useState, useMemo, useCallback } from 'react';
import { ModuleShell } from '../components/layout/ModuleShell';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { TextInput } from '../components/ui/Input';
import { COLOR, FONT, CARD } from '../styles/tokens';
import { fmtNum, fmtMil } from '../hooks/useFormat';

interface Props { onBack: () => void }

interface Customer { id: number; name: string; group: 'VIP'|'عمده'|'خرده'; phone: string; city: string; email: string; joinDate: string; balance: number; purchases: number; totalSpent: number }
interface HistoryRow { date: string; inv: string; items: string; total: number; status: string }
interface LedgerRow  { date: string; desc: string; debit: number; credit: number }

const ACC = COLOR.module.crm;
const NAV = [{ id: 'list', label: 'لیست مشتریان', icon: '👥' }];

const CUSTOMERS: Customer[] = [
  { id: 1, name: 'شرکت آلفا تجارت', group: 'VIP',   phone: '۰۲۱-۴۴۵۵۶۶۷۷', city: 'تهران',   email: 'alpha@example.com', joinDate: '۱۴۰۱/۰۳/۱۵', balance: -2500000,  purchases: 48, totalSpent: 185000000 },
  { id: 2, name: 'فروشگاه بتا',       group: 'عمده', phone: '۰۳۱-۳۳۴۴۵۵۶۶', city: 'اصفهان',  email: 'beta@example.com',  joinDate: '۱۴۰۱/۰۷/۲۰', balance: 0,          purchases: 22, totalSpent:  62000000 },
  { id: 3, name: 'رضا محمدی',         group: 'خرده', phone: '۰۹۱۲۱۲۳۴۵۶۷', city: 'تهران',   email: 'reza@example.com',  joinDate: '۱۴۰۲/۰۱/۰۵', balance: 500000,     purchases:  9, totalSpent:   8500000 },
  { id: 4, name: 'پخش گاما',          group: 'VIP',  phone: '۰۲۱-۸۸۹۹۰۰۱۱', city: 'تهران',   email: 'gamma@example.com', joinDate: '۱۴۰۰/۱۱/۱۰', balance: -8000000,  purchases: 74, totalSpent: 310000000 },
  { id: 5, name: 'سارا احمدی',        group: 'خرده', phone: '۰۹۳۵۹۸۷۶۵۴۳', city: 'شیراز',   email: 'sara@example.com',  joinDate: '۱۴۰۲/۰۵/۱۸', balance: 0,          purchases:  5, totalSpent:   3200000 },
  { id: 6, name: 'تجارت دلتا',        group: 'عمده', phone: '۰۴۱-۳۵۵۶۶۷۷۸', city: 'تبریز',   email: 'delta@example.com', joinDate: '۱۴۰۱/۱۰/۲۵', balance: -1500000,  purchases: 31, totalSpent:  95000000 },
];

const HISTORY: Record<number, HistoryRow[]> = {
  1: [
    { date: '۱۴۰۳/۰۴/۰۵', inv: 'INV-2048', items: '۳ قلم', total:  8500000, status: 'پرداخت‌شده' },
    { date: '۱۴۰۳/۰۳/۲۸', inv: 'INV-2035', items: '۵ قلم', total: 12000000, status: 'پرداخت‌شده' },
    { date: '۱۴۰۳/۰۳/۱۰', inv: 'INV-2021', items: '۲ قلم', total:  4500000, status: 'معوق'        },
  ],
  4: [
    { date: '۱۴۰۳/۰۴/۰۶', inv: 'INV-2050', items: '۸ قلم', total: 22000000, status: 'پرداخت‌شده' },
    { date: '۱۴۰۳/۰۴/۰۱', inv: 'INV-2043', items: '۴ قلم', total:  9800000, status: 'معوق'        },
  ],
};
const LEDGER: Record<number, LedgerRow[]> = {
  1: [
    { date: '۱۴۰۳/۰۴/۰۵', desc: 'فاکتور INV-2048', debit:  8500000, credit:       0 },
    { date: '۱۴۰۳/۰۴/۰۳', desc: 'پرداخت نقدی',     debit:        0, credit: 6000000 },
    { date: '۱۴۰۳/۰۳/۲۸', desc: 'فاکتور INV-2035', debit: 12000000, credit:       0 },
  ],
  4: [
    { date: '۱۴۰۳/۰۴/۰۶', desc: 'فاکتور INV-2050', debit: 22000000, credit:        0 },
    { date: '۱۴۰۳/۰۴/۰۲', desc: 'چک برگشتی',       debit:  3000000, credit:        0 },
    { date: '۱۴۰۳/۰۳/۳۰', desc: 'پرداخت بانکی',    debit:        0, credit: 17000000 },
  ],
};

const GROUP_COLOR: Record<string, string> = { VIP: COLOR.yellow, عمده: ACC, خرده: COLOR.textMuted };

export default function CRMModule({ onBack }: Props) {
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [selId, setSelId] = useState(1);
  const [tab, setTab] = useState<'history' | 'ledger' | 'notes'>('history');
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState(['مشتری VIP - اولویت بالا در ارسال', 'تخفیف ۵٪ دارد']);

  const filtered = useMemo(() => CUSTOMERS.filter(c => {
    if (groupFilter !== 'all' && c.group !== groupFilter) return false;
    if (search && !c.name.includes(search) && !c.phone.includes(search)) return false;
    return true;
  }), [search, groupFilter]);

  const sel = CUSTOMERS.find(c => c.id === selId)!;

  const addNote = useCallback(() => {
    if (!note.trim()) return;
    setNotes(p => [...p, note.trim()]);
    setNote('');
  }, [note]);

  const avatar = (name: string) => name.charAt(0);
  const gc = GROUP_COLOR[sel.group];

  return (
    <ModuleShell
      accent={ACC} icon="👥" title="مشتریان" subtitle="مدیریت CRM"
      navItems={NAV} section="list" onSection={() => {}} onBack={onBack}
    >
      <div style={{ display: 'flex', height: '100%', gap: 0, margin: -24 }}>
        {/* Customer sidebar list */}
        <div style={{ width: 260, background: COLOR.surface, borderLeft: `1px solid ${COLOR.border}`, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ padding: 12, borderBottom: `1px solid ${COLOR.border}` }}>
            <TextInput value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجو…" style={{ marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {['all', 'VIP', 'عمده', 'خرده'].map(g => (
                <button key={g} onClick={() => setGroupFilter(g)} style={{ padding: '3px 10px', borderRadius: 20, border: 'none', background: groupFilter === g ? ACC + '22' : COLOR.surfaceAlt, color: groupFilter === g ? ACC : COLOR.textFaint, fontFamily: 'inherit', fontSize: FONT.xs + 1, cursor: 'pointer' }}>
                  {g === 'all' ? 'همه' : g}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {filtered.map(c => (
              <div key={c.id} onClick={() => setSelId(c.id)} style={{ padding: '11px 14px', cursor: 'pointer', background: selId === c.id ? ACC + '12' : 'transparent', borderRight: `3px solid ${selId === c.id ? ACC : 'transparent'}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: GROUP_COLOR[c.group] + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: GROUP_COLOR[c.group], flexShrink: 0 }}>{avatar(c.name)}</div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: FONT.base, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                  <div style={{ fontSize: FONT.xs, color: COLOR.textFaint }}>{c.group} • {c.city}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {/* Profile card */}
          <div style={{ ...CARD, padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 }}>
              <div style={{ width: 58, height: 58, borderRadius: '50%', background: gc + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: gc, flexShrink: 0 }}>{avatar(sel.name)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h2 style={{ margin: 0, fontSize: FONT.lg, fontWeight: 700 }}>{sel.name}</h2>
                  <Badge label={sel.group} color={gc} />
                </div>
                <div style={{ fontSize: FONT.base, color: COLOR.textFaint }}>{sel.phone} • {sel.city}</div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: FONT.xs, color: COLOR.textFaint }}>مانده حساب</div>
                <div style={{ fontSize: FONT.xxl, fontWeight: 700, color: sel.balance < 0 ? COLOR.red : sel.balance > 0 ? COLOR.green : COLOR.textMuted }}>
                  {fmtMil(sel.balance)} ت
                </div>
                <div style={{ fontSize: FONT.xs, color: sel.balance < 0 ? COLOR.red : COLOR.textFaint }}>
                  {sel.balance < 0 ? 'بدهکار' : sel.balance > 0 ? 'بستانکار' : 'تسویه'}
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              <StatCard icon="🛍️" value={fmtNum(sel.purchases)}                               label="تعداد خرید"   color={ACC} />
              <StatCard icon="💰" value={fmtMil(sel.totalSpent)}                              label="مجموع خرید"  color={ACC} />
              <StatCard icon="📊" value={fmtMil(sel.totalSpent / sel.purchases)}              label="میانگین سبد" color={ACC} />
              <StatCard icon="📅" value={sel.joinDate}                                        label="تاریخ عضویت" color={ACC} />
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
            {([['history','تاریخچه خرید'],['ledger','دفتر حساب'],['notes','یادداشت‌ها']] as const).map(([v, l]) => (
              <button key={v} onClick={() => setTab(v)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: tab === v ? ACC + '22' : COLOR.surface, color: tab === v ? ACC : COLOR.textFaint, fontFamily: 'inherit', fontSize: FONT.base, cursor: 'pointer' }}>{l}</button>
            ))}
          </div>

          {tab === 'history' && (
            <DataTable
              columns={[
                { key: 'date',   header: 'تاریخ',       render: r => <span style={{ color: COLOR.textFaint }}>{r.date as string}</span> },
                { key: 'inv',    header: 'شماره فاکتور', render: r => <span style={{ color: ACC }}>{r.inv as string}</span> },
                { key: 'items',  header: 'اقلام' },
                { key: 'total',  header: 'مبلغ',         render: r => <strong>{fmtNum(r.total as number)}</strong> },
                { key: 'status', header: 'وضعیت',       render: r => <Badge label={r.status as string} color={(r.status as string) === 'پرداخت‌شده' ? COLOR.green : COLOR.yellow} /> },
              ]}
              rows={(HISTORY[sel.id] ?? []) as unknown as Record<string, unknown>[]}
              emptyText="سابقه‌ای موجود نیست"
            />
          )}

          {tab === 'ledger' && (
            <DataTable
              columns={[
                { key: 'date',   header: 'تاریخ',      render: r => <span style={{ color: COLOR.textFaint }}>{r.date as string}</span> },
                { key: 'desc',   header: 'شرح' },
                { key: 'debit',  header: 'بدهکار',     render: r => <span style={{ color: COLOR.red,   fontWeight: r.debit  ? 600 : 400 }}>{(r.debit as number) ? fmtNum(r.debit as number) : '–'}</span> },
                { key: 'credit', header: 'بستانکار',   render: r => <span style={{ color: COLOR.green, fontWeight: r.credit ? 600 : 400 }}>{(r.credit as number) ? fmtNum(r.credit as number) : '–'}</span> },
              ]}
              rows={(LEDGER[sel.id] ?? []) as unknown as Record<string, unknown>[]}
              emptyText="تراکنشی موجود نیست"
            />
          )}

          {tab === 'notes' && (
            <div>
              <div style={{ ...CARD, padding: 20, marginBottom: 12 }}>
                {notes.map((n, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < notes.length - 1 ? `1px solid rgba(255,255,255,.04)` : 'none' }}>
                    <span style={{ fontSize: FONT.base }}>• {n}</span>
                    <button onClick={() => setNotes(p => p.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: COLOR.red + '77', cursor: 'pointer', fontSize: 18 }}>×</button>
                  </div>
                ))}
                {!notes.length && <div style={{ color: COLOR.textFaint, fontSize: FONT.base, textAlign: 'center', padding: 12 }}>یادداشتی ثبت نشده</div>}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <TextInput value={note} onChange={e => setNote(e.target.value)} placeholder="یادداشت جدید…" style={{ flex: 1 }} />
                <Button color={ACC} onClick={addNote}>افزودن</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModuleShell>
  );
}
