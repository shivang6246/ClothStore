import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const NAV_STYLE = { textDecoration: 'none', color: '#888', fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase' as const, fontFamily: "'Montserrat',sans-serif", transition: 'color 0.2s' };

function PageLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/collection', label: 'Collection' },
    { to: '/looks', label: 'Looks' },
    { to: '/about', label: 'About' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f0ede6', fontFamily: "'Montserrat',sans-serif" }}>
      {/* Navigation */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '1rem 4%' : '1.5rem 6%', borderBottom: '0.5px solid #1a1a1a', position: 'relative' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#f0ede6', fontFamily: "'Cormorant Garamond',serif", fontSize: isMobile ? '1.1rem' : '1.4rem', fontWeight: 300, letterSpacing: isMobile ? 6 : 12 }}>VOGUE</Link>
        
        {!isMobile && (
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {navItems.map(item => (
              <Link key={item.to} to={item.to} style={NAV_STYLE}>
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {isMobile && (
          <>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: '#f0ede6',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.5rem',
              }}
            >
              ☰
            </button>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  background: '#111',
                  border: '0.5px solid #1a1a1a',
                  minWidth: '200px',
                  zIndex: 100,
                  padding: '1rem',
                }}
              >
                {navItems.map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    style={{
                      display: 'block',
                      padding: '0.75rem 0',
                      color: '#888',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      borderBottom: '0.5px solid #1a1a1a',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#c9a96e')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#888')}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </nav>

      {/* Page Title Section */}
      <div style={{ borderBottom: '0.5px solid #1a1a1a', padding: isMobile ? '2rem 4%' : '3rem 6%' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 8 }}>VOGUE INDIA</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1.5rem, 5vw, 3.5rem)', fontWeight: 300, margin: 0 }}>{title}</h1>
      </div>

      {children}
    </div>
  );
}

export { PageLayout };
export default PageLayout;
