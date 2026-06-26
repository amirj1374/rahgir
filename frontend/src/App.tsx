import { useState, useEffect, useCallback } from 'react';
import { companyApi, productsApi, customersApi, warehousesApi, categoriesApi, unitsApi, taxRatesApi } from './api';
import type { Company, Product, Customer, Warehouse, Category, Unit, TaxRate } from './types';
import SalesModule from './modules/SalesModule';
import InventoryModule from './modules/InventoryModule';
import CRMModule from './modules/CRMModule';
import AccountingModule from './modules/AccountingModule';
import ReportsModule from './modules/ReportsModule';
import SuppliersModule from './modules/SuppliersModule';

// ─── Types ────────────────────────────────────────────────────────────────────
type Section =
  | 'dashboard' | 'company' | 'products' | 'customers'
  | 'woocommerce' | 'users' | 'warehouses' | 'categories'
  | 'units' | 'tax' | 'suppliers';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtNum = (n: number) =>
  n.toLocaleString('fa-IR');

const statusBadge = (stock: number) => {
  if (stock === 0) return { bg: 'rgba(239,68,68,.1)', color: '#ef4444', label: 'ناموجود' };
  if (stock < 10) return { bg: 'rgba(251,146,60,.1)', color: '#fb923c', label: 'کم‌موجودی' };
  return { bg: 'rgba(74,222,128,.1)', color: '#4ade80', label: 'فعال' };
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ sec, onNav }: { sec: Section; onNav: (s: Section) => void }) {
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

  const groups = [
    { label: 'داشبورد', items: [item('dashboard', '🏠', 'پیشخوان')] },
    { label: 'تنظیمات کسب‌وکار', items: [
      item('company', '🏢', 'اطلاعات شرکت'),
      item('warehouses', '🏭', 'انبارها', '۲'),
      item('users', '👤', 'کاربران', '۵'),
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
    { label: 'یکپارچه‌سازی', items: [
      item('woocommerce', '🔗', 'ووکامرس'),
    ]},
  ];

  return (
    <aside style={{ width: 244, flexShrink: 0, background: '#070d1a', borderLeft: '1px solid rgba(255,255,255,.05)', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Logo */}
      <div style={{ padding: '15px 14px', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#e8a94c,#f5c842)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 900, color: '#060a13', flexShrink: 0 }}>B</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#f0f4ff', letterSpacing: '-.3px' }}>بیزنس‌کور</div>
          <div style={{ fontSize: 10, color: '#e8a94c', fontWeight: 700 }}>ماژول اطلاعات پایه</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 6px', overflowY: 'auto' }}>
        {groups.map(g => (
          <div key={g.label} style={{ marginBottom: 2 }}>
            <div style={{ fontSize: 9, color: '#1f2937', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', padding: '9px 10px 4px' }}>{g.label}</div>
            {g.items}
          </div>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '11px 12px', borderTop: '1px solid rgba(255,255,255,.05)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 29, height: 29, background: 'rgba(232,169,76,.15)', border: '1.5px solid rgba(232,169,76,.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#e8a94c', flexShrink: 0 }}>م</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#e8edf5' }}>مدیر سیستم</div>
          <div style={{ fontSize: 9, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>admin@rayan.ir</div>
        </div>
        <span style={{ fontSize: 13, color: '#374151', cursor: 'pointer' }}>⚙</span>
      </div>
    </aside>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ onNav }: { onNav: (s: Section) => void }) {
  const dashStats = [
    { icon: '🏷️', value: '–', label: 'محصول', color: '#e8a94c', glow: 'rgba(232,169,76,.25)' },
    { icon: '👥', value: '–', label: 'مشتری', color: '#38bdf8', glow: 'rgba(56,189,248,.22)' },
    { icon: '📦', value: '۲', label: 'انبار تعریف‌شده', color: '#4ade80', glow: 'rgba(74,222,128,.22)' },
    { icon: '🤝', value: '۲۳', label: 'تامین‌کننده', color: '#a78bfa', glow: 'rgba(167,139,250,.22)' },
    { icon: '📂', value: '–', label: 'دسته‌بندی', color: '#fb923c', glow: 'rgba(251,146,60,.22)' },
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
        {/* WC Card */}
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

        {/* Quick Actions */}
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

      {/* Checklist */}
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

// ─── Company ──────────────────────────────────────────────────────────────────
function CompanySection() {
  const [data, setData] = useState<Company>({
    name: 'فروشگاه آنلاین رایان', nationalId: '۱۰۱۰۳۴۵۶۷۸۹',
    registrationNumber: '۳۵۸۷۶۲', phone: '۰۲۱-۸۸۷۶۵۴۳۲',
    email: 'info@rayan-shop.ir', address: 'تهران، خیابان ولیعصر، پلاک ۱۲۰۴',
    currency: 'IRR', fiscalYearStart: 'Farvardin', vatRate: 10,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    companyApi.get().then(c => { if (c) setData(c); }).catch(() => {});
  }, []);

  const save = async () => {
    try { await companyApi.save(data); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2800);
  };

  const field = (label: string, key: keyof Company, ltr = false) => (
    <div>
      <label style={{ display: 'block', fontSize: 10, color: '#8892a4', fontWeight: 700, marginBottom: 5 }}>{label}</label>
      <input
        type="text"
        value={String(data[key] ?? '')}
        onChange={e => setData(d => ({ ...d, [key]: e.target.value }))}
        style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, padding: '8px 11px', color: '#f0f4ff', fontSize: 12, outline: 'none', direction: ltr ? 'ltr' : 'rtl', textAlign: 'right' }}
      />
    </div>
  );

  return (
    <div style={{ maxWidth: 780, animation: 'fadeSlide .3s ease' }}>
      {saved && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', background: 'rgba(74,222,128,.07)', border: '1px solid rgba(74,222,128,.2)', borderRadius: 9, marginBottom: 13 }}>
          <span>✅</span>
          <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 700 }}>اطلاعات شرکت با موفقیت ذخیره شد</span>
        </div>
      )}

      {/* Profile header */}
      <div style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 20, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 64, height: 64, background: 'rgba(232,169,76,.07)', border: '2px dashed rgba(232,169,76,.28)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, cursor: 'pointer' }} title="بارگذاری لوگو">🏢</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#f0f4ff', marginBottom: 3 }}>{data.name}</div>
          <div style={{ fontSize: 11, color: '#6b7280', direction: 'ltr', textAlign: 'right' }}>{data.email}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.22)', color: '#4ade80', fontSize: 10, padding: '2px 9px', borderRadius: 20, fontWeight: 700 }}>فعال</span>
          <span style={{ fontSize: 9, color: '#374151' }}>راه‌اندازی: ۱۴۰۵/۰۱/۱۵</span>
        </div>
      </div>

      {/* Main info */}
      <div style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 20, marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#e8a94c', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,.05)' }}>اطلاعات اصلی</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
          {field('نام شرکت / فروشگاه', 'name')}
          {field('شناسه ملی / کد اقتصادی', 'nationalId')}
          {field('شماره ثبت', 'registrationNumber')}
          {field('تلفن', 'phone')}
          {field('ایمیل', 'email', true)}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: 10, color: '#8892a4', fontWeight: 700, marginBottom: 5 }}>آدرس</label>
            <input type="text" value={data.address || ''} onChange={e => setData(d => ({ ...d, address: e.target.value }))} style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, padding: '8px 11px', color: '#f0f4ff', fontSize: 12, outline: 'none' }} />
          </div>
        </div>
      </div>

      {/* Financial */}
      <div style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 20, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,.05)' }}>تنظیمات مالی</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 13 }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#8892a4', fontWeight: 700, marginBottom: 5 }}>ارز پایه</label>
            <select style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, padding: '8px 11px', fontSize: 12, outline: 'none', color: '#f0f4ff' }}>
              <option>تومان (IRR)</option><option>دلار (USD)</option><option>یورو (EUR)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#8892a4', fontWeight: 700, marginBottom: 5 }}>شروع سال مالی</label>
            <select style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, padding: '8px 11px', fontSize: 12, outline: 'none', color: '#f0f4ff' }}>
              <option>فروردین</option><option>مهر</option><option>دی</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#8892a4', fontWeight: 700, marginBottom: 5 }}>نرخ مالیات ارزش افزوده</label>
            <input type="text" defaultValue="۱۰٪" style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, padding: '8px 11px', color: '#f0f4ff', fontSize: 12, outline: 'none' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 9 }}>
        <button onClick={save} style={{ background: 'linear-gradient(135deg,#e8a94c,#f5c842)', color: '#060a13', border: 'none', padding: '10px 24px', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>ذخیره تغییرات</button>
        <button style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', color: '#8892a4', padding: '10px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>انصراف</button>
      </div>
    </div>
  );
}

