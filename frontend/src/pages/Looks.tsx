import { Link } from 'react-router-dom';

const NAV = ['Home', 'Collection', 'Looks', 'About'];
const navLink = (l: string) => ({ textDecoration: 'none', color: l === 'Looks' ? '#c9a96e' : '#888', fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase' as const, fontFamily: "'Montserrat',sans-serif" });

const LOOKS = [
  {
    id: 1, title: 'The City Edit', season: 'Spring / Summer 2026',
    desc: 'Clean lines and breathable fabrics for the urban landscape. Linen shirts, slim chinos, and leather trainers.',
    image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=700&fit=crop',
    tags: ['Linen', 'Minimal', 'Urban'],
    pieces: ['Oxford Button-Down', 'Slim Fit Chinos', 'White Leather Trainers'],
  },
  {
    id: 2, title: 'Evening Noir', season: 'Resort 2026',
    desc: 'Commanding darkness. Velvet, tailoring and obsidian tones for occasions that demand authority.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=700&fit=crop',
    tags: ['Formal', 'Dark', 'Luxe'],
    pieces: ['Wool Overcoat', 'Navy Slim Blazer', 'Tailored Trousers'],
  },
  {
    id: 3, title: 'The Weekend Escape', season: 'Pre-Fall 2026',
    desc: 'Soft textures and relaxed forms for countryside weekends. Heritage check and fine cognac leather.',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=700&fit=crop',
    tags: ['Heritage', 'Casual', 'Relaxed'],
    pieces: ['Denim Jacket', 'Henley Long Sleeve', 'Suede Chelsea Boots'],
  },
  {
    id: 4, title: 'Northern Edge', season: 'Autumn / Winter 2026',
    desc: 'Heavy wool, raw leather, and rugged silhouettes. Dressed for weather, built for character.',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700&fit=crop',
    tags: ['Winter', 'Outerwear', 'Bold'],
    pieces: ['Bomber Jacket', 'Shearling Coat', 'Knitted Polo Shirt'],
  },
  {
    id: 5, title: 'Resort Blanc', season: 'Summer 2026',
    desc: 'Head-to-toe ivory and sand tones. Linen sets, open collars and rope-soled ease.',
    image: 'https://images.unsplash.com/photo-1594938298870-5799049-photo?w=700&fit=crop&auto=format',
    tags: ['Resort', 'White', 'Linen'],
    pieces: ['Linen Co-ord Set', 'Classic White Tee', 'Knit Lounge Set'],
  },
  {
    id: 6, title: 'The Power Suit', season: 'Corporate Capsule',
    desc: 'Precision tailoring. When boardroom presence is non-negotiable, the suit must speak first.',
    image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=700&fit=crop',
    tags: ['Suits', 'Power', 'Tailored'],
    pieces: ['Check Blazer', 'Linen Blazer', 'Tailored Trousers'],
  },
];

export default function Looks() {
  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#f0ede6', fontFamily: "'Montserrat',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Montserrat:wght@300;400;500&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .look-card { animation: fadeUp 0.5s ease both; }
        .look-card:hover .look-img { transform: scale(1.03); }
        .look-card:hover .look-overlay { opacity:1!important; }
      `}</style>

      {/* NAV */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 6%', borderBottom: '0.5px solid #141414', position: 'sticky', top: 0, background: 'rgba(8,8,8,0.96)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#f0ede6', fontFamily: "'Cormorant Garamond',serif", fontSize: '1.4rem', fontWeight: 300, letterSpacing: 12 }}>VOGUE</Link>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {NAV.map(l => <Link key={l} to={l === 'Home' ? '/' : `/${l.toLowerCase()}`} style={navLink(l)}>{l}</Link>)}
        </div>
      </nav>

      {/* HERO */}
      <div style={{ padding: '5rem 6% 3rem', borderBottom: '0.5px solid #141414', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 50%, rgba(201,169,110,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <p style={{ fontSize: '0.6rem', letterSpacing: '5px', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 14 }}>Editorial</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 300, margin: '0 0 1.5rem', lineHeight: 1.1, fontStyle: 'italic' }}>The Looks</h1>
        <p style={{ color: '#555', fontSize: '0.8rem', lineHeight: 2.2, maxWidth: 420 }}>
          Six curated storylines. Each look a complete expression of a moment, a mood, and a mastery of dress.
        </p>
      </div>

      {/* LOOKS GRID */}
      <div style={{ padding: '4rem 6%', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2.5rem' }}>
        {LOOKS.map((look, i) => (
          <div key={look.id} className="look-card" style={{ animationDelay: `${i * 0.1}s` }}>
            {/* Image */}
            <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden', background: '#111', borderRadius: 2, marginBottom: '1.4rem' }}>
              <img src={look.image} alt={look.title} loading="lazy" className="look-img"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease', display: 'block' }} />
              {/* Dark overlay on hover */}
              <div className="look-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', opacity: 0, transition: 'opacity 0.4s', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '2rem' }}>
                <p style={{ fontSize: '0.7rem', color: '#bbb', lineHeight: 1.9, marginBottom: '1.2rem' }}>{look.desc}</p>
                <Link to="/collection" style={{ display: 'inline-block', padding: '0.6rem 1.4rem', background: '#c9a96e', color: '#0a0a0a', textDecoration: 'none', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, borderRadius: 2 }}>
                  Shop This Look
                </Link>
              </div>
              {/* Season badge */}
              <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', padding: '0.3rem 0.7rem', borderRadius: 2, border: '0.5px solid #ffffff10' }}>
                <span style={{ fontSize: '0.55rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888' }}>{look.season}</span>
              </div>
            </div>
            {/* Info */}
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.5rem', fontWeight: 300, margin: '0 0 8px', fontStyle: 'italic' }}>{look.title}</h2>
              {/* Tags */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {look.tags.map(t => (
                  <span key={t} style={{ padding: '0.15rem 0.6rem', border: '0.5px solid #1e1e1e', borderRadius: 2, fontSize: '0.55rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#555' }}>{t}</span>
                ))}
              </div>
              {/* Pieces */}
              <div style={{ borderTop: '0.5px solid #141414', paddingTop: '0.8rem' }}>
                <p style={{ fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#444', marginBottom: 8 }}>Featured Pieces</p>
                {look.pieces.map(piece => (
                  <p key={piece} style={{ fontSize: '0.72rem', color: '#666', margin: '4px 0', letterSpacing: '0.5px' }}>— {piece}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SHOP CTA */}
      <div style={{ padding: '4rem 6%', textAlign: 'center', borderTop: '0.5px solid #141414' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '4px', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 14 }}>The Full Edit</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 300, marginBottom: '1.5rem', fontStyle: 'italic' }}>Explore Every Piece</h2>
        <Link to="/collection" style={{ display: 'inline-block', padding: '0.9rem 3rem', background: 'transparent', color: '#c9a96e', border: '1px solid #c9a96e40', textDecoration: 'none', fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase', borderRadius: 2, transition: 'all 0.3s' }}>
          View Collection
        </Link>
      </div>

      <footer style={{ borderTop: '0.5px solid #141414', padding: '2.5rem 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.1rem', letterSpacing: 10, color: '#222' }}>VOGUE</span>
        <p style={{ fontSize: '0.55rem', letterSpacing: '2px', color: '#222', margin: 0 }}>© 2026 VOGUE INDIA. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
