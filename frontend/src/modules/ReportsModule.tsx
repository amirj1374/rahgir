import { useState } from 'react';
import { ModuleShell, PageHeader } from '../components/layout/ModuleShell';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { DataTable } from '../components/ui/DataTable';
import { COLOR, FONT, CARD } from '../styles/tokens';
import { fmtNum, fmtMil } from '../hooks/useFormat';

interface Props { onBack: () => void }

const ACC = COLOR.module.reports;
const NAV = [
  { id: 'sales',     label: 'گزارش فروش',  icon: '📈' },
  { id: 'inventory', label: 'گزارش انبار', icon: '📦' },
  { id: 'financial', label: 'گزارش مالی',  icon: '💰' },
];

const DAILY     = [{ d:'ش',v:42},{d:'ی',v:68},{d:'د',v:55},{d:'س',v:80},{d:'چ',v:73},{d:'پ',v:91},{d:'ج',v:38}];
const TOP_PRODS = [
  { name:'تی‌شرت مشکی',  qty:124, revenue:18600000, pct:85 },
  { name:'کاپشن قرمز',   qty: 87, revenue:13050000, pct:62 },
  { name:'کفش آبی',       qty: 65, revenue:19500000, pct:55 },
  { name:'هودی بنفش',     qty: 54, revenue:10800000, pct:42 },
  { name:'شلوار سبز',     qty: 43, revenue: 8600000, pct:30 },
];
const CATS = [
  { name:'پوشاک',       pct:62, revenue:58000000 },
  { name:'کفش',         pct:28, revenue:26200000 },
  { name:'لوازم جانبی', pct:10, revenue: 9300000 },
];
const TOP_CUST = [
  { name:'پخش گاما',   orders:12, revenue:88000000 },
  { name:'شرکت آلفا',  orders: 9, revenue:62000000 },
  { name:'تجارت دلتا', orders: 7, revenue:38000000 },
  { name:'فروشگاه بتا',orders: 5, revenue:21000000 },
];
const STOCK_RPT = [
  { name:'تی‌شرت مشکی', total:65, wh1:45, wh2:20, val:9750000,  status:'موجود'   },
  { name:'تی‌شرت سفید', total:13, wh1: 8, wh2: 5, val:1950000,  status:'کم'       },
  { name:'کفش آبی',      total: 0, wh1: 0, wh2: 0, val:       0, status:'ناموجود'  },
  { name:'کاپشن قرمز',  total:32, wh1:22, wh2:10, val:6400000,  status:'موجود'   },
  { name:'شلوار سبز',    total: 3, wh1: 3, wh2: 0, val: 600000,  status:'کم'       },
];
const MONTHLY = [{m:'فر',r:68,c:42},{m:'ار',r:75,c:48},{m:'خر',r:82,c:52},{m:'تی',r:91,c:58},{m:'مر',r:88,c:54},{m:'شه',r:95,c:61}];

const MAX_DAY   = Math.max(...DAILY.map(d => d.v));
const MAX_MONTH = Math.max(...MONTHLY.flatMap(m => [m.r, m.c]));

const ST_COLOR: Record<string, string> = { موجود: COLOR.green, کم: COLOR.yellow, ناموجود: COLOR.red };

function BarChart({ bars, color = ACC }: { bars: {label:string; value:number; max:number}[]; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
      {bars.map(b => (
        <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <div style={{ fontSize: FONT.xs, color: COLOR.textMuted }}>{b.value}</div>
          <div style={{ width: '100%', height: (b.value / b.max) * 80, background: `linear-gradient(to top, ${color}88, ${color}33)`, borderRadius: '3px 3px 0 0', border: `1px solid ${color}44` }} />
          <div style={{ fontSize: FONT.xs + 1, color: COLOR.textFaint }}>{b.label}</div>
        </div>
      ))}
    </div>
  );
}

function ProgressRow({ label, value, pct, color }: { label:string; value:string; pct:number; color:string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: FONT.base }}>{label}</span>
        <span style={{ fontSize: FONT.sm, color: COLOR.textFaint }}>{value}</span>
      </div>
      <div style={{ height: 6, background: COLOR.surfaceAlt, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: pct + '%', background: color, borderRadius: 4 }} />
      </div>
    </div>
  );
}