// ─── Products ─────────────────────────────────────────────────────────────────
const MOCK_PRODUCTS: Product[] = [
  { id: 1, sku: 'TSH-001', name: 'تی‌شرت مردانه', category: 'پوشاک', price: 185000, type: 'VARIABLE', source: 'WOOCOMMERCE', status: 'ACTIVE', stock: 125 },
  { id: 2, sku: 'SHO-002', name: 'کفش اسپورت رانینگ', category: 'کفش', price: 850000, type: 'SIMPLE', source: 'WOOCOMMERCE', status: 'ACTIVE', stock: 12 },
  { id: 3, sku: 'JNS-003', name: 'شلوار جین اسلیم فیت', category: 'پوشاک', price: 420000, type: 'VARIABLE', source: 'WOOCOMMERCE', status: 'ACTIVE', stock: 84 },
  { id: 4, sku: 'BAG-004', name: 'کیف چرم زنانه', category: 'کیف', price: 670000, type: 'SIMPLE', source: 'WOOCOMMERCE', status: 'ACTIVE', stock: 8 },
  { id: 5, sku: 'PRF-005', name: 'عطر مردانه کلاسیک', category: 'عطر', price: 1200000, type: 'SIMPLE', source: 'MANUAL', status: 'ACTIVE', stock: 35 },
  { id: 6, sku: 'CAP-006', name: 'کلاه بیسبال', category: 'پوشاک', price: 125000, type: 'SIMPLE', source: 'WOOCOMMERCE', status: 'OUT_OF_STOCK', stock: 0 },
  { id: 7, sku: 'BLT-007', name: 'کمربند چرمی مردانه', category: 'اکسسوری', price: 280000, type: 'SIMPLE', source: 'WOOCOMMERCE', status: 'ACTIVE', stock: 19 },
  { id: 8, sku: 'SRT-008', name: 'شورت ورزشی', category: 'پوشاک', price: 95000, type: 'SIMPLE', source: 'MANUAL', status: 'ACTIVE', stock: 52 },
];

