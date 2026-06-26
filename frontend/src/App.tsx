import { useState, useCallback, lazy, Suspense } from 'react';
import { COLOR } from './styles/tokens';
import { useAuth } from './auth/AuthContext';
import { LoginPage } from './auth/LoginPage';
import type { Feature } from './types';

const BasedataModule     = lazy(() => import('./modules/BasedataModule'));
const SalesModule        = lazy(() => import('./modules/SalesModule'));
const InventoryModule    = lazy(() => import('./modules/InventoryModule'));
const CRMModule          = lazy(() => import('./modules/CRMModule'));
const AccountingModule   = lazy(() => import('./modules/AccountingModule'));
const ReportsModule      = lazy(() => import('./modules/ReportsModule'));
const SuppliersModule    = lazy(() => import('./modules/SuppliersModule'));
const SubscriptionModule = lazy(() => import('./modules/SubscriptionModule'));

function ModuleLoader() {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLOR.bg, color: COLOR.textFaint, fontSize: 13, fontFamily: "'Vazirmatn',sans-serif", gap: 10 }}>
      <div style={{ width: 18, height: 18, border: `2px solid ${COLOR.gold}44`, borderTopColor: COLOR.gold, borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      در حال بارگذاری…
    </div>
  );
}

type AppModule = 'home' | 'basedata' | 'sales' | 'inventory' | 'crm' | 'accounting' | 'reports' | 'suppliers' | 'subscription';

// `feature: null` → always available (core). Otherwise the card is gated by plan.
const MODULE_CARDS: Array<{ id: AppModule; icon: string; label: string; desc: string; color: string; feature: Feature | null }> = [
  { id: 'basedata', icon: '⚙️', label: 'اطلاعات پایه', desc: 'محصولات، مشتریان، انبارها و تنظیمات', color: '#e8a94c', feature: null },
  { id: 'sales', icon: '🛍️', label: 'فروش', desc: 'فاکتور، پیش‌فاکتور و مدیریت فروش', color: '#f43f5e', feature: 'SALES' },
  { id: 'inventory', icon: '📦', label: 'انبارداری', desc: 'موجودی، ورود/خروج و جابجایی', color: '#4ade80', feature: 'INVENTORY' },
  { id: 'crm', icon: '👥', label: 'مشتریان (CRM)', desc: 'پروفایل، تاریخچه و دفتر حساب', color: '#38bdf8', feature: 'CRM' },
  { id: 'accounting', icon: '💜', label: 'حسابداری', desc: 'داشبورد مالی، چک و سود و زیان', color: '#a78bfa', feature: 'ACCOUNTING' },
  { id: 'reports', icon: '📊', label: 'گزارشات', desc: 'تحلیل فروش، انبار و مالی', color: '#fb923c', feature: 'REPORTS' },
  { id: 'suppliers', icon: '🏭', label: 'تامین‌کنندگان', desc: 'سفارشات خرید و دریافت کالا', color: '#22d3ee', feature: 'SUPPLIERS' },
];

function HomeScreen({ onNavigate }: { onNavigate: (m: AppModule) => void }) {
  const { user, hasFeature } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: '#060a13', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, fontFamily: 'Vazirmatn', direction: 'rtl' }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏢</div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: '#f0f4ff', letterSpacing: '-0.5px' }}>بیزنس‌کور</h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: '#64748b' }}>سیستم یکپارچه مدیریت کسب‌وکار</p>
        {user && (
          <button onClick={() => onNavigate('subscription')} style={{ marginTop: 14, background: 'rgba(232,169,76,.1)', border: '1px solid rgba(232,169,76,.3)', color: '#e8a94c', fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 100, cursor: 'pointer', fontFamily: 'Vazirmatn' }}>
            {user.tenantName} · پلن {user.planLabel} · مدیریت اشتراک ←
          </button>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, maxWidth: 900, width: '100%' }}>
        {MODULE_CARDS.map(m => {
          const locked = m.feature !== null && !hasFeature(m.feature);
          return (
            <button key={m.id} onClick={() => (locked ? onNavigate('subscription') : onNavigate(m.id))}
              title={locked ? 'برای فعال‌سازی، پلن خود را ارتقا دهید' : undefined}
              style={{ position: 'relative', background: '#0a1120', border: `1px solid ${locked ? 'rgba(255,255,255,.06)' : m.color + '22'}`, borderRadius: 14, padding: '22px 20px', cursor: 'pointer', textAlign: 'right', transition: 'border-color .2s', fontFamily: 'Vazirmatn', opacity: locked ? 0.55 : 1 }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = (locked ? '#ffffff22' : m.color + '66'))}
              onMouseLeave={e => (e.currentTarget.style.borderColor = (locked ? '#ffffff10' : m.color + '22'))}>
              {locked && <span style={{ position: 'absolute', top: 14, left: 14, fontSize: 14 }}>🔒</span>}
              <div style={{ fontSize: 28, marginBottom: 10 }}>{m.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: locked ? '#64748b' : m.color, marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>{locked ? 'نیازمند ارتقای پلن' : m.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const [appModule, setAppModule] = useState<AppModule>('home');
  const goHome = useCallback(() => setAppModule('home'), []);

  if (loading) return <ModuleLoader />;
  if (!user) return <LoginPage />;

  if (appModule === 'home') {
    return <HomeScreen onNavigate={setAppModule} />;
  }

  return (
    <Suspense fallback={<ModuleLoader />}>
      {appModule === 'basedata'    && <BasedataModule   onBack={goHome} />}
      {appModule === 'sales'       && <SalesModule      onBack={goHome} />}
      {appModule === 'inventory'   && <InventoryModule  onBack={goHome} />}
      {appModule === 'crm'         && <CRMModule        onBack={goHome} />}
      {appModule === 'accounting'  && <AccountingModule onBack={goHome} />}
      {appModule === 'reports'     && <ReportsModule    onBack={goHome} />}
      {appModule === 'suppliers'   && <SuppliersModule  onBack={goHome} />}
      {appModule === 'subscription' && <SubscriptionModule onBack={goHome} />}
    </Suspense>
  );
}
