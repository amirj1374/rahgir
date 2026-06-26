import { useState } from 'react';
import { ModuleShell, PageHeader } from '../components/layout/ModuleShell';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { COLOR, FONT, CARD } from '../styles/tokens';
import { fmtNum, fmtMil } from '../hooks/useFormat';

interface Props { onBack: () => void }

const ACC = COLOR.module.accounting;
const NAV = [
  { id: 'dashboard', label: 'داشبورد مالی', icon: '📊' },
  { id: 'checks',    label: 'مدیریت چک',    icon: '📄' },
  { id: 'pnl',       label: 'سود و زیان',   icon: '📈' },
];

const TX = [
  { id: 1, date: '۱۴۰۳/۰۴/۰۶', desc: 'دریافت از شرکت آلفا',      type: 'دریافت', amount: 12000000, account: 'بانک ملت', ref: 'INV-2048' },
  { id: 2, date: '۱۴۰۳/۰۴/۰۵', desc: 'پرداخت اجاره انبار',       type: 'پرداخت',  amount:  8000000, account: 'صندوق',    ref: 'EXP-101'  },
  { id: 3, date: '۱۴۰۳/۰۴/۰۴', desc: 'خرید کالا از تامین‌کننده', type: 'پرداخت',  amount: 25000000, account: 'بانک ملت', ref: 'PO-1015'  },
  { id: 4, date: '۱۴۰۳/۰۴/۰۳', desc: 'دریافت از پخش گاما',       type: 'دریافت', amount: 18500000, account: 'بانک ملت', ref: 'INV-2046' },
  { id: 5, date: '۱۴۰۳/۰۴/۰۲', desc: 'حقوق کارکنان',             type: 'پرداخت',  amount: 42000000, account: 'بانک ملت', ref: 'SAL-0403' },
];

const CHECKS = [
  { id: 1, issuer: 'شرکت آلفا',  bank: 'ملت',    number: '۱۲۳۴۵۶', due: '۱۴۰۳/۰۵/۱۵', amount: 15000000, type: 'دریافتنی', status: 'در انتظار' },
  { id: 2, issuer: 'فروشگاه بتا',bank: 'صادرات', number: '۹۸۷۶۵۴', due: '۱۴۰۳/۰۴/۳۰', amount:  8500000, type: 'دریافتنی', status: 'وصول‌شده'  },
  { id: 3, issuer: 'شرکت ما',    bank: 'ملی',    number: '۵۵۴۴۳۳', due: '۱۴۰۳/۰۵/۰۱', amount: 20000000, type: 'پرداختنی', status: 'در انتظار' },
  { id: 4, issuer: 'پخش گاما',   bank: 'تجارت', number: '۱۱۲۲۳۳', due: '۱۴۰۳/۰۴/۲۵', amount:  5000000, type: 'دریافتنی', status: 'برگشتی'    },
];

const PNL = [
  { row: 'درآمد فروش',            value:  485,  bold: false },
  { row: 'بهای تمام‌شده کالا',    value: -285,  bold: false },
  { row: 'سود ناخالص',             value:  200,  bold: true  },
  { row: 'هزینه حقوق',             value:  -84,  bold: false },
  { row: 'هزینه اجاره',            value:  -24,  bold: false },
  { row: 'هزینه بازاریابی',        value:  -15,  bold: false },
  { row: 'سایر هزینه‌ها',          value: -8.5,  bold: false },
  { row: 'سود خالص',               value: 68.5,  bold: true  },
];

const CHECK_STATUS_COLOR: Record<string, string> = { 'در انتظار': COLOR.yellow, 'وصول‌شده': COLOR.green, 'برگشتی': COLOR.red };

