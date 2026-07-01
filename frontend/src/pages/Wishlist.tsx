import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

import { useState } from 'react';

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{minHeight: '100vh', backgroundColor: 'var(--bg-primary)', fontFamily: 'Inter, sans-serif'}}>
      <nav className="responsive-nav" style={{padding: '1.5rem 5%', borderBottom: '1px solid rgba(0,0,0,0.06)'}}>
        <Link to="/" className="logo" style={{textDecoration: 'none', color: 'var(--text-main)', letterSpacing: '13px', fontSize: '1.2rem', fontFamily: "'Cormorant Garamond', serif"}}>VOGUE</Link>
        <div style={{display: 'flex', gap: '2rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', alignItems: 'center'}}>
          <Link to="/" className="hide-mobile" style={{textDecoration: 'none', color: 'var(--text-muted)'}}>Shop</Link>
          <Link to="/cart" className="hide-mobile" style={{textDecoration: 'none', color: 'var(--text-muted)'}}>Cart</Link>
          <Link to="/account" className="hide-mobile" style={{textDecoration: 'none', color: 'var(--text-muted)'}}>My Account</Link>
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
          <hr style={{ borderTop:"0.5px solid #222", margin:"1rem 0", border:"none" }} />
          <Link to="/cart" onClick={() => setMobileMenuOpen(false)} style={{ fontSize:"1rem", textDecoration:"none", color:"#888" }}>Cart</Link>
          <Link to="/account" onClick={() => setMobileMenuOpen(false)} style={{ fontSize:"1rem", textDecoration:"none", color:"#888" }}>Account</Link>
        </div>
      </div>

      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '3rem 5%'}}>
        <h1 className="serif" style={{fontSize: '2.2rem', marginBottom: '0.5rem'}}>Saved Items</h1>
        <p style={{color: 'var(--text-muted)', marginBottom: '3rem'}}>{wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved</p>
        
        {wishlist.length === 0 ? (
          <div style={{textAlign: 'center', padding: '5rem 0'}}>
            <p style={{color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem'}}>No saved items yet.</p>
            <Link to="/"><button className="filled-btn">Browse Collection</button></Link>
          </div>
        ) : (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem'}}>
            {wishlist.map(item => (
              <div key={item.id} style={{position: 'relative'}}>
                <Link to={`/product/${item.product?.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                  <div style={{aspectRatio: '3/4', backgroundImage: `url(${item.product?.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '4px', marginBottom: '1rem'}}></div>
                  <h3 style={{fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.3rem'}}>{item.product?.name}</h3>
                  <div style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>${item.product?.price?.toFixed(2)}</div>
                </Link>
                <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}>
                  <button className="filled-btn" style={{flex: 1, padding: '0.6rem', fontSize: '0.8rem'}} onClick={() => { addToCart(item.product.id, item.product.sizes?.[0] || '', item.product.colors?.[0] || '', 1); }}>Add to Bag</button>
                  <button onClick={() => toggleWishlist(item.product.id)} style={{padding: '0.6rem 1rem', border: '1px solid #ddd', background: 'transparent', cursor: 'pointer', borderRadius: '2px', color: 'var(--error)', fontSize: '0.8rem'}}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
