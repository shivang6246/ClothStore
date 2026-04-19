import { Link } from 'react-router-dom';

const NAV = ['Home', 'Collection', 'Looks', 'About'];
const navLink = (l: string) => ({ textDecoration: 'none', color: l === 'About' ? '#c9a96e' : '#888', fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase' as const, fontFamily: "'Montserrat',sans-serif" });

const VALUES = [
  { icon: '◈', title: 'Craft First', desc: 'Every piece is sourced from heritage mills and produced in small-batch ateliers. We believe volume is the enemy of quality.' },
  { icon: '◉', title: 'Considered Design', desc: 'Silhouettes built to transcend seasons. When we design, we ask if a man would wear this in ten years.' },
  { icon: '◇', title: 'Honest Materials', desc: 'Pure wool, linen, leather and cotton. We reject synthetic shortcuts and the disposable culture they enable.' },
  { icon: '◎', title: 'Restrained Edition', desc: 'We produce limited quantities. Not for artificial scarcity — but because true luxury is never mass-produced.' },
];

const TEAM = [
  { name: 'Arjun Mehta', role: 'Creative Director', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&crop=face' },
  { name: 'Priya Sharma', role: 'Head of Collections', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&fit=crop&crop=face' },
  { name: 'Rohan Kapoor', role: 'Lead Tailor', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&fit=crop&crop=face' },
];

export default function About() {
  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#f0ede6', fontFamily: "'Montserrat',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Montserrat:wght@300;400;500&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.6s ease both; }
      `}</style>

      {/* NAV */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 6%', borderBottom: '0.5px solid #141414', position: 'sticky', top: 0, background: 'rgba(8,8,8,0.96)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#f0ede6', fontFamily: "'Cormorant Garamond',serif", fontSize: '1.4rem', fontWeight: 300, letterSpacing: 12 }}>VOGUE</Link>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {NAV.map(l => <Link key={l} to={l === 'Home' ? '/' : `/${l.toLowerCase()}`} style={navLink(l)}>{l}</Link>)}
        </div>
      </nav>

      {/* HERO */}
      <section className="grid-2" style={{ minHeight: '70vh' }}>
        <div style={{ padding: '6rem 6% 6rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p className="fade-up" style={{ fontSize: '0.6rem', letterSpacing: '5px', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 18 }}>Our Story</p>
          <h1 className="fade-up" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2.5rem, 4vw, 3.8rem)', fontWeight: 300, margin: '0 0 2rem', lineHeight: 1.2, fontStyle: 'italic', animationDelay: '0.1s' }}>
            Dressed for<br />a life well lived.
          </h1>
          <p className="fade-up" style={{ color: '#666', fontSize: '0.82rem', lineHeight: 2.2, maxWidth: 400, animationDelay: '0.2s' }}>
            VOGUE India was founded in New Delhi with a singular conviction: that Indian menswear deserved the same uncompromising approach to craft that the world's great ateliers brought to their work.
          </p>
          <p className="fade-up" style={{ color: '#555', fontSize: '0.8rem', lineHeight: 2.2, maxWidth: 400, marginTop: '1.2rem', animationDelay: '0.3s' }}>
            Since 2018, we have built each collection around one question — what does a man who values permanence over novelty actually need to wear?
          </p>
        </div>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img src="https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&fit=crop" alt="About VOGUE"
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #080808, transparent)' }} />
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section style={{ padding: '5rem 6%', borderTop: '0.5px solid #141414', borderBottom: '0.5px solid #141414', textAlign: 'center' }}>
        <p style={{ fontSize: '0.6rem', letterSpacing: '5px', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 20 }}>Philosophy</p>
        <blockquote style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontWeight: 300, fontStyle: 'italic', color: '#ddd', maxWidth: 700, margin: '0 auto', lineHeight: 1.6 }}>
          "The most elegant thing a man can wear is intention."
        </blockquote>
        <p style={{ color: '#444', fontSize: '0.65rem', letterSpacing: '2px', marginTop: 20 }}>— VOGUE India, Founding Manifesto, 2018</p>
      </section>

      {/* VALUES */}
      <section style={{ padding: '5rem 6%' }}>
        <p style={{ fontSize: '0.6rem', letterSpacing: '5px', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 14, textAlign: 'center' }}>What We Stand For</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 300, textAlign: 'center', marginBottom: '3.5rem', fontStyle: 'italic' }}>Our Values</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
          {VALUES.map((v, i) => (
            <div key={v.title} className="fade-up" style={{ padding: '2rem', border: '0.5px solid #141414', borderRadius: 2, animationDelay: `${i * 0.1}s` }}>
              <div style={{ fontSize: '1.5rem', color: '#c9a96e', marginBottom: '1rem', opacity: 0.7 }}>{v.icon}</div>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.2rem', fontWeight: 400, marginBottom: '0.8rem', letterSpacing: 0.5 }}>{v.title}</h3>
              <p style={{ color: '#555', fontSize: '0.78rem', lineHeight: 2, margin: 0 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NUMBERS */}
      <section style={{ padding: '4rem 6%', background: '#060606', borderTop: '0.5px solid #141414', borderBottom: '0.5px solid #141414' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          {[{ n: '2018', label: 'Founded' }, { n: '12', label: 'Collections' }, { n: '8+', label: 'Artisan Partners' }, { n: '10K+', label: 'Clients' }].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 300, color: '#c9a96e', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: '0.6rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#444', marginTop: 10 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TEAM */}
      <section style={{ padding: '5rem 6%' }}>
        <p style={{ fontSize: '0.6rem', letterSpacing: '5px', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 14, textAlign: 'center' }}>The People</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 300, textAlign: 'center', marginBottom: '3rem', fontStyle: 'italic' }}>Behind VOGUE</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', maxWidth: 800, margin: '0 auto' }}>
          {TEAM.map(t => (
            <div key={t.name} style={{ textAlign: 'center' }}>
              <div style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 1.2rem', border: '1px solid #1e1e1e' }}>
                <img src={t.image} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.15rem', fontWeight: 400, marginBottom: 4 }}>{t.name}</div>
              <div style={{ fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#555' }}>{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '4rem 6%', textAlign: 'center', borderTop: '0.5px solid #141414', background: '#060606' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 300, marginBottom: '1.5rem', fontStyle: 'italic' }}>Begin Your Edit</h2>
        <Link to="/collection" style={{ display: 'inline-block', padding: '0.9rem 3rem', background: '#c9a96e', color: '#0a0a0a', textDecoration: 'none', fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase', borderRadius: 2, fontWeight: 700 }}>
          Explore Collection
        </Link>
      </section>

      <footer style={{ borderTop: '0.5px solid #141414', padding: '2.5rem 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.1rem', letterSpacing: 10, color: '#222' }}>VOGUE</span>
        <p style={{ fontSize: '0.55rem', letterSpacing: '2px', color: '#222', margin: 0 }}>© 2026 VOGUE INDIA. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
