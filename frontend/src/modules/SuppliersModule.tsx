import { useState } from 'react';

interface Props { onBack: () => void; }

const C = '#22d3ee';

const SUPPLIERS = [
  { id: 1, name: 'بافت آریا', city: 'تهران', category: 'پارچه', phone: '۰۲۱-۵۵۶۶۷۷۸۸', balance: -3500000, orders: 24, stars: 5 },
  { id: 2, name: 'کفش‌سازی مینا', city: 'تبریز', category: 'کفش', phone: '۰۴۱-۳۳۴۴۵۵۶۶', balance: 0, orders: 15, stars: 4 },
  { id: 3, name: 'نساجی کرمان', city: 'کرمان', category: 'پارچه', phone: '۰۳۴-۲۲۳۳۴۴۵۵', balance: -1200000, orders: 31, stars: 4 },
  { id: 4, name: 'پوشاک مهر', city: 'اصفهان', category: 'پوشاک', phone: '۰۳۱-۴۴۵۵۶۶۷۷', balance: 500000, orders: 8, stars: 3 },
  { id: 5, name: 'کارخانه نخ ابریشم', city: 'گیلان', category: 'نخ', phone: '۰۱۳-۵۵۶۶۷۷۸۸', balance: -8800000, orders: 42, stars: 5 },
];

const PURCHASE_ORDERS = [
  { id: 'PO-1015', supplier: 'بافت آریا', items: 5, orderDate: '۱۴۰۳/۰۳/۲۰', deliveryDate: '۱۴۰۳/۰۴/۰۵', total: 25000000, status: 'تحویل‌شده' },
  { id: 'PO-1016', supplier: 'کفش‌سازی مینا', items: 3, orderDate: '۱۴۰۳/۰۴/۰۱', deliveryDate: '۱۴۰۳/۰۴/۱۵', total: 18000000, status: 'در راه' },
  { id: 'PO-1017', supplier: 'نساجی کرمان', items: 8, orderDate: '۱۴۰۳/۰۴/۰۵', deliveryDate: '۱۴۰۳/۰۵/۰۱', total: 32000000, status: 'در انتظار' },
  { id: 'PO-1018', supplier: 'پوشاک مهر', items: 2, orderDate: '۱۴۰۳/۰۴/۰۶', deliveryDate: '۱۴۰۳/۰۴/۲۰', total: 8500000, status: 'در انتظار' },
  { id: 'PO-1014', supplier: 'کارخانه نخ ابریشم', items: 6, orderDate: '۱۴۰۳/۰۳/۱۵', deliveryDate: '۱۴۰۳/۰۳/۳۰', total: 41000000, status: 'تحویل‌شده' },
];

