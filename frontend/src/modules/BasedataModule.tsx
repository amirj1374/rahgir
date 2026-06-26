import { useState } from 'react';
import { META, HDR_BTN, type Section } from './basedata/shared';
import { Sidebar } from './basedata/Sidebar';
import { Dashboard } from './basedata/Dashboard';
import { CompanySection } from './basedata/CompanySection';
import { ProductsSection } from './basedata/ProductsSection';
import { CustomersSection } from './basedata/CustomersSection';
import { WarehousesSection } from './basedata/WarehousesSection';
import { CategoriesSection } from './basedata/CategoriesSection';
import { UnitsSection } from './basedata/UnitsSection';
import { TaxSection } from './basedata/TaxSection';
import { UsersSection } from './basedata/UsersSection';
import { RolesSection } from './basedata/RolesSection';
import { WoocommerceSection } from './basedata/WoocommerceSection';
import { Placeholder } from './basedata/Placeholder';

export default function BasedataModule({ onBack }: { onBack: () => void }) {
  const [sec, setSec] = useState<Section>('dashboard');
  const meta = META[sec];

  const renderSection = () => {
    switch (sec) {
      case 'dashboard':   return <Dashboard onNav={setSec} />;
      case 'company':     return <CompanySection />;
      case 'products':    return <ProductsSection />;
      case 'customers':   return <CustomersSection />;
      case 'warehouses':  return <WarehousesSection />;
      case 'categories':  return <CategoriesSection />;
      case 'units':       return <UnitsSection />;
      case 'tax':         return <TaxSection />;
      case 'users':       return <UsersSection />;
      case 'roles':       return <RolesSection />;
      case 'woocommerce': return <WoocommerceSection />;
      case 'suppliers':   return <Placeholder icon="🤝" title="تامین‌کنندگان" desc="اطلاعات کامل تامین‌کنندگان، شرایط پرداخت و تاریخچه معاملات." />;
      default:            return null;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#060a13', color: '#e8edf5', fontFamily: "'Vazirmatn',sans-serif", direction: 'rtl' }}>
      <Sidebar sec={sec} onNav={setSec} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <header style={{ height: 56, flexShrink: 0, background: '#070d1a', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', padding: '0 18px', gap: 11 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 12, fontFamily: 'Vazirmatn', marginLeft: 8 }}>← خانه</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: '#374151', fontWeight: 500, marginBottom: 1 }}>{meta.crumb}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-.3px' }}>{meta.title}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 100, padding: '4px 10px' }}>
              <span style={{ width: 5, height: 5, background: '#ef4444', borderRadius: '50%', flexShrink: 0 }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444' }}>WC: قطع</span>
            </div>
            <button style={{ background: 'linear-gradient(135deg,#e8a94c,#f5c842)', color: '#060a13', border: 'none', padding: '7px 15px', borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif", whiteSpace: 'nowrap' }}>
              {HDR_BTN[sec]}
            </button>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: 18, background: '#060a13', position: 'relative' }}>
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
