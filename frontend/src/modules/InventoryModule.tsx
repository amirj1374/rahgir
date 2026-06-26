import { useState } from 'react';

interface Props { onBack: () => void; }

const INIT_STOCK = [
  { id: 1, sku: 'P001-BLK-L', name: 'تی‌شرت مشکی', variant: 'مشکی / L', wh1: 45, wh2: 20, alertAt: 10, category: 'پوشاک' },
  { id: 2, sku: 'P001-WHT-M', name: 'تی‌شرت سفید', variant: 'سفید / M', wh1: 8, wh2: 5, alertAt: 10, category: 'پوشاک' },
  { id: 3, sku: 'P002-BLU-42', name: 'کفش آبی', variant: 'آبی / 42', wh1: 0, wh2: 0, alertAt: 5, category: 'کفش' },
  { id: 4, sku: 'P003-RED-S', name: 'کاپشن قرمز', variant: 'قرمز / S', wh1: 22, wh2: 10, alertAt: 8, category: 'پوشاک' },
  { id: 5, sku: 'P004-GRN-XL', name: 'شلوار سبز', variant: 'سبز / XL', wh1: 3, wh2: 0, alertAt: 5, category: 'پوشاک' },
  { id: 6, sku: 'P005-BRN-44', name: 'کفش قهوه‌ای', variant: 'قهوه‌ای / 44', wh1: 15, wh2: 8, alertAt: 6, category: 'کفش' },
  { id: 7, sku: 'P006-PUR-M', name: 'هودی بنفش', variant: 'بنفش / M', wh1: 0, wh2: 2, alertAt: 5, category: 'پوشاک' },
  { id: 8, sku: 'P007-YEL-38', name: 'صندل زرد', variant: 'زرد / 38', wh1: 12, wh2: 6, alertAt: 4, category: 'کفش' },
];

const INIT_LOG = [
  { id: 1, date: '۱۴۰۳/۰۴/۰۱', type: 'in', sku: 'P001-BLK-L', name: 'تی‌شرت مشکی', qty: 20, wh: 'انبار ۱', ref: 'PO-1001', user: 'احمدی' },
  { id: 2, date: '۱۴۰۳/۰۴/۰۲', type: 'out', sku: 'P002-BLU-42', name: 'کفش آبی', qty: 5, wh: 'انبار ۲', ref: 'INV-2045', user: 'رضایی' },
  { id: 3, date: '۱۴۰۳/۰۴/۰۳', type: 'transfer', sku: 'P003-RED-S', name: 'کاپشن قرمز', qty: 8, wh: 'انبار ۱ → انبار ۲', ref: 'TR-001', user: 'محمدی' },
  { id: 4, date: '۱۴۰۳/۰۴/۰۴', type: 'in', sku: 'P006-PUR-M', name: 'هودی بنفش', qty: 15, wh: 'انبار ۱', ref: 'PO-1002', user: 'احمدی' },
  { id: 5, date: '۱۴۰۳/۰۴/۰۵', type: 'out', sku: 'P004-GRN-XL', name: 'شلوار سبز', qty: 3, wh: 'انبار ۱', ref: 'INV-2046', user: 'رضایی' },
];

const G = '#4ade80';

