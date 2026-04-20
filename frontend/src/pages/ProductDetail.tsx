import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useStore } from '../context/StoreContext';
import { getPremiumImage } from '../utils/imageUtils';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [addedToBag, setAddedToBag] = useState(false);
  const [reviewStats, setReviewStats] = useState<{ avg: number; total: number } | null>(null);

  const { addToCart, toggleWishlist, wishlist, cart } = useStore();
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setFetchError('');
    setProduct(null);

    const productId = Number(id);
    if (!id || Number.isNaN(productId) || productId <= 0) {
      setFetchError('Invalid product id.');
      setLoading(false);
      return;
    }

    api.get(`/api/products/${productId}`)
      .then(res => {
        if (!res.data || Array.isArray(res.data)) {
          throw new Error('Unexpected product payload');
        }
        setProduct(res.data);
        setMainImage(getPremiumImage(res.data));
        if (res.data.sizes?.length) setSize(res.data.sizes[0]);
        if (res.data.colors?.length) setColor(res.data.colors[0]);
      })
      .catch((error) => {
        const status = error?.response?.status;
        if (status === 404) setFetchError('Product could not be found.');
        else setFetchError('Unable to load product details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (id) {
      api.get(`/api/reviews/${id}`)
        .then(res => setReviewStats({ avg: res.data.averageRating, total: res.data.totalReviews }))
        .catch(() => {});
    }
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a' }}>
      <div style={{ textAlign: 'center', color: '#555' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #1a1a1a', borderTopColor: '#c9a96e', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: 4, textTransform: 'uppercase' }}>Loading</span>
      </div>
    </div>
  );

  if (fetchError || !product) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a', gap: '1.5rem', color: '#f0ede6' }}>
      <h2 style={{ fontWeight: 300, fontFamily: "'Cormorant Garamond',serif" }}>{fetchError || 'Product Not Found'}</h2>
      <button onClick={() => navigate('/')} style={{ padding: '0.8rem 2rem', background: 'transparent', color: '#c9a96e', border: '0.5px solid #c9a96e', cursor: 'pointer', fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: 3, textTransform: 'uppercase' }}>Back to Collection</button>
    </div>
  );

  const allImages = [product.imageUrl, ...(product.multipleImages || [])].filter(Boolean);
  const isWishlisted = wishlist.some((w: any) => w.product?.id === product.id);

  const colorMap: Record<string, string> = {
    white: '#f5f5f5', black: '#1a1a1a', grey: '#9e9e9e', gray: '#9e9e9e', blue: '#3b5998',
    navy: '#1a2744', red: '#c0392b', brown: '#6b4226', tan: '#d2b48c', khaki: '#c3b091',
    cream: '#fffdd0', green: '#2d6a4f', olive: '#556b2f', pink: '#e8a0bf', burgundy: '#722f37',
    charcoal: '#36454f', camel: '#c19a6b', sand: '#c2b280', floral: '#e8a0bf', ivory: '#f8f4e3',
    sage: '#b2ac88', ecru: '#c2b280', champagne: '#f7e7ce', lilac: '#c8a2c8',
  };
  const getCssColor = (c: string) => colorMap[c.toLowerCase().trim()] || '#888';

  const handleAddToCart = () => {
    addToCart(product.id, size, color, quantity);
    setAddedToBag(true);
    setTimeout(() => setAddedToBag(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#f0ede6', fontFamily: "'Montserrat',sans-serif" }}>
      <style>{`
        @keyframes pdFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .pd-anim { animation: pdFadeUp 0.45s ease both; }
        .thumb-hover:hover { opacity: 1 !important; border-color: #c9a96e !important; }
        .size-btn:hover { border-color: #c9a96e !important; color: #c9a96e !important; }
        .tab-btn:hover { color: #f0ede6 !important; }
      `}</style>

      <nav className="responsive-nav" style={{ padding: '1.4rem 5%', borderBottom: '0.5px solid #141414', backgroundColor: '#0a0a0a', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="nav-links" style={{ display: 'flex', gap: '2.5rem', fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: 3.5, textTransform: 'uppercase' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#555' }}>Home</Link>
          <Link to="/collection" style={{ textDecoration: 'none', color: '#f0ede6' }}>Collection</Link>
          <Link to="/looks" style={{ textDecoration: 'none', color: '#555' }}>Looks</Link>
          <Link to="/about" style={{ textDecoration: 'none', color: '#555' }}>About</Link>
        </div>
        <Link to="/" className="logo" style={{ textDecoration: 'none', color: '#f0ede6', fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 300, letterSpacing: 12 }}>VOGUE</Link>
        <div style={{ display: 'flex', gap: '1.8rem', alignItems: 'center', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' }}>
          <Link to="/wishlist" className="hide-mobile" style={{ textDecoration: 'none', color: '#555' }}>Wishlist</Link>
          <Link to="/cart" style={{ textDecoration: 'none', color: '#555' }}>Bag</Link>
          <Link to="/account" className="hide-mobile" style={{ textDecoration: 'none', color: '#555' }}>Account</Link>
          <button className="hamburger-btn" onClick={() => setMobileMenuOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />
      <div className={`mobile-menu-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"2rem" }}>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, letterSpacing:6, color:"#f0ede6" }}>VOGUE</span>
          <button onClick={() => setMobileMenuOpen(false)} style={{ background:"none", border:"none", color:"#fff", fontSize:"1.5rem" }}>✕</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize:"1.2rem", textDecoration:"none", color:"#f0ede6" }}>Home</Link>
          <Link to="/collection" onClick={() => setMobileMenuOpen(false)} style={{ fontSize:"1.2rem", textDecoration:"none", color:"#f0ede6" }}>Collection</Link>
          <Link to="/looks" onClick={() => setMobileMenuOpen(false)} style={{ fontSize:"1.2rem", textDecoration:"none", color:"#f0ede6" }}>Looks</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} style={{ fontSize:"1.2rem", textDecoration:"none", color:"#f0ede6" }}>About</Link>
          <hr style={{ borderTop:"0.5px solid #222", margin:"1rem 0", border:"none" }} />
          <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} style={{ fontSize:"1rem", textDecoration:"none", color:"#888" }}>Wishlist</Link>
          <Link to="/account" onClick={() => setMobileMenuOpen(false)} style={{ fontSize:"1rem", textDecoration:"none", color:"#888" }}>Account</Link>
        </div>
      </div>

      {/* ── BREADCRUMB + BACK BUTTON ── */}
      <div style={{ padding: '0.9rem 5%', fontSize: '0.7rem', color: '#444', borderBottom: '0.5px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'space-between', letterSpacing: 1 }}>
        {/* Breadcrumb trail */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link to="/" style={{ color: '#444', textDecoration: 'none' }}>Home</Link>
          <span style={{ color: '#2a2a2a' }}>/</span>
          <Link to="/collection" style={{ color: '#444', textDecoration: 'none' }}>{product.category || 'Shop'}</Link>
          <span style={{ color: '#2a2a2a' }}>/</span>
          <span style={{ color: '#c9a96e' }}>{product.name}</span>
        </div>
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '0.5px solid #1e1e1e', color: '#888', padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: "'Montserrat',sans-serif", borderRadius: 3, transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a96e'; e.currentTarget.style.color = '#c9a96e'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.color = '#888'; }}
        >
          ← Back
        </button>
      </div>


      {/* ── MAIN GRID ── */}
      <div className="grid-2" style={{ maxWidth: 1200, margin: '3rem auto', padding: '0 5%' }}>

        {/* GALLERY */}
        <div className="pd-anim" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            width: '100%', aspectRatio: '3/4', backgroundColor: '#111',
            backgroundImage: `url(${mainImage})`, backgroundSize: 'cover', backgroundPosition: 'center top',
            transition: 'background-image 0.35s ease',
          }} />
          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {allImages.map((img: string, i: number) => (
                <div key={i} onClick={() => setMainImage(img)} className="thumb-hover" style={{
                  width: 66, height: 84, backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center',
                  cursor: 'pointer',
                  border: mainImage === img ? '0.5px solid #c9a96e' : '0.5px solid #222',
                  opacity: mainImage === img ? 1 : 0.45, transition: 'all 0.25s',
                }} />
              ))}
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div className="pd-anim" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Category */}
          <p style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: 5, color: '#c9a96e', textTransform: 'uppercase', marginBottom: 10 }}>{product.category || 'Clothing'}</p>

          {/* Name */}
          <h1 className="product-title" style={{ fontSize: '2.6rem', color: '#f0ede6', marginBottom: '0.8rem', fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, letterSpacing: 2, lineHeight: 1.15 }}>{product.name}</h1>

          {/* Real rating */}
          {reviewStats && reviewStats.total > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <span style={{ color: '#c9a96e', fontSize: '0.85rem', letterSpacing: 2 }}>{'★'.repeat(Math.round(reviewStats.avg))}{'☆'.repeat(5 - Math.round(reviewStats.avg))}</span>
              <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#f0ede6' }}>{reviewStats.avg.toFixed(1)}</span>
              <span style={{ color: '#555', fontSize: '0.78rem' }}>({reviewStats.total} review{reviewStats.total !== 1 ? 's' : ''})</span>
            </div>
          )}

          {/* Price */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '0.5px solid #141414' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 300, fontFamily: "'Cormorant Garamond',serif", color: '#f0ede6', letterSpacing: 1 }}>₹{product.price.toFixed(0)}</span>
            <span style={{ fontSize: '1rem', color: '#333', textDecoration: 'line-through', fontFamily: "'Montserrat',sans-serif" }}>₹{(product.price * 1.4).toFixed(0)}</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#c9a96e', fontFamily: "'Montserrat',sans-serif", letterSpacing: 2 }}>30% OFF</span>
          </div>

          {/* Description */}
          <p style={{ color: '#888', lineHeight: 1.9, marginBottom: '2rem', fontSize: '0.85rem', letterSpacing: '0.3px', fontWeight: 300 }}>{product.description}</p>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: 9, fontFamily: "'Montserrat',sans-serif", letterSpacing: 3, textTransform: 'uppercase', color: '#f0ede6', marginBottom: 12 }}>
                Color — <span style={{ color: '#c9a96e', textTransform: 'capitalize' }}>{color}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {product.colors.map((c: string) => (
                  <button key={c} onClick={() => setColor(c)} title={c} style={{
                    width: 28, height: 28, borderRadius: '50%', backgroundColor: getCssColor(c), padding: 0,
                    border: color === c ? '0.5px solid #c9a96e' : '0.5px solid #2a2a2a',
                    cursor: 'pointer',
                    boxShadow: color === c ? '0 0 0 2px #0a0a0a, 0 0 0 3px #c9a96e' : 'none',
                    transform: color === c ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.2s',
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: 9, fontFamily: "'Montserrat',sans-serif", letterSpacing: 3, textTransform: 'uppercase', color: '#f0ede6', marginBottom: 12 }}>
                Size — <span style={{ color: '#c9a96e' }}>{size}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {product.sizes.map((s: string) => (
                  <button key={s} className="size-btn" onClick={() => setSize(s)} style={{
                    padding: '0.55rem 1.2rem', fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: 2,
                    border: size === s ? '0.5px solid #c9a96e' : '0.5px solid #222',
                    backgroundColor: size === s ? '#c9a96e' : 'transparent',
                    color: size === s ? '#0a0a0a' : '#888',
                    cursor: 'pointer', transition: 'all 0.2s', fontWeight: size === s ? 700 : 400,
                  }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* ── Stock Status Banner ── */}
          {product.stock === 0 ? (
            <div style={{ marginBottom: '1.5rem', padding: '1rem 1.2rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ fontSize: '1.1rem' }}>⊘</span>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 3 }}>Out of Stock</div>
                <div style={{ fontSize: '0.7rem', color: '#888', lineHeight: 1.6 }}>This piece is currently unavailable. Check back soon or browse similar styles.</div>
              </div>
            </div>
          ) : product.stock <= 5 ? (
            <div style={{ marginBottom: '1.5rem', padding: '0.8rem 1.2rem', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ fontSize: '1rem', color: '#f59e0b' }}>◐</span>
              <div style={{ fontSize: '0.7rem', color: '#f59e0b', letterSpacing: '1px' }}>
                Only <strong>{product.stock}</strong> left in stock — order soon.
              </div>
            </div>
          ) : null}

          {/* CTA */}
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'stretch' }}>
            {/* Qty selector — hidden when out of stock */}
            {(() => {
              const qtyInCart = cart.reduce((acc, item) => item.product?.id === product.id ? acc + item.quantity : acc, 0);
              const availableStock = Math.max(0, product.stock - qtyInCart);

              return (
                <>
                  {product.stock > 0 && availableStock > 0 && (
                    <div style={{ display: 'flex', border: '0.5px solid #1e1e1e' }}>
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '0 1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#555', fontFamily: "'Montserrat',sans-serif" }}>−</button>
                      <div style={{ padding: '0 1rem', borderLeft: '0.5px solid #1e1e1e', borderRight: '0.5px solid #1e1e1e', display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: '0.9rem', color: '#f0ede6', minWidth: 44, justifyContent: 'center' }}>{quantity}</div>
                      <button onClick={() => setQuantity(Math.min(availableStock, quantity + 1))} style={{ padding: '0 1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#555', fontFamily: "'Montserrat',sans-serif" }}>+</button>
                    </div>
                  )}

                  {/* Add to Bag / Out of Stock / Limit Reached button */}
                  {product.stock === 0 ? (
                    <button disabled style={{
                      flex: 1, padding: '1rem', fontFamily: "'Montserrat',sans-serif", fontWeight: 700,
                      fontSize: 9, textTransform: 'uppercase', letterSpacing: 3.5, border: '0.5px solid #1e1e1e',
                      backgroundColor: 'transparent', color: '#333', cursor: 'not-allowed',
                    }}>Sold Out</button>
                  ) : availableStock === 0 ? (
                     <button disabled style={{
                      flex: 1, padding: '1rem', fontFamily: "'Montserrat',sans-serif", fontWeight: 700,
                      fontSize: 9, textTransform: 'uppercase', letterSpacing: 3.5, border: '0.5px solid #1e1e1e',
                      backgroundColor: 'transparent', color: '#333', cursor: 'not-allowed',
                    }}>Stock Limit Reached</button>
                  ) : (
                    <button onClick={handleAddToCart} style={{
                      flex: 1, padding: '1rem', fontFamily: "'Montserrat',sans-serif", fontWeight: 700, cursor: 'pointer',
                      fontSize: 9, textTransform: 'uppercase', letterSpacing: 3.5, border: 'none',
                      backgroundColor: addedToBag ? '#c9a96e' : '#f0ede6', color: '#0a0a0a',
                      transition: 'all 0.3s',
                    }}>{addedToBag ? '✓ Added to Bag' : 'Add to Bag'}</button>
                  )}
                </>
              );
            })()}

            <button onClick={() => toggleWishlist(product.id)} style={{
              padding: '1rem 1.2rem', background: 'transparent', border: '0.5px solid #1e1e1e',
              cursor: 'pointer', fontSize: '1.3rem', color: isWishlisted ? '#c9a96e' : '#333', transition: 'color 0.3s',
            }}>{isWishlisted ? '♥' : '♡'}</button>
          </div>


          {/* Trust strip */}
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1.5rem', padding: '1rem 0', borderTop: '0.5px solid #141414', borderBottom: '0.5px solid #141414' }}>
            {[['🚚', 'Free Delivery', 'Orders above ₹999'], ['↩', 'Easy Returns', '7-day policy'], ['✓', 'Genuine', '100% authentic']].map(([icon, title, sub]) => (
              <div key={title as string} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flex: 1 }}>
                <span style={{ fontSize: '0.9rem', color: '#c9a96e', marginTop: 2 }}>{icon}</span>
                <div>
                  <div style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, color: '#f0ede6', fontSize: '0.72rem', letterSpacing: 1 }}>{title}</div>
                  <div style={{ color: '#444', fontSize: '0.65rem', marginTop: 3, letterSpacing: '0.5px' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ maxWidth: 1000, margin: '3rem auto 0', padding: '0 5%' }}>
        <div style={{ display: 'flex', borderBottom: '0.5px solid #141414' }}>
          {['description', 'info', 'reviews'].map(tab => (
            <div key={tab} onClick={() => setActiveTab(tab)} className="tab-btn" style={{
              padding: '1rem 2rem', cursor: 'pointer',
              fontFamily: "'Montserrat',sans-serif", fontSize: 9, textTransform: 'uppercase', letterSpacing: 2.5,
              color: activeTab === tab ? '#f0ede6' : '#444',
              borderBottom: activeTab === tab ? '0.5px solid #c9a96e' : '0.5px solid transparent',
              marginBottom: -1, transition: 'all 0.25s',
            }}>
              {tab === 'info' ? 'Details' : tab === 'reviews' ? 'Reviews' : 'Description'}
            </div>
          ))}
        </div>

        <div style={{ padding: '2.5rem 0 6rem', fontSize: '0.88rem', lineHeight: 1.9 }}>
          {activeTab === 'description' && (
            <div>
              <p style={{ color: '#888', fontWeight: 300 }}>{product.description}</p>
              <p style={{ color: '#444', marginTop: '1rem', fontWeight: 300 }}>Crafted with premium materials. Designed to blend comfort with sophisticated style for the modern wardrobe.</p>
            </div>
          )}
          {activeTab === 'info' && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  ['Material', 'Premium Cotton Blend'],
                  ['Sizes', product.sizes?.join(', ') || 'Standard'],
                  ['Colors', product.colors?.join(', ') || 'Standard'],
                  ['Origin', 'Imported'],
                  ['Care', 'Machine wash cold, tumble dry low'],
                ].map(([k, v], i) => (
                  <tr key={i} style={{ borderBottom: '0.5px solid #111' }}>
                    <td style={{ padding: '1rem 0', fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#555', width: '35%' }}>{k}</td>
                    <td style={{ padding: '1rem 0', color: '#f0ede6', fontWeight: 300, fontSize: '0.85rem' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeTab === 'reviews' && <ReviewsSection productId={product.id} />}
        </div>
      </div>
    </div>
  );
}

// ── REVIEWS (dark theme) ──────────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} onClick={() => onChange(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          style={{ fontSize: '1.8rem', cursor: 'pointer', color: s <= (hover || value) ? '#c9a96e' : '#1e1e1e', transition: 'all 0.15s', transform: s <= (hover || value) ? 'scale(1.15)' : 'scale(1)', display: 'inline-block' }}>★</span>
      ))}
    </div>
  );
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <span style={{ fontSize: '0.72rem', color: '#555', minWidth: 28, fontFamily: "'Montserrat',sans-serif" }}>{star}★</span>
      <div style={{ flex: 1, height: 3, backgroundColor: '#141414', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#c9a96e', transition: 'width 0.7s ease' }} />
      </div>
      <span style={{ fontSize: '0.7rem', color: '#333', minWidth: 20, textAlign: 'right', fontFamily: "'Montserrat',sans-serif" }}>{count}</span>
    </div>
  );
}

function ReviewsSection({ productId }: { productId: number }) {
  const [data, setData] = useState<any>(null);
  const [myReview, setMyReview] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState('');
  const isLoggedIn = !!localStorage.getItem('token');

  const fetchReviews = useCallback(() => {
    api.get(`/api/reviews/${productId}`).then(res => setData(res.data)).catch(console.error);
    if (isLoggedIn) {
      api.get(`/api/reviews/${productId}/mine`)
        .then(res => { if (res.status === 200) { setMyReview(res.data); setRating(res.data.rating); setComment(res.data.comment); } })
        .catch(() => setMyReview(null));
    }
  }, [productId, isLoggedIn]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    try {
      await api.post(`/api/reviews/${productId}`, { rating, comment });
      setSuccess(myReview ? 'Review updated!' : 'Review submitted!');
      setShowForm(false); fetchReviews();
      setTimeout(() => setSuccess(''), 3000);
    } catch { console.error('Submit failed'); }
    finally { setSubmitting(false); }
  };

  const avg: number = data?.averageRating ?? 0;
  const total: number = data?.totalReviews ?? 0;
  const dist: Record<number, number> = data?.distribution ?? {};
  const reviews: any[] = data?.reviews ?? [];

  return (
    <div>
      <style>{`@keyframes reviewIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Summary */}
      <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', padding: '1.5rem', border: '0.5px solid #141414', backgroundColor: '#0d0d0d' }}>
        <div style={{ textAlign: 'center', minWidth: 100 }}>
          <div style={{ fontSize: '3.5rem', fontWeight: 300, fontFamily: "'Cormorant Garamond',serif", color: '#f0ede6', lineHeight: 1 }}>{avg > 0 ? avg.toFixed(1) : '—'}</div>
          <div style={{ color: '#c9a96e', fontSize: '1rem', margin: '0.4rem 0', letterSpacing: 3 }}>{'★'.repeat(Math.round(avg))}{'☆'.repeat(5 - Math.round(avg))}</div>
          <div style={{ fontSize: '0.65rem', color: '#444', fontFamily: "'Montserrat',sans-serif", letterSpacing: 2 }}>{total} REVIEW{total !== 1 ? 'S' : ''}</div>
        </div>
        <div style={{ flex: 1, minWidth: 180, paddingTop: '0.4rem' }}>
          {[5, 4, 3, 2, 1].map(s => <RatingBar key={s} star={s} count={dist[s] ?? 0} total={total} />)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {isLoggedIn ? (
            <button onClick={() => setShowForm(f => !f)} style={{
              padding: '0.75rem 1.5rem', backgroundColor: 'transparent', color: '#c9a96e',
              border: '0.5px solid #c9a96e', cursor: 'pointer', fontFamily: "'Montserrat',sans-serif",
              fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, transition: 'all 0.25s',
            }}>{myReview ? '✏ Edit Review' : '+ Write a Review'}</button>
          ) : (
            <Link to="/login">
              <button style={{ padding: '0.75rem 1.5rem', backgroundColor: 'transparent', color: '#555', border: '0.5px solid #222', cursor: 'pointer', fontFamily: "'Montserrat',sans-serif", fontSize: 9, textTransform: 'uppercase', letterSpacing: 2 }}>Login to Review</button>
            </Link>
          )}
          {success && <div style={{ color: '#c9a96e', fontSize: '0.75rem', fontFamily: "'Montserrat',sans-serif", letterSpacing: 1 }}>{success}</div>}
        </div>
      </div>

      {/* Write form */}
      {showForm && (
        <div style={{ marginBottom: '2.5rem', padding: '1.5rem', backgroundColor: '#0d0d0d', border: '0.5px solid #1a1a1a', animation: 'reviewIn 0.3s ease' }}>
          <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#f0ede6', marginBottom: '1.2rem' }}>
            {myReview ? 'Update Your Review' : 'Share Your Experience'}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.65rem', color: '#555', marginBottom: 8, fontFamily: "'Montserrat',sans-serif", letterSpacing: 2, textTransform: 'uppercase' }}>Your Rating</div>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ fontSize: '0.65rem', color: '#555', marginBottom: 8, fontFamily: "'Montserrat',sans-serif", letterSpacing: 2, textTransform: 'uppercase' }}>Your Comment</div>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder="What do you think of this product?"
              rows={4} style={{ width: '100%', padding: '0.9rem', backgroundColor: '#111', border: '0.5px solid #1e1e1e', color: '#f0ede6', fontSize: '0.85rem', lineHeight: 1.7, resize: 'vertical', fontFamily: "'Montserrat',sans-serif", boxSizing: 'border-box', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button onClick={handleSubmit} disabled={!rating || submitting} style={{
              padding: '0.75rem 2rem', backgroundColor: rating ? '#f0ede6' : '#111',
              color: rating ? '#0a0a0a' : '#333', border: 'none',
              cursor: rating ? 'pointer' : 'not-allowed', fontFamily: "'Montserrat',sans-serif",
              fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, transition: 'all 0.25s',
            }}>{submitting ? 'Submitting…' : myReview ? 'Update' : 'Submit Review'}</button>
            <button onClick={() => setShowForm(false)} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'transparent', color: '#444', border: '0.5px solid #1e1e1e', cursor: 'pointer', fontFamily: "'Montserrat',sans-serif", fontSize: 9 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Review cards */}
      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#333' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem', opacity: 0.3 }}>★</div>
          <p style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: 3, textTransform: 'uppercase' }}>No reviews yet — be the first</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {reviews.map((r: any) => (
            <div key={r.id} style={{ padding: '1.5rem 0', borderBottom: '0.5px solid #111', animation: 'reviewIn 0.4s ease' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #c9a96e44, #c9a96e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond',serif", fontSize: '1.1rem', color: '#0a0a0a', fontWeight: 700 }}>
                  {(r.user?.fullName || 'A').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: '#f0ede6', fontWeight: 400 }}>{r.user?.fullName || 'Anonymous'}</span>
                      <div style={{ color: '#c9a96e', fontSize: '0.78rem', marginTop: 2, letterSpacing: 2 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#333', fontFamily: "'Montserrat',sans-serif", letterSpacing: 1 }}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {r.comment && <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.8, margin: 0, fontWeight: 300 }}>{r.comment}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
