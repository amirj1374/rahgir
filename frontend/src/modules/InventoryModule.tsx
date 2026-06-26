import { useState, useMemo, useCallback } from 'react';
import { ModuleShell, PageHeader } from '../components/layout/ModuleShell';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { TextInput, SelectInput } from '../components/ui/Input';
import { DataTable } from '../components/ui/DataTable';
import { COLOR, FONT } from '../styles/tokens';
import { fmtNum } from '../hooks/useFormat';

interface Props { onBack: () => void }

interface StockItem {
  id: number; sku: string; name: string; variant: string;
  wh1: number; wh2: number; alertAt: number; category: string;
}
interface TxLog {
  id: number; date: string; type: 'in' | 'out' | 'transfer';
  sku: string; name: string; qty: number; wh: string; ref: string; user: string;
}

const ACC = COLOR.module.inventory;
const NAV = [
  { id: 'stock',        label: 'موجودی کالا',   icon: '📦' },
  { id: 'transactions', label: 'تراکنش‌ها',      icon: '📋' },
  { id: 'transfer',     label: 'جابجایی انبار',  icon: '🔄' },
];

const INIT_STOCK: StockItem[] = [
  { id: 1, sku: 'P001-BLK-L',  name: 'تی‌شرت مشکی',    variant: 'مشکی / L',         wh1: 45, wh2: 20, alertAt: 10, category: 'پوشاک' },
  { id: 2, sku: 'P001-WHT-M',  name: 'تی‌شرت سفید',    variant: 'سفید / M',         wh1:  8, wh2:  5, alertAt: 10, category: 'پوشاک' },
  { id: 3, sku: 'P002-BLU-42', name: 'کفش آبی',         variant: 'آبی / 42',         wh1:  0, wh2:  0, alertAt:  5, category: 'کفش'   },
  { id: 4, sku: 'P003-RED-S',  name: 'کاپشن قرمز',     variant: 'قرمز / S',         wh1: 22, wh2: 10, alertAt:  8, category: 'پوشاک' },
  { id: 5, sku: 'P004-GRN-XL', name: 'شلوار سبز',       variant: 'سبز / XL',         wh1:  3, wh2:  0, alertAt:  5, category: 'پوشاک' },
  { id: 6, sku: 'P005-BRN-44', name: 'کفش قهوه‌ای',     variant: 'قهوه‌ای / 44',     wh1: 15, wh2:  8, alertAt:  6, category: 'کفش'   },
  { id: 7, sku: 'P006-PUR-M',  name: 'هودی بنفش',       variant: 'بنفش / M',         wh1:  0, wh2:  2, alertAt:  5, category: 'پوشاک' },
  { id: 8, sku: 'P007-YEL-38', name: 'صندل زرد',        variant: 'زرد / 38',         wh1: 12, wh2:  6, alertAt:  4, category: 'کفش'   },
];

const INIT_LOG: TxLog[] = [
  { id: 1, date: '۱۴۰۳/۰۴/۰۱', type: 'in',       sku: 'P001-BLK-L',  name: 'تی‌شرت مشکی',  qty: 20, wh: 'انبار ۱',            ref: 'PO-1001', user: 'احمدی'   },
  { id: 2, date: '۱۴۰۳/۰۴/۰۲', type: 'out',      sku: 'P002-BLU-42', name: 'کفش آبی',       qty:  5, wh: 'انبار ۲',            ref: 'INV-2045',user: 'رضایی'   },
  { id: 3, date: '۱۴۰۳/۰۴/۰۳', type: 'transfer', sku: 'P003-RED-S',  name: 'کاپشن قرمز',   qty:  8, wh: 'انبار ۱ → انبار ۲', ref: 'TR-001',  user: 'محمدی'  },
  { id: 4, date: '۱۴۰۳/۰۴/۰۴', type: 'in',       sku: 'P006-PUR-M',  name: 'هودی بنفش',     qty: 15, wh: 'انبار ۱',            ref: 'PO-1002', user: 'احمدی'   },
  { id: 5, date: '۱۴۰۳/۰۴/۰۵', type: 'out',      sku: 'P004-GRN-XL', name: 'شلوار سبز',     qty:  3, wh: 'انبار ۱',            ref: 'INV-2046',user: 'رضایی'   },
];