export default function ReportsModule({ onBack }: Props) {
  const [section, setSection] = useState('sales');

  return (
    <ModuleShell
      accent={ACC} icon="📊" title="گزارشات" subtitle="تحلیل داده"
      navItems={NAV} section={section} onSection={setSection} onBack={onBack}
    >
      {/* Sales */}
      {section === 'sales' && (
        <>
          <PageHeader title="گزارش فروش" color={ACC} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
            <StatCard icon="💰" value="۴۸۵M"  label="مجموع فروش"    color={ACC} trend="+۱۴٪" trendUp />
            <StatCard icon="🧾" value="۱۸۶"   label="تعداد فاکتور"  color={ACC} trend="+۸٪"  trendUp />
            <StatCard icon="🛒" value="۲.۶M"  label="میانگین سبد"   color={ACC} trend="+۵٪"  trendUp />
            <StatCard icon="👤" value="۲۳"    label="مشتریان جدید"  color={ACC} trend="+۳۱٪" trendUp />
          </div>

          <div style={{ ...CARD, padding: 24, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: FONT.md, color: COLOR.textMuted, fontWeight: 600 }}>فروش ۷ روز گذشته</h3>
            <BarChart bars={DAILY.map(d => ({ label: d.d, value: d.v, max: MAX_DAY }))} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, marginBottom: 20 }}>
            <div style={{ ...CARD, padding: 20 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: FONT.md, color: COLOR.textMuted, fontWeight: 600 }}>محصولات برتر</h3>
              {TOP_PRODS.map(p => <ProgressRow key={p.name} label={p.name} value={`${fmtNum(p.qty)} عدد`} pct={p.pct} color={ACC} />)}
            </div>
            <div style={{ ...CARD, padding: 20 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: FONT.md, color: COLOR.textMuted, fontWeight: 600 }}>دسته‌بندی</h3>
              {CATS.map(c => <ProgressRow key={c.name} label={c.name} value={`${c.pct}٪`} pct={c.pct} color={ACC + 'aa'} />)}
            </div>
          </div>

          <DataTable
            columns={[
              { key: 'rank',    header: '#',           render: (_,i) => <span style={{ color: ACC }}>#{i+1}</span> },
              { key: 'name',    header: 'مشتری' },
              { key: 'orders',  header: 'سفارشات',      render: r => fmtNum(r.orders as number) },
              { key: 'revenue', header: 'مجموع خرید',  render: r => <strong style={{ color: ACC }}>{fmtMil(r.revenue as number)}</strong> },
            ]}
            rows={TOP_CUST as unknown as Record<string, unknown>[]}
            keyField="name"
          />
        </>
      )}

      {/* Inventory */}
      {section === 'inventory' && (
        <>
          <PageHeader title="گزارش انبار" color={ACC} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
            <StatCard icon="📦" value="۸"     label="کل اقلام"       color={ACC} />
            <StatCard icon="💰" value="۱۸.۷M" label="ارزش موجودی"   color={ACC} />
            <StatCard icon="⚠️" value="۱"     label="ناموجود"        color={COLOR.red} />
            <StatCard icon="📉" value="۲"     label="کم‌موجود"       color={COLOR.yellow} />
          </div>
          <DataTable
            columns={[
              { key: 'name',   header: 'نام کالا' },
              { key: 'wh1',    header: 'انبار ۱',   render: r => fmtNum(r.wh1 as number) },
              { key: 'wh2',    header: 'انبار ۲',   render: r => fmtNum(r.wh2 as number) },
              { key: 'total',  header: 'جمع',        render: r => <strong>{fmtNum(r.total as number)}</strong> },
              { key: 'val',    header: 'ارزش',       render: r => <span style={{ color: ACC }}>{(r.val as number) ? fmtMil(r.val as number) : '–'}</span> },
              { key: 'status', header: 'وضعیت',     render: r => <Badge label={r.status as string} color={ST_COLOR[r.status as string]} /> },
            ]}
            rows={STOCK_RPT as unknown as Record<string, unknown>[]}
            keyField="name"
          />
        </>
      )}

      {/* Financial */}
      {section === 'financial' && (
        <>
          <PageHeader title="گزارش مالی" color={ACC} />
          <div style={{ ...CARD, padding: 24, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: FONT.md, color: COLOR.textMuted, fontWeight: 600 }}>درآمد و هزینه ۶ ماه</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 140 }}>
              {MONTHLY.map(m => (
                <div key={m.m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', display: 'flex', gap: 3, alignItems: 'flex-end', height: 100 }}>
                    <div style={{ flex: 1, background: ACC + '88', borderRadius: '3px 3px 0 0', height: (m.r / MAX_MONTH) * 90 }} />
                    <div style={{ flex: 1, background: COLOR.red + '66', borderRadius: '3px 3px 0 0', height: (m.c / MAX_MONTH) * 90 }} />
                  </div>
                  <div style={{ fontSize: FONT.xs, color: COLOR.textFaint }}>{m.m}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              {[['درآمد', ACC], ['هزینه', COLOR.red]].map(([l, c]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
                  <span style={{ fontSize: FONT.xs + 1, color: COLOR.textMuted }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...CARD, padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: FONT.md, color: COLOR.textMuted, fontWeight: 600 }}>تجزیه هزینه‌ها</h3>
            {([['حقوق و دستمزد', 84, COLOR.purple], ['اجاره', 24, COLOR.blue], ['بازاریابی', 15, COLOR.green], ['سایر', 8.5, COLOR.yellow]] as [string,number,string][]).map(([k, v, c]) => (
              <ProgressRow key={k} label={k} value={`${v}M`} pct={(v / 84) * 100} color={c} />
            ))}
          </div>
        </>
      )}
    </ModuleShell>
  );
}
