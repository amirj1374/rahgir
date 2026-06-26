import { useState } from 'react';
import type { Role, Permission } from '../../types';
import { roles as rolesHooks, usePermissionCatalog } from '../../hooks/queries';

const emptyRole: Role = { name: '', permissions: [] };

export function RolesSection() {
  const { data: roles = [] } = rolesHooks.useList();
  const { data: catalog = [] } = usePermissionCatalog();
  const create = rolesHooks.useCreate();
  const update = rolesHooks.useUpdate();
  const remove = rolesHooks.useRemove();

  const [modal, setModal] = useState<Role | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const openNew = () => { setEditingId(null); setError(''); setModal({ ...emptyRole, permissions: [] }); };
  const openEdit = (r: Role) => { setEditingId(r.id ?? null); setError(''); setModal({ ...r, permissions: [...r.permissions] }); };

  const toggle = (p: Permission) => {
    if (!modal) return;
    const has = modal.permissions.includes(p);
    setModal({ ...modal, permissions: has ? modal.permissions.filter(x => x !== p) : [...modal.permissions, p] });
  };

  const save = () => {
    if (!modal) return;
    if (!modal.name.trim()) { setError('نام نقش الزامی است'); return; }
    const onErr = (e: unknown) => setError(e instanceof Error ? e.message : 'خطا در ذخیره');
    const done = { onSuccess: () => setModal(null), onError: onErr };
    if (editingId) update.mutate({ id: editingId, data: modal }, done);
    else create.mutate(modal, done);
  };

  const del = (r: Role) => {
    if (r.id && confirm(`نقش «${r.name}» حذف شود؟`)) {
      remove.mutate(r.id, { onError: e => alert(e instanceof Error ? e.message : 'خطا') });
    }
  };

  const busy = create.isPending || update.isPending;

  return (
    <div style={{ maxWidth: 940, animation: 'fadeSlide .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{roles.length} نقش تعریف‌شده · دسترسی‌ها توسط ادمین فروشگاه تعیین می‌شود</div>
        <button onClick={openNew} style={{ background: 'linear-gradient(135deg,#e8a94c,#f5c842)', color: '#060a13', border: 'none', padding: '8px 15px', borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>+ نقش جدید</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 11 }}>
        {roles.map(r => (
          <div key={r.id} style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#e8a94c' }}>
                {r.name}
                {r.builtin && <span style={{ fontSize: 9, color: '#64748b', marginRight: 6, fontWeight: 600 }}>(پیش‌فرض)</span>}
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                <button onClick={() => openEdit(r)} style={btn}>ویرایش</button>
                {!r.builtin && <button onClick={() => del(r)} style={{ ...btn, color: '#ef4444' }}>حذف</button>}
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {r.permissions.length === 0 && <span style={{ fontSize: 10, color: '#374151' }}>بدون دسترسی</span>}
              {r.permissions.map(p => (
                <span key={p} style={{ fontSize: 9, background: 'rgba(56,189,248,.1)', color: '#38bdf8', padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>
                  {catalog.find(c => c.name === p)?.label || p}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600 }}>
          <div onClick={() => setModal(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.78)', backdropFilter: 'blur(5px)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 460, maxHeight: '88vh', overflowY: 'auto', background: '#0d1320', border: '1px solid rgba(255,255,255,.09)', borderRadius: 18, boxShadow: '0 28px 80px rgba(0,0,0,.65)' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,.06)', fontSize: 14, fontWeight: 900, color: '#f0f4ff' }}>
              {editingId ? 'ویرایش نقش' : 'نقش جدید'}
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {error && <div style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', fontSize: 11, fontWeight: 600, padding: '8px 11px', borderRadius: 7 }}>{error}</div>}
              <div>
                <div style={{ fontSize: 10, color: '#374151', fontWeight: 700, marginBottom: 6 }}>نام نقش *</div>
                <input value={modal.name} onChange={e => setModal({ ...modal, name: e.target.value })} placeholder="مثلاً: مدیر فروش" style={inp} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#374151', fontWeight: 700, marginBottom: 8 }}>دسترسی‌ها</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {catalog.map(c => {
                    const on = modal.permissions.includes(c.name);
                    return (
                      <button key={c.name} type="button" onClick={() => toggle(c.name)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: on ? 'rgba(56,189,248,.1)' : 'rgba(255,255,255,.025)', border: `1px solid ${on ? 'rgba(56,189,248,.3)' : 'rgba(255,255,255,.06)'}`, borderRadius: 8, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: on ? '#38bdf8' : '#b8c0cc' }}>{c.label}</span>
                        <span style={{ width: 18, height: 18, borderRadius: 5, border: `1px solid ${on ? '#38bdf8' : 'rgba(255,255,255,.15)'}`, background: on ? '#38bdf8' : 'transparent', color: '#060a13', fontSize: 12, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on ? '✓' : ''}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={save} disabled={busy} style={{ flex: 2, background: 'linear-gradient(135deg,#e8a94c,#f5c842)', color: '#060a13', border: 'none', padding: 11, borderRadius: 9, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif", opacity: busy ? .6 : 1 }}>{busy ? 'در حال ذخیره…' : 'ذخیره'}</button>
                <button onClick={() => setModal(null)} style={{ flex: 1, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#8892a4', padding: 11, borderRadius: 9, fontSize: 13, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>انصراف</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const btn: React.CSSProperties = { padding: '3px 8px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 5, color: '#8892a4', fontSize: 10, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" };
const inp: React.CSSProperties = { width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '8px 11px', color: '#f0f4ff', fontSize: 12, outline: 'none', fontFamily: "'Vazirmatn',sans-serif" };
