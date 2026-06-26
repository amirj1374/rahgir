import { memo, type ReactNode } from 'react';
import { COLOR, RADIUS } from '../../styles/tokens';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  titleColor?: string;
  width?: number;
  children: ReactNode;
}

export const Modal = memo(function Modal({ open, onClose, title, titleColor = COLOR.gold, width = 460, children }: ModalProps) {
  if (!open) return null;
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200,
      }}
    >
      <div style={{
        background: COLOR.surface,
        borderRadius: RADIUS.xl,
        padding: 28,
        width,
        maxWidth: 'calc(100vw - 40px)',
        border: `1px solid rgba(255,255,255,.08)`,
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h3 style={{ margin: 0, fontSize: 16, color: titleColor, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: COLOR.textFaint, cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
});
