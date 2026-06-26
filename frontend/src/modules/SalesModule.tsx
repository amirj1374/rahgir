import { useState, useMemo, useCallback } from 'react';
import { fmtNum as fmt } from '../hooks/useFormat';

type InvStatus = 'draft' | 'pending' | 'paid' | 'cancelled';
interface InvItem { id: number; sku: string; name: string; variantLabel: string; qty: number; unitPrice: number; discPct: number; total: number; }
interface SavedInvoice { id: number; num: string; customer: string; date: string; total: number; status: InvStatus; itemCount: number; items?: InvItem[]; subtotal?: number; gDiscAmt?: number; tax?: number; grand?: number; notes?: string; custName?: string; custPhone?: string; custGroup?: string; dueDate?: string; statusLabel?: string; }

const STATUS_MAP: Record<InvStatus, { label: string; bg: string; color: string; border: string }> = {
  draft:     { label: 'پیش‌نویس',   bg: 'rgba(255,255,255,.06)', color: '#6b7280', border: 'rgba(255,255,255,.08)' },
  pending:   { label: 'در انتظار',  bg: 'rgba(232,169,76,.1)',   color: '#e8a94c', border: 'rgba(232,169,76,.22)' },
  paid:      { label: 'پرداخت‌شده', bg: 'rgba(74,222,128,.1)',   color: '#4ade80', border: 'rgba(74,222,128,.2)'  },
  cancelled: { label: 'لغوشده',     bg: 'rgba(239,68,68,.1)',    color: '#ef4444', border: 'rgba(239,68,68,.2)'   },
};

const ALL_PRODUCTS = [
  { sku: 'TSH-001', name: 'تی‌شرت مردانه', catIcon: '👕', price: 185000, isVariable: true,
    attributes: [{ name: 'رنگ', key: 'color', values: ['سفید', 'مشکی', 'آبی نیوی'] }, { name: 'سایز', key: 'size', values: ['S', 'M', 'L', 'XL'] }],
    variants: [
      { color: 'سفید', size: 'S', sku: 'TSH-WH-S', stock: 8, price: 185000 }, { color: 'سفید', size: 'M', sku: 'TSH-WH-M', stock: 15, price: 185000 },
      { color: 'سفید', size: 'L', sku: 'TSH-WH-L', stock: 22, price: 185000 }, { color: 'سفید', size: 'XL', sku: 'TSH-WH-X', stock: 10, price: 195000 },
      { color: 'مشکی', size: 'S', sku: 'TSH-BK-S', stock: 5, price: 185000 }, { color: 'مشکی', size: 'M', sku: 'TSH-BK-M', stock: 18, price: 185000 },
      { color: 'مشکی', size: 'L', sku: 'TSH-BK-L', stock: 12, price: 185000 }, { color: 'مشکی', size: 'XL', sku: 'TSH-BK-X', stock: 0, price: 195000 },
      { color: 'آبی نیوی', size: 'S', sku: 'TSH-NV-S', stock: 3, price: 185000 }, { color: 'آبی نیوی', size: 'M', sku: 'TSH-NV-M', stock: 20, price: 185000 },
      { color: 'آبی نیوی', size: 'L', sku: 'TSH-NV-L', stock: 18, price: 185000 }, { color: 'آبی نیوی', size: 'XL', sku: 'TSH-NV-X', stock: 14, price: 195000 },
    ] },
  { sku: 'SHO-002', name: 'کفش اسپورت رانینگ', catIcon: '👟', price: 850000, isVariable: false, attributes: [], variants: [] },
  { sku: 'JNS-003', name: 'شلوار جین اسلیم فیت', catIcon: '👖', price: 420000, isVariable: true,
    attributes: [{ name: 'رنگ', key: 'color', values: ['آبی روشن', 'آبی تیره'] }, { name: 'کمر', key: 'waist', values: ['۲۸', '۳۰', '۳۲', '۳۴'] }],
    variants: [
      { color: 'آبی روشن', waist: '۲۸', sku: 'JNS-LB-28', stock: 8, price: 420000 }, { color: 'آبی روشن', waist: '۳۰', sku: 'JNS-LB-30', stock: 12, price: 420000 },
      { color: 'آبی روشن', waist: '۳۲', sku: 'JNS-LB-32', stock: 15, price: 420000 }, { color: 'آبی روشن', waist: '۳۴', sku: 'JNS-LB-34', stock: 5, price: 420000 },
      { color: 'آبی تیره', waist: '۲۸', sku: 'JNS-DB-28', stock: 6, price: 420000 }, { color: 'آبی تیره', waist: '۳۰', sku: 'JNS-DB-30', stock: 18, price: 420000 },
      { color: 'آبی تیره', waist: '۳۲', sku: 'JNS-DB-32', stock: 10, price: 420000 }, { color: 'آبی تیره', waist: '۳۴', sku: 'JNS-DB-34', stock: 10, price: 420000 },
    ] },
  { sku: 'BAG-004', name: 'کیف چرم زنانه', catIcon: '👜', price: 670000, isVariable: false, attributes: [], variants: [] },
  { sku: 'PRF-005', name: 'عطر مردانه کلاسیک', catIcon: '🧴', price: 1200000, isVariable: false, attributes: [], variants: [] },
  { sku: 'CAP-006', name: 'کلاه بیسبال', catIcon: '🧢', price: 125000, isVariable: false, attributes: [], variants: [] },
  { sku: 'BLT-007', name: 'کمربند چرمی مردانه', catIcon: '🔗', price: 280000, isVariable: false, attributes: [], variants: [] },
  { sku: 'SRT-008', name: 'شورت ورزشی', catIcon: '🩳', price: 95000, isVariable: false, attributes: [], variants: [] },
];

