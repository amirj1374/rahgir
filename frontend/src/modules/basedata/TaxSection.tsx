import { taxRates as taxRatesHooks } from '../../hooks/queries';
import { MOCK_TAX } from './shared';

export function TaxSection() {
  const { data: taxRates = [] } = taxRatesHooks.useList(MOCK_TAX);

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