export default function InventoryModule({ onBack }: Props) {
  const [section, setSection] = useState<'stock' | 'transactions' | 'transfer'>('stock');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'oos' | 'ok'>('all');
  const [search, setSearch] = useState('');
  const [stock, setStock] = useState(INIT_STOCK);
  const [log, setLog] = useState(INIT_LOG);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'in' | 'out'>('in');
  const [selItem, setSelItem] = useState<typeof INIT_STOCK[0] | null>(null);
  const [txQty, setTxQty] = useState('');
  const [txWh, setTxWh] = useState('wh1');
  const [txRef, setTxRef] = useState('');

  const [trFrom, setTrFrom] = useState('wh1');
  const [trTo, setTrTo] = useState('wh2');
  const [trItem, setTrItem] = useState('');
  const [trQty, setTrQty] = useState('');

  const fmtN = (n: number) => n.toLocaleString('fa-IR');

  const filtered = stock.filter(s => {
    const total = s.wh1 + s.wh2;
    if (stockFilter === 'oos' && total > 0) return false;
    if (stockFilter === 'low' && (total === 0 || total >= s.alertAt)) return false;
    if (stockFilter === 'ok' && total < s.alertAt) return false;
    if (search && !s.name.includes(search) && !s.sku.includes(search)) return false;
    return true;
  });

  const getStatus = (s: typeof INIT_STOCK[0]) => {
    const total = s.wh1 + s.wh2;
    if (total === 0) return { label: 'ناموجود', color: '#ef4444' };
    if (total < s.alertAt) return { label: 'کم', color: '#f59e0b' };
    return { label: 'موجود', color: G };
  };

  const applyTx = () => {
    if (!selItem || !txQty) return;
    const qty = parseInt(txQty);
    setStock(prev => prev.map(s => {
      if (s.id !== selItem.id) return s;
      if (txWh === 'wh1') return { ...s, wh1: modalType === 'in' ? s.wh1 + qty : Math.max(0, s.wh1 - qty) };
      return { ...s, wh2: modalType === 'in' ? s.wh2 + qty : Math.max(0, s.wh2 - qty) };
    }));
    setLog(prev => [{ id: prev.length + 1, date: '۱۴۰۳/۰۴/۰۶', type: modalType, sku: selItem.sku, name: selItem.name, qty, wh: txWh === 'wh1' ? 'انبار ۱' : 'انبار ۲', ref: txRef || '-', user: 'کاربر' }, ...prev]);
    setShowModal(false); setTxQty(''); setTxRef('');
  };

  const applyTransfer = () => {
    if (!trItem || !trQty || trFrom === trTo) return;
    const qty = parseInt(trQty);
    const item = stock.find(s => s.sku === trItem);
    if (!item) return;
    setStock(prev => prev.map(s => {
      if (s.sku !== trItem) return s;
      if (trFrom === 'wh1') return { ...s, wh1: Math.max(0, s.wh1 - qty), wh2: s.wh2 + qty };
      return { ...s, wh1: s.wh1 + qty, wh2: Math.max(0, s.wh2 - qty) };
    }));
    setLog(prev => [{ id: prev.length + 1, date: '۱۴۰۳/۰۴/۰۶', type: 'transfer', sku: item.sku, name: item.name, qty, wh: `${trFrom === 'wh1' ? 'انبار ۱' : 'انبار ۲'} → ${trTo === 'wh1' ? 'انبار ۱' : 'انبار ۲'}`, ref: 'TR-' + Date.now(), user: 'کاربر' }, ...prev]);
    setTrQty(''); setTrItem('');
  };

  const navItems = [
    { id: 'stock', label: 'موجودی کالا', icon: '📦' },
    { id: 'transactions', label: 'تراکنش‌ها', icon: '📋' },
    { id: 'transfer', label: 'جابجایی انبار', icon: '🔄' },
  ];

  const inputStyle: React.CSSProperties = { background: '#0d1320', border: '1px solid #1e2d45', borderRadius: 8, color: '#e8edf5', padding: '8px 12px', fontFamily: 'Vazirmatn', fontSize: 13, width: '100%' };
  const btnStyle = (color: string): React.CSSProperties => ({ background: color + '22', border: `1px solid ${color}44`, color, borderRadius: 8, padding: '8px 18px', fontFamily: 'Vazirmatn', fontSize: 13, cursor: 'pointer' });

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#060a13', color: '#e8edf5', fontFamily: 'Vazirmatn', direction: 'rtl' }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: '#0a1120', borderLeft: '1px solid #1a2540', display: 'flex', flexDirection: 'column', padding: '20px 0' }}>
        <div style={{ padding: '0 16px 20px', borderBottom: '1px solid #1a2540' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>← بازگشت</button>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: G + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📦</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: G }}>انبارداری</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>مدیریت موجودی</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setSection(n.id as any)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: section === n.id ? G + '18' : 'none', color: section === n.id ? G : '#94a3b8', cursor: 'pointer', fontFamily: 'Vazirmatn', fontSize: 13, marginBottom: 2, textAlign: 'right' }}>
              <span>{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
        </nav>
        {/* Stats */}
        <div style={{ padding: '16px', borderTop: '1px solid #1a2540' }}>
          {[['کل اقلام', fmtN(stock.length)], ['ناموجود', fmtN(stock.filter(s => s.wh1 + s.wh2 === 0).length)], ['کم‌موجود', fmtN(stock.filter(s => { const t = s.wh1 + s.wh2; return t > 0 && t < s.alertAt; }).length)]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>{k}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#e8edf5' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {section === 'stock' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20, color: G }}>موجودی کالا</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setModalType('in'); setShowModal(true); setSelItem(null); }} style={btnStyle(G)}>+ ورود کالا</button>
                <button onClick={() => { setModalType('out'); setShowModal(true); setSelItem(null); }} style={btnStyle('#f59e0b')}>- خروج کالا</button>
              </div>
            </div>
            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[['all','همه'], ['ok','موجود'], ['low','کم‌موجود'], ['oos','ناموجود']].map(([v,l]) => (
                <button key={v} onClick={() => setStockFilter(v as any)} style={{ padding: '6px 14px', borderRadius: 20, border: 'none', background: stockFilter === v ? G + '22' : '#0d1320', color: stockFilter === v ? G : '#64748b', fontFamily: 'Vazirmatn', fontSize: 12, cursor: 'pointer' }}>{l}</button>
              ))}
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجو..." style={{ ...inputStyle, width: 200, marginRight: 'auto' }} />
            </div>
            {/* Table */}
            <div style={{ background: '#0a1120', borderRadius: 12, overflow: 'hidden', border: '1px solid #1a2540' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0d1320' }}>
                    {['SKU','نام کالا','تنوع','انبار ۱','انبار ۲','جمع','هشدار','وضعیت','عملیات'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'right', fontSize: 12, color: '#64748b', fontWeight: 600, borderBottom: '1px solid #1a2540' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => {
                    const st = getStatus(s);
                    return (
                      <tr key={s.id} style={{ background: i % 2 === 0 ? 'transparent' : '#0d132022', borderBottom: '1px solid #1a254020' }}>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{s.sku}</td>
                        <td style={{ padding: '11px 14px', fontSize: 13 }}>{s.name}</td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#94a3b8' }}>{s.variant}</td>
                        <td style={{ padding: '11px 14px', fontSize: 13, textAlign: 'center' }}>{fmtN(s.wh1)}</td>
                        <td style={{ padding: '11px 14px', fontSize: 13, textAlign: 'center' }}>{fmtN(s.wh2)}</td>
                        <td style={{ padding: '11px 14px', fontSize: 14, fontWeight: 700, textAlign: 'center' }}>{fmtN(s.wh1 + s.wh2)}</td>
                        <td style={{ padding: '11px 14px', fontSize: 12, textAlign: 'center', color: '#64748b' }}>{fmtN(s.alertAt)}</td>
                        <td style={{ padding: '11px 14px' }}><span style={{ background: st.color + '22', color: st.color, padding: '3px 10px', borderRadius: 20, fontSize: 11 }}>{st.label}</span></td>
                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => { setSelItem(s); setModalType('in'); setShowModal(true); }} style={{ ...btnStyle(G), padding: '4px 10px', fontSize: 11 }}>ورود</button>
                            <button onClick={() => { setSelItem(s); setModalType('out'); setShowModal(true); }} style={{ ...btnStyle('#f59e0b'), padding: '4px 10px', fontSize: 11 }}>خروج</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === 'transactions' && (
          <div>
            <h2 style={{ margin: '0 0 20px', fontSize: 20, color: G }}>تراکنش‌های انبار</h2>
            <div style={{ background: '#0a1120', borderRadius: 12, overflow: 'hidden', border: '1px solid #1a2540' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0d1320' }}>
                    {['تاریخ','نوع','SKU','نام کالا','تعداد','انبار','مرجع','کاربر'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'right', fontSize: 12, color: '#64748b', fontWeight: 600, borderBottom: '1px solid #1a2540' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {log.map((l, i) => {
                    const typeMap: Record<string, {label:string,color:string}> = { in: {label:'ورود',color:G}, out: {label:'خروج',color:'#ef4444'}, transfer: {label:'انتقال',color:'#38bdf8'} };
                    const t = typeMap[l.type];
                    return (
                      <tr key={l.id} style={{ background: i % 2 === 0 ? 'transparent' : '#0d132022', borderBottom: '1px solid #1a254020' }}>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{l.date}</td>
                        <td style={{ padding: '11px 14px' }}><span style={{ background: t.color + '22', color: t.color, padding: '3px 10px', borderRadius: 20, fontSize: 11 }}>{t.label}</span></td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{l.sku}</td>
                        <td style={{ padding: '11px 14px', fontSize: 13 }}>{l.name}</td>
                        <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>{fmtN(l.qty)}</td>
                        <td style={{ padding: '11px 14px', fontSize: 12 }}>{l.wh}</td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#94a3b8' }}>{l.ref}</td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#64748b' }}>{l.user}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === 'transfer' && (
          <div style={{ maxWidth: 600 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 20, color: G }}>جابجایی بین انبارها</h2>
            <div style={{ background: '#0a1120', borderRadius: 12, padding: 24, border: '1px solid #1a2540', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>از انبار</label>
                  <select value={trFrom} onChange={e => setTrFrom(e.target.value)} style={inputStyle}>
                    <option value="wh1">انبار ۱</option>
                    <option value="wh2">انبار ۲</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>به انبار</label>
                  <select value={trTo} onChange={e => setTrTo(e.target.value)} style={inputStyle}>
                    <option value="wh2">انبار ۲</option>
                    <option value="wh1">انبار ۱</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>کالا</label>
                <select value={trItem} onChange={e => setTrItem(e.target.value)} style={inputStyle}>
                  <option value="">انتخاب کنید...</option>
                  {stock.map(s => <option key={s.sku} value={s.sku}>{s.name} ({s.variant})</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>تعداد</label>
                <input type="number" value={trQty} onChange={e => setTrQty(e.target.value)} placeholder="تعداد" style={inputStyle} />
              </div>
              <button onClick={applyTransfer} style={{ ...btnStyle(G), padding: '10px', textAlign: 'center' }}>ثبت جابجایی</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: '#000000aa', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#0a1120', borderRadius: 16, padding: 28, width: 440, border: '1px solid #1a2540' }}>
            <h3 style={{ margin: '0 0 20px', color: modalType === 'in' ? G : '#f59e0b' }}>{modalType === 'in' ? '+ ورود کالا' : '- خروج کالا'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>کالا</label>
                <select value={selItem?.id || ''} onChange={e => setSelItem(stock.find(s => s.id === parseInt(e.target.value)) || null)} style={inputStyle}>
                  <option value="">انتخاب کنید...</option>
                  {stock.map(s => <option key={s.id} value={s.id}>{s.name} ({s.variant})</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>انبار</label>
                <select value={txWh} onChange={e => setTxWh(e.target.value)} style={inputStyle}>
                  <option value="wh1">انبار ۱ {selItem ? `(موجودی: ${fmtN(selItem.wh1)})` : ''}</option>
                  <option value="wh2">انبار ۲ {selItem ? `(موجودی: ${fmtN(selItem.wh2)})` : ''}</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>تعداد</label>
                <input type="number" value={txQty} onChange={e => setTxQty(e.target.value)} placeholder="تعداد" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>شماره مرجع (اختیاری)</label>
                <input value={txRef} onChange={e => setTxRef(e.target.value)} placeholder="PO-xxxx / INV-xxxx" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button onClick={applyTx} style={{ ...btnStyle(modalType === 'in' ? G : '#f59e0b'), flex: 1, textAlign: 'center' }}>ثبت</button>
                <button onClick={() => setShowModal(false)} style={{ ...btnStyle('#64748b'), flex: 1, textAlign: 'center' }}>انصراف</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
