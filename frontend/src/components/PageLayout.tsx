import React from 'react';
import { Link } from 'react-router-dom';

const NAV_STYLE = { textDecoration: 'none', color: '#888', fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase' as const, fontFamily: "'Montserrat',sans-serif", transition: 'color 0.2s' };

function PageLayout({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f0ede6', fontFamily: "'Montserrat',sans-serif" }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 6%', borderBottom: '0.5px solid #1a1a1a' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#f0ede6', fontFamily: "'Cormorant Garamond',serif", fontSize: '1.4rem', fontWeight: 300, letterSpacing: 12 }}>VOGUE</Link>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/" style={NAV_STYLE}>Home</Link>
          <Link to="/collection" style={NAV_STYLE}>Collection</Link>
          <Link to="/looks" style={NAV_STYLE}>Looks</Link>
          <Link to="/about" style={NAV_STYLE}>About</Link>
        </div>
      </nav>
      <div style={{ borderBottom: '0.5px solid #1a1a1a', padding: '3rem 6%' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 8 }}>VOGUE INDIA</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300, margin: 0 }}>{title}</h1>
      </div>
      {children}
    </div>
  );
}

export { PageLayout };
export default PageLayout;
