import { useState, useMemo } from 'react';
import { ModuleShell, PageHeader } from '../components/layout/ModuleShell';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { TextInput, SelectInput, Textarea } from '../components/ui/Input';
import { COLOR, FONT, CARD } from '../styles/tokens';
import { fmtNum, fmtMil } from '../hooks/useFormat';

interface Props { onBack: () => void }

const ACC = COLOR.module.suppliers;
const NAV = [
  { id: 'list',    label: 'لیست تامین‌کنندگان', icon: '🏭' },
  { id: 'orders',  label: 'سفارشات خرید',        icon: '📋' },
  { id: 'receive', label: 'دریافت کالا',          icon: '📥' },
];

const SUPPLIERS = [
  { id: 1, name: 'بافت آریا',             city: 'تهران',  category: 'پارچه', phone: '۰۲۱-۵۵۶۶۷۷۸۸', balance: -3500000, orders: 24, stars: 5 },
  { id: 2, name: 'کفش‌سازی مینا',         city: 'تبریز',  category: 'کفش',   phone: '۰۴۱-۳۳۴۴۵۵۶۶', balance:         0, orders: 15, stars: 4 },
  { id: 3, name: 'نساجی کرمان',           city: 'کرمان',  category: 'پارچه', phone: '۰۳۴-۲۲۳۳۴۴۵۵', balance: -1200000, orders: 31, stars: 4 },
  { id: 4, name: 'پوشاک مهر',             city: 'اصفهان', category: 'پوشاک', phone: '۰۳۱-۴۴۵۵۶۶۷۷', balance:   500000, orders:  8, stars: 3 },
  { id: 5, name: 'کارخانه نخ ابریشم',    city: 'گیلان',  category: 'نخ',    phone: '۰۱۳-۵۵۶۶۷۷۸۸', balance: -8800000, orders: 42, stars: 5 },
];

const ORDERS = [
  { id: 'PO-1015', supplier: 'بافت آریا',          items: 5, orderDate: '۱۴۰۳/۰۳/۲۰', deliveryDate: '۱۴۰۳/۰۴/۰۵', total: 25000000, status: 'تحویل‌شده' },
  { id: 'PO-1016', supplier: 'کفش‌سازی مینا',       items: 3, orderDate: '۱۴۰۳/۰۴/۰۱', deliveryDate: '۱۴۰۳/۰۴/۱۵', total: 18000000, status: 'در راه'     },
  { id: 'PO-1017', supplier: 'نساجی کرمان',         items: 8, orderDate: '۱۴۰۳/۰۴/۰۵', deliveryDate: '۱۴۰۳/۰۵/۰۱', total: 32000000, status: 'در انتظار' },
  { id: 'PO-1018', supplier: 'پوشاک مهر',           items: 2, orderDate: '۱۴۰۳/۰۴/۰۶', deliveryDate: '۱۴۰۳/۰۴/۲۰', total:  8500000, status: 'در انتظار' },
  { id: 'PO-1014', supplier: 'کارخانه نخ ابریشم',  items: 6, orderDate: '۱۴۰۳/۰۳/۱۵', deliveryDate: '۱۴۰۳/۰۳/۳۰', total: 41000000, status: 'تحویل‌شده' },
];

const PO_STATUS_COLOR: Record<string, string> = { 'تحویل‌شده': COLOR.green, 'در راه': ACC, 'در انتظار': COLOR.yellow };
const STARS = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

