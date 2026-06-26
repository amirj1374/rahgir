import { useState, useMemo, useCallback } from 'react';
import { fmtNum as fmt } from '../hooks/useFormat';
import { invoices as invoiceHooks, products as productHooks, customers as customerHooks } from '../hooks/queries';
import { useAuth } from '../auth/AuthContext';
import type { Invoice, InvoiceItem, InvoiceStatus, Product, Customer } from '../types';

const STATUS_MAP: Record<InvoiceStatus, { label: string; bg: string; color: string; border: string }> = {
  DRAFT:          { label: 'پیش‌نویس',    bg: 'rgba(255,255,255,.06)', color: '#6b7280', border: 'rgba(255,255,255,.08)' },
  CONFIRMED:      { label: 'تأییدشده',     bg: 'rgba(232,169,76,.1)',   color: '#e8a94c', border: 'rgba(232,169,76,.22)' },
  PARTIALLY_PAID: { label: 'پرداخت جزئی',  bg: 'rgba(56,189,248,.1)',   color: '#38bdf8', border: 'rgba(56,189,248,.2)'  },
  PAID:           { label: 'پرداخت‌شده',   bg: 'rgba(74,222,128,.1)',   color: '#4ade80', border: 'rgba(74,222,128,.2)'  },
  CANCELLED:      { label: 'لغوشده',       bg: 'rgba(239,68,68,.1)',    color: '#ef4444', border: 'rgba(239,68,68,.2)'   },
};

const GROUP_LABEL: Record<string, string> = { VIP: 'VIP', WHOLESALE: 'عمده', RETAIL: 'خرده' };

/** A draft line in the new-invoice editor (before it is sent to the server). */
interface DraftItem {
  key: number;
  productId?: number;
  productName: string;
  sku?: string;
  qty: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
}

type SalesSec = 'dashboard' | 'new-invoice' | 'invoices';

