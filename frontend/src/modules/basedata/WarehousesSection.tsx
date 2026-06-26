import { warehouses as warehousesHooks } from '../../hooks/queries';
import { fmtNum, MOCK_WAREHOUSES } from './shared';

export function WarehousesSection() {
  const { data: warehouses = [] } = warehousesHooks.useList(MOCK_WAREHOUSES);

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