export default function SuppliersModule({ onBack }: Props) {
  const [section, setSection] = useState('list');
  const [search, setSearch] = useState('');
  const [poFilter, setPoFilter] = useState('all');
  const [newPOOpen, setNewPOOpen] = useState(false);

  // PO form state
  const [poSupplier, setPoSupplier] = useState('');
  const [poDate, setPoDate]         = useState('');
  const [poTerms, setPoTerms]       = useState('');
  const [poNotes, setPoNotes]       = useState('');

  // Receive form state
  const [recSupplier, setRecSupplier] = useState('');
  const [recRef, setRecRef]           = useState('');
  const [recWh, setRecWh]             = useState('wh1');
  const [recItems, setRecItems] = useState([{ name: '', qty: '', price: '' }]);

  const filteredSuppliers = useMemo(() => SUPPLIERS.filter(s => !search || s.name.includes(search) || s.city.includes(search)), [search]);
  const filteredOrders    = useMemo(() => ORDERS.filter(o => poFilter === 'all' || o.status === poFilter), [poFilter]);

  const recTotal = useMemo(() => recItems.reduce((sum, i) => sum + (parseInt(i.qty || '0') * parseInt(i.price || '0')), 0), [recItems]);

  const sidebarFooter = useMemo(() => [
    { label: 'کل تامین‌کنندگان', value: fmtNum(SUPPLIERS.length) },
    { label: 'سفارش فعال',        value: fmtNum(ORDERS.filter(o => o.status !== 'تحویل‌شده').length) },
    { label: 'در راه',            value: fmtNum(ORDERS.filter(o => o.status === 'در راه').length) },
  ], []);

  return (
    <ModuleShell
      accent={ACC} icon="🏭" title="تامین‌کنندگان" subtitle="مدیریت خرید"
      navItems={NAV} section={section} onSection={setSection} onBack={onBack}
      sidebarFooter={sidebarFooter}
    >
      {/* Supplier list */}
      {section === 'list' && (
        <>
          <PageHeader title="تامین‌کنندگان" color={ACC} action={
            <TextInput value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجو…" style={{ width: 220 }} />
          } />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
            <StatCard icon="🏭" value="۵"     label="تامین‌کنندگان فعال" color={ACC} />
            <StatCard icon="💸" value="۱۳.۵M" label="بدهی کل"            color={COLOR.red} />
            <StatCard icon="📋" value="۴"     label="سفارشات این ماه"    color={COLOR.yellow} />
            <StatCard icon="⭐" value="۴.۲"   label="میانگین رتبه"       color={COLOR.yellow} />
          </div>
          <DataTable
            columns={[
              { key: 'name',     header: 'تامین‌کننده',  render: r => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: ACC + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: FONT.base, fontWeight: 700, color: ACC, flexShrink: 0 }}>{(r.name as string).charAt(0)}</div>
                  <span>{r.name as string}</span>
                </div>
              )},
              { key: 'city',     header: 'شهر',           render: r => <span style={{ color: COLOR.textMuted }}>{r.city as string}</span> },
              { key: 'category', header: 'دسته‌بندی' },
              { key: 'phone',    header: 'تلفن',           render: r => <span style={{ color: COLOR.textFaint }}>{r.phone as string}</span> },
              { key: 'balance',  header: 'مانده',          render: r => {
                const b = r.balance as number;
                return <span style={{ color: b < 0 ? COLOR.red : b > 0 ? COLOR.green : COLOR.textFaint, fontWeight: b !== 0 ? 600 : 400 }}>{b !== 0 ? fmtMil(b) : 'تسویه'}</span>;
              }},
              { key: 'orders',   header: 'سفارشات',        render: r => fmtNum(r.orders as number) },
              { key: 'stars',    header: 'رتبه',           render: r => <span style={{ color: COLOR.yellow, fontSize: FONT.xs + 1 }}>{STARS(r.stars as number)}</span> },
              { key: 'action',   header: '',               render: r => <Button size="sm" color={ACC} onClick={() => { setPoSupplier(r.name as string); setSection('orders'); }}>سفارش</Button> },
            ]}
            rows={filteredSuppliers as unknown as Record<string, unknown>[]}
            keyField="id"
          />
        </>
      )}

      {/* Orders */}
      {section === 'orders' && (
        <>
          <PageHeader title="سفارشات خرید" color={ACC} action={<Button color={ACC} onClick={() => setNewPOOpen(true)}>+ سفارش جدید</Button>} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[['all','همه'],['در انتظار','در انتظار'],['در راه','در راه'],['تحویل‌شده','تحویل‌شده']].map(([v,l]) => (
              <button key={v} onClick={() => setPoFilter(v)} style={{ padding: '5px 14px', borderRadius: 20, border: 'none', background: poFilter === v ? ACC + '22' : COLOR.surfaceAlt, color: poFilter === v ? ACC : COLOR.textFaint, fontFamily: 'inherit', fontSize: FONT.sm + 1, cursor: 'pointer' }}>{l}</button>
            ))}
          </div>
          <DataTable
            columns={[
              { key: 'id',           header: 'شماره PO',      render: r => <span style={{ color: ACC }}>{r.id as string}</span> },
              { key: 'supplier',     header: 'تامین‌کننده' },
              { key: 'items',        header: 'اقلام',          render: r => `${r.items} قلم` },
              { key: 'orderDate',    header: 'تاریخ سفارش',   render: r => <span style={{ color: COLOR.textFaint }}>{r.orderDate as string}</span> },
              { key: 'deliveryDate', header: 'تاریخ تحویل' },
              { key: 'total',        header: 'مبلغ',           render: r => <strong>{fmtMil(r.total as number)}</strong> },
              { key: 'status',       header: 'وضعیت',          render: r => <Badge label={r.status as string} color={PO_STATUS_COLOR[r.status as string]} /> },
            ]}
            rows={filteredOrders as unknown as Record<string, unknown>[]}
            keyField="id"
          />
        </>
      )}

      {/* Receive */}
      {section === 'receive' && (
        <>
          <PageHeader title="دریافت کالا" color={ACC} />
          <div style={{ maxWidth: 680, ...CARD, padding: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <SelectInput label="تامین‌کننده" value={recSupplier} onChange={e => setRecSupplier(e.target.value)}>
                <option value="">انتخاب کنید…</option>
                {SUPPLIERS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </SelectInput>
              <TextInput label="شماره PO مرجع" value={recRef} onChange={e => setRecRef(e.target.value)} placeholder="PO-xxxx" />
            </div>

            {/* Items */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: FONT.sm + 1, color: COLOR.textMuted }}>اقلام دریافتی</span>
                <Button size="sm" color={ACC} onClick={() => setRecItems(p => [...p, { name: '', qty: '', price: '' }])}>+ افزودن ردیف</Button>
              </div>
              <div style={{ background: COLOR.surfaceAlt, borderRadius: 8, overflow: 'hidden', border: `1px solid ${COLOR.border}` }}>
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 2fr 32px', gap: 0, padding: '8px 12px', background: COLOR.surface, borderBottom: `1px solid ${COLOR.border}` }}>
                  {['نام کالا','تعداد','قیمت واحد',''].map(h => <span key={h} style={{ fontSize: FONT.xs + 1, color: COLOR.textFaint }}>{h}</span>)}
                </div>
                {recItems.map((item, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 2fr 32px', gap: 8, padding: '8px 12px', borderBottom: i < recItems.length - 1 ? `1px solid rgba(255,255,255,.04)` : 'none', alignItems: 'center' }}>
                    <input value={item.name}  onChange={e => setRecItems(p => p.map((x,j) => j===i ? {...x, name: e.target.value}  : x))} style={{ background: COLOR.surfaceAlt, border: `1px solid ${COLOR.border}`, borderRadius: 6, padding: '6px 10px', color: COLOR.textSecondary, fontFamily: 'inherit', fontSize: FONT.base, outline: 'none' }} />
                    <input value={item.qty}   onChange={e => setRecItems(p => p.map((x,j) => j===i ? {...x, qty: e.target.value}   : x))} type="number" style={{ background: COLOR.surfaceAlt, border: `1px solid ${COLOR.border}`, borderRadius: 6, padding: '6px 8px',  color: COLOR.textSecondary, fontFamily: 'inherit', fontSize: FONT.base, outline: 'none' }} />
                    <input value={item.price} onChange={e => setRecItems(p => p.map((x,j) => j===i ? {...x, price: e.target.value} : x))} type="number" style={{ background: COLOR.surfaceAlt, border: `1px solid ${COLOR.border}`, borderRadius: 6, padding: '6px 10px', color: COLOR.textSecondary, fontFamily: 'inherit', fontSize: FONT.base, outline: 'none' }} />
                    <button onClick={() => setRecItems(p => p.filter((_,j) => j !== i))} style={{ background: 'none', border: 'none', color: COLOR.red + '77', cursor: 'pointer', fontSize: 18, padding: 0 }}>×</button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <SelectInput label="انبار مقصد" value={recWh} onChange={e => setRecWh(e.target.value)}>
                <option value="wh1">انبار ۱</option>
                <option value="wh2">انبار ۲</option>
              </SelectInput>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', flexDirection: 'column' }}>
                <div style={{ fontSize: FONT.xs, color: COLOR.textFaint }}>جمع کل</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: ACC }}>{fmtNum(recTotal)}</div>
              </div>
            </div>
            <Button color={ACC} style={{ width: '100%', textAlign: 'center', padding: 12 }}>ثبت دریافت کالا</Button>
          </div>
        </>
      )}

      {/* New PO modal */}
      <Modal open={newPOOpen} onClose={() => setNewPOOpen(false)} title="سفارش خرید جدید" titleColor={ACC} width={460}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SelectInput label="تامین‌کننده" value={poSupplier} onChange={e => setPoSupplier(e.target.value)}>
            <option value="">انتخاب کنید…</option>
            {SUPPLIERS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </SelectInput>
          <TextInput label="تاریخ تحویل" value={poDate} onChange={e => setPoDate(e.target.value)} placeholder="۱۴۰۳/۰۵/۰۱" />
          <SelectInput label="شرایط پرداخت" value={poTerms} onChange={e => setPoTerms(e.target.value)}>
            <option value="">انتخاب کنید…</option>
            <option value="cash">نقدی</option>
            <option value="30">۳۰ روزه</option>
            <option value="60">۶۰ روزه</option>
            <option value="check">چک</option>
          </SelectInput>
          <Textarea label="توضیحات" value={poNotes} onChange={e => setPoNotes(e.target.value)} rows={3} />
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Button color={ACC} onClick={() => setNewPOOpen(false)} style={{ flex: 1, textAlign: 'center' }}>ثبت سفارش</Button>
            <Button variant="ghost" onClick={() => setNewPOOpen(false)} style={{ flex: 1, textAlign: 'center' }}>انصراف</Button>
          </div>
        </div>
      </Modal>
    </ModuleShell>
  );
}
