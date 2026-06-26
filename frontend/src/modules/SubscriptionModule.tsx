import { useSubscription, usePlans, useChangePlan } from '../hooks/queries';
import { useAuth } from '../auth/AuthContext';

const FEATURE_LABELS: Record<string, string> = {
  SALES: 'فروش', INVENTORY: 'انبارداری', CRM: 'مدیریت مشتریان', ACCOUNTING: 'حسابداری',
  REPORTS: 'گزارشات', SUPPLIERS: 'تامین‌کنندگان', WOOCOMMERCE: 'اتصال ووکامرس',
};

const fmt = (n: number) => n.toLocaleString('fa-IR');
const limit = (n: number) => (n === -1 ? 'نامحدود' : fmt(n));

export default function SubscriptionModule({ onBack }: { onBack: () => void }) {
  const { has } = useAuth();
  const { data: sub } = useSubscription();
  const { data: plans = [] } = usePlans();
  const changePlan = useChangePlan();
  const canManage = has('USER_MANAGE');

  return (
    <div style={{ minHeight: '100vh', background: '#060a13', color: '#e8edf5', fontFamily: "'Vazirmatn',sans-serif", direction: 'rtl', padding: 24 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', marginBottom: 16 }}>← خانه</button>

        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#f0f4ff', margin: '0 0 4px' }}>اشتراک و پلن</h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px' }}>یک سیستم بخر، همه‌چی رو داشته باش — فیچرها بر اساس پلن شما باز می‌شوند.</p>

        {sub && (
          <div style={{ background: '#0d1320', border: '1px solid rgba(232,169,76,.25)', borderRadius: 14, padding: 20, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>پلن فعلی</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#e8a94c' }}>{sub.planLabel}</div>
                <div style={{ fontSize: 12, color: '#8892a4', marginTop: 4 }}>{sub.tenantName} · {sub.typeLabel}</div>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                <Stat label="کاربران" used={sub.usedUsers} max={sub.maxUsers} />
                <Stat label="محصولات" used={sub.usedProducts} max={sub.maxProducts} />
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 14 }}>
          {plans.map(p => {
            const current = sub?.plan === p.name;
            return (
              <div key={p.name} style={{ background: '#0d1320', border: `1px solid ${current ? 'rgba(232,169,76,.4)' : 'rgba(255,255,255,.07)'}`, borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: current ? '#e8a94c' : '#f0f4ff' }}>{p.label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#f0f4ff', margin: '8px 0 2px' }}>
                  {p.monthlyPrice === 0 ? 'رایگان' : fmt(p.monthlyPrice)}
                  {p.monthlyPrice > 0 && <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}> تومان/ماه</span>}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>
                  {limit(p.maxUsers)} کاربر · {limit(p.maxProducts)} محصول
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1, marginBottom: 14 }}>
                  {Object.keys(FEATURE_LABELS).map(f => {
                    const on = p.features.includes(f as never);
                    return (
                      <div key={f} style={{ fontSize: 11, color: on ? '#b8c0cc' : '#374151', display: 'flex', gap: 6 }}>
                        <span style={{ color: on ? '#4ade80' : '#374151' }}>{on ? '✓' : '✕'}</span>
                        {FEATURE_LABELS[f]}
                      </div>
                    );
                  })}
                </div>
                {current ? (
                  <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#4ade80', padding: '9px', background: 'rgba(74,222,128,.08)', borderRadius: 8 }}>پلن فعلی شما</div>
                ) : canManage ? (
                  <button onClick={() => changePlan.mutate(p.name)} disabled={changePlan.isPending} style={{ background: 'linear-gradient(135deg,#e8a94c,#f5c842)', color: '#060a13', border: 'none', padding: 10, borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
                    انتخاب این پلن
                  </button>
                ) : (
                  <div style={{ textAlign: 'center', fontSize: 11, color: '#64748b', padding: '9px' }}>تنها مدیر می‌تواند پلن را تغییر دهد</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = max === -1 ? 0 : Math.min(100, (used / max) * 100);
  return (
    <div style={{ minWidth: 120 }}>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: '#f0f4ff' }}>
        {used.toLocaleString('fa-IR')} <span style={{ fontSize: 11, color: '#64748b' }}>/ {max === -1 ? 'نامحدود' : max.toLocaleString('fa-IR')}</span>
      </div>
      {max !== -1 && (
        <div style={{ height: 4, background: 'rgba(255,255,255,.06)', borderRadius: 4, marginTop: 6, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: pct > 85 ? '#ef4444' : '#4ade80', borderRadius: 4 }} />
        </div>
      )}
    </div>
  );
}
