export function Placeholder({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', animation: 'fadeSlide .3s ease' }}>
      <div style={{ fontSize: 52, marginBottom: 16, opacity: .3 }}>{icon}</div>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f0f4ff', margin: '0 0 9px' }}>{title}</h2>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 auto 22px', lineHeight: 1.8, maxWidth: 360 }}>{desc}</p>
      <span style={{ background: 'rgba(232,169,76,.08)', border: '1px solid rgba(232,169,76,.22)', color: '#e8a94c', fontSize: 11, padding: '5px 14px', borderRadius: 20, fontWeight: 700 }}>در حال توسعه</span>
    </div>
  );
}