const TYPE_MAP: Record<string, { label: string; color: string }> = {
  in:       { label: 'ورود',    color: ACC },
  out:      { label: 'خروج',    color: COLOR.red },
  transfer: { label: 'انتقال',  color: COLOR.blue },
};

function itemStatus(s: StockItem) {
  const t = s.wh1 + s.wh2;
  if (t === 0)         return { label: 'ناموجود', color: COLOR.red };
  if (t < s.alertAt)   return { label: 'کم',      color: COLOR.yellow };
  return               { label: 'موجود',    color: ACC };
}

export default function InventoryModule({ onBack }: Props) {
  const [section, setSection] = useState('stock');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'oos' | 'ok'>('all');
  const [search, setSearch] = useState('');
  const [stock, setStock] = useState<StockItem[]>(INIT_STOCK);
  const [log, setLog] = useState<TxLog[]>(INIT_LOG);

  const [txOpen, setTxOpen] = useState(false);
  const [txType, setTxType] = useState<'in' | 'out'>('in');
  const [selId, setSelId] = useState<number | ''>('');
  const [txQty, setTxQty] = useState('');
  const [txWh, setTxWh] = useState('wh1');
  const [txRef, setTxRef] = useState('');

  const [trFrom, setTrFrom] = useState('wh1');
  const [trTo, setTrTo] = useState('wh2');
  const [trItem, setTrItem] = useState('');
  const [trQty, setTrQty] = useState('');

  const filtered = useMemo(() => stock.filter(s => {
    const t = s.wh1 + s.wh2;
    if (stockFilter === 'oos' && t > 0) return false;
    if (stockFilter === 'low' && (t === 0 || t >= s.alertAt)) return false;
    if (stockFilter === 'ok'  && t < s.alertAt) return false;
    if (search && !s.name.includes(search) && !s.sku.includes(search)) return false;
    return true;
  }), [stock, stockFilter, search]);

  const sidebarStats = useMemo(() => [
    { label: 'کل اقلام',  value: fmtNum(stock.length) },
    { label: 'ناموجود',  value: fmtNum(stock.filter(s => s.wh1 + s.wh2 === 0).length) },
    { label: 'کم‌موجود', value: fmtNum(stock.filter(s => { const t = s.wh1 + s.wh2; return t > 0 && t < s.alertAt; }).length) },
  ], [stock]);

  const selItem = stock.find(s => s.id === selId);

  const applyTx = useCallback(() => {
    if (!selItem || !txQty) return;
    const qty = parseInt(txQty);
    setStock(prev => prev.map(s => {
      if (s.id !== selItem.id) return s;
      return txWh === 'wh1'
        ? { ...s, wh1: txType === 'in' ? s.wh1 + qty : Math.max(0, s.wh1 - qty) }
        : { ...s, wh2: txType === 'in' ? s.wh2 + qty : Math.max(0, s.wh2 - qty) };
    }));
    setLog(prev => [{
      id: prev.length + 1, date: '۱۴۰۳/۰۴/۰۶', type: txType,
      sku: selItem.sku, name: selItem.name, qty,
      wh: txWh === 'wh1' ? 'انبار ۱' : 'انبار ۲', ref: txRef || '-', user: 'کاربر',
    }, ...prev]);
    setTxOpen(false); setTxQty(''); setTxRef(''); setSelId('');
  }, [selItem, txQty, txType, txWh, txRef]);

  const applyTransfer = useCallback(() => {
    if (!trItem || !trQty || trFrom === trTo) return;
    const qty = parseInt(trQty);
    const item = stock.find(s => s.sku === trItem);
    if (!item) return;
    setStock(prev => prev.map(s => {
      if (s.sku !== trItem) return s;
      return trFrom === 'wh1'
        ? { ...s, wh1: Math.max(0, s.wh1 - qty), wh2: s.wh2 + qty }
        : { ...s, wh1: s.wh1 + qty, wh2: Math.max(0, s.wh2 - qty) };
    }));
    setLog(prev => [{
      id: prev.length + 1, date: '۱۴۰۳/۰۴/۰۶', type: 'transfer',
      sku: item.sku, name: item.name, qty,
      wh: `${trFrom === 'wh1' ? 'انبار ۱' : 'انبار ۲'} → ${trTo === 'wh1' ? 'انبار ۱' : 'انبار ۲'}`,
      ref: 'TR-' + Date.now(), user: 'کاربر',
    }, ...prev]);
    setTrQty(''); setTrItem('');
  }, [trItem, trQty, trFrom, trTo, stock]);

  return (
    <ModuleShell
      accent={ACC} icon="📦" title="انبارداری" subtitle="مدیریت موجودی"
      navItems={NAV} section={section} onSection={setSection} onBack={onBack}
      sidebarFooter={sidebarStats}
    >
      {/* Stock list */}
      {section === 'stock' && (
        <>
          <PageHeader title="موجودی کالا" color={ACC} action={
            <>
              <Button color={ACC} onClick={() => { setTxType('in');  setTxOpen(true); }}>+ ورود کالا</Button>
              <Button color={COLOR.yellow} onClick={() => { setTxType('out'); setTxOpen(true); }}>- خروج کالا</Button>
            </>
          } />

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {([['all','همه'],['ok','موجود'],['low','کم‌موجود'],['oos','ناموجود']] as const).map(([v, l]) => (
              <button key={v} onClick={() => setStockFilter(v)} style={{ padding: '5px 14px', borderRadius: 20, border: 'none', background: stockFilter === v ? ACC + '22' : COLOR.surfaceAlt, color: stockFilter === v ? ACC : COLOR.textFaint, fontFamily: 'inherit', fontSize: FONT.sm + 1, cursor: 'pointer' }}>{l}</button>
            ))}
            <div style={{ marginRight: 'auto' }}>
              <TextInput value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجو نام یا SKU…" style={{ width: 200 }} />
            </div>
          </div>

          <DataTable
            columns={[
              { key: 'sku',     header: 'SKU',    render: r => <span style={{ fontSize: FONT.sm, color: COLOR.textFaint }}>{String(r.sku)}</span> },
              { key: 'name',    header: 'نام کالا' },
              { key: 'variant', header: 'تنوع',   render: r => <span style={{ color: COLOR.textMuted }}>{String(r.variant)}</span> },
              { key: 'wh1',     header: 'انبار ۱', render: r => fmtNum(r.wh1 as number) },
              { key: 'wh2',     header: 'انبار ۲', render: r => fmtNum(r.wh2 as number) },
              { key: 'total',   header: 'جمع',     render: r => <strong>{fmtNum((r.wh1 as number) + (r.wh2 as number))}</strong> },
              { key: 'alertAt', header: 'هشدار',   render: r => <span style={{ color: COLOR.textFaint }}>{fmtNum(r.alertAt as number)}</span> },
              { key: 'status',  header: 'وضعیت',  render: r => { const st = itemStatus(r as unknown as StockItem); return <Badge label={st.label} color={st.color} />; } },
              { key: 'actions', header: '', render: r => (
                <div style={{ display: 'flex', gap: 6 }}>
                  <Button size="sm" color={ACC}          onClick={() => { setSelId(r.id as number); setTxType('in');  setTxOpen(true); }}>ورود</Button>
                  <Button size="sm" color={COLOR.yellow} onClick={() => { setSelId(r.id as number); setTxType('out'); setTxOpen(true); }}>خروج</Button>
                </div>
              )},
            ]}
            rows={filtered as unknown as Record<string, unknown>[]}
            keyField="id"
          />
        </>
      )}

      {/* Transactions */}
      {section === 'transactions' && (
        <>
          <PageHeader title="تراکنش‌های انبار" color={ACC} />
          <DataTable
            columns={[
              { key: 'date',  header: 'تاریخ',  render: r => <span style={{ color: COLOR.textFaint }}>{r.date as string}</span> },
              { key: 'type',  header: 'نوع',    render: r => { const t = TYPE_MAP[r.type as string]; return <Badge label={t.label} color={t.color} />; } },
              { key: 'sku',   header: 'SKU',    render: r => <span style={{ color: COLOR.textFaint, fontSize: FONT.sm }}>{r.sku as string}</span> },
              { key: 'name',  header: 'نام کالا' },
              { key: 'qty',   header: 'تعداد',  render: r => <strong>{fmtNum(r.qty as number)}</strong> },
              { key: 'wh',    header: 'انبار'   },
              { key: 'ref',   header: 'مرجع',   render: r => <span style={{ color: COLOR.textMuted }}>{r.ref as string}</span> },
              { key: 'user',  header: 'کاربر',  render: r => <span style={{ color: COLOR.textFaint }}>{r.user as string}</span> },
            ]}
            rows={log as unknown as Record<string, unknown>[]}
            keyField="id"
          />
        </>
      )}

      {/* Transfer */}
      {section === 'transfer' && (
        <>
          <PageHeader title="جابجایی بین انبارها" color={ACC} />
          <div style={{ maxWidth: 560, background: COLOR.surface, borderRadius: 12, padding: 24, border: `1px solid ${COLOR.border}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <SelectInput label="از انبار" value={trFrom} onChange={e => setTrFrom(e.target.value)}>
                <option value="wh1">انبار ۱</option>
                <option value="wh2">انبار ۲</option>
              </SelectInput>
              <SelectInput label="به انبار" value={trTo} onChange={e => setTrTo(e.target.value)}>
                <option value="wh2">انبار ۲</option>
                <option value="wh1">انبار ۱</option>
              </SelectInput>
            </div>
            <SelectInput label="کالا" value={trItem} onChange={e => setTrItem(e.target.value)}>
              <option value="">انتخاب کنید…</option>
              {stock.map(s => <option key={s.sku} value={s.sku}>{s.name} ({s.variant})</option>)}
            </SelectInput>
            <TextInput label="تعداد" type="number" value={trQty} onChange={e => setTrQty(e.target.value)} placeholder="تعداد" />
            <Button color={ACC} onClick={applyTransfer} style={{ textAlign: 'center' }}>ثبت جابجایی</Button>
          </div>
        </>
      )}

      {/* TX Modal */}
      <Modal open={txOpen} onClose={() => setTxOpen(false)} titleColor={txType === 'in' ? ACC : COLOR.yellow}
        title={txType === 'in' ? '+ ورود کالا' : '- خروج کالا'} width={440}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SelectInput label="کالا" value={selId} onChange={e => setSelId(Number(e.target.value) || '')}>
            <option value="">انتخاب کنید…</option>
            {stock.map(s => <option key={s.id} value={s.id}>{s.name} ({s.variant})</option>)}
          </SelectInput>
          <SelectInput label="انبار" value={txWh} onChange={e => setTxWh(e.target.value)}>
            <option value="wh1">انبار ۱{selItem ? ` (موجودی: ${fmtNum(selItem.wh1)})` : ''}</option>
            <option value="wh2">انبار ۲{selItem ? ` (موجودی: ${fmtNum(selItem.wh2)})` : ''}</option>
          </SelectInput>
          <TextInput label="تعداد" type="number" value={txQty} onChange={e => setTxQty(e.target.value)} placeholder="تعداد" />
          <TextInput label="شماره مرجع (اختیاری)" value={txRef} onChange={e => setTxRef(e.target.value)} placeholder="PO-xxxx / INV-xxxx" />
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Button color={txType === 'in' ? ACC : COLOR.yellow} onClick={applyTx} style={{ flex: 1, textAlign: 'center' }}>ثبت</Button>
            <Button variant="ghost" onClick={() => setTxOpen(false)} style={{ flex: 1, textAlign: 'center' }}>انصراف</Button>
          </div>
        </div>
      </Modal>
    </ModuleShell>
  );
}
