import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useStore();

  return (
    <div style={{minHeight: '100vh', backgroundColor: 'var(--bg-primary)', fontFamily: 'Inter, sans-serif'}}>
      <nav style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 5%', borderBottom: '1px solid rgba(0,0,0,0.06)'}}>
        <Link to="/" className="logo" style={{textDecoration: 'none', color: 'var(--text-main)'}}>MEN'S</Link>
        <div style={{display: 'flex', gap: '2rem', fontSize: '0.9rem'}}>
          <Link to="/" style={{textDecoration: 'none', color: 'var(--text-muted)'}}>Shop</Link>
          <Link to="/cart" style={{textDecoration: 'none', color: 'var(--text-muted)'}}>Cart</Link>
          <Link to="/account" style={{textDecoration: 'none', color: 'var(--text-muted)'}}>My Account</Link>
        </div>
      </nav>

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
