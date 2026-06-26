export function UsersSection() {
  const users = [
    { name: 'مدیر سیستم', email: 'admin@rayan.ir', role: 'مدیر ارشد', lastLogin: '۱۴۰۵/۰۴/۰۴ ۱۴:۳۲', status: 'فعال', init: 'م', avBg: '#e8a94c', roleBg: 'rgba(232,169,76,.15)', roleColor: '#e8a94c', stBg: 'rgba(74,222,128,.1)', stColor: '#4ade80' },
    { name: 'امیر حسینی', email: 'amir@rayan.ir', role: 'فروش', lastLogin: '۱۴۰۵/۰۴/۰۴ ۰۹:۱۵', status: 'فعال', init: 'ا', avBg: '#38bdf8', roleBg: 'rgba(56,189,248,.1)', roleColor: '#38bdf8', stBg: 'rgba(74,222,128,.1)', stColor: '#4ade80' },
    { name: 'فاطمه نوری', email: 'fateme@rayan.ir', role: 'انبارداری', lastLogin: '۱۴۰۵/۰۴/۰۳ ۱۶:۴۸', status: 'فعال', init: 'ف', avBg: '#4ade80', roleBg: 'rgba(74,222,128,.1)', roleColor: '#4ade80', stBg: 'rgba(74,222,128,.1)', stColor: '#4ade80' },
    { name: 'داود کرمی', email: 'davood@rayan.ir', role: 'حسابداری', lastLogin: '۱۴۰۵/۰۴/۰۲ ۱۱:۲۰', status: 'فعال', init: 'د', avBg: '#a78bfa', roleBg: 'rgba(167,139,250,.1)', roleColor: '#a78bfa', stBg: 'rgba(74,222,128,.1)', stColor: '#4ade80' },
    { name: 'نگار صادقی', email: 'negar@rayan.ir', role: 'فروش', lastLogin: '–', status: 'غیرفعال', init: 'ن', avBg: '#fb923c', roleBg: 'rgba(56,189,248,.1)', roleColor: '#38bdf8', stBg: 'rgba(239,68,68,.1)', stColor: '#ef4444' },
  ];

  const roles = [
    { name: 'مدیر ارشد', color: '#e8a94c', count: '۱ کاربر', desc: 'دسترسی کامل به تمام ماژول‌ها و تنظیمات سیستم.' },
    { name: 'فروش', color: '#38bdf8', count: '۲ کاربر', desc: 'فاکتورسازی، CRM و گزارش‌های فروش.' },
    { name: 'انبارداری', color: '#4ade80', count: '۱ کاربر', desc: 'ورود/خروج کالا، موجودی و انبارگردانی.' },
    { name: 'حسابداری', color: '#a78bfa', count: '۱ کاربر', desc: 'صندوق، بانک و گزارش‌های مالی.' },
    { name: 'مشاهده', color: '#94a3b8', count: '۰ کاربر', desc: 'فقط مشاهده گزارش‌ها، بدون تغییر داده.' },
  ];

  return (
    <div style={{ maxWidth: 940, animation: 'fadeSlide .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{users.length} کاربر در سیستم</div>
        <button style={{ background: 'linear-gradient(135deg,#e8a94c,#f5c842)', color: '#060a13', border: 'none', padding: '8px 15px', borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>+ کاربر جدید</button>
      </div>

      <div style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr 95px 140px 68px 86px', padding: '9px 13px', background: 'rgba(255,255,255,.03)', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          {['نام کاربر','ایمیل','نقش','آخرین ورود','وضعیت','عملیات'].map(h => (
            <div key={h} style={{ fontSize: 9, color: '#374151', fontWeight: 700 }}>{h}</div>
          ))}
        </div>
        {users.map(u => (
          <div key={u.email} style={{ display: 'grid', gridTemplateColumns: '170px 1fr 95px 140px 68px 86px', padding: '9px 13px', borderBottom: '1px solid rgba(255,255,255,.04)', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, background: u.avBg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#060a13', flexShrink: 0 }}>{u.init}</div>
              <span style={{ fontSize: 12, color: '#e8edf5', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</span>
            </div>
            <div style={{ fontSize: 10, color: '#6b7280', direction: 'ltr', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
            <div><span style={{ fontSize: 9, background: u.roleBg, color: u.roleColor, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>{u.role}</span></div>
            <div style={{ fontSize: 10, color: '#6b7280' }}>{u.lastLogin}</div>
            <div><span style={{ fontSize: 9, background: u.stBg, color: u.stColor, padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>{u.status}</span></div>
            <div><button style={{ padding: '3px 7px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 5, color: '#8892a4', fontSize: 10, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>ویرایش</button></div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, fontWeight: 800, color: '#f0f4ff', marginBottom: 10 }}>نقش‌های دسترسی</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 9 }}>
        {roles.map(r => (
          <div key={r.name} style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: r.color }}>{r.name}</div>
              <span style={{ fontSize: 9, color: '#374151' }}>{r.count}</span>
            </div>
            <p style={{ fontSize: 10, color: '#374151', margin: 0, lineHeight: 1.6 }}>{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
