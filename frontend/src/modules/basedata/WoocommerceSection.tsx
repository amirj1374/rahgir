import { useState, useCallback } from 'react';

export function WoocommerceSection() {
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