export default function AccountingModule({ onBack }: Props) {
  const [section, setSection] = useState('dashboard');

  return (
    <ModuleShell
      accent={ACC} icon="💜" title="حسابداری" subtitle="مدیریت مالی"
      navItems={NAV} section={section} onSection={setSection} onBack={onBack}
    >
      {/* Dashboard */}
      {section === 'dashboard' && (
        <>
          <PageHeader title="داشبورد مالی" color={ACC} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
            <StatCard icon="💰" value="۴۸.۵M" label="درآمد این ماه" color={COLOR.green}  trend="+۱۲٪" trendUp />
            <StatCard icon="💸" value="۳۲.۱M" label="هزینه‌ها"       color={COLOR.red}   trend="-۵٪"  trendUp={false} />
            <StatCard icon="📈" value="۱۶.۴M" label="سود خالص"       color={ACC}         trend="+۲۳٪" trendUp />
            <StatCard icon="🏦" value="۸۵.۲M" label="مانده کل"        color={COLOR.yellow} />
          </div>

          {/* Account cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            {[['صندوق','۱۲,۵۰۰,۰۰۰','💵'],['بانک ملت','۷۲,۸۰۰,۰۰۰','🏦']].map(([name,bal,ic]) => (
              <div key={name} style={{ ...CARD, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 28 }}>{ic}</div>
                  <div>
                    <div style={{ fontSize: FONT.sm, color: COLOR.textFaint }}>{name}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{bal}</div>
                  </div>
                </div>
                <Button color={ACC}>تراکنش</Button>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: FONT.md, marginBottom: 12, color: COLOR.textMuted, fontWeight: 600 }}>تراکنش‌های اخیر</h3>
          <DataTable
            columns={[
              { key: 'date',    header: 'تاریخ',  render: r => <span style={{ color: COLOR.textFaint }}>{r.date as string}</span> },
              { key: 'desc',    header: 'شرح' },
              { key: 'type',    header: 'نوع',    render: r => <Badge label={r.type as string} color={(r.type as string) === 'دریافت' ? COLOR.green : COLOR.red} /> },
              { key: 'amount',  header: 'مبلغ',   render: r => <span style={{ color: (r.type as string) === 'دریافت' ? COLOR.green : COLOR.red, fontWeight: 600 }}>{(r.type as string) === 'دریافت' ? '+' : '-'}{fmtNum(r.amount as number)}</span> },
              { key: 'account', header: 'حساب',   render: r => <span style={{ color: COLOR.textMuted }}>{r.account as string}</span> },
              { key: 'ref',     header: 'مرجع',   render: r => <span style={{ color: COLOR.textFaint }}>{r.ref as string}</span> },
            ]}
            rows={TX as unknown as Record<string, unknown>[]}
            keyField="id"
          />
        </>
      )}

      {/* Checks */}
      {section === 'checks' && (
        <>
          <PageHeader title="مدیریت چک" color={ACC} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
            <StatCard icon="📄" value="۳" label="چک‌های دریافتنی"  color={ACC} />
            <StatCard icon="📤" value="۱" label="چک‌های پرداختنی"  color={COLOR.red} />
            <StatCard icon="✅" value="۱" label="وصول‌شده"          color={COLOR.green} />
            <StatCard icon="↩️" value="۱" label="برگشتی"             color={COLOR.yellow} />
          </div>
          <DataTable
            columns={[
              { key: 'issuer', header: 'صادرکننده' },
              { key: 'bank',   header: 'بانک',       render: r => <span style={{ color: COLOR.textMuted }}>{r.bank as string}</span> },
              { key: 'number', header: 'شماره',      render: r => <span style={{ color: COLOR.textFaint }}>{r.number as string}</span> },
              { key: 'due',    header: 'سررسید' },
              { key: 'amount', header: 'مبلغ',        render: r => <strong>{fmtMil(r.amount as number)}</strong> },
              { key: 'type',   header: 'نوع',        render: r => <Badge label={r.type as string} color={(r.type as string) === 'دریافتنی' ? COLOR.green : COLOR.red} /> },
              { key: 'status', header: 'وضعیت',     render: r => <Badge label={r.status as string} color={CHECK_STATUS_COLOR[r.status as string]} /> },
            ]}
            rows={CHECKS as unknown as Record<string, unknown>[]}
            keyField="id"
          />
        </>
      )}

      {/* P&L */}
      {section === 'pnl' && (
        <>
          <PageHeader title="صورت سود و زیان — فروردین ۱۴۰۳" color={ACC} />
          <div style={{ maxWidth: 600, ...CARD, overflow: 'hidden' }}>
            {PNL.map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: i < PNL.length - 1 ? `1px solid rgba(255,255,255,.04)` : 'none', background: r.bold ? ACC + '0a' : 'transparent' }}>
                <span style={{ fontSize: r.bold ? FONT.md : FONT.base, fontWeight: r.bold ? 700 : 400, color: r.bold ? COLOR.textPrimary : COLOR.textMuted }}>{r.row}</span>
                <span style={{ fontSize: r.bold ? FONT.lg : FONT.base, fontWeight: r.bold ? 700 : 400, color: r.value < 0 ? COLOR.red : r.bold ? ACC : COLOR.textSecondary }}>
                  {r.value < 0 ? `(${Math.abs(r.value)}M)` : `${r.value}M`}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </ModuleShell>
  );
}