export default function SuppliersModule({ onBack }: Props) {
  const [section, setSection] = useState<'list' | 'orders' | 'receive'>('list');
  const [search, setSearch] = useState('');
  const [poFilter, setPoFilter] = useState('all');
  const [selSupplier, setSelSupplier] = useState('');
  const [showNewPO, setShowNewPO] = useState(false);
  const [poDate, setPoDate] = useState('');
  const [poNotes, setPoNotes] = useState('');
  const [poTerms, setPoTerms] = useState('');

  const [receiveItems, setReceiveItems] = useState([
    { name: 'پارچه آبی', qty: '', price: '' },
    { name: 'پارچه قرمز', qty: '', price: '' },
  ]);
  const [receiveWh, setReceiveWh] = useState('wh1');
  const [receiveRef, setReceiveRef] = useState('');

  const fmtN = (n: number) => n.toLocaleString('fa-IR');
  const fmtM = (n: number) => (n / 1000000).toFixed(1) + 'M';
  const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);
  const inputStyle: React.CSSProperties = { background: '#0d1320', border: '1px solid #1e2d45', borderRadius: 8, color: '#e8edf5', padding: '8px 12px', fontFamily: 'Vazirmatn', fontSize: 13, width: '100%' };
  const btnStyle = (color: string): React.CSSProperties => ({ background: color + '22', border: `1px solid ${color}44`, color, borderRadius: 8, padding: '8px 18px', fontFamily: 'Vazirmatn', fontSize: 13, cursor: 'pointer' });

  const filteredSuppliers = SUPPLIERS.filter(s => !search || s.name.includes(search) || s.city.includes(search));
  const filteredPOs = PURCHASE_ORDERS.filter(p => poFilter === 'all' || p.status === poFilter);

  const poStatusColor: Record<string, string> = { 'تحویل‌شده': '#4ade80', 'در راه': C, 'در انتظار': '#f59e0b' };

  const navItems = [
    { id: 'list', label: 'لیست تامین‌کنندگان', icon: '🏭' },
    { id: 'orders', label: 'سفارشات خرید', icon: '📋' },
    { id: 'receive', label: 'دریافت کالا', icon: '📥' },
  ];

  const receiveTotal = receiveItems.reduce((sum, i) => sum + (parseInt(i.qty || '0') * parseInt(i.price || '0')), 0);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#060a13', color: '#e8edf5', fontFamily: 'Vazirmatn', direction: 'rtl' }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: '#0a1120', borderLeft: '1px solid #1a2540', display: 'flex', flexDirection: 'column', padding: '20px 0' }}>
        <div style={{ padding: '0 16px 20px', borderBottom: '1px solid #1a2540' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13 }}>← بازگشت</button>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏭</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C }}>تامین‌کنندگان</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>مدیریت خرید</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setSection(n.id as any)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: section === n.id ? C + '18' : 'none', color: section === n.id ? C : '#94a3b8', cursor: 'pointer', fontFamily: 'Vazirmatn', fontSize: 13, marginBottom: 2, textAlign: 'right' }}>
              <span>{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px', borderTop: '1px solid #1a2540' }}>
          {[['کل تامین‌کننده', SUPPLIERS.length], ['سفارش فعال', PURCHASE_ORDERS.filter(p => p.status !== 'تحویل‌شده').length], ['در راه', PURCHASE_ORDERS.filter(p => p.status === 'در راه').length]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>{k}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {section === 'list' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20, color: C }}>تامین‌کنندگان</h2>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجو..." style={{ ...inputStyle, width: 220 }} />
            </div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
              {[['تامین‌کنندگان فعال', '۵', C], ['بدهی کل', '۱۳.۵M', '#ef4444'], ['سفارشات این ماه', '۴', '#f59e0b'], ['میانگین رتبه', '۴.۲', '#f59e0b']].map(([k, v, c]) => (
                <div key={k} style={{ background: '#0a1120', borderRadius: 12, padding: '14px 18px', border: '1px solid #1a2540' }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{k}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: c as string }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#0a1120', borderRadius: 12, overflow: 'hidden', border: '1px solid #1a2540' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#0d1320' }}>{['تامین‌کننده','شهر','دسته‌بندی','تلفن','مانده','سفارشات','رتبه','عملیات'].map(h => <th key={h} style={{ padding: '11px 14px', textAlign: 'right', fontSize: 12, color: '#64748b', borderBottom: '1px solid #1a2540' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {filteredSuppliers.map((s, i) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #1a254020', background: i % 2 === 0 ? 'transparent' : '#0d132015' }}>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: C + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: C }}>{s.name.charAt(0)}</div>
                          <span style={{ fontSize: 13 }}>{s.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: '#94a3b8' }}>{s.city}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12 }}>{s.category}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{s.phone}</td>
                      <td style={{ padding: '11px 14px', fontSize: 13, color: s.balance < 0 ? '#ef4444' : s.balance > 0 ? '#4ade80' : '#64748b', fontWeight: 600 }}>{s.balance !== 0 ? fmtM(s.balance) : 'تسویه'}</td>
                      <td style={{ padding: '11px 14px', fontSize: 13, textAlign: 'center' }}>{fmtN(s.orders)}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: '#f59e0b' }}>{stars(s.stars)}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <button onClick={() => { setSection('orders'); setSelSupplier(s.name); }} style={{ ...btnStyle(C), padding: '4px 12px', fontSize: 11 }}>سفارش</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === 'orders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20, color: C }}>سفارشات خرید</h2>
              <button onClick={() => setShowNewPO(true)} style={btnStyle(C)}>+ سفارش جدید</button>
            </div>
            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[['all','همه'], ['در انتظار','در انتظار'], ['در راه','در راه'], ['تحویل‌شده','تحویل‌شده']].map(([v, l]) => (
                <button key={v} onClick={() => setPoFilter(v)} style={{ padding: '6px 14px', borderRadius: 20, border: 'none', background: poFilter === v ? C + '22' : '#0d1320', color: poFilter === v ? C : '#64748b', fontFamily: 'Vazirmatn', fontSize: 12, cursor: 'pointer' }}>{l}</button>
              ))}
            </div>
            <div style={{ background: '#0a1120', borderRadius: 12, overflow: 'hidden', border: '1px solid #1a2540' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#0d1320' }}>{['شماره PO','تامین‌کننده','اقلام','تاریخ سفارش','تاریخ تحویل','مبلغ','وضعیت'].map(h => <th key={h} style={{ padding: '11px 14px', textAlign: 'right', fontSize: 12, color: '#64748b', borderBottom: '1px solid #1a2540' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {filteredPOs.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #1a254020', background: i % 2 === 0 ? 'transparent' : '#0d132015' }}>
                      <td style={{ padding: '11px 14px', fontSize: 13, color: C }}>{p.id}</td>
                      <td style={{ padding: '11px 14px', fontSize: 13 }}>{p.supplier}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, textAlign: 'center' }}>{p.items} قلم</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{p.orderDate}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12 }}>{p.deliveryDate}</td>
                      <td style={{ padding: '11px 14px', fontSize: 14, fontWeight: 700 }}>{fmtM(p.total)}</td>
                      <td style={{ padding: '11px 14px' }}><span style={{ background: poStatusColor[p.status] + '22', color: poStatusColor[p.status], padding: '3px 10px', borderRadius: 20, fontSize: 11 }}>{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === 'receive' && (
          <div style={{ maxWidth: 700 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 20, color: C }}>دریافت کالا</h2>
            <div style={{ background: '#0a1120', borderRadius: 12, padding: 24, border: '1px solid #1a2540' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>تامین‌کننده</label>
                  <select value={selSupplier} onChange={e => setSelSupplier(e.target.value)} style={inputStyle}>
                    <option value="">انتخاب کنید...</option>
                    {SUPPLIERS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>شماره PO مرجع</label>
                  <input value={receiveRef} onChange={e => setReceiveRef(e.target.value)} placeholder="PO-xxxx" style={inputStyle} />
                </div>
              </div>
              {/* Items table */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>اقلام دریافتی</span>
                  <button onClick={() => setReceiveItems(p => [...p, { name: '', qty: '', price: '' }])} style={{ ...btnStyle(C), padding: '4px 12px', fontSize: 12 }}>+ افزودن ردیف</button>
                </div>
                <div style={{ background: '#0d1320', borderRadius: 8, overflow: 'hidden', border: '1px solid #1a2540' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 2fr', gap: 0, background: '#0a1120', padding: '8px 12px', borderBottom: '1px solid #1a2540' }}>
                    {['نام کالا', 'تعداد', 'قیمت واحد'].map(h => <span key={h} style={{ fontSize: 12, color: '#64748b' }}>{h}</span>)}
                  </div>
                  {receiveItems.map((item, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 2fr auto', gap: 8, padding: '8px 12px', borderBottom: i < receiveItems.length - 1 ? '1px solid #1a254030' : 'none', alignItems: 'center' }}>
                      <input value={item.name} onChange={e => setReceiveItems(p => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} style={{ ...inputStyle, width: 'auto' }} />
                      <input type="number" value={item.qty} onChange={e => setReceiveItems(p => p.map((x, j) => j === i ? { ...x, qty: e.target.value } : x))} style={{ ...inputStyle, width: 'auto' }} />
                      <input type="number" value={item.price} onChange={e => setReceiveItems(p => p.map((x, j) => j === i ? { ...x, price: e.target.value } : x))} style={{ ...inputStyle, width: 'auto' }} />
                      <button onClick={() => setReceiveItems(p => p.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#ef444466', cursor: 'pointer', fontSize: 18, padding: '0 4px' }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>انبار مقصد</label>
                  <select value={receiveWh} onChange={e => setReceiveWh(e.target.value)} style={inputStyle}>
                    <option value="wh1">انبار ۱</option>
                    <option value="wh2">انبار ۲</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 12, color: '#64748b' }}>جمع کل</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: C }}>{fmtN(receiveTotal)}</div>
                  </div>
                </div>
              </div>
              <button style={{ ...btnStyle(C), width: '100%', padding: 12, textAlign: 'center', fontSize: 14 }}>ثبت دریافت کالا</button>
            </div>
          </div>
        )}
      </div>

      {/* New PO Modal */}
      {showNewPO && (
        <div style={{ position: 'fixed', inset: 0, background: '#000000aa', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#0a1120', borderRadius: 16, padding: 28, width: 460, border: '1px solid #1a2540' }}>
            <h3 style={{ margin: '0 0 20px', color: C }}>سفارش خرید جدید</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>تامین‌کننده</label>
                <select value={selSupplier} onChange={e => setSelSupplier(e.target.value)} style={inputStyle}>
                  <option value="">انتخاب کنید...</option>
                  {SUPPLIERS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>تاریخ تحویل</label>
                <input value={poDate} onChange={e => setPoDate(e.target.value)} placeholder="۱۴۰۳/۰۵/۰۱" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>شرایط پرداخت</label>
                <select value={poTerms} onChange={e => setPoTerms(e.target.value)} style={inputStyle}>
                  <option value="">انتخاب کنید...</option>
                  <option value="cash">نقدی</option>
                  <option value="30">۳۰ روزه</option>
                  <option value="60">۶۰ روزه</option>
                  <option value="check">چک</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>توضیحات</label>
                <textarea value={poNotes} onChange={e => setPoNotes(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setShowNewPO(false)} style={{ ...btnStyle(C), flex: 1, textAlign: 'center' }}>ثبت سفارش</button>
                <button onClick={() => setShowNewPO(false)} style={{ ...btnStyle('#64748b'), flex: 1, textAlign: 'center' }}>انصراف</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
