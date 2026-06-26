import { useState, useMemo } from 'react';
import type { Product } from '../../types';
import { products as productsHooks } from '../../hooks/queries';
import { fmtNum, statusBadge, MOCK_PRODUCTS } from './shared';

export function ProductsSection() {
  const { data: products = [] } = productsHooks.useList(MOCK_PRODUCTS);
  const createProduct = productsHooks.useCreate();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newProd, setNewProd] = useState<Partial<Product>>({ type: 'SIMPLE' });
  const [toast, setToast] = useState('');

  const filtered = useMemo(
    () => products.filter(p =>
      !search || p.name.includes(search) || (p.sku || '').toLowerCase().includes(search.toLowerCase())
    ),
    [products, search],
  );

  const saveProduct = () => {
    if (!newProd.name) return;
    createProduct.mutate(newProd as Product, {
      onSettled: () => {
        setShowModal(false);
        setToast('محصول با موفقیت ذخیره شد');
        setTimeout(() => setToast(''), 2800);
      },
    });
  };

  return (
    <div style={{ animation: 'fadeSlide .3s ease' }}>
      {toast && (
        <div style={{ position: 'absolute', top: 66, left: '50%', transform: 'translateX(-50%)', zIndex: 500, background: '#4ade80', color: '#052e16', padding: '9px 20px', borderRadius: 10, fontSize: 12, fontWeight: 800, boxShadow: '0 4px 20px rgba(74,222,128,.35)', whiteSpace: 'nowrap', animation: 'fadeSlide .2s ease' }}>✅ {toast}</div>
      )}

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
                <button onClick={saveProduct} disabled={createProduct.isPending} style={{ flex: 2, background: 'linear-gradient(135deg,#e8a94c,#f5c842)', color: '#060a13', border: 'none', padding: 12, borderRadius: 9, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif", opacity: createProduct.isPending ? .6 : 1 }}>{createProduct.isPending ? 'در حال ذخیره…' : 'ذخیره محصول ←'}</button>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#8892a4', padding: 12, borderRadius: 9, fontSize: 13, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>انصراف</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
