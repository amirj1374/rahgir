import { units as unitsHooks } from '../../hooks/queries';
import { MOCK_UNITS } from './shared';

export function UnitsSection() {
  const { data: units = [] } = unitsHooks.useList(MOCK_UNITS);

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
