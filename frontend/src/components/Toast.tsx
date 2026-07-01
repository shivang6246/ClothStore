import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = 'info', duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 400);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors: Record<string, { bg: string; border: string; icon: string; text: string }> = {
    success: { bg: 'rgba(39,174,96,0.08)', border: '#27ae60', icon: '✓', text: '#27ae60' },
    error: { bg: 'rgba(192,57,43,0.08)', border: '#c0392b', icon: '✕', text: '#c0392b' },
    warning: { bg: 'rgba(243,156,18,0.08)', border: '#f39c12', icon: '⚠', text: '#d68910' },
    info: { bg: 'rgba(52,152,219,0.08)', border: '#3498db', icon: 'ℹ', text: '#2980b9' },
  };
  const c = colors[type];

  return (
    <div style={{
      position: 'fixed', top: '2rem', right: '2rem', zIndex: 9999,
      transform: isVisible && !isExiting ? 'translateX(0)' : 'translateX(120%)',
      opacity: isVisible && !isExiting ? 1 : 0,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.8rem',
        padding: '1rem 1.5rem', minWidth: '320px', maxWidth: '450px',
        background: 'white', borderRadius: '8px',
        border: `1px solid ${c.border}20`,
        borderLeft: `4px solid ${c.border}`,
        boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
        fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.8rem', fontWeight: 700, color: c.text, flexShrink: 0,
        }}>{c.icon}</div>
        <div style={{ flex: 1, fontSize: '0.88rem', color: '#1a1a1a', lineHeight: 1.5 }}>{message}</div>
        <button onClick={() => { setIsExiting(true); setTimeout(onClose, 400); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#999',
            fontSize: '1.1rem', padding: '0 0 0 0.5rem', lineHeight: 1, flexShrink: 0,
          }}>×</button>
      </div>
    </div>
  );
}
