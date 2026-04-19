import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { getPremiumImage } from '../utils/imageUtils';

export default function Cart() {
  const { cart, removeFromCart, updateCart, cartTotal } = useStore();

  return (
    <div style={{minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', fontFamily: "'Montserrat', sans-serif"}}>
      {/* Nav */}
      <nav style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 5%', borderBottom: '1px solid rgba(255,255,255,0.06)'}}>
        <Link to="/" className="logo" style={{textDecoration: 'none', color: 'var(--text-main)', letterSpacing: '13px', fontSize: '1.2rem', fontFamily: "'Cormorant Garamond', serif"}}>VOGUE</Link>
        <div style={{display: 'flex', gap: '2rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px'}}>
          <Link to="/" style={{textDecoration: 'none', color: 'var(--text-muted)'}}>Continue Shopping</Link>
          <Link to="/wishlist" style={{textDecoration: 'none', color: 'var(--text-muted)'}}>Wishlist</Link>
          <Link to="/account" style={{textDecoration: 'none', color: 'var(--text-muted)'}}>My Account</Link>
        </div>
      </nav>

      <div style={{maxWidth: '1100px', margin: '0 auto', padding: '3rem 5%'}}>
        <h1 className="serif" style={{fontSize: '2.2rem', marginBottom: '0.5rem', fontFamily: "'Cormorant Garamond', serif"}}>Shopping Bag</h1>
        <p style={{color: 'var(--text-muted)', marginBottom: '3rem', letterSpacing: '1px'}}>{cart.length} item{cart.length !== 1 ? 's' : ''} in your bag</p>
        
        {cart.length === 0 ? (
           <div style={{textAlign: 'center', padding: '5rem 0'}}>
             <p style={{color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem', letterSpacing: '1px'}}>Your shopping bag is empty.</p>
             <Link to="/"><button className="filled-btn" style={{padding: '1rem 3rem'}}>Start Shopping</button></Link>
          </div>
        ) : (
          <div style={{display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem', alignItems: 'start'}}>
            {/* Items */}
            <div>
              {cart.map(item => (
                <div key={item.id} style={{display: 'flex', gap: '1.5rem', padding: '1.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)'}}>
                  <div style={{width: '120px', height: '150px', backgroundImage: `url(${getPremiumImage(item.product)})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '4px', flexShrink: 0}}></div>
                  <div style={{flex: 1}}>
                    <h3 style={{fontFamily: "'Montserrat', sans-serif", fontWeight: 400, fontSize: '1.1rem', marginBottom: '0.3rem'}}>{item.product?.name}</h3>
                    <p style={{color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem'}}>Size: {item.size || '—'} &nbsp;·&nbsp; Color: {item.color || '—'}</p>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <button onClick={() => updateCart(item.id, Math.max(1, item.quantity - 1))} style={{width: '32px', height: '32px', border: '1px solid #333', color: '#f0ede6', background: 'transparent', cursor: 'pointer', borderRadius: '2px'}}>−</button>
                      <span style={{width: '40px', textAlign: 'center', fontWeight: 500}}>{item.quantity}</span>
                      <button onClick={() => updateCart(item.id, Math.min(item.product?.stock || 99, item.quantity + 1))} style={{width: '32px', height: '32px', border: '1px solid #333', color: '#f0ede6', background: 'transparent', cursor: 'pointer', borderRadius: '2px'}}>+</button>
                    </div>
                  </div>
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between'}}>
                    <span style={{fontWeight: 300, fontSize: '1.2rem'}}>₹{(item.product?.price * item.quantity).toLocaleString()}</span>
                    <button onClick={() => removeFromCart(item.id)} style={{background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase'}}>Remove</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{backgroundColor: 'var(--bg-card)', border: '1px solid #1a1a1a', padding: '2rem', borderRadius: '4px', position: 'sticky', top: '2rem'}}>
              <h3 style={{fontFamily: "'Montserrat', sans-serif", fontWeight: 300, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.85rem'}}>Order Summary</h3>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '0.85rem', letterSpacing: '0.5px'}}>
                <span style={{color: 'var(--text-muted)'}}>Subtotal</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '0.9rem'}}>
                <span style={{color: 'var(--text-muted)'}}>Shipping</span>
                <span style={{color: '#4a7c59'}}>FREE</span>
              </div>
              <hr style={{border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '1.5rem 0'}}/>
              <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 300, fontSize: '1.3rem', marginBottom: '2rem'}}>
                <span>Total</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <Link to="/checkout">
                <button className="filled-btn" style={{width: '100%', padding: '1rem'}}>Proceed to Checkout</button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
