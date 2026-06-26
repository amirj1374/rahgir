import { useState, useMemo } from 'react';
import type { Customer } from '../../types';
import { customers as customersHooks } from '../../hooks/queries';
import { fmtNum, AV_COLORS, MOCK_CUSTOMERS } from './shared';

export function CustomersSection() {
  const { data: customers = [] } = customersHooks.useList(MOCK_CUSTOMERS);
  const createCustomer = customersHooks.useCreate();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newCust, setNewCust] = useState<Partial<Customer>>({ group: 'RETAIL' });
  const [toast, setToast] = useState('');

  const filtered = useMemo(
    () => customers.filter(c =>
      !search || c.name.includes(search) || (c.phone || '').includes(search)
    ),
    [customers, search],
  );

  const saveCust = () => {
    if (!newCust.name) return;
    createCustomer.mutate(newCust as Customer, {
      onSettled: () => {
        setShowModal(false);
        setToast('مشتری با موفقیت ذخیره شد');
        setTimeout(() => setToast(''), 2800);
      },
    });
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
                <button onClick={saveCust} disabled={createCustomer.isPending} style={{ flex: 2, background: 'linear-gradient(135deg,#38bdf8,#0ea5e9)', color: '#fff', border: 'none', padding: 12, borderRadius: 9, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif", opacity: createCustomer.isPending ? .6 : 1 }}>{createCustomer.isPending ? 'در حال ذخیره…' : 'ذخیره مشتری ←'}</button>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#8892a4', padding: 12, borderRadius: 9, fontSize: 13, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>انصراف</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