const ALL_CUSTOMERS = [
  { id: 'C001', name: 'علی محمدی',   phone: '0912-123-4567', group: 'VIP',  balance: 520000,   balPos: true  },
  { id: 'C002', name: 'سارا احمدی',  phone: '0935-987-6543', group: 'عمده', balance: -1200000, balPos: false },
  { id: 'C003', name: 'رضا کریمی',   phone: '0917-456-7890', group: 'خرده', balance: 0,        balPos: null  },
  { id: 'C004', name: 'مریم تهرانی', phone: '0936-321-0987', group: 'VIP',  balance: 85000,    balPos: true  },
  { id: 'C005', name: 'حسن رضایی',   phone: '0921-654-3210', group: 'عمده', balance: -3500000, balPos: false },
];

const INIT_INVOICES: SavedInvoice[] = [
  { id: 1, num: 'INV-1405-001', customer: 'علی محمدی',   date: '۱۴۰۵/۰۴/۰۱', total: 1850000, status: 'paid',      itemCount: 3 },
  { id: 2, num: 'INV-1405-002', customer: 'سارا احمدی',  date: '۱۴۰۵/۰۴/۰۲', total: 5640000, status: 'pending',   itemCount: 7 },
  { id: 3, num: 'INV-1405-003', customer: 'رضا کریمی',   date: '۱۴۰۵/۰۴/۰۳', total: 820000,  status: 'draft',     itemCount: 2 },
  { id: 4, num: 'INV-1405-004', customer: 'مریم تهرانی', date: '۱۴۰۳/۲۸/۰۳', total: 3200000, status: 'paid',      itemCount: 5 },
  { id: 5, num: 'INV-1405-005', customer: 'حسن رضایی',   date: '۱۴۰۵/۰۳/۲۵', total: 7800000, status: 'paid',      itemCount: 12 },
  { id: 6, num: 'INV-1405-006', customer: 'فاطمه نوری',  date: '۱۴۰۵/۰۳/۲۰', total: 420000,  status: 'cancelled', itemCount: 1 },
];

type SalesSec = 'dashboard' | 'new-invoice' | 'invoices' | 'proforma' | 'returns' | 'reports';