function ProductsSection() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newProd, setNewProd] = useState<Partial<Product>>({ type: 'SIMPLE' });
  const [toast, setToast] = useState('');

  useEffect(() => {
    productsApi.list().then(list => { if (list.length) setProducts(list); }).catch(() => {});
  }, []);

  const filtered = products.filter(p =>
    !search || p.name.includes(search) || (p.sku || '').toLowerCase().includes(search.toLowerCase())
  );

  const saveProduct = async () => {
    if (!newProd.name) return;
    try {
      const saved = await productsApi.create(newProd as Product);
      setProducts(ps => [...ps, saved]);
    } catch {
      setProducts(ps => [...ps, { ...newProd, id: Date.now() } as Product]);
    }
    setShowModal(false);
    setToast('محصول با موفقیت ذخیره شد');
    setTimeout(() => setToast(''), 2800);
  };

  return (
    <div style={{ animation: 'fadeSlide .3s ease' }}>
      {toast && (
        <div style={{ position: 'absolute', top: 66, left: '50%', transform: 'translateX(-50%)', zIndex: 500, background: '#4ade80', color: '#052e16', padding: '9px 20px', borderRadius: 10, fontSize: 12, fontWeight: 800, boxShadow: '0 4px 20px rgba(74,222,128,.35)', whiteSpace: 'nowrap', animation: 'fadeSlide .2s ease' }}>✅ {toast}</div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 190, position: 'relative' }}>
          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#374151', pointerEvents: 'none' }}>🔍</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجو نام یا SKU..." style={{ width: '100%', background: '#0d1320', border: '1px solid rgba(255,255,255,.07)', borderRadius: 8, padding: '8px 32px 8px 11px', color: '#f0f4ff', fontSize: 12, outline: 'none' }} />
        </div>
        <select style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.07)', borderRadius: 8, padding: '8px 11px', fontSize: 11, outline: 'none', color: '#8892a4' }}>
          <option>همه دسته‌ها</option><option>پوشاک</option><option>کفش</option><option>کیف</option>
        </select>
        <button style={{ background: 'rgba(232,169,76,.08)', border: '1px solid rgba(232,169,76,.22)', color: '#e8a94c', padding: '8px 13px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif", whiteSpace: 'nowrap' }}>🔄 همگام WC</button>
        <button onClick={() => { setNewProd({ type: 'SIMPLE' }); setShowModal(true); }} style={{ background: 'linear-gradient(135deg,#e8a94c,#f5c842)', color: '#060a13', border: 'none', padding: '8px 13px', borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif", whiteSpace: 'nowrap' }}>+ محصول جدید</button>
      </div>

      {/* Table */}
      <div style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '74px 1fr 95px 118px 80px 92px 64px', padding: '9px 13px', background: 'rgba(255,255,255,.03)', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          {['SKU','نام محصول','دسته','قیمت (تومان)','موجودی','وضعیت','منبع'].map(h => (
            <div key={h} style={{ fontSize: 9, color: '#374151', fontWeight: 700 }}>{h}</div>
          ))}
        </div>
        {filtered.map(p => {
          const st = statusBadge(p.stock || 0);
          return (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '74px 1fr 95px 118px 80px 92px 64px', padding: '9px 13px', borderBottom: '1px solid rgba(255,255,255,.04)', alignItems: 'center' }}>
              <div style={{ fontSize: 10, color: '#4b5563', fontFamily: 'monospace', direction: 'ltr', textAlign: 'right' }}>{p.sku}</div>
              <div style={{ paddingLeft: 6, overflow: 'hidden' }}>
                <div style={{ fontSize: 12, color: '#e8edf5', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                {p.type === 'VARIABLE' && <div style={{ fontSize: 10, color: '#a78bfa', marginTop: 2, fontWeight: 600 }}>متغیر</div>}
              </div>
              <div style={{ fontSize: 11, color: '#8892a4' }}>{p.category}</div>
              <div style={{ fontSize: 12, color: '#f0f4ff', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(p.price || 0)}</div>
              <div style={{ fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: st.color }}>{p.stock === 0 ? 'ناموجود' : fmtNum(p.stock || 0)}</div>
              <div><span style={{ fontSize: 9, background: st.bg, color: st.color, padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>{st.label}</span></div>
              <div><span style={{ fontSize: 9, background: p.source === 'WOOCOMMERCE' ? 'rgba(167,139,250,.1)' : 'rgba(255,255,255,.05)', color: p.source === 'WOOCOMMERCE' ? '#a78bfa' : '#8892a4', padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>{p.source === 'WOOCOMMERCE' ? '⊕ WC' : 'دستی'}</span></div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: '11px 2px', fontSize: 10, color: '#374151' }}>{filtered.length} محصول</div>

      {/* New Product Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600 }}>
          <div onClick={() => setShowModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.78)', backdropFilter: 'blur(5px)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 560, maxHeight: '88vh', overflowY: 'auto', background: '#0d1320', border: '1px solid rgba(255,255,255,.09)', borderRadius: 18, boxShadow: '0 28px 80px rgba(0,0,0,.65)', animation: 'fadeSlide .2s ease' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#f0f4ff' }}>محصول جدید</div>
                <div style={{ fontSize: 11, color: '#374151', marginTop: 2 }}>اطلاعات پایه محصول را وارد کنید</div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: 30, height: 30, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 7, color: '#8892a4', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Product type */}
              <div>
                <div style={{ fontSize: 10, color: '#374151', fontWeight: 700, marginBottom: 7 }}>نوع محصول</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[{ type: 'SIMPLE', icon: '🏷️', label: 'ساده', desc: 'یک نوع، یک قیمت' }, { type: 'VARIABLE', icon: '🎨', label: 'متغیر', desc: 'رنگ، سایز و واریانت' }].map(pt => (
                    <button key={pt.type} onClick={() => setNewProd(p => ({ ...p, type: pt.type as 'SIMPLE' | 'VARIABLE' }))} style={{ flex: 1, padding: 10, background: newProd.type === pt.type ? (pt.type === 'SIMPLE' ? 'rgba(232,169,76,.12)' : 'rgba(167,139,250,.12)') : 'rgba(255,255,255,.03)', border: `1px solid ${newProd.type === pt.type ? (pt.type === 'SIMPLE' ? 'rgba(232,169,76,.35)' : 'rgba(167,139,250,.35)') : 'rgba(255,255,255,.08)'}`, borderRadius: 9, color: newProd.type === pt.type ? (pt.type === 'SIMPLE' ? '#e8a94c' : '#a78bfa') : '#8892a4', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontSize: 22 }}>{pt.icon}</span>
                      <span>{pt.label}</span>
                      <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 400 }}>{pt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#374151', fontWeight: 700, marginBottom: 6 }}>نام محصول <span style={{ color: '#ef4444' }}>*</span></div>
                  <input type="text" value={newProd.name || ''} onChange={e => setNewProd(p => ({ ...p, name: e.target.value }))} placeholder="مثلاً: تی‌شرت مردانه پنبه‌ای" style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '9px 11px', color: '#f0f4ff', fontSize: 13, outline: 'none' }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#374151', fontWeight: 700, marginBottom: 6 }}>کد SKU</div>
                  <input type="text" value={newProd.sku || ''} onChange={e => setNewProd(p => ({ ...p, sku: e.target.value }))} placeholder="TSH-001" style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '9px 11px', color: '#f0f4ff', fontSize: 13, outline: 'none', direction: 'ltr' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#374151', fontWeight: 700, marginBottom: 6 }}>دسته‌بندی</div>
                  <select onChange={e => setNewProd(p => ({ ...p, category: e.target.value }))} style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '9px 11px', color: '#f0f4ff', fontSize: 12, outline: 'none' }}>
                    <option>پوشاک</option><option>کفش و کیف</option><option>عطر و بهداشت</option><option>اکسسوری</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#374151', fontWeight: 700, marginBottom: 6 }}>قیمت پایه (تومان)</div>
                  <input type="text" value={newProd.price || ''} onChange={e => setNewProd(p => ({ ...p, price: Number(e.target.value) }))} placeholder="۱۸۵,۰۰۰" style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '9px 11px', color: '#f0f4ff', fontSize: 13, outline: 'none', direction: 'ltr' }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#374151', fontWeight: 700, marginBottom: 6 }}>واحد</div>
                  <select style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '9px 11px', color: '#f0f4ff', fontSize: 12, outline: 'none' }}>
                    <option>عدد</option><option>جفت</option><option>کیلوگرم</option><option>متر</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={saveProduct} style={{ flex: 2, background: 'linear-gradient(135deg,#e8a94c,#f5c842)', color: '#060a13', border: 'none', padding: 12, borderRadius: 9, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>ذخیره محصول ←</button>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#8892a4', padding: 12, borderRadius: 9, fontSize: 13, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>انصراف</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Customers ────────────────────────────────────────────────────────────────
const AV_COLORS = ['#e8a94c', '#38bdf8', '#4ade80', '#a78bfa', '#fb923c'];
const MOCK_CUSTOMERS: Customer[] = [
  { id: 1, name: 'علی محمدی', phone: '0912-123-4567', group: 'VIP', balance: 520000, source: 'WOOCOMMERCE' },
  { id: 2, name: 'سارا احمدی', phone: '0935-987-6543', group: 'WHOLESALE', balance: -1200000, source: 'WOOCOMMERCE' },
  { id: 3, name: 'رضا کریمی', phone: '0917-456-7890', group: 'RETAIL', balance: 0, source: 'MANUAL' },
  { id: 4, name: 'مریم تهرانی', phone: '0936-321-0987', group: 'VIP', balance: 85000, source: 'WOOCOMMERCE' },
  { id: 5, name: 'حسن رضایی', phone: '0921-654-3210', group: 'WHOLESALE', balance: -3500000, source: 'WOOCOMMERCE' },
];

function CustomersSection() {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newCust, setNewCust] = useState<Partial<Customer>>({ group: 'RETAIL' });
  const [toast, setToast] = useState('');

  useEffect(() => {
    customersApi.list().then(list => { if (list.length) setCustomers(list); }).catch(() => {});
  }, []);

  const filtered = customers.filter(c =>
    !search || c.name.includes(search) || (c.phone || '').includes(search)
  );

  const saveCust = async () => {
    if (!newCust.name) return;
    try {
      const saved = await customersApi.create(newCust as Customer);
      setCustomers(cs => [...cs, saved]);
    } catch {
      setCustomers(cs => [...cs, { ...newCust, id: Date.now() } as Customer]);
    }
    setShowModal(false);
    setToast('مشتری با موفقیت ذخیره شد');
    setTimeout(() => setToast(''), 2800);
  };

  const grpLabel = (g?: string) => g === 'VIP' ? 'VIP' : g === 'WHOLESALE' ? 'عمده' : 'خرده';
  const grpStyle = (g?: string) => g === 'VIP'
    ? { bg: 'rgba(232,169,76,.15)', color: '#e8a94c' }
    : g === 'WHOLESALE'
    ? { bg: 'rgba(56,189,248,.1)', color: '#38bdf8' }
    : { bg: 'rgba(255,255,255,.05)', color: '#8892a4' };

  return (
    <div style={{ animation: 'fadeSlide .3s ease' }}>
      {toast && (
        <div style={{ position: 'absolute', top: 66, left: '50%', transform: 'translateX(-50%)', zIndex: 500, background: '#4ade80', color: '#052e16', padding: '9px 20px', borderRadius: 10, fontSize: 12, fontWeight: 800, boxShadow: '0 4px 20px rgba(74,222,128,.35)', whiteSpace: 'nowrap', animation: 'fadeSlide .2s ease' }}>✅ {toast}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 190, position: 'relative' }}>
          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#374151', pointerEvents: 'none' }}>🔍</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجو نام یا موبایل..." style={{ width: '100%', background: '#0d1320', border: '1px solid rgba(255,255,255,.07)', borderRadius: 8, padding: '8px 32px 8px 11px', color: '#f0f4ff', fontSize: 12, outline: 'none' }} />
        </div>
        <select style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.07)', borderRadius: 8, padding: '8px 11px', fontSize: 11, outline: 'none', color: '#8892a4' }}>
          <option>همه گروه‌ها</option><option>VIP</option><option>عمده</option><option>خرده</option>
        </select>
        <button style={{ background: 'rgba(56,189,248,.08)', border: '1px solid rgba(56,189,248,.2)', color: '#38bdf8', padding: '8px 13px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif", whiteSpace: 'nowrap' }}>🔄 دریافت از WC</button>
        <button onClick={() => { setNewCust({ group: 'RETAIL' }); setShowModal(true); }} style={{ background: 'linear-gradient(135deg,#e8a94c,#f5c842)', color: '#060a13', border: 'none', padding: '8px 13px', borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif", whiteSpace: 'nowrap' }}>+ مشتری جدید</button>
      </div>

      <div style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '38px 1fr 115px 76px 115px 108px 60px 78px', padding: '9px 13px', background: 'rgba(255,255,255,.03)', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          {['#','نام مشتری','موبایل','گروه','آخرین خرید','مانده حساب','منبع','عملیات'].map(h => (
            <div key={h} style={{ fontSize: 9, color: '#374151', fontWeight: 700 }}>{h}</div>
          ))}
        </div>
        {filtered.map((c, i) => {
          const gs = grpStyle(c.group);
          const balPos = (c.balance || 0) > 0;
          const balNeg = (c.balance || 0) < 0;
          return (
            <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '38px 1fr 115px 76px 115px 108px 60px 78px', padding: '9px 13px', borderBottom: '1px solid rgba(255,255,255,.04)', alignItems: 'center' }}>
              <div style={{ fontSize: 10, color: '#374151', fontVariantNumeric: 'tabular-nums' }}>{String(c.id).padStart(3, '0')}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 24, height: 24, background: AV_COLORS[i % 5], borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#060a13', flexShrink: 0 }}>{c.name.charAt(0)}</div>
                <span style={{ fontSize: 12, color: '#e8edf5', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
              </div>
              <div style={{ fontSize: 10, color: '#6b7280', direction: 'ltr', textAlign: 'right' }}>{c.phone}</div>
              <div><span style={{ fontSize: 9, background: gs.bg, color: gs.color, padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>{grpLabel(c.group)}</span></div>
              <div style={{ fontSize: 10, color: '#6b7280' }}>{c.lastOrderDate || '–'}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: balPos ? '#4ade80' : balNeg ? '#ef4444' : '#6b7280', fontVariantNumeric: 'tabular-nums' }}>{c.balance ? (balPos ? '+' : '') + fmtNum(c.balance) : '۰'}</div>
              <div><span style={{ fontSize: 9, background: c.source === 'WOOCOMMERCE' ? 'rgba(167,139,250,.1)' : 'rgba(255,255,255,.05)', color: c.source === 'WOOCOMMERCE' ? '#a78bfa' : '#8892a4', padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>{c.source === 'WOOCOMMERCE' ? 'WC' : 'دستی'}</span></div>
              <div><button style={{ padding: '3px 7px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 5, color: '#8892a4', fontSize: 10, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>پروفایل</button></div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: '11px 2px', fontSize: 10, color: '#374151' }}>{filtered.length} مشتری</div>

      {/* New Customer Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600 }}>
          <div onClick={() => setShowModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.78)', backdropFilter: 'blur(5px)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, background: '#0d1320', border: '1px solid rgba(255,255,255,.09)', borderRadius: 18, boxShadow: '0 28px 80px rgba(0,0,0,.65)', animation: 'fadeSlide .2s ease' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#f0f4ff' }}>مشتری جدید</div>
                <div style={{ fontSize: 11, color: '#374151', marginTop: 2 }}>اطلاعات مشتری را کامل کنید</div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: 30, height: 30, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 7, color: '#8892a4', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#374151', fontWeight: 700, marginBottom: 6 }}>نام کامل <span style={{ color: '#ef4444' }}>*</span></div>
                  <input type="text" value={newCust.name || ''} onChange={e => setNewCust(c => ({ ...c, name: e.target.value }))} placeholder="علی محمدی" style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '9px 11px', color: '#f0f4ff', fontSize: 13, outline: 'none' }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#374151', fontWeight: 700, marginBottom: 6 }}>موبایل <span style={{ color: '#ef4444' }}>*</span></div>
                  <input type="text" value={newCust.phone || ''} onChange={e => setNewCust(c => ({ ...c, phone: e.target.value }))} placeholder="09121234567" style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '9px 11px', color: '#f0f4ff', fontSize: 13, outline: 'none', direction: 'ltr' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#374151', fontWeight: 700, marginBottom: 6 }}>ایمیل</div>
                  <input type="text" value={newCust.email || ''} onChange={e => setNewCust(c => ({ ...c, email: e.target.value }))} placeholder="email@example.com" style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '9px 11px', color: '#f0f4ff', fontSize: 13, outline: 'none', direction: 'ltr' }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#374151', fontWeight: 700, marginBottom: 6 }}>شهر</div>
                  <input type="text" value={newCust.city || ''} onChange={e => setNewCust(c => ({ ...c, city: e.target.value }))} placeholder="تهران" style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '9px 11px', color: '#f0f4ff', fontSize: 13, outline: 'none' }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#374151', fontWeight: 700, marginBottom: 6 }}>گروه مشتری</div>
                <select onChange={e => setNewCust(c => ({ ...c, group: e.target.value as Customer['group'] }))} style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '9px 11px', color: '#f0f4ff', fontSize: 12, outline: 'none' }}>
                  <option value="RETAIL">خرده</option><option value="WHOLESALE">عمده</option><option value="VIP">VIP</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                <button onClick={saveCust} style={{ flex: 2, background: 'linear-gradient(135deg,#38bdf8,#0ea5e9)', color: '#fff', border: 'none', padding: 12, borderRadius: 9, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>ذخیره مشتری ←</button>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#8892a4', padding: 12, borderRadius: 9, fontSize: 13, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>انصراف</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Warehouses ───────────────────────────────────────────────────────────────
const MOCK_WAREHOUSES: Warehouse[] = [
  { id: 1, name: 'انبار اصلی', location: 'تهران، انبار مرکزی', manager: 'علی محمدی', capacity: 5000, active: true },
  { id: 2, name: 'انبار ۲', location: 'تهران، شعبه غرب', manager: 'رضا کریمی', capacity: 2000, active: true },
  { id: 3, name: 'انبار یدکی', location: 'کرج، مجتمع صنعتی', manager: 'سارا احمدی', capacity: 1000, active: false },
];

function WarehousesSection() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(MOCK_WAREHOUSES);

  useEffect(() => {
    warehousesApi.list().then(list => { if (list.length) setWarehouses(list); }).catch(() => {});
  }, []);

  return (
    <div style={{ maxWidth: 820, animation: 'fadeSlide .3s ease' }}>
      <div style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 110px 90px 70px 76px', padding: '9px 14px', background: 'rgba(255,255,255,.03)', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          {['نام انبار','مکان','مسئول','ظرفیت','وضعیت','عملیات'].map(h => (
            <div key={h} style={{ fontSize: 9, color: '#374151', fontWeight: 700 }}>{h}</div>
          ))}
        </div>
        {warehouses.map(wh => (
          <div key={wh.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 110px 90px 70px 76px', padding: '11px 14px', borderBottom: '1px solid rgba(255,255,255,.04)', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f0f4ff' }}>{wh.name}</div>
            <div style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wh.location}</div>
            <div style={{ fontSize: 11, color: '#8892a4' }}>{wh.manager}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', fontVariantNumeric: 'tabular-nums' }}>{fmtNum(wh.capacity || 0)}</div>
            <div><span style={{ fontSize: 9, background: wh.active ? 'rgba(74,222,128,.1)' : 'rgba(239,68,68,.1)', color: wh.active ? '#4ade80' : '#ef4444', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>{wh.active ? 'فعال' : 'غیرفعال'}</span></div>
            <div><button style={{ padding: '4px 8px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 5, color: '#8892a4', fontSize: 10, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>ویرایش</button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Categories ───────────────────────────────────────────────────────────────
const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'پوشاک', parentName: '–', productCount: 12 },
  { id: 2, name: 'کفش و کیف', parentName: '–', productCount: 8 },
  { id: 3, name: 'عطر و بهداشت', parentName: '–', productCount: 5 },
  { id: 4, name: 'تی‌شرت', parentName: 'پوشاک', productCount: 4 },
  { id: 5, name: 'شلوار', parentName: 'پوشاک', productCount: 3 },
  { id: 6, name: 'کفش اسپورت', parentName: 'کفش و کیف', productCount: 5 },
];

function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);

  useEffect(() => {
    categoriesApi.list().then(list => { if (list.length) setCategories(list); }).catch(() => {});
  }, []);

  return (
    <div style={{ maxWidth: 680, animation: 'fadeSlide .3s ease' }}>
      <div style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 80px 76px', padding: '9px 14px', background: 'rgba(255,255,255,.03)', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          {['نام دسته‌بندی','دسته والد','تعداد کالا','عملیات'].map(h => (
            <div key={h} style={{ fontSize: 9, color: '#374151', fontWeight: 700 }}>{h}</div>
          ))}
        </div>
        {categories.map(cat => (
          <div key={cat.id} style={{ display: 'grid', gridTemplateColumns: '1fr 130px 80px 76px', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,.04)', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#374151' }}>📂</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#f0f4ff' }}>{cat.name}</span>
            </div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>{cat.parentName || '–'}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', fontVariantNumeric: 'tabular-nums' }}>{cat.productCount}</div>
            <div><button style={{ padding: '4px 8px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 5, color: '#8892a4', fontSize: 10, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>ویرایش</button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Units ────────────────────────────────────────────────────────────────────
const MOCK_UNITS: Unit[] = [
  { id: 1, name: 'عدد', symbol: 'عدد', type: 'تعداد' },
  { id: 2, name: 'کیلوگرم', symbol: 'kg', type: 'وزن' },
  { id: 3, name: 'متر', symbol: 'm', type: 'طول' },
  { id: 4, name: 'لیتر', symbol: 'L', type: 'حجم' },
  { id: 5, name: 'جفت', symbol: 'جفت', type: 'تعداد' },
  { id: 6, name: 'بسته', symbol: 'بسته', type: 'تعداد' },
];

function UnitsSection() {
  const [units, setUnits] = useState<Unit[]>(MOCK_UNITS);

  useEffect(() => {
    unitsApi.list().then(list => { if (list.length) setUnits(list); }).catch(() => {});
  }, []);

  return (
    <div style={{ maxWidth: 560, animation: 'fadeSlide .3s ease' }}>
      <div style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 76px', padding: '9px 14px', background: 'rgba(255,255,255,.03)', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          {['نام واحد','نماد','نوع','عملیات'].map(h => (
            <div key={h} style={{ fontSize: 9, color: '#374151', fontWeight: 700 }}>{h}</div>
          ))}
        </div>
        {units.map(u => (
          <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 76px', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,.04)', alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f0f4ff' }}>{u.name}</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#e8a94c', direction: 'ltr' }}>{u.symbol}</div>
            <div><span style={{ fontSize: 10, background: 'rgba(255,255,255,.05)', color: '#8892a4', padding: '2px 9px', borderRadius: 7 }}>{u.type}</span></div>
            <div><button style={{ padding: '4px 8px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 5, color: '#8892a4', fontSize: 10, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>ویرایش</button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tax ──────────────────────────────────────────────────────────────────────
const MOCK_TAX: TaxRate[] = [
  { id: 1, name: 'مالیات ارزش افزوده عمومی', rate: 10, active: true, appliesTo: 'همه کالاها' },
  { id: 2, name: 'معاف از مالیات', rate: 0, active: true, appliesTo: 'اقلام غذایی ضروری' },
  { id: 3, name: 'مالیات تجملاتی', rate: 25, active: false, appliesTo: 'کالاهای لوکس' },
];

function TaxSection() {
  const [taxRates, setTaxRates] = useState<TaxRate[]>(MOCK_TAX);

  useEffect(() => {
    taxRatesApi.list().then(list => { if (list.length) setTaxRates(list); }).catch(() => {});
  }, []);

  return (
    <div style={{ maxWidth: 680, animation: 'fadeSlide .3s ease' }}>
      <div style={{ background: 'rgba(232,169,76,.06)', border: '1px solid rgba(232,169,76,.18)', borderRadius: 10, padding: '12px 16px', marginBottom: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
        <p style={{ fontSize: 12, color: '#a0aab8', margin: 0, lineHeight: 1.8 }}>نرخ مالیات ارزش افزوده در صدور فاکتور اعمال می‌شود. تغییر نرخ، فاکتورهای قبلی را تحت تأثیر قرار نمی‌دهد.</p>
      </div>

      <div style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, overflow: 'hidden', marginBottom: 13 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr 70px 76px', padding: '9px 14px', background: 'rgba(255,255,255,.03)', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          {['نام نرخ','درصد','اعمال به','وضعیت','عملیات'].map(h => (
            <div key={h} style={{ fontSize: 9, color: '#374151', fontWeight: 700 }}>{h}</div>
          ))}
        </div>
        {taxRates.map(tr => (
          <div key={tr.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr 70px 76px', padding: '11px 14px', borderBottom: '1px solid rgba(255,255,255,.04)', alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f0f4ff' }}>{tr.name}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#e8a94c', fontVariantNumeric: 'tabular-nums' }}>{tr.rate}٪</div>
            <div style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr.appliesTo}</div>
            <div><span style={{ fontSize: 9, background: tr.active ? 'rgba(74,222,128,.1)' : 'rgba(239,68,68,.08)', color: tr.active ? '#4ade80' : '#ef4444', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>{tr.active ? 'فعال' : 'غیرفعال'}</span></div>
            <div><button style={{ padding: '4px 8px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 5, color: '#8892a4', fontSize: 10, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>ویرایش</button></div>
          </div>
        ))}
      </div>

      <div style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#f0f4ff', marginBottom: 14 }}>تنظیمات سریع فاکتور</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: '#374151', fontWeight: 700, marginBottom: 6 }}>نرخ پیش‌فرض فاکتور</div>
            <select style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '9px 11px', color: '#f0f4ff', fontSize: 12, outline: 'none' }}>
              <option>مالیات ارزش افزوده ۱۰٪</option><option>بدون مالیات</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#374151', fontWeight: 700, marginBottom: 6 }}>نمایش مالیات در فاکتور</div>
            <select style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '9px 11px', color: '#f0f4ff', fontSize: 12, outline: 'none' }}>
              <option>نمایش جداگانه</option><option>ادغام در قیمت</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Users ────────────────────────────────────────────────────────────────────
function UsersSection() {
  const users = [
    { name: 'مدیر سیستم', email: 'admin@rayan.ir', role: 'مدیر ارشد', lastLogin: '۱۴۰۵/۰۴/۰۴ ۱۴:۳۲', status: 'فعال', init: 'م', avBg: '#e8a94c', roleBg: 'rgba(232,169,76,.15)', roleColor: '#e8a94c', stBg: 'rgba(74,222,128,.1)', stColor: '#4ade80' },
    { name: 'امیر حسینی', email: 'amir@rayan.ir', role: 'فروش', lastLogin: '۱۴۰۵/۰۴/۰۴ ۰۹:۱۵', status: 'فعال', init: 'ا', avBg: '#38bdf8', roleBg: 'rgba(56,189,248,.1)', roleColor: '#38bdf8', stBg: 'rgba(74,222,128,.1)', stColor: '#4ade80' },
    { name: 'فاطمه نوری', email: 'fateme@rayan.ir', role: 'انبارداری', lastLogin: '۱۴۰۵/۰۴/۰۳ ۱۶:۴۸', status: 'فعال', init: 'ف', avBg: '#4ade80', roleBg: 'rgba(74,222,128,.1)', roleColor: '#4ade80', stBg: 'rgba(74,222,128,.1)', stColor: '#4ade80' },
    { name: 'داود کرمی', email: 'davood@rayan.ir', role: 'حسابداری', lastLogin: '۱۴۰۵/۰۴/۰۲ ۱۱:۲۰', status: 'فعال', init: 'د', avBg: '#a78bfa', roleBg: 'rgba(167,139,250,.1)', roleColor: '#a78bfa', stBg: 'rgba(74,222,128,.1)', stColor: '#4ade80' },
    { name: 'نگار صادقی', email: 'negar@rayan.ir', role: 'فروش', lastLogin: '–', status: 'غیرفعال', init: 'ن', avBg: '#fb923c', roleBg: 'rgba(56,189,248,.1)', roleColor: '#38bdf8', stBg: 'rgba(239,68,68,.1)', stColor: '#ef4444' },
  ];

  const roles = [
    { name: 'مدیر ارشد', color: '#e8a94c', count: '۱ کاربر', desc: 'دسترسی کامل به تمام ماژول‌ها و تنظیمات سیستم.' },
    { name: 'فروش', color: '#38bdf8', count: '۲ کاربر', desc: 'فاکتورسازی، CRM و گزارش‌های فروش.' },
    { name: 'انبارداری', color: '#4ade80', count: '۱ کاربر', desc: 'ورود/خروج کالا، موجودی و انبارگردانی.' },
    { name: 'حسابداری', color: '#a78bfa', count: '۱ کاربر', desc: 'صندوق، بانک و گزارش‌های مالی.' },
    { name: 'مشاهده', color: '#94a3b8', count: '۰ کاربر', desc: 'فقط مشاهده گزارش‌ها، بدون تغییر داده.' },
  ];

  return (
    <div style={{ maxWidth: 940, animation: 'fadeSlide .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{users.length} کاربر در سیستم</div>
        <button style={{ background: 'linear-gradient(135deg,#e8a94c,#f5c842)', color: '#060a13', border: 'none', padding: '8px 15px', borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>+ کاربر جدید</button>
      </div>

      <div style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr 95px 140px 68px 86px', padding: '9px 13px', background: 'rgba(255,255,255,.03)', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          {['نام کاربر','ایمیل','نقش','آخرین ورود','وضعیت','عملیات'].map(h => (
            <div key={h} style={{ fontSize: 9, color: '#374151', fontWeight: 700 }}>{h}</div>
          ))}
        </div>
        {users.map(u => (
          <div key={u.email} style={{ display: 'grid', gridTemplateColumns: '170px 1fr 95px 140px 68px 86px', padding: '9px 13px', borderBottom: '1px solid rgba(255,255,255,.04)', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, background: u.avBg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#060a13', flexShrink: 0 }}>{u.init}</div>
              <span style={{ fontSize: 12, color: '#e8edf5', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</span>
            </div>
            <div style={{ fontSize: 10, color: '#6b7280', direction: 'ltr', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
            <div><span style={{ fontSize: 9, background: u.roleBg, color: u.roleColor, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>{u.role}</span></div>
            <div style={{ fontSize: 10, color: '#6b7280' }}>{u.lastLogin}</div>
            <div><span style={{ fontSize: 9, background: u.stBg, color: u.stColor, padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>{u.status}</span></div>
            <div><button style={{ padding: '3px 7px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 5, color: '#8892a4', fontSize: 10, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>ویرایش</button></div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, fontWeight: 800, color: '#f0f4ff', marginBottom: 10 }}>نقش‌های دسترسی</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 9 }}>
        {roles.map(r => (
          <div key={r.name} style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: r.color }}>{r.name}</div>
              <span style={{ fontSize: 9, color: '#374151' }}>{r.count}</span>
            </div>
            <p style={{ fontSize: 10, color: '#374151', margin: 0, lineHeight: 1.6 }}>{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── WooCommerce ──────────────────────────────────────────────────────────────
function WoocommerceSection() {
  const [wcUrl, setWcUrl] = useState('https://myshop.ir');
  const [wcKey, setWcKey] = useState('');
  const [wcSecret, setWcSecret] = useState('');
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connPct, setConnPct] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncPct, setSyncPct] = useState(0);
  const [syncPhase, setSyncPhase] = useState('آماده...');
  const [lastSync, setLastSync] = useState('–');
  const [autoSync, setAutoSync] = useState(true);
  const [wcStats, setWcStats] = useState({ products: 0, customers: 0, orders: 0, categories: 0 });

  const connect = useCallback(() => {
    if (connected) { setConnected(false); setWcStats({ products: 0, customers: 0, orders: 0, categories: 0 }); setLastSync('–'); return; }
    if (connecting) return;
    setConnecting(true); setConnPct(0);
    let p = 0;
    const t = setInterval(() => {
      p += Math.random() * 22 + 12;
      if (p >= 100) { clearInterval(t); setConnecting(false); setConnected(true); setConnPct(100); }
      else setConnPct(Math.round(p));
    }, 280);
  }, [connected, connecting]);

  const syncAll = useCallback(() => {
    if (!connected || syncing) return;
    const phases = [
      { label: 'دریافت دسته‌بندی‌ها...', stats: { categories: 18 } },
      { label: 'دریافت محصولات...', stats: { products: 124 } },
      { label: 'دریافت مشتریان...', stats: { customers: 586 } },
      { label: 'دریافت سفارشات...', stats: { orders: 1240 } },
      { label: 'پردازش و ذخیره‌سازی...', stats: {} },
    ];
    setSyncing(true); setSyncPct(0);
    let i = 0;
    const t = setInterval(() => {
      if (i < phases.length) {
        const ph = phases[i];
        setSyncPct(Math.round(((i + 1) / phases.length) * 100));
        setSyncPhase(ph.label);
        if (ph.stats) setWcStats(s => ({ ...s, ...ph.stats }));
        i++;
      } else {
        clearInterval(t);
        setSyncing(false);
        const now = new Date();
        setLastSync(`۱۴۰۵/۰۴/۰۴ · ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
      }
    }, 850);
  }, [connected, syncing]);

  const wcColor = connecting ? '#e8a94c' : connected ? '#4ade80' : '#ef4444';
  const wcLabel = connecting ? 'در حال اتصال...' : connected ? 'متصل' : 'قطع';
  const fieldMaps = [
    { wc: 'name', sys: 'نام محصول', type: 'متن' },
    { wc: 'sku', sys: 'کد محصول (SKU)', type: 'متن' },
    { wc: 'regular_price', sys: 'قیمت فروش', type: 'عدد' },
    { wc: 'sale_price', sys: 'قیمت تخفیف‌دار', type: 'عدد' },
    { wc: 'stock_quantity', sys: 'موجودی انبار', type: 'عدد صحیح' },
    { wc: 'categories', sys: 'دسته‌بندی', type: 'آرایه' },
    { wc: 'description', sys: 'توضیحات محصول', type: 'HTML' },
    { wc: 'billing.first_name + last_name', sys: 'نام مشتری', type: 'متن' },
    { wc: 'billing.phone', sys: 'موبایل مشتری', type: 'متن' },
    { wc: 'total', sys: 'مبلغ سفارش', type: 'عدد' },
  ];

  return (
    <div style={{ animation: 'fadeSlide .3s ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13, marginBottom: 13 }}>
        {/* Connect card */}
        <div style={{ background: '#0d1320', border: `1px solid ${connected ? 'rgba(74,222,128,.25)' : 'rgba(255,255,255,.06)'}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ height: 3, background: connected ? 'linear-gradient(90deg,#4ade80,#22c55e)' : 'rgba(255,255,255,.06)' }} />
          <div style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#f0f4ff' }}>🔗 اتصال به ووکامرس</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 700, color: wcColor, padding: '3px 8px', borderRadius: 20, border: `1px solid ${wcColor}33` }}>
                <span style={{ width: 5, height: 5, background: wcColor, borderRadius: '50%', animation: connecting ? 'pulse2 1s ease infinite' : 'none', display: 'inline-block' }} />
                {wcLabel}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: '#8892a4', fontWeight: 700, marginBottom: 5 }}>آدرس سایت ووکامرس</label>
                <input type="text" value={wcUrl} onChange={e => setWcUrl(e.target.value)} placeholder="https://myshop.ir" style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, padding: '8px 11px', color: '#f0f4ff', fontSize: 12, outline: 'none', direction: 'ltr' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: '#8892a4', fontWeight: 700, marginBottom: 5 }}>Consumer Key</label>
                <input type="text" value={wcKey} onChange={e => setWcKey(e.target.value)} placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, padding: '8px 11px', color: '#f0f4ff', fontSize: 11, outline: 'none', direction: 'ltr' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, color: '#8892a4', fontWeight: 700, marginBottom: 5 }}>Consumer Secret</label>
                <input type="password" value={wcSecret} onChange={e => setWcSecret(e.target.value)} placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, padding: '8px 11px', color: '#f0f4ff', fontSize: 11, outline: 'none', direction: 'ltr' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 7, marginBottom: 12 }}>
              <button style={{ flex: 1, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#c8d0dc', padding: 9, borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>تست اتصال</button>
              <button onClick={connect} style={{ flex: 2, background: connecting ? 'rgba(232,169,76,.12)' : connected ? 'rgba(239,68,68,.1)' : 'linear-gradient(135deg,#e8a94c,#f5c842)', border: connecting ? '1px solid rgba(232,169,76,.25)' : connected ? '1px solid rgba(239,68,68,.3)' : 'none', color: connecting ? '#e8a94c' : connected ? '#ef4444' : '#060a13', padding: 9, borderRadius: 7, fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>
                {connecting ? '⏳ در حال اتصال...' : connected ? 'قطع اتصال' : 'اتصال به ووکامرس'}
              </button>
            </div>

            {connecting && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 5 }}>
                  <span style={{ color: '#e8a94c', fontWeight: 600 }}>در حال برقراری اتصال...</span>
                  <span style={{ color: '#6b7280', fontVariantNumeric: 'tabular-nums' }}>{connPct}٪</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,.05)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${connPct}%`, background: 'linear-gradient(90deg,#e8a94c,#f5c842)', borderRadius: 4, transition: 'width .4s' }} />
                </div>
              </div>
            )}
            {connected && (
              <div style={{ padding: '9px 11px', background: 'rgba(74,222,128,.06)', border: '1px solid rgba(74,222,128,.18)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 14 }}>✅</span>
                <div>
                  <div style={{ fontSize: 11, color: '#4ade80', fontWeight: 700 }}>اتصال برقرار است</div>
                  <div style={{ fontSize: 9, color: '#374151', marginTop: 1, direction: 'ltr', textAlign: 'right' }}>{wcUrl}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sync panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <div style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#f0f4ff' }}>همگام‌سازی داده‌ها</div>
              <button onClick={syncAll} style={{ background: connected ? 'linear-gradient(135deg,#e8a94c,#f5c842)' : 'rgba(255,255,255,.04)', border: connected ? 'none' : '1px solid rgba(255,255,255,.07)', color: connected ? '#060a13' : '#374151', cursor: connected ? 'pointer' : 'not-allowed', padding: '5px 12px', borderRadius: 7, fontSize: 10, fontWeight: 800, fontFamily: "'Vazirmatn',sans-serif", whiteSpace: 'nowrap' }}>
                {syncing ? '⏳ در حال همگام‌سازی...' : '🔄 همگام‌سازی همه'}
              </button>
            </div>

            {syncing && (
              <div style={{ marginBottom: 11, padding: '9px 11px', background: 'rgba(232,169,76,.06)', border: '1px solid rgba(232,169,76,.18)', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 5 }}>
                  <span style={{ color: '#e8a94c', fontWeight: 600 }}>{syncPhase}</span>
                  <span style={{ color: '#6b7280', fontVariantNumeric: 'tabular-nums' }}>{syncPct}٪</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,.05)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${syncPct}%`, background: 'linear-gradient(90deg,#e8a94c,#f5c842)', borderRadius: 4, transition: 'width .5s' }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { icon: '📂', label: 'دسته‌بندی‌ها', count: wcStats.categories, color: '#a78bfa' },
                { icon: '🏷️', label: 'محصولات', count: wcStats.products, color: '#e8a94c' },
                { icon: '👥', label: 'مشتریان', count: wcStats.customers, color: '#38bdf8' },
                { icon: '📋', label: 'سفارشات', count: wcStats.orders, color: '#4ade80' },
              ].map(si => (
                <div key={si.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 8 }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{si.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#e8edf5' }}>{si.label}</div>
                    <div style={{ fontSize: 9, color: '#374151', marginTop: 1 }}>{si.count > 0 ? lastSync : '–'}</div>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 900, color: si.color, fontVariantNumeric: 'tabular-nums', minWidth: 34, textAlign: 'left' }}>{si.count}</span>
                  <button onClick={syncAll} style={{ padding: '4px 8px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 5, color: '#8892a4', fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif", flexShrink: 0 }}>همگام</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#f0f4ff', marginBottom: 12 }}>همگام‌سازی خودکار</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#c8d0dc', fontWeight: 600 }}>فعال‌سازی</span>
                <div onClick={() => setAutoSync(a => !a)} style={{ width: 38, height: 20, background: autoSync ? 'rgba(232,169,76,.75)' : 'rgba(255,255,255,.1)', borderRadius: 20, position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background .25s' }}>
                  <div style={{ width: 16, height: 16, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, right: autoSync ? 2 : 20, transition: 'right .2s' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#c8d0dc', fontWeight: 600 }}>دوره</span>
                <select style={{ background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, padding: '5px 9px', fontSize: 11, outline: 'none', color: '#f0f4ff' }}>
                  <option>هر ۶ ساعت</option><option>هر ۱۲ ساعت</option><option>هر ۲۴ ساعت</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#c8d0dc', fontWeight: 600 }}>آخرین همگام‌سازی</span>
                <span style={{ fontSize: 10, color: '#374151', fontWeight: 600 }}>{lastSync}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Field mapping */}
      <div style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#f0f4ff', marginBottom: 12 }}>نگاشت فیلدها · Field Mapping</div>
        <div style={{ border: '1px solid rgba(255,255,255,.05)', borderRadius: 9, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 90px 80px', padding: '8px 12px', background: 'rgba(255,255,255,.03)', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
            {['فیلد ووکامرس','فیلد سیستم','نوع داده','وضعیت'].map(h => (
              <div key={h} style={{ fontSize: 9, color: '#374151', fontWeight: 700 }}>{h}</div>
            ))}
          </div>
          {fieldMaps.map(fm => (
            <div key={fm.wc} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 90px 80px', padding: '7px 12px', borderBottom: '1px solid rgba(255,255,255,.03)', alignItems: 'center' }}>
              <div style={{ fontSize: 10, color: '#a78bfa', fontFamily: 'monospace', direction: 'ltr' }}>{fm.wc}</div>
              <div style={{ fontSize: 11, color: '#e8edf5', fontWeight: 600 }}>{fm.sys}</div>
              <div style={{ fontSize: 10, color: '#6b7280' }}>{fm.type}</div>
              <div><span style={{ fontSize: 9, background: 'rgba(74,222,128,.1)', color: '#4ade80', padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>✓ فعال</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Placeholder ─────────────────────────────────────────────────────────────
function Placeholder({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', animation: 'fadeSlide .3s ease' }}>
      <div style={{ fontSize: 52, marginBottom: 16, opacity: .3 }}>{icon}</div>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f0f4ff', margin: '0 0 9px' }}>{title}</h2>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 auto 22px', lineHeight: 1.8, maxWidth: 360 }}>{desc}</p>
      <span style={{ background: 'rgba(232,169,76,.08)', border: '1px solid rgba(232,169,76,.22)', color: '#e8a94c', fontSize: 11, padding: '5px 14px', borderRadius: 20, fontWeight: 700 }}>در حال توسعه</span>
    </div>
  );
}

// ─── Meta ─────────────────────────────────────────────────────────────────────
const META: Record<Section, { title: string; crumb: string }> = {
  dashboard:   { title: 'پیشخوان', crumb: 'اطلاعات پایه / داشبورد' },
  company:     { title: 'اطلاعات شرکت', crumb: 'اطلاعات پایه / شرکت' },
  products:    { title: 'مدیریت محصولات', crumb: 'اطلاعات پایه / محصولات' },
  categories:  { title: 'دسته‌بندی‌ها', crumb: 'اطلاعات پایه / دسته‌بندی‌ها' },
  customers:   { title: 'مشتریان', crumb: 'اطلاعات پایه / مشتریان' },
  suppliers:   { title: 'تامین‌کنندگان', crumb: 'اطلاعات پایه / تامین‌کنندگان' },
  warehouses:  { title: 'انبارها', crumb: 'اطلاعات پایه / انبارها' },
  units:       { title: 'واحدهای اندازه‌گیری', crumb: 'اطلاعات پایه / واحدها' },
  tax:         { title: 'تنظیمات مالیاتی', crumb: 'اطلاعات پایه / مالیات' },
  users:       { title: 'کاربران و دسترسی‌ها', crumb: 'اطلاعات پایه / کاربران' },
  woocommerce: { title: 'اتصال ووکامرس', crumb: 'اطلاعات پایه / ووکامرس' },
};

const HDR_BTN: Record<Section, string> = {
  dashboard: 'اتصال WC', company: 'ذخیره', products: '+ محصول جدید',
  categories: '+ دسته‌بندی', customers: '+ مشتری جدید', suppliers: 'در حال توسعه',
  warehouses: '+ انبار جدید', units: '+ واحد جدید', tax: '+ نرخ مالیاتی',
  users: '+ کاربر', woocommerce: 'اتصال ←',
};

type AppModule = 'home' | 'basedata' | 'sales' | 'inventory' | 'crm' | 'accounting' | 'reports' | 'suppliers';

const MODULE_CARDS: Array<{ id: AppModule; icon: string; label: string; desc: string; color: string }> = [
  { id: 'basedata', icon: '⚙️', label: 'اطلاعات پایه', desc: 'محصولات، مشتریان، انبارها و تنظیمات', color: '#e8a94c' },
  { id: 'sales', icon: '🛍️', label: 'فروش', desc: 'فاکتور، پیش‌فاکتور و مدیریت فروش', color: '#f43f5e' },
  { id: 'inventory', icon: '📦', label: 'انبارداری', desc: 'موجودی، ورود/خروج و جابجایی', color: '#4ade80' },
  { id: 'crm', icon: '👥', label: 'مشتریان (CRM)', desc: 'پروفایل، تاریخچه و دفتر حساب', color: '#38bdf8' },
  { id: 'accounting', icon: '💜', label: 'حسابداری', desc: 'داشبورد مالی، چک و سود و زیان', color: '#a78bfa' },
  { id: 'reports', icon: '📊', label: 'گزارشات', desc: 'تحلیل فروش، انبار و مالی', color: '#fb923c' },
  { id: 'suppliers', icon: '🏭', label: 'تامین‌کنندگان', desc: 'سفارشات خرید و دریافت کالا', color: '#22d3ee' },
];

function HomeScreen({ onNavigate }: { onNavigate: (m: AppModule) => void }) {
  return (
    <div style={{ minHeight: '100vh', background: '#060a13', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, fontFamily: 'Vazirmatn', direction: 'rtl' }}>
      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏢</div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: '#f0f4ff', letterSpacing: '-0.5px' }}>بیزنس‌کور</h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: '#64748b' }}>سیستم یکپارچه مدیریت کسب‌وکار</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, maxWidth: 900, width: '100%' }}>
        {MODULE_CARDS.map(m => (
          <button key={m.id} onClick={() => onNavigate(m.id)} style={{ background: '#0a1120', border: `1px solid ${m.color}22`, borderRadius: 14, padding: '22px 20px', cursor: 'pointer', textAlign: 'right', transition: 'border-color .2s', fontFamily: 'Vazirmatn' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = m.color + '66')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = m.color + '22')}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{m.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: m.color, marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>{m.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [appModule, setAppModule] = useState<AppModule>('home');
  const [sec, setSec] = useState<Section>('dashboard');

  if (appModule === 'sales')       return <SalesModule onBack={() => setAppModule('home')} />;
  if (appModule === 'inventory')   return <InventoryModule onBack={() => setAppModule('home')} />;
  if (appModule === 'crm')         return <CRMModule onBack={() => setAppModule('home')} />;
  if (appModule === 'accounting')  return <AccountingModule onBack={() => setAppModule('home')} />;
  if (appModule === 'reports')     return <ReportsModule onBack={() => setAppModule('home')} />;
  if (appModule === 'suppliers')   return <SuppliersModule onBack={() => setAppModule('home')} />;
  if (appModule === 'home')        return <HomeScreen onNavigate={setAppModule} />;

  const meta = META[sec];

  const renderSection = () => {
    switch (sec) {
      case 'dashboard':   return <Dashboard onNav={setSec} />;
      case 'company':     return <CompanySection />;
      case 'products':    return <ProductsSection />;
      case 'customers':   return <CustomersSection />;
      case 'warehouses':  return <WarehousesSection />;
      case 'categories':  return <CategoriesSection />;
      case 'units':       return <UnitsSection />;
      case 'tax':         return <TaxSection />;
      case 'users':       return <UsersSection />;
      case 'woocommerce': return <WoocommerceSection />;
      case 'suppliers':   return <Placeholder icon="🤝" title="تامین‌کنندگان" desc="اطلاعات کامل تامین‌کنندگان، شرایط پرداخت و تاریخچه معاملات." />;
      default:            return null;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#060a13', color: '#e8edf5' }}>
      <Sidebar sec={sec} onNav={setSec} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ height: 56, flexShrink: 0, background: '#070d1a', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', padding: '0 18px', gap: 11 }}>
          <button onClick={() => setAppModule('home')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 12, fontFamily: 'Vazirmatn', marginLeft: 8 }}>← خانه</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: '#374151', fontWeight: 500, marginBottom: 1 }}>{meta.crumb}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-.3px' }}>{meta.title}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 100, padding: '4px 10px' }}>
              <span style={{ width: 5, height: 5, background: '#ef4444', borderRadius: '50%', flexShrink: 0 }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444' }}>WC: قطع</span>
            </div>
            <button style={{ background: 'linear-gradient(135deg,#e8a94c,#f5c842)', color: '#060a13', border: 'none', padding: '7px 15px', borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif", whiteSpace: 'nowrap' }}>
              {HDR_BTN[sec]}
            </button>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 18, background: '#060a13', position: 'relative' }}>
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
