import { useState } from 'react';
import type { UserAccount } from '../../types';
import { users as usersHooks, roles as rolesHooks } from '../../hooks/queries';

const AV_COLORS = ['#e8a94c', '#38bdf8', '#4ade80', '#a78bfa', '#fb923c'];
const empty: UserAccount = { username: '', password: '', fullName: '', email: '', roleId: 0, active: true };

export function UsersSection() {
  const { data: users = [] } = usersHooks.useList();
  const { data: roles = [] } = rolesHooks.useList();
  const create = usersHooks.useCreate();
  const update = usersHooks.useUpdate();
  const remove = usersHooks.useRemove();

  const [modal, setModal] = useState<UserAccount | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const openNew = () => { setEditingId(null); setError(''); setModal({ ...empty, roleId: roles[0]?.id ?? 0 }); };
  const openEdit = (u: UserAccount) => { setEditingId(u.id ?? null); setError(''); setModal({ ...u, password: '' }); };

  const save = () => {
    if (!modal) return;
    if (!modal.username || !modal.roleId) { setError('نام کاربری و نقش الزامی است'); return; }
    const onErr = (e: unknown) => setError(e instanceof Error ? e.message : 'خطا در ذخیره');
    const done = { onSuccess: () => setModal(null), onError: onErr };
    if (editingId) update.mutate({ id: editingId, data: modal }, done);
    else create.mutate(modal, done);
  };

  const del = (u: UserAccount) => {
    if (u.id && confirm(`کاربر «${u.username}» حذف شود؟`)) remove.mutate(u.id);
  };

  const busy = create.isPending || update.isPending;

  return (
    <div style={{ maxWidth: 940, animation: 'fadeSlide .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{users.length} کاربر در سیستم</div>
        <button onClick={openNew} style={{ background: 'linear-gradient(135deg,#e8a94c,#f5c842)', color: '#060a13', border: 'none', padding: '8px 15px', borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif" }}>+ کاربر جدید</button>
      </div>

      <div style={{ background: '#0d1320', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr 110px 130px 64px 110px', padding: '9px 13px', background: 'rgba(255,255,255,.03)', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          {['نام کاربر','ایمیل','نقش','آخرین ورود','وضعیت','عملیات'].map(h => (
            <div key={h} style={{ fontSize: 9, color: '#374151', fontWeight: 700 }}>{h}</div>
          ))}
        </div>
        {users.map((u, i) => (
          <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '170px 1fr 110px 130px 64px 110px', padding: '9px 13px', borderBottom: '1px solid rgba(255,255,255,.04)', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, background: AV_COLORS[i % 5], borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#060a13', flexShrink: 0 }}>{(u.fullName || u.username).charAt(0)}</div>
              <span style={{ fontSize: 12, color: '#e8edf5', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.fullName || u.username}</span>
            </div>
            <div style={{ fontSize: 10, color: '#6b7280', direction: 'ltr', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email || '–'}</div>
            <div><span style={{ fontSize: 9, background: 'rgba(232,169,76,.12)', color: '#e8a94c', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>{u.roleName}</span></div>
            <div style={{ fontSize: 10, color: '#6b7280' }}>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('fa-IR') : '–'}</div>
            <div><span style={{ fontSize: 9, background: u.active ? 'rgba(74,222,128,.1)' : 'rgba(239,68,68,.1)', color: u.active ? '#4ade80' : '#ef4444', padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>{u.active ? 'فعال' : 'غیرفعال'}</span></div>
            <div style={{ display: 'flex', gap: 5 }}>
              <button onClick={() => openEdit(u)} style={btn}>ویرایش</button>
              <button onClick={() => del(u)} style={{ ...btn, color: '#ef4444' }}>حذف</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600 }}>
          <div onClick={() => setModal(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.78)', backdropFilter: 'blur(5px)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 480, background: '#0d1320', border: '1px solid rgba(255,255,255,.09)', borderRadius: 18, boxShadow: '0 28px 80px rgba(0,0,0,.65)' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,.06)', fontSize: 14, fontWeight: 900, color: '#f0f4ff' }}>
              {editingId ? 'ویرایش کاربر' : 'کاربر جدید'}
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 13 }}>
              {error && <div style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', fontSize: 11, fontWeight: 600, padding: '8px 11px', borderRadius: 7 }}>{error}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="نام کاربری *"><input value={modal.username} onChange={e => setModal({ ...modal, username: e.target.value })} style={inp} /></Field>
                <Field label={editingId ? 'رمز جدید (اختیاری)' : 'رمز عبور *'}><input type="password" value={modal.password || ''} onChange={e => setModal({ ...modal, password: e.target.value })} style={inp} /></Field>
                <Field label="نام کامل"><input value={modal.fullName || ''} onChange={e => setModal({ ...modal, fullName: e.target.value })} style={inp} /></Field>
                <Field label="ایمیل"><input value={modal.email || ''} onChange={e => setModal({ ...modal, email: e.target.value })} style={{ ...inp, direction: 'ltr' }} /></Field>
                <Field label="نقش *">
                  <select value={modal.roleId} onChange={e => setModal({ ...modal, roleId: Number(e.target.value) })} style={inp}>
                    <option value={0} disabled>انتخاب نقش</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </Field>
                <Field label="وضعیت">
                  <select value={modal.active ? '1' : '0'} onChange={e => setModal({ ...modal, active: e.target.value === '1' })} style={inp}>
                    <option value="1">فعال</option><option value="0">غیرفعال</option>
                  </select>
                </Field>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: '#374151', fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}
