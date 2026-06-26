import { useState, useEffect } from 'react';
import type { Company } from '../../types';
import { useCompany, useSaveCompany } from '../../hooks/queries';

const FALLBACK: Company = {
  name: 'فروشگاه آنلاین رایان', nationalId: '۱۰۱۰۳۴۵۶۷۸۹',
  registrationNumber: '۳۵۸۷۶۲', phone: '۰۲۱-۸۸۷۶۵۴۳۲',
  email: 'info@rayan-shop.ir', address: 'تهران، خیابان ولیعصر، پلاک ۱۲۰۴',
  currency: 'IRR', fiscalYearStart: 'Farvardin', vatRate: 10,
};

export function CompanySection() {
  const { data: remote } = useCompany();
  const saveCompany = useSaveCompany();
  const [data, setData] = useState<Company>(FALLBACK);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (remote) setData(remote); }, [remote]);

  const save = () => {
    saveCompany.mutate(data, {
      onSettled: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2800);
      },
    });
  };

  const field = (label: string, key: keyof Company, ltr = false) => (
    <div>
      <label style={{ display: 'block', fontSize: 10, color: '#8892a4', fontWeight: 700, marginBottom: 5 }}>{label}</label>
      <input
        type="text"
        value={String(data[key] ?? '')}
        onChange={e => setData(d => ({ ...d, [key]: e.target.value }))}
        style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, padding: '8px 11px', color: '#f0f4ff', fontSize: 12, outline: 'none', direction: ltr ? 'ltr' : 'rtl', textAlign: 'right' }}
      />
    </div>
  );

  return (
    <div style={{ maxWidth: 780, animation: 'fadeSlide .3s ease' }}>
      {saved && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', background: 'rgba(74,222,128,.07)', border: '1px solid rgba(74,222,128,.2)', borderRadius: 9, marginBottom: 13 }}>
          <span>✅</span>
          <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 700 }}>اطلاعات شرکت با موفقیت ذخیره شد</span>
        </div>
      )}

      <div style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 20, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 64, height: 64, background: 'rgba(232,169,76,.07)', border: '2px dashed rgba(232,169,76,.28)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, cursor: 'pointer' }} title="بارگذاری لوگو">🏢</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#f0f4ff', marginBottom: 3 }}>{data.name}</div>
          <div style={{ fontSize: 11, color: '#6b7280', direction: 'ltr', textAlign: 'right' }}>{data.email}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.22)', color: '#4ade80', fontSize: 10, padding: '2px 9px', borderRadius: 20, fontWeight: 700 }}>فعال</span>
          <span style={{ fontSize: 9, color: '#374151' }}>راه‌اندازی: ۱۴۰۵/۰۱/۱۵</span>
        </div>
      </div>

      <div style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 20, marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#e8a94c', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,.05)' }}>اطلاعات اصلی</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
          {field('نام شرکت / فروشگاه', 'name')}
          {field('شناسه ملی / کد اقتصادی', 'nationalId')}
          {field('شماره ثبت', 'registrationNumber')}
          {field('تلفن', 'phone')}
          {field('ایمیل', 'email', true)}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: 10, color: '#8892a4', fontWeight: 700, marginBottom: 5 }}>آدرس</label>
            <input type="text" value={data.address || ''} onChange={e => setData(d => ({ ...d, address: e.target.value }))} style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, padding: '8px 11px', color: '#f0f4ff', fontSize: 12, outline: 'none' }} />
          </div>
        </div>
      </div>

      <div style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 20, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,.05)' }}>تنظیمات مالی</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 13 }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#8892a4', fontWeight: 700, marginBottom: 5 }}>ارز پایه</label>
            <select style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, padding: '8px 11px', fontSize: 12, outline: 'none', color: '#f0f4ff' }}>
              <option>تومان (IRR)</option><option>دلار (USD)</option><option>یورو (EUR)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#8892a4', fontWeight: 700, marginBottom: 5 }}>شروع سال مالی</label>
            <select style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, padding: '8px 11px', fontSize: 12, outline: 'none', color: '#f0f4ff' }}>
              <option>فروردین</option><option>مهر</option><option>دی</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, color: '#8892a4', fontWeight: 700, marginBottom: 5 }}>نرخ مالیات ارزش افزوده</label>
            <input type="text" value={String(data.vatRate ?? '')} onChange={e => setData(d => ({ ...d, vatRate: Number(e.target.value) || 0 }))} style={{ width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, padding: '8px 11px', color: '#f0f4ff', fontSize: 12, outline: 'none' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 9 }}>
        <button onClick={save} disabled={saveCompany.isPending} style={{ background: 'linear-gradient(135deg,#e8a94c,#f5c842)', color: '#060a13', border: 'none', padding: '10px 24px', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif", opacity: saveCompany.isPending ? .6 : 1 }}>{saveCompany.isPending ? 'در حال ذخیره…' : 'ذخیره تغییرات'}</button>
        <button style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', color: '#8892a4', padding: '10px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>انصراف</button>
      </div>
    </div>
  );
}
