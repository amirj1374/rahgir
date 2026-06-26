import { useState, useCallback, lazy, Suspense } from 'react';
import { COLOR } from './styles/tokens';
import { useAuth } from './auth/AuthContext';
import { LoginPage } from './auth/LoginPage';

const BasedataModule   = lazy(() => import('./modules/BasedataModule'));
const SalesModule      = lazy(() => import('./modules/SalesModule'));
const InventoryModule  = lazy(() => import('./modules/InventoryModule'));
const CRMModule        = lazy(() => import('./modules/CRMModule'));
const AccountingModule = lazy(() => import('./modules/AccountingModule'));
const ReportsModule    = lazy(() => import('./modules/ReportsModule'));
const SuppliersModule  = lazy(() => import('./modules/SuppliersModule'));

function ModuleLoader() {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLOR.bg, color: COLOR.textFaint, fontSize: 13, fontFamily: "'Vazirmatn',sans-serif", gap: 10 }}>
      <div style={{ width: 18, height: 18, border: `2px solid ${COLOR.gold}44`, borderTopColor: COLOR.gold, borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      در حال بارگذاری…
    </div>
  );
}

type AppModule = 'home' | 'basedata' | 'sales' | 'inventory' | 'crm' | 'accounting' | 'reports' | 'suppliers';

const MODULE_CARDS: Array<{ id: AppModule; icon: string; label: string; desc: string; color: string }> = [
  { id: 'basedata', icon: '⚙️', label: 'اطلاعات پایه', desc: 'محصولات، مشتریان، انبارها و تنظیمات', color: '#e8a94c' },
  { id: 'sales', icon: '🛍️', label: 'فروش', desc: 'فاکتور، پیش‌فاکتور و مدیریت فروش', color: '#f43f5e' },
  { id: 'inventory', icon: '📦', label: 'انبارداری', desc: 'موجودی، ورود/خروج و جابجایی', color: '#4ade80' },
  { id: 'crm', icon: '👥', label: 'مشتریان (CRM)', desc: 'پروفایل، تاریخچه و دفتر حساب', color: '#38bdf8' },
  { id: 'accounting', icon: '💜', label: 'حسابداری', desc: 'داشبورد مالی، چک و سود و زیان', color: '#a78bfa' },
  { id: 'reports', icon: '📊', label: 'گزارشات', desc: 'تحلیل فروش، انبار و مالی', color: '#fb923c' },
  { id: 'suppliers', icon: '🏭', label: 'تامین‌کنندگان', desc: 'سفارشات خرید و دریافت کالا', color: '#22d3ee' },
];

function HomeScreen({ onNavigate }: { onNavigate: (m: AppModule) => void }) {
  return (
    <div style={{ minHeight: '100vh', background: '#060a13', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, fontFamily: 'Vazirmatn', direction: 'rtl' }}>
      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏢</div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: '#f0f4ff', letterSpacing: '-0.5px' }}>بیزنس‌کور</h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: '#64748b' }}>سیستم یکپارچه مدیریت کسب‌وکار</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, maxWidth: 900, width: '100%' }}>
        {MODULE_CARDS.map(m => (
          <button key={m.id} onClick={() => onNavigate(m.id)} style={{ background: '#0a1120', border: `1px solid ${m.color}22`, borderRadius: 14, padding: '22px 20px', cursor: 'pointer', textAlign: 'right', transition: 'border-color .2s', fontFamily: 'Vazirmatn' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = m.color + '66')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = m.color + '22')}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{m.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: m.color, marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>{m.desc}</div>
          </button>
        ))}
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
    </Suspense>
  );
}
