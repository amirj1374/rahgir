import { categories as categoriesHooks } from '../../hooks/queries';
import { MOCK_CATEGORIES } from './shared';

export function CategoriesSection() {
  const { data: categories = [] } = categoriesHooks.useList(MOCK_CATEGORIES);

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
