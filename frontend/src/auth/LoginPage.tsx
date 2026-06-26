import { useState } from 'react';
import { useAuth } from './AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ورود ناموفق بود');
    } finally {
      setBusy(false);
    }
  };

  const input: React.CSSProperties = {
    width: '100%', background: '#060a13', border: '1px solid rgba(255,255,255,.1)',
    borderRadius: 8, padding: '11px 13px', color: '#f0f4ff', fontSize: 13, outline: 'none',
    fontFamily: "'Vazirmatn',sans-serif", direction: 'ltr', textAlign: 'left',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#060a13', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Vazirmatn',sans-serif", direction: 'rtl' }}>
      <form onSubmit={submit} style={{ width: 360, background: '#0d1320', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: 28, boxShadow: '0 24px 70px rgba(0,0,0,.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ width: 46, height: 46, margin: '0 auto 12px', background: 'linear-gradient(135deg,#e8a94c,#f5c842)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#060a13' }}>B</div>
          <h1 style={{ margin: 0, fontSize: 19, fontWeight: 900, color: '#f0f4ff' }}>ورود به بیزنس‌کور</h1>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: '#64748b' }}>سیستم یکپارچه مدیریت کسب‌وکار</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', color: '#ef4444', fontSize: 12, fontWeight: 600, padding: '9px 12px', borderRadius: 8, marginBottom: 14, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <label style={{ display: 'block', fontSize: 11, color: '#8892a4', fontWeight: 700, marginBottom: 6 }}>نام کاربری</label>
        <input value={username} onChange={e => setUsername(e.target.value)} autoFocus placeholder="admin" style={{ ...input, marginBottom: 14 }} />

        <label style={{ display: 'block', fontSize: 11, color: '#8892a4', fontWeight: 700, marginBottom: 6 }}>رمز عبور</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ ...input, marginBottom: 20 }} />

        <button type="submit" disabled={busy} style={{ width: '100%', background: 'linear-gradient(135deg,#e8a94c,#f5c842)', color: '#060a13', border: 'none', padding: 12, borderRadius: 9, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: "'Vazirmatn',sans-serif", opacity: busy ? .6 : 1 }}>
          {busy ? 'در حال ورود…' : 'ورود'}
        </button>

        <div style={{ marginTop: 18, padding: 11, background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 8, fontSize: 11, color: '#64748b', lineHeight: 1.9 }}>
          <div style={{ fontWeight: 700, color: '#8892a4', marginBottom: 3 }}>حساب‌های نمونه:</div>
          admin / admin123 (مدیر ارشد)<br />
          sales / sales123 (فروش)
        </div>
      </form>
    </div>
  );
}