export default function SalesModule({ onBack }: { onBack: () => void }) {
  const [sec, setSec] = useState<SalesSec>('new-invoice');
  const [invItems, setInvItems] = useState<InvItem[]>([]);
  const [invCustomer, setInvCustomer] = useState<typeof ALL_CUSTOMERS[0] | null>(null);
  const [invDate, setInvDate] = useState('۱۴۰۵/۰۴/۰۵');
  const [invDueDate, setInvDueDate] = useState('۱۴۰۵/۰۵/۰۵');
  const [invGlobalDisc, setInvGlobalDisc] = useState(0);
  const [invTaxPct] = useState(10);
  const [invNotes, setInvNotes] = useState('');
  const [invCounter, setInvCounter] = useState(8);
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>(INIT_INVOICES);
  const [showProdModal, setShowProdModal] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalSelProd, setModalSelProd] = useState<typeof ALL_PRODUCTS[0] | null>(null);
  const [modalAttrs, setModalAttrs] = useState<Record<string, string>>({});
  const [showCustModal, setShowCustModal] = useState(false);
  const [custSearch, setCustSearch] = useState('');
  const [invListFilter, setInvListFilter] = useState<InvStatus | 'all'>('all');

  const invNumber = 'INV-1405-' + String(invCounter).padStart(3, '0');

  const addItem = useCallback((item: Omit<InvItem, 'id'>) => {
    setInvItems(prev => [...prev, { id: Date.now(), ...item }]);
    setShowProdModal(false);
    setModalSelProd(null);
    setModalAttrs({});
    setModalSearch('');
  }, []);

  const updateItemField = (id: number, field: 'qty' | 'unitPrice' | 'discPct', rawVal: string) => {
    const num = parseFloat(rawVal.replace(/[^0-9.]/g, '')) || 0;
    setInvItems(prev => prev.map(it => {
      if (it.id !== id) return it;
      const u = { ...it, [field]: num };
      u.total = Math.round(u.qty * u.unitPrice * (1 - u.discPct / 100));
      return u;
    }));
  };

  const subtotal = invItems.reduce((a, it) => a + it.total, 0);
  const gDiscAmt = Math.round(subtotal * (invGlobalDisc / 100));
  const taxable  = subtotal - gDiscAmt;
  const tax      = Math.round(taxable * (invTaxPct / 100));
  const grand    = taxable + tax;
  const canSave  = invItems.length > 0;

  const saveInvoice = () => {
    if (!canSave) return;
    const newNum = 'INV-1405-' + String(invCounter).padStart(3, '0');
    const newInv: SavedInvoice = {
      id: invCounter, num: newNum,
      customer: invCustomer ? invCustomer.name : 'مشتری نامشخص',
      date: invDate, total: grand, status: 'pending', itemCount: invItems.length,
    };
    setSavedInvoices(prev => [newInv, ...prev]);
    setInvCounter(c => c + 1);
    setInvItems([]);
    setInvCustomer(null);
    setInvNotes('');
    setInvGlobalDisc(0);
    setSec('invoices');
  };

  const filteredInvoices = useMemo(() => savedInvoices.filter(inv => invListFilter === 'all' || inv.status === invListFilter), [savedInvoices, invListFilter]);
  const totalRev   = useMemo(() => savedInvoices.filter(i => i.status === 'paid').reduce((a, i) => a + i.total, 0), [savedInvoices]);
  const pendingRev = useMemo(() => savedInvoices.filter(i => i.status === 'pending').reduce((a, i) => a + i.total, 0), [savedInvoices]);

  const navItems = [
    { id: 'dashboard',   icon: '📊', label: 'لوح‌کل فروش',    group: 'داشبورد' },
    { id: 'new-invoice', icon: '➕', label: 'فاکتور جدید',    group: 'فاکتورها' },
    { id: 'invoices',    icon: '📋', label: 'لیست فاکتورها', group: 'فاکتورها', badge: String(savedInvoices.length) },
    { id: 'proforma',    icon: '📄', label: 'پیش‌فاکتور',    group: 'فاکتورها' },
    { id: 'returns',     icon: '↩', label: 'مرجوعی فروش',   group: 'عملیات', badge: String(savedInvoices.filter(i => i.status === 'pending').length), badgeBg: 'rgba(251,146,60,.1)', badgeColor: '#fb923c' },
    { id: 'reports',     icon: '📈', label: 'گزارش فروش',    group: 'عملیات' },
  ];

  const pageTitles: Record<SalesSec, string> = { 'new-invoice': 'فاکتور جدید', invoices: 'لیست فاکتورها', dashboard: 'لوح‌کل فروش', proforma: 'پیش‌فاکتور', returns: 'مرجوعی فروش', reports: 'گزارش فروش' };

  const modalProds = useMemo(() => ALL_PRODUCTS.filter(p => !modalSearch || p.name.includes(modalSearch) || p.sku.toLowerCase().includes(modalSearch.toLowerCase())), [modalSearch]);

  const modalCusts = useMemo(() => ALL_CUSTOMERS.filter(c => !custSearch || c.name.includes(custSearch) || c.phone.includes(custSearch)), [custSearch]);

  const selectedAttrsComplete = modalSelProd?.isVariable && modalSelProd.attributes.every(a => !!modalAttrs[a.key]);
  const selectedVariant = selectedAttrsComplete && modalSelProd ? modalSelProd.variants.find((v: any) => modalSelProd.attributes.every((a: any) => v[a.key] === modalAttrs[a.key])) : null;

  const confirmAdd = () => {
    if (!modalSelProd) return;
    if (!modalSelProd.isVariable) {
      addItem({ sku: modalSelProd.sku, name: modalSelProd.name, variantLabel: '', qty: 1, unitPrice: modalSelProd.price, discPct: 0, total: modalSelProd.price });
    } else if (selectedVariant) {
      const label = modalSelProd.attributes.map((a: any) => modalAttrs[a.key]).join(' / ');
      addItem({ sku: (selectedVariant as any).sku, name: modalSelProd.name, variantLabel: label, qty: 1, unitPrice: (selectedVariant as any).price, discPct: 0, total: (selectedVariant as any).price });
    }
  };

  const s: Record<string, React.CSSProperties> = {
    sidebar:  { width: 220, flexShrink: 0, background: '#070d1a', borderLeft: '1px solid rgba(255,255,255,.05)', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' },
    main:     { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' },
    header:   { height: 54, flexShrink: 0, background: '#070d1a', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10 },
    content:  { flex: 1, overflowY: 'auto', padding: 14, background: '#060a13', position: 'relative' },
  };

  const card = (style?: React.CSSProperties) => ({ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, ...style } as React.CSSProperties);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#060a13', color: '#e8edf5' }}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={{ padding: '14px 12px', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#e8a94c,#f5c842)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: '#060a13' }}>B</div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 900, color: '#f0f4ff' }}>بیزنس‌کور</div>
            <div style={{ fontSize: 10, color: '#fb923c', fontWeight: 700 }}>ماژول فروش</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '8px 5px', overflowY: 'auto' }}>
          {['داشبورد', 'فاکتورها', 'عملیات'].map(grp => (
            <div key={grp} style={{ marginBottom: 2 }}>
              <div style={{ fontSize: 9, color: '#1f2937', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', padding: '8px 9px 4px' }}>{grp}</div>
              {navItems.filter(n => n.group === grp).map(n => (
                <button key={n.id} onClick={() => setSec(n.id as SalesSec)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '8px 9px', borderRadius: 7, border: 'none', cursor: 'pointer', background: sec === n.id ? 'rgba(232,169,76,.09)' : 'transparent', fontFamily: "'Vazirmatn',sans-serif", fontSize: 12, fontWeight: sec === n.id ? 700 : 500, color: sec === n.id ? '#e8a94c' : '#8892a4', textAlign: 'right', marginBottom: 1 }}>
                  <span style={{ fontSize: 13, width: 16, textAlign: 'center', flexShrink: 0 }}>{n.icon}</span>
                  <span style={{ flex: 1 }}>{n.label}</span>
                  {n.badge && <span style={{ background: n.badgeBg || 'rgba(255,255,255,.08)', color: n.badgeColor || '#8892a4', fontSize: 9, padding: '1px 6px', borderRadius: 20, fontWeight: 800 }}>{n.badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,.05)', flexShrink: 0 }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 9px', borderRadius: 7, color: '#374151', fontSize: 11, fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', fontFamily: "'Vazirmatn',sans-serif" }}>
            <span>⟵</span><span>اطلاعات پایه</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={s.main}>
        <header style={s.header}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: '#374151', marginBottom: 1 }}>فروش / {pageTitles[sec]}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f0f4ff' }}>{pageTitles[sec]}</div>
          </div>
          <button onClick={() => setSec('new-invoice')} style={{ background: 'linear-gradient(135deg,#e8a94c,#f5c842)', color: '#060a13', border: 'none', padding: '7px 14px', borderRadius: 7, fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif", whiteSpace: 'nowrap' }}>+ فاکتور جدید</button>
        </header>

        <div style={s.content}>

          {/* Dashboard */}
          {sec === 'dashboard' && (
            <div style={{ animation: 'fadeSlide .3s ease' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 12 }}>
                {[
                  { icon: '💰', value: fmt(totalRev),   label: 'درآمد دریافت‌شده', color: '#4ade80', glow: 'rgba(74,222,128,.22)' },
                  { icon: '⏳', value: fmt(pendingRev), label: 'در انتظار دریافت', color: '#e8a94c', glow: 'rgba(232,169,76,.22)' },
                  { icon: '📋', value: String(savedInvoices.length), label: 'کل فاکتورها', color: '#38bdf8', glow: 'rgba(56,189,248,.2)' },
                  { icon: '✅', value: String(savedInvoices.filter(i => i.status === 'paid').length), label: 'پرداخت‌شده', color: '#a78bfa', glow: 'rgba(167,139,250,.2)' },
                ].map(ds => (
                  <div key={ds.label} style={{ ...card(), padding: 16, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, background: ds.glow, filter: 'blur(24px)', transform: 'translate(14px,-16px)', pointerEvents: 'none' }} />
                    <div style={{ fontSize: 18, marginBottom: 7 }}>{ds.icon}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: ds.color, lineHeight: 1, marginBottom: 4, fontVariantNumeric: 'tabular-nums', letterSpacing: '-.5px' }}>{ds.value}</div>
                    <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{ds.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...card(), padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12, opacity: .2 }}>📊</div>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>نمودارهای تحلیل فروش در مرحله توسعه هستند</p>
                <button onClick={() => setSec('new-invoice')} style={{ background: 'linear-gradient(135deg,#e8a94c,#f5c842)', color: '#060a13', border: 'none', padding: '10px 24px', borderRadius: 9, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>+ ایجاد فاکتور جدید</button>
              </div>
            </div>
          )}

          {/* New Invoice */}
          {sec === 'new-invoice' && (
            <div style={{ maxWidth: 960, animation: 'fadeSlide .3s ease' }}>
              {/* Meta bar */}
              <div style={{ ...card(), padding: '13px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 9, color: '#374151', fontWeight: 700, marginBottom: 3, letterSpacing: 1 }}>شماره فاکتور</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#e8a94c', direction: 'ltr', letterSpacing: '.5px' }}>{invNumber}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: '#374151', fontWeight: 700, marginBottom: 4 }}>تاریخ صدور</div>
                    <input type="text" value={invDate} onChange={e => setInvDate(e.target.value)} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, padding: '4px 9px', color: '#f0f4ff', fontSize: 12, outline: 'none', width: 106 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: '#374151', fontWeight: 700, marginBottom: 4 }}>سررسید پرداخت</div>
                    <input type="text" value={invDueDate} onChange={e => setInvDueDate(e.target.value)} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, padding: '4px 9px', color: '#f0f4ff', fontSize: 12, outline: 'none', width: 106 }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, background: STATUS_MAP.draft.bg, color: STATUS_MAP.draft.color, padding: '3px 11px', borderRadius: 20, border: `1px solid ${STATUS_MAP.draft.border}` }}>پیش‌نویس</span>
                </div>
                <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                  <button style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#8892a4', padding: '7px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>🖨 چاپ</button>
                  <button style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#8892a4', padding: '7px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>📤 ارسال</button>
                  <button onClick={saveInvoice} style={{ background: canSave ? 'linear-gradient(135deg,#e8a94c,#f5c842)' : 'rgba(255,255,255,.06)', color: canSave ? '#060a13' : '#374151', border: 'none', padding: '7px 16px', borderRadius: 7, fontSize: 11, fontWeight: 800, cursor: canSave ? 'pointer' : 'not-allowed', fontFamily: "'Vazirmatn',sans-serif" }}>ثبت فاکتور ←</button>
                </div>
              </div>

              {/* Customer */}
              <div style={{ ...card(), padding: '12px 16px', marginBottom: 10 }}>
                {invCustomer ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, background: 'rgba(232,169,76,.15)', border: '1.5px solid rgba(232,169,76,.38)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 900, color: '#e8a94c', flexShrink: 0 }}>{invCustomer.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#f0f4ff', marginBottom: 4 }}>{invCustomer.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 11, color: '#6b7280', direction: 'ltr' }}>{invCustomer.phone}</span>
                          <span style={{ fontSize: 9, background: invCustomer.group === 'VIP' ? 'rgba(232,169,76,.15)' : 'rgba(56,189,248,.1)', color: invCustomer.group === 'VIP' ? '#e8a94c' : '#38bdf8', padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>{invCustomer.group}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setInvCustomer(null)} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', color: '#8892a4', padding: '5px 11px', borderRadius: 7, fontSize: 11, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>تغییر مشتری</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,.03)', border: '2px dashed rgba(255,255,255,.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, opacity: .35 }}>👥</div>
                      <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>مشتری انتخاب نشده است</span>
                    </div>
                    <button onClick={() => setShowCustModal(true)} style={{ background: 'rgba(56,189,248,.08)', border: '1px solid rgba(56,189,248,.22)', color: '#38bdf8', padding: '7px 16px', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>👥 انتخاب مشتری</button>
                  </div>
                )}
              </div>

              {/* Items table */}
              <div style={{ ...card(), overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '34px 1fr 86px 130px 68px 122px 34px', padding: '9px 14px', background: 'rgba(255,255,255,.03)', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                  {['#', 'محصول', 'تعداد', 'قیمت واحد (ت)', 'تخفیف%', 'مبلغ (تومان)', ''].map((h, i) => (
                    <div key={i} style={{ fontSize: 9, color: '#374151', fontWeight: 700 }}>{h}</div>
                  ))}
                </div>
                {invItems.map((item, i) => (
                  <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '34px 1fr 86px 130px 68px 122px 34px', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,.04)', alignItems: 'center' }}>
                    <div style={{ fontSize: 11, color: '#374151', fontWeight: 700 }}>{i + 1}</div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: 12, color: '#e8edf5', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                      {item.variantLabel && <div style={{ fontSize: 10, color: '#a78bfa', marginTop: 2, fontWeight: 600 }}>{item.variantLabel}</div>}
                      <div style={{ fontSize: 9, color: '#374151', marginTop: 1, direction: 'ltr', textAlign: 'right' }}>{item.sku}</div>
                    </div>
                    <div><input type="number" value={item.qty} onChange={e => updateItemField(item.id, 'qty', e.target.value)} style={{ width: 64, background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, padding: '5px 8px', color: '#f0f4ff', fontSize: 12, fontWeight: 700, outline: 'none', textAlign: 'center' }} /></div>
                    <div><input type="text" value={item.unitPrice} onChange={e => updateItemField(item.id, 'unitPrice', e.target.value)} style={{ width: 108, background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, padding: '5px 8px', color: '#f0f4ff', fontSize: 12, fontWeight: 700, outline: 'none', direction: 'ltr' }} /></div>
                    <div><input type="number" value={item.discPct} onChange={e => updateItemField(item.id, 'discPct', e.target.value)} style={{ width: 50, background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, padding: '5px 7px', color: '#f0f4ff', fontSize: 12, fontWeight: 700, outline: 'none', textAlign: 'center' }} /></div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: '#f0f4ff', textAlign: 'left', fontVariantNumeric: 'tabular-nums', paddingRight: 4 }}>{fmt(item.total)}</div>
                    <div><button onClick={() => setInvItems(prev => prev.filter(it => it.id !== item.id))} style={{ width: 26, height: 26, background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 6, color: '#ef4444', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button></div>
                  </div>
                ))}
                {invItems.length === 0 && (
                  <div style={{ padding: 36, textAlign: 'center' }}>
                    <div style={{ fontSize: 36, marginBottom: 12, opacity: .18 }}>📦</div>
                    <p style={{ fontSize: 12, color: '#374151', margin: 0 }}>هنوز محصولی اضافه نشده — روی «افزودن محصول» کلیک کنید</p>
                  </div>
                )}
                <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,.04)' }}>
                  <button onClick={() => setShowProdModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.025)', border: '1px dashed rgba(255,255,255,.1)', borderRadius: 8, padding: '8px 14px', color: '#8892a4', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>
                    <span style={{ fontSize: 17, color: '#e8a94c', fontWeight: 900, lineHeight: 1 }}>+</span>
                    <span>افزودن محصول</span>
                  </button>
                </div>
              </div>

              {/* Notes + Totals */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 10, alignItems: 'start' }}>
                <div style={{ ...card(), padding: 14 }}>
                  <div style={{ fontSize: 10, color: '#374151', fontWeight: 700, marginBottom: 8 }}>یادداشت فاکتور</div>
                  <textarea onChange={e => setInvNotes(e.target.value)} value={invNotes} placeholder="توضیحات، شرایط پرداخت..." style={{ width: '100%', height: 82, background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 8, padding: '9px 11px', color: '#a0aab8', fontSize: 12, outline: 'none', resize: 'none', lineHeight: 1.8, fontFamily: "'Vazirmatn',sans-serif" }} />
                </div>
                <div style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: 16 }}>
                  {[
                    { label: 'جمع اقلام:', value: fmt(subtotal), color: '#f0f4ff', size: 13 },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: '#8892a4' }}>{r.label}</span>
                      <span style={{ fontSize: r.size, fontWeight: 700, color: r.color, fontVariantNumeric: 'tabular-nums' }}>{r.value}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: '#8892a4' }}>تخفیف فاکتور:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <input type="number" value={invGlobalDisc} onChange={e => setInvGlobalDisc(parseFloat(e.target.value) || 0)} style={{ width: 42, background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 5, padding: '3px 6px', color: '#f0f4ff', fontSize: 11, outline: 'none', textAlign: 'center' }} />
                      <span style={{ fontSize: 11, color: '#6b7280' }}>٪</span>
                      <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{fmt(gDiscAmt)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 }}>
                    <span style={{ fontSize: 12, color: '#8892a4' }}>مالیات ({invTaxPct}٪):</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#f0f4ff', fontVariantNumeric: 'tabular-nums' }}>{fmt(tax)}</span>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#f0f4ff' }}>قابل پرداخت:</span>
                    <span style={{ fontSize: 20, fontWeight: 900, color: '#e8a94c', fontVariantNumeric: 'tabular-nums', letterSpacing: '-.5px' }}>{fmt(grand)}</span>
                  </div>
                  <button onClick={saveInvoice} style={{ width: '100%', background: canSave ? 'linear-gradient(135deg,#e8a94c,#f5c842)' : 'rgba(255,255,255,.06)', color: canSave ? '#060a13' : '#374151', border: 'none', padding: 11, borderRadius: 9, fontSize: 13, fontWeight: 800, cursor: canSave ? 'pointer' : 'not-allowed', fontFamily: "'Vazirmatn',sans-serif" }}>ثبت و دریافت وجه ←</button>
                </div>
              </div>
            </div>
          )}

          {/* Invoice List */}
          {sec === 'invoices' && (
            <div style={{ animation: 'fadeSlide .3s ease' }}>
              <div style={{ display: 'flex', gap: 7, marginBottom: 12, flexWrap: 'wrap' }}>
                {(['all', 'paid', 'pending', 'draft'] as const).map(k => {
                  const cnt = k === 'all' ? savedInvoices.length : savedInvoices.filter(i => i.status === k).length;
                  const act = invListFilter === k;
                  return (
                    <button key={k} onClick={() => setInvListFilter(k)} style={{ background: act ? 'rgba(232,169,76,.1)' : 'rgba(255,255,255,.03)', border: act ? '1px solid rgba(232,169,76,.3)' : '1px solid rgba(255,255,255,.06)', color: act ? '#e8a94c' : '#8892a4', padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: act ? 700 : 500, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                      {{ all: 'همه', paid: 'پرداخت‌شده', pending: 'در انتظار', draft: 'پیش‌نویس' }[k]}<span style={{ opacity: .65 }}>({cnt})</span>
                    </button>
                  );
                })}
              </div>
              <div style={{ ...card(), overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '155px 1fr 100px 130px 110px 80px 52px', padding: '9px 14px', background: 'rgba(255,255,255,.03)', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                  {['شماره فاکتور', 'مشتری', 'تعداد اقلام', 'تاریخ', 'مبلغ (تومان)', 'وضعیت', 'چاپ'].map(h => (
                    <div key={h} style={{ fontSize: 9, color: '#374151', fontWeight: 700 }}>{h}</div>
                  ))}
                </div>
                {filteredInvoices.map(inv => {
                  const st = STATUS_MAP[inv.status];
                  return (
                    <div key={inv.id} style={{ display: 'grid', gridTemplateColumns: '155px 1fr 100px 130px 110px 80px 52px', padding: '11px 14px', borderBottom: '1px solid rgba(255,255,255,.04)', alignItems: 'center' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#e8a94c', direction: 'ltr', letterSpacing: '.3px' }}>{inv.num}</div>
                      <div style={{ fontSize: 12, color: '#e8edf5', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.customer}</div>
                      <div style={{ fontSize: 11, color: '#8892a4' }}>{inv.itemCount} قلم</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>{inv.date}</div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: '#f0f4ff', fontVariantNumeric: 'tabular-nums' }}>{fmt(inv.total)}</div>
                      <div><span style={{ fontSize: 9, background: st.bg, color: st.color, padding: '2px 8px', borderRadius: 20, fontWeight: 700, border: `1px solid ${st.border}` }}>{st.label}</span></div>
                      <div><button style={{ width: 34, height: 28, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 6, color: '#8892a4', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>🖨</button></div>
                    </div>
                  );
                })}
                {filteredInvoices.length === 0 && (
                  <div style={{ padding: 36, textAlign: 'center' }}>
                    <div style={{ fontSize: 36, opacity: .2, marginBottom: 12 }}>📋</div>
                    <p style={{ fontSize: 12, color: '#374151', margin: 0 }}>هنوز فاکتوری در این دسته‌بندی وجود ندارد</p>
                  </div>
                )}
              </div>
              <div style={{ fontSize: 10, color: '#374151', padding: '11px 2px' }}>{filteredInvoices.length} فاکتور</div>
            </div>
          )}

          {/* Placeholder for other sections */}
          {['proforma', 'returns', 'reports'].includes(sec) && (
            <div style={{ textAlign: 'center', padding: '80px 20px', animation: 'fadeSlide .3s ease' }}>
              <div style={{ fontSize: 48, marginBottom: 14, opacity: .25 }}>{{ proforma: '📄', returns: '↩', reports: '📈' }[sec as 'proforma' | 'returns' | 'reports']}</div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f0f4ff', margin: '0 0 10px' }}>{{ proforma: 'پیش‌فاکتور', returns: 'مرجوعی فروش', reports: 'گزارش فروش' }[sec as 'proforma' | 'returns' | 'reports']}</h2>
              <span style={{ background: 'rgba(232,169,76,.08)', border: '1px solid rgba(232,169,76,.22)', color: '#e8a94c', fontSize: 11, padding: '5px 14px', borderRadius: 20, fontWeight: 700 }}>در حال توسعه</span>
            </div>
          )}
        </div>
      </div>

      {/* Product Picker Modal */}
      {showProdModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600 }}>
          <div onClick={() => setShowProdModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.78)', backdropFilter: 'blur(5px)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, maxHeight: '82vh', display: 'flex', flexDirection: 'column', background: '#0d1320', border: '1px solid rgba(255,255,255,.09)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 28px 80px rgba(0,0,0,.65)', animation: 'fadeSlide .2s ease' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 11, flexShrink: 0 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#374151', pointerEvents: 'none' }}>🔍</span>
                <input type="text" value={modalSearch} onChange={e => setModalSearch(e.target.value)} placeholder="جستجو نام یا کد محصول..." style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 9, padding: '9px 36px 9px 12px', color: '#f0f4ff', fontSize: 13, outline: 'none' }} />
              </div>
              <button onClick={() => setShowProdModal(false)} style={{ width: 32, height: 32, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: '#8892a4', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {modalProds.map(p => (
                  <div key={p.sku} onClick={() => setModalSelProd(p)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderBottom: `1px solid ${modalSelProd?.sku === p.sku ? 'rgba(232,169,76,.15)' : 'rgba(255,255,255,.04)'}`, cursor: 'pointer', background: modalSelProd?.sku === p.sku ? 'rgba(232,169,76,.06)' : 'transparent' }}>
                    <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,.04)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{p.catIcon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#e8edf5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                        <span style={{ fontSize: 10, color: '#4b5563', direction: 'ltr' }}>{p.sku}</span>
                        <span style={{ fontSize: 9, background: p.isVariable ? 'rgba(167,139,250,.1)' : 'rgba(255,255,255,.04)', color: p.isVariable ? '#a78bfa' : '#6b7280', padding: '1px 7px', borderRadius: 20, fontWeight: 700 }}>{p.isVariable ? 'متغیر' : 'ساده'}</span>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'left' }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#e8a94c', fontVariantNumeric: 'tabular-nums' }}>{fmt(p.price)}</div>
                      <div style={{ fontSize: 9, color: '#4b5563', marginTop: 2 }}>تومان</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Variant panel */}
              {modalSelProd && modalSelProd.isVariable && (
                <div style={{ width: 252, flexShrink: 0, overflowY: 'auto', padding: 16, background: 'rgba(13,19,32,.8)', borderRight: '1px solid rgba(255,255,255,.06)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 900, color: '#f0f4ff', lineHeight: 1.3, marginBottom: 4 }}>{modalSelProd.name}</div>
                    <div style={{ fontSize: 10, color: '#374151' }}>انتخاب واریانت</div>
                  </div>
                  {modalSelProd.attributes.map((attr: any) => (
                    <div key={attr.key}>
                      <div style={{ fontSize: 10, color: '#8892a4', fontWeight: 700, marginBottom: 8 }}>{attr.name}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {attr.values.map((v: string) => {
                          const sel = modalAttrs[attr.key] === v;
                          return (
                            <button key={v} onClick={() => setModalAttrs(prev => ({ ...prev, [attr.key]: v }))} style={{ padding: '7px 13px', background: sel ? 'rgba(232,169,76,.18)' : 'rgba(255,255,255,.04)', border: `1px solid ${sel ? 'rgba(232,169,76,.5)' : 'rgba(255,255,255,.09)'}`, borderRadius: 8, color: sel ? '#e8a94c' : '#a0aab8', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>{v}</button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {selectedVariant && (
                    <div style={{ background: 'rgba(74,222,128,.06)', border: '1px solid rgba(74,222,128,.2)', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#4ade80', marginBottom: 4 }}>{modalSelProd.attributes.map((a: any) => modalAttrs[a.key]).join(' / ')}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11, color: '#6b7280' }}>موجودی:</span>
                        <span style={{ fontSize: 14, fontWeight: 900, color: (selectedVariant as any).stock > 5 ? '#4ade80' : (selectedVariant as any).stock > 0 ? '#fb923c' : '#ef4444' }}>{(selectedVariant as any).stock}</span>
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop: 'auto' }}>
                    <button onClick={confirmAdd} style={{ width: '100%', background: selectedAttrsComplete ? 'linear-gradient(135deg,#e8a94c,#f5c842)' : 'rgba(255,255,255,.06)', color: selectedAttrsComplete ? '#060a13' : '#374151', border: 'none', padding: 12, borderRadius: 9, fontSize: 13, fontWeight: 900, cursor: selectedAttrsComplete ? 'pointer' : 'not-allowed', fontFamily: "'Vazirmatn',sans-serif" }}>افزودن به فاکتور ←</button>
                  </div>
                </div>
              )}
              {modalSelProd && !modalSelProd.isVariable && (
                <div style={{ width: 200, flexShrink: 0, padding: 16, background: 'rgba(13,19,32,.8)', borderRight: '1px solid rgba(255,255,255,.06)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 900, color: '#f0f4ff', lineHeight: 1.3, marginBottom: 4 }}>{modalSelProd.name}</div>
                    <div style={{ fontSize: 10, color: '#374151' }}>محصول ساده</div>
                  </div>
                  <div style={{ background: 'rgba(232,169,76,.06)', border: '1px solid rgba(232,169,76,.2)', borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#e8a94c', fontVariantNumeric: 'tabular-nums' }}>{fmt(modalSelProd.price)}</div>
                    <div style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>تومان</div>
                  </div>
                  <div style={{ marginTop: 'auto' }}>
                    <button onClick={confirmAdd} style={{ width: '100%', background: 'linear-gradient(135deg,#e8a94c,#f5c842)', color: '#060a13', border: 'none', padding: 12, borderRadius: 9, fontSize: 13, fontWeight: 900, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>افزودن به فاکتور ←</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Picker Modal */}
      {showCustModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600 }}>
          <div onClick={() => setShowCustModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.78)', backdropFilter: 'blur(5px)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 460, background: '#0d1320', border: '1px solid rgba(255,255,255,.09)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 28px 80px rgba(0,0,0,.65)', animation: 'fadeSlide .2s ease' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#374151', pointerEvents: 'none' }}>🔍</span>
                <input type="text" value={custSearch} onChange={e => setCustSearch(e.target.value)} placeholder="جستجو نام یا موبایل..." style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 9, padding: '9px 36px 9px 12px', color: '#f0f4ff', fontSize: 13, outline: 'none' }} />
              </div>
              <button onClick={() => setShowCustModal(false)} style={{ width: 32, height: 32, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: '#8892a4', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
            </div>
            <div style={{ maxHeight: 370, overflowY: 'auto' }}>
              {modalCusts.map((c, i) => {
                const avColors = ['#e8a94c', '#38bdf8', '#4ade80', '#a78bfa', '#fb923c'];
                const grpBg    = c.group === 'VIP' ? 'rgba(232,169,76,.15)' : c.group === 'عمده' ? 'rgba(56,189,248,.1)' : 'rgba(255,255,255,.05)';
                const grpColor = c.group === 'VIP' ? '#e8a94c' : c.group === 'عمده' ? '#38bdf8' : '#8892a4';
                return (
                  <div key={c.id} onClick={() => { setInvCustomer(c); setShowCustModal(false); }} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,.04)', cursor: 'pointer' }}>
                    <div style={{ width: 38, height: 38, background: avColors[i % 5], borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#060a13', flexShrink: 0 }}>{c.name.charAt(0)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#e8edf5' }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: '#6b7280', direction: 'ltr', textAlign: 'right', marginTop: 2 }}>{c.phone}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                      <span style={{ fontSize: 9, background: grpBg, color: grpColor, padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>{c.group}</span>
                      <span style={{ fontSize: 11, color: c.balPos === true ? '#4ade80' : c.balPos === false ? '#ef4444' : '#6b7280', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                        {c.balance === 0 ? 'تراز' : (c.balPos ? '+' : '-') + fmt(Math.abs(c.balance))}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,.05)' }}>
              <button style={{ width: '100%', background: 'rgba(56,189,248,.07)', border: '1px solid rgba(56,189,248,.18)', color: '#38bdf8', padding: 9, borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>+ ایجاد مشتری جدید</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
