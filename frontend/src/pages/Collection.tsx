import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiWithCache } from '../services/api';

const CATEGORIES = ['All', 'T-shirt', 'Shirt', 'Jacket', 'Pants', 'Blazer', 'Outerwear', 'Sets', 'Dresses', 'Footwear'];

function statusColor(stock: number) {
  if (stock > 10) return '#22c55e';
  if (stock > 0) return '#f59e0b';
  return '#ef4444';
}

export default function Collection() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sort, setSort] = useState('default');
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    apiWithCache.get('/api/products').then(r => setProducts(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = products
    .filter(p => activeCategory === 'All' || p.category === activeCategory)
    .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f0ede6', fontFamily: "'Montserrat',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Montserrat:wght@300;400;500;600&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .product-card { animation: fadeUp 0.4s ease both; }
        .product-card:hover .card-overlay { opacity:1!important; }
        .product-card:hover img { transform: scale(1.04); }
      `}</style>

      {/* NAV */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 6%', borderBottom: '0.5px solid #1a1a1a', position: 'sticky', top: 0, background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#f0ede6', fontFamily: "'Cormorant Garamond',serif", fontSize: '1.4rem', fontWeight: 300, letterSpacing: 12 }}>VOGUE</Link>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {['Home', 'Collection', 'Looks', 'About'].map(l => (
            <Link key={l} to={l === 'Home' ? '/' : `/${l.toLowerCase()}`}
              style={{ textDecoration: 'none', color: l === 'Collection' ? '#c9a96e' : '#888', fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: "'Montserrat',sans-serif" }}>
              {l}
            </Link>
          ))}
          <Link to="/cart" style={{ textDecoration: 'none', color: '#888', fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: "'Montserrat',sans-serif" }}>Bag</Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ padding: '4rem 6% 2rem', borderBottom: '0.5px solid #1a1a1a' }}>
        <p style={{ fontSize: '0.6rem', letterSpacing: '4px', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 10 }}>The Edit</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 300, margin: '0 0 1rem', letterSpacing: 2 }}>The Collection</h1>
        <p style={{ color: '#555', fontSize: '0.8rem', lineHeight: 2, maxWidth: 480, margin: 0 }}>
          Refined essentials and seasonal statements for the modern gentleman. Each piece selected for its craft, quality, and longevity.
        </p>
      </div>

      {/* FILTERS */}
      <div style={{ padding: '1.5rem 6%', borderBottom: '0.5px solid #1a1a1a', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{ padding: '0.4rem 1rem', background: activeCategory === cat ? '#c9a96e' : 'transparent', color: activeCategory === cat ? '#0a0a0a' : '#555', border: `1px solid ${activeCategory === cat ? '#c9a96e' : '#1e1e1e'}`, borderRadius: 2, cursor: 'pointer', fontSize: '0.65rem', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: "'Montserrat',sans-serif", transition: 'all 0.2s', fontWeight: activeCategory === cat ? 600 : 400 }}>
              {cat}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: '0.4rem 0.8rem', background: '#111', border: '1px solid #1e1e1e', borderRadius: 2, color: '#f0ede6', fontSize: '0.75rem', fontFamily: "'Montserrat',sans-serif", outline: 'none', width: 150 }} />
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ padding: '0.4rem 0.8rem', background: '#111', border: '1px solid #1e1e1e', borderRadius: 2, color: '#888', fontSize: '0.7rem', fontFamily: "'Montserrat',sans-serif", outline: 'none', cursor: 'pointer' }}>
            <option value="default">Sort: Featured</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="name">Name: A → Z</option>
          </select>
          <span style={{ color: '#444', fontSize: '0.65rem', letterSpacing: '1px', whiteSpace: 'nowrap' }}>{filtered.length} pieces</span>
        </div>
      </div>

      {/* GRID */}
      <div style={{ padding: '3rem 6%' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '6rem', color: '#444' }}>
            <div style={{ width: 28, height: 28, border: '1.5px solid #1a1a1a', borderTopColor: '#c9a96e', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            Loading collection...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem', color: '#444' }}>
            <p style={{ fontSize: '0.8rem', letterSpacing: '2px' }}>NO PIECES FOUND</p>
          </div>
        ) : (
          <div className="grid-3" style={{ gap: '2rem' }}>
            {filtered.map((p, i) => (
              <Link key={p.id} to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="product-card" onMouseEnter={() => setHoveredId(p.id)} onMouseLeave={() => setHoveredId(null)}
                  style={{ animationDelay: `${(i % 12) * 0.05}s`, cursor: 'pointer' }}>
                  {/* Image */}
                  <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: '#111', borderRadius: 2, marginBottom: '1rem' }}>
                    <img src={p.imageUrl} alt={p.name} loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease', display: 'block' }} />
                    {/* Overlay */}
                    <div className="card-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)', opacity: hoveredId === p.id ? 1 : 0, transition: 'opacity 0.35s', display: 'flex', alignItems: 'flex-end', padding: '1.2rem' }}>
                      <span style={{ fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#c9a96e', fontWeight: 600 }}>View Piece →</span>
                    </div>
                    {/* Category badge */}
                    <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '0.2rem 0.6rem', borderRadius: 2 }}>
                      <span style={{ fontSize: '0.55rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888' }}>{p.category}</span>
                    </div>
                    {/* Stock */}
                    {p.stock === 0 && (
                      <div style={{ position: 'absolute', top: 12, right: 12, background: '#ef444420', border: '1px solid #ef444440', padding: '0.2rem 0.6rem', borderRadius: 2 }}>
                        <span style={{ fontSize: '0.55rem', letterSpacing: '1.5px', color: '#ef4444' }}>SOLD OUT</span>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.15rem', fontWeight: 400, marginBottom: 4, color: '#f0ede6' }}>{p.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#555', marginBottom: 8, letterSpacing: '0.5px', lineHeight: 1.6 }}>{p.description?.slice(0, 60)}...</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.1rem', color: '#c9a96e' }}>₹{p.price?.toLocaleString('en-IN')}</span>
                      <span style={{ fontSize: '0.6rem', color: statusColor(p.stock), letterSpacing: '1px' }}>
                        {p.stock > 10 ? '● In Stock' : p.stock > 0 ? `● ${p.stock} left` : '● Sold Out'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '0.5px solid #141414', padding: '3rem 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.2rem', letterSpacing: 10, color: '#333' }}>VOGUE</span>
        <p style={{ fontSize: '0.6rem', letterSpacing: '2px', color: '#2a2a2a', margin: 0 }}>© 2026 VOGUE INDIA. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