export default function SalesModule({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const defaultTax = 0;

  const { data: savedInvoices = [] } = invoiceHooks.useList();
  const { data: allProducts = [] } = productHooks.useList();
  const { data: allCustomers = [] } = customerHooks.useList();
  const createInvoice = invoiceHooks.useCreate();
  const removeInvoice = invoiceHooks.useRemove();

  const [sec, setSec] = useState<SalesSec>('new-invoice');
  const [items, setItems] = useState<DraftItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState('');
  const [globalDisc, setGlobalDisc] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [showProdModal, setShowProdModal] = useState(false);
  const [showCustModal, setShowCustModal] = useState(false);
  const [prodSearch, setProdSearch] = useState('');
  const [custSearch, setCustSearch] = useState('');
  const [listFilter, setListFilter] = useState<InvoiceStatus | 'all'>('all');
  const [error, setError] = useState('');

  const addProduct = useCallback((p: Product) => {
    setItems(prev => [...prev, {
      key: Date.now(), productId: p.id, productName: p.name, sku: p.sku,
      qty: 1, unitPrice: p.price ?? 0, discount: 0, taxRate: defaultTax,
    }]);
    setShowProdModal(false);
    setProdSearch('');
  }, []);

  const patchItem = (key: number, field: keyof DraftItem, raw: string) => {
    const num = parseFloat(raw.replace(/[^0-9.]/g, '')) || 0;
    setItems(prev => prev.map(it => (it.key === key ? { ...it, [field]: num } : it)));
  };

  const lineNet = (it: DraftItem) => Math.max(0, it.qty * it.unitPrice - it.discount);
  const lineTax = (it: DraftItem) => Math.round((lineNet(it) * it.taxRate) / 100);
  const lineTotal = (it: DraftItem) => lineNet(it) + lineTax(it);

  const subtotal = items.reduce((a, it) => a + lineNet(it), 0);
  const taxAmount = items.reduce((a, it) => a + lineTax(it), 0);
  const total = Math.max(0, subtotal - globalDisc) + taxAmount;
  const canSave = items.length > 0 && !createInvoice.isPending;

  const resetForm = () => {
    setItems([]); setCustomer(null); setGlobalDisc(0); setPaidAmount(0); setNotes(''); setDueDate('');
  };

  const save = async () => {
    if (!canSave) return;
    setError('');
    const payload: Invoice = {
      type: 'SALE',
      customerId: customer?.id,
      customerName: customer?.name,
      issueDate,
      dueDate: dueDate || undefined,
      discount: globalDisc,
      paidAmount,
      notes,
      items: items.map<InvoiceItem>(it => ({
        productId: it.productId, productName: it.productName, sku: it.sku,
        quantity: it.qty, unitPrice: it.unitPrice, discount: it.discount, taxRate: it.taxRate,
      })),
    };
    try {
      await createInvoice.mutateAsync(payload);
      resetForm();
      setSec('invoices');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در ثبت فاکتور');
    }
  };

  const filtered = useMemo(
    () => savedInvoices.filter(inv => listFilter === 'all' || inv.status === listFilter),
    [savedInvoices, listFilter],
  );
  const paidRev = useMemo(
    () => savedInvoices.filter(i => i.status === 'PAID').reduce((a, i) => a + (i.total ?? 0), 0),
    [savedInvoices],
  );
  const outstanding = useMemo(
    () => savedInvoices.reduce((a, i) => a + (i.balance ?? 0), 0),
    [savedInvoices],
  );

  const modalProds = useMemo(
    () => allProducts.filter(p => !prodSearch || p.name.includes(prodSearch) || (p.sku ?? '').toLowerCase().includes(prodSearch.toLowerCase())),
    [allProducts, prodSearch],
  );
  const modalCusts = useMemo(
    () => allCustomers.filter(c => !custSearch || c.name.includes(custSearch) || (c.phone ?? '').includes(custSearch)),
    [allCustomers, custSearch],
  );

  const navItems = [
    { id: 'dashboard',   icon: '📊', label: 'لوح‌کل فروش',   group: 'داشبورد' },
    { id: 'new-invoice', icon: '➕', label: 'فاکتور جدید',   group: 'فاکتورها' },
    { id: 'invoices',    icon: '📋', label: 'لیست فاکتورها', group: 'فاکتورها', badge: String(savedInvoices.length) },
  ];
  const pageTitles: Record<SalesSec, string> = { 'new-invoice': 'فاکتور جدید', invoices: 'لیست فاکتورها', dashboard: 'لوح‌کل فروش' };

  const card = (style?: React.CSSProperties) => ({ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, ...style } as React.CSSProperties);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#060a13', color: '#e8edf5' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, flexShrink: 0, background: '#070d1a', borderLeft: '1px solid rgba(255,255,255,.05)', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <div style={{ padding: '14px 12px', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#e8a94c,#f5c842)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: '#060a13' }}>B</div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 900, color: '#f0f4ff' }}>بیزنس‌کور</div>
            <div style={{ fontSize: 10, color: '#fb923c', fontWeight: 700 }}>ماژول فروش</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '8px 5px', overflowY: 'auto' }}>
          {['داشبورد', 'فاکتورها'].map(grp => (
            <div key={grp} style={{ marginBottom: 2 }}>
              <div style={{ fontSize: 9, color: '#1f2937', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', padding: '8px 9px 4px' }}>{grp}</div>
              {navItems.filter(n => n.group === grp).map(n => (
                <button key={n.id} onClick={() => setSec(n.id as SalesSec)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '8px 9px', borderRadius: 7, border: 'none', cursor: 'pointer', background: sec === n.id ? 'rgba(232,169,76,.09)' : 'transparent', fontFamily: "'Vazirmatn',sans-serif", fontSize: 12, fontWeight: sec === n.id ? 700 : 500, color: sec === n.id ? '#e8a94c' : '#8892a4', textAlign: 'right', marginBottom: 1 }}>
                  <span style={{ fontSize: 13, width: 16, textAlign: 'center', flexShrink: 0 }}>{n.icon}</span>
                  <span style={{ flex: 1 }}>{n.label}</span>
                  {n.badge && <span style={{ background: 'rgba(255,255,255,.08)', color: '#8892a4', fontSize: 9, padding: '1px 6px', borderRadius: 20, fontWeight: 800 }}>{n.badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,.05)', flexShrink: 0 }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 9px', borderRadius: 7, color: '#374151', fontSize: 11, fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', fontFamily: "'Vazirmatn',sans-serif" }}>
            <span>⟵</span><span>خانه</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <header style={{ height: 54, flexShrink: 0, background: '#070d1a', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: '#374151', marginBottom: 1 }}>فروش / {pageTitles[sec]} · {user?.tenantName}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f0f4ff' }}>{pageTitles[sec]}</div>
          </div>
          <button onClick={() => { resetForm(); setSec('new-invoice'); }} style={{ background: 'linear-gradient(135deg,#e8a94c,#f5c842)', color: '#060a13', border: 'none', padding: '7px 14px', borderRadius: 7, fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif", whiteSpace: 'nowrap' }}>+ فاکتور جدید</button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: 14, background: '#060a13', position: 'relative' }}>

          {/* Dashboard */}
          {sec === 'dashboard' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {[
                { icon: '💰', value: fmt(paidRev),    label: 'درآمد دریافت‌شده', color: '#4ade80' },
                { icon: '⏳', value: fmt(outstanding), label: 'مانده دریافتی',    color: '#e8a94c' },
                { icon: '📋', value: String(savedInvoices.length), label: 'کل فاکتورها', color: '#38bdf8' },
                { icon: '✅', value: String(savedInvoices.filter(i => i.status === 'PAID').length), label: 'پرداخت‌شده', color: '#a78bfa' },
              ].map(ds => (
                <div key={ds.label} style={{ ...card(), padding: 16 }}>
                  <div style={{ fontSize: 18, marginBottom: 7 }}>{ds.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: ds.color, lineHeight: 1, marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>{ds.value}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{ds.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* New Invoice */}
          {sec === 'new-invoice' && (
            <div style={{ maxWidth: 960 }}>
              {error && <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#ef4444', padding: '9px 14px', borderRadius: 8, fontSize: 12, marginBottom: 10 }}>{error}</div>}

              {/* Meta */}
              <div style={{ ...card(), padding: '13px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 9, color: '#374151', fontWeight: 700, marginBottom: 4 }}>تاریخ صدور</div>
                  <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} style={inputStyle(118)} />
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#374151', fontWeight: 700, marginBottom: 4 }}>سررسید پرداخت</div>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={inputStyle(118)} />
                </div>
              </div>

              {/* Customer */}
              <div style={{ ...card(), padding: '12px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {customer ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, background: 'rgba(232,169,76,.15)', border: '1.5px solid rgba(232,169,76,.38)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 900, color: '#e8a94c' }}>{customer.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#f0f4ff', marginBottom: 4 }}>{customer.name}</div>
                        <span style={{ fontSize: 11, color: '#6b7280', direction: 'ltr' }}>{customer.phone}</span>
                      </div>
                    </div>
                    <button onClick={() => setCustomer(null)} style={ghostBtn}>تغییر مشتری</button>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>مشتری انتخاب نشده (فروش نقدی)</span>
                    <button onClick={() => setShowCustModal(true)} style={{ background: 'rgba(56,189,248,.08)', border: '1px solid rgba(56,189,248,.22)', color: '#38bdf8', padding: '7px 16px', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>👥 انتخاب مشتری</button>
                  </>
                )}
              </div>

              {/* Items */}
              <div style={{ ...card(), overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '30px 1fr 70px 120px 90px 60px 120px 34px', padding: '9px 14px', background: 'rgba(255,255,255,.03)', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                  {['#', 'محصول', 'تعداد', 'قیمت واحد', 'تخفیف', 'مالیات٪', 'مبلغ (تومان)', ''].map((h, i) => (
                    <div key={i} style={{ fontSize: 9, color: '#374151', fontWeight: 700 }}>{h}</div>
                  ))}
                </div>
                {items.map((it, i) => (
                  <div key={it.key} style={{ display: 'grid', gridTemplateColumns: '30px 1fr 70px 120px 90px 60px 120px 34px', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,.04)', alignItems: 'center' }}>
                    <div style={{ fontSize: 11, color: '#374151', fontWeight: 700 }}>{i + 1}</div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: 12, color: '#e8edf5', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.productName}</div>
                      {it.sku && <div style={{ fontSize: 9, color: '#374151', marginTop: 1, direction: 'ltr', textAlign: 'right' }}>{it.sku}</div>}
                    </div>
                    <div><input type="number" value={it.qty} onChange={e => patchItem(it.key, 'qty', e.target.value)} style={cellInput(58, 'center')} /></div>
                    <div><input type="text" value={it.unitPrice} onChange={e => patchItem(it.key, 'unitPrice', e.target.value)} style={cellInput(104, 'left')} /></div>
                    <div><input type="text" value={it.discount} onChange={e => patchItem(it.key, 'discount', e.target.value)} style={cellInput(76, 'left')} /></div>
                    <div><input type="number" value={it.taxRate} onChange={e => patchItem(it.key, 'taxRate', e.target.value)} style={cellInput(46, 'center')} /></div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: '#f0f4ff', textAlign: 'left', fontVariantNumeric: 'tabular-nums', paddingRight: 4 }}>{fmt(lineTotal(it))}</div>
                    <div><button onClick={() => setItems(prev => prev.filter(x => x.key !== it.key))} style={{ width: 26, height: 26, background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 6, color: '#ef4444', fontSize: 13, cursor: 'pointer' }}>✕</button></div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div style={{ padding: 36, textAlign: 'center' }}>
                    <div style={{ fontSize: 36, marginBottom: 12, opacity: .18 }}>📦</div>
                    <p style={{ fontSize: 12, color: '#374151', margin: 0 }}>هنوز محصولی اضافه نشده</p>
                  </div>
                )}
                <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,.04)' }}>
                  <button onClick={() => setShowProdModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.025)', border: '1px dashed rgba(255,255,255,.1)', borderRadius: 8, padding: '8px 14px', color: '#8892a4', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>
                    <span style={{ fontSize: 17, color: '#e8a94c', fontWeight: 900, lineHeight: 1 }}>+</span><span>افزودن محصول</span>
                  </button>
                </div>
              </div>

              {/* Notes + totals */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 10, alignItems: 'start' }}>
                <div style={{ ...card(), padding: 14 }}>
                  <div style={{ fontSize: 10, color: '#374151', fontWeight: 700, marginBottom: 8 }}>یادداشت فاکتور</div>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="توضیحات، شرایط پرداخت..." style={{ width: '100%', height: 82, background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 8, padding: '9px 11px', color: '#a0aab8', fontSize: 12, outline: 'none', resize: 'none', lineHeight: 1.8, fontFamily: "'Vazirmatn',sans-serif" }} />
                </div>
                <div style={{ ...card(), padding: 16 }}>
                  <Row label="جمع اقلام:" value={fmt(subtotal)} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: '#8892a4' }}>تخفیف فاکتور:</span>
                    <input type="text" value={globalDisc} onChange={e => setGlobalDisc(parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0)} style={cellInput(96, 'left')} />
                  </div>
                  <Row label="مالیات:" value={fmt(taxAmount)} />
                  <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#f0f4ff' }}>قابل پرداخت:</span>
                    <span style={{ fontSize: 20, fontWeight: 900, color: '#e8a94c', fontVariantNumeric: 'tabular-nums' }}>{fmt(total)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 }}>
                    <span style={{ fontSize: 12, color: '#8892a4' }}>دریافت‌شده:</span>
                    <input type="text" value={paidAmount} onChange={e => setPaidAmount(parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0)} style={cellInput(96, 'left')} />
                  </div>
                  <button onClick={save} disabled={!canSave} style={{ width: '100%', background: canSave ? 'linear-gradient(135deg,#e8a94c,#f5c842)' : 'rgba(255,255,255,.06)', color: canSave ? '#060a13' : '#374151', border: 'none', padding: 11, borderRadius: 9, fontSize: 13, fontWeight: 800, cursor: canSave ? 'pointer' : 'not-allowed', fontFamily: "'Vazirmatn',sans-serif" }}>
                    {createInvoice.isPending ? 'در حال ثبت…' : 'ثبت فاکتور ←'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Invoice list */}
          {sec === 'invoices' && (
            <div>
              <div style={{ display: 'flex', gap: 7, marginBottom: 12, flexWrap: 'wrap' }}>
                {(['all', 'PAID', 'PARTIALLY_PAID', 'CONFIRMED', 'DRAFT'] as const).map(k => {
                  const cnt = k === 'all' ? savedInvoices.length : savedInvoices.filter(i => i.status === k).length;
                  const act = listFilter === k;
                  const label = k === 'all' ? 'همه' : STATUS_MAP[k].label;
                  return (
                    <button key={k} onClick={() => setListFilter(k)} style={{ background: act ? 'rgba(232,169,76,.1)' : 'rgba(255,255,255,.03)', border: act ? '1px solid rgba(232,169,76,.3)' : '1px solid rgba(255,255,255,.06)', color: act ? '#e8a94c' : '#8892a4', padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: act ? 700 : 500, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>
                      {label} <span style={{ opacity: .65 }}>({cnt})</span>
                    </button>
                  );
                })}
              </div>
              <div style={{ ...card(), overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '155px 1fr 90px 120px 120px 100px 40px', padding: '9px 14px', background: 'rgba(255,255,255,.03)', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                  {['شماره فاکتور', 'مشتری', 'اقلام', 'تاریخ', 'مبلغ (ت)', 'وضعیت', ''].map(h => (
                    <div key={h} style={{ fontSize: 9, color: '#374151', fontWeight: 700 }}>{h}</div>
                  ))}
                </div>
                {filtered.map(inv => {
                  const st = STATUS_MAP[inv.status ?? 'DRAFT'];
                  return (
                    <div key={inv.id} style={{ display: 'grid', gridTemplateColumns: '155px 1fr 90px 120px 120px 100px 40px', padding: '11px 14px', borderBottom: '1px solid rgba(255,255,255,.04)', alignItems: 'center' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#e8a94c', direction: 'ltr' }}>{inv.number}</div>
                      <div style={{ fontSize: 12, color: '#e8edf5', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.customerName || 'نقدی'}</div>
                      <div style={{ fontSize: 11, color: '#8892a4' }}>{inv.items?.length ?? 0} قلم</div>
                      <div style={{ fontSize: 11, color: '#6b7280', direction: 'ltr', textAlign: 'right' }}>{inv.issueDate}</div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: '#f0f4ff', fontVariantNumeric: 'tabular-nums' }}>{fmt(inv.total ?? 0)}</div>
                      <div><span style={{ fontSize: 9, background: st.bg, color: st.color, padding: '2px 8px', borderRadius: 20, fontWeight: 700, border: `1px solid ${st.border}` }}>{st.label}</span></div>
                      <div><button onClick={() => inv.id && confirm('حذف این فاکتور؟') && removeInvoice.mutate(inv.id)} style={{ width: 28, height: 26, background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 6, color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>✕</button></div>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div style={{ padding: 36, textAlign: 'center' }}>
                    <div style={{ fontSize: 36, opacity: .2, marginBottom: 12 }}>📋</div>
                    <p style={{ fontSize: 12, color: '#374151', margin: 0 }}>فاکتوری در این دسته وجود ندارد</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product picker */}
      {showProdModal && (
        <Modal onClose={() => setShowProdModal(false)} width={620}>
          <ModalSearch value={prodSearch} onChange={setProdSearch} placeholder="جستجو نام یا کد محصول..." onClose={() => setShowProdModal(false)} />
          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {modalProds.map(p => (
              <div key={p.id} onClick={() => addProduct(p)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,.04)', cursor: 'pointer' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#e8edf5' }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: '#4b5563', direction: 'ltr', textAlign: 'right', marginTop: 3 }}>{p.sku}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#e8a94c', fontVariantNumeric: 'tabular-nums' }}>{fmt(p.price ?? 0)}</div>
              </div>
            ))}
            {modalProds.length === 0 && <div style={{ padding: 30, textAlign: 'center', fontSize: 12, color: '#374151' }}>محصولی یافت نشد</div>}
          </div>
        </Modal>
      )}

      {/* Customer picker */}
      {showCustModal && (
        <Modal onClose={() => setShowCustModal(false)} width={460}>
          <ModalSearch value={custSearch} onChange={setCustSearch} placeholder="جستجو نام یا موبایل..." onClose={() => setShowCustModal(false)} />
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {modalCusts.map(c => (
              <div key={c.id} onClick={() => { setCustomer(c); setShowCustModal(false); }} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,.04)', cursor: 'pointer' }}>
                <div style={{ width: 38, height: 38, background: 'rgba(232,169,76,.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#e8a94c', flexShrink: 0 }}>{c.name.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5' }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: '#6b7280', direction: 'ltr', textAlign: 'right', marginTop: 2 }}>{c.phone}</div>
                </div>
                {c.group && <span style={{ fontSize: 9, background: 'rgba(56,189,248,.1)', color: '#38bdf8', padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>{GROUP_LABEL[c.group] ?? c.group}</span>}
              </div>
            ))}
            {modalCusts.length === 0 && <div style={{ padding: 30, textAlign: 'center', fontSize: 12, color: '#374151' }}>مشتری‌ای یافت نشد</div>}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── small helpers ────────────────────────────────────────────────────────────────
const inputStyle = (w: number): React.CSSProperties => ({ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, padding: '4px 9px', color: '#f0f4ff', fontSize: 12, outline: 'none', width: w, fontFamily: "'Vazirmatn',sans-serif" });
const cellInput = (w: number, align: 'left' | 'center'): React.CSSProperties => ({ width: w, background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, padding: '5px 8px', color: '#f0f4ff', fontSize: 12, fontWeight: 700, outline: 'none', textAlign: align, direction: align === 'left' ? 'ltr' : 'rtl' });
const ghostBtn: React.CSSProperties = { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', color: '#8892a4', padding: '5px 11px', borderRadius: 7, fontSize: 11, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" };

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <span style={{ fontSize: 12, color: '#8892a4' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#f0f4ff', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

function Modal({ children, onClose, width }: { children: React.ReactNode; onClose: () => void; width: number }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.78)', backdropFilter: 'blur(5px)' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width, background: '#0d1320', border: '1px solid rgba(255,255,255,.09)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 28px 80px rgba(0,0,0,.65)' }}>
        {children}
      </div>
    </div>
  );
}

function ModalSearch({ value, onChange, placeholder, onClose }: { value: string; onChange: (v: string) => void; placeholder: string; onClose: () => void }) {
  return (
    <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 11 }}>
      <input autoFocus type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ flex: 1, background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 9, padding: '9px 12px', color: '#f0f4ff', fontSize: 13, outline: 'none', fontFamily: "'Vazirmatn',sans-serif" }} />
      <button onClick={onClose} style={{ width: 32, height: 32, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: '#8892a4', fontSize: 15, cursor: 'pointer' }}>✕</button>
    </div>
  );
}
