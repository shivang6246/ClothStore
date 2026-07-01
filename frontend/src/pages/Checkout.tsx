import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useStore } from '../context/StoreContext';
import { getPremiumImage } from '../utils/imageUtils';

export default function Checkout() {
  const { cart, cartTotal, fetchCart } = useStore();
  const navigate = useNavigate();

  const [address, setAddress] = useState({ fullName: '', street: '', city: '', state: '', zipCode: '' });
  const [loading, setLoading] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  const discount = appliedCoupon?.discount ?? 0;
  const finalTotal = Math.max(0, cartTotal - discount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    setAppliedCoupon(null);
    try {
      const res = await api.get(`/api/coupons/validate?code=${encodeURIComponent(couponCode.trim())}&total=${cartTotal}`);
      setAppliedCoupon(res.data);
    } catch (e: any) {
      setCouponError(e.response?.data?.error || 'Invalid coupon code.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/checkout/process', { ...address, paymentToken: 'tok_mock_123' });
      // Apply coupon usage if used
      if (appliedCoupon?.code) {
        await api.post(`/api/coupons/apply?code=${encodeURIComponent(appliedCoupon.code)}`).catch(() => {});
      }
      await fetchCart();
      navigate('/account');
    } catch {
      alert('Failed to process checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <h2 className="serif" style={{ marginBottom: '1rem' }}>Your bag is empty</h2>
        <Link to="/"><button className="filled-btn">Continue Shopping</button></Link>
      </div>
    );
  }

  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#888', fontFamily: "'Montserrat', sans-serif" };
  const inputStyle: React.CSSProperties = { backgroundColor: 'transparent', color: '#f0ede6', border: '1px solid #333' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: '#f0ede6', fontFamily: 'Inter, sans-serif' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 5%', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'var(--text-main)', letterSpacing: '13px', fontSize: '1.2rem' }}>VOGUE</Link>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: "'Montserrat', sans-serif", letterSpacing: '2px', textTransform: 'uppercase' }}>Secure Checkout</div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 5%' }}>
        <h1 className="serif" style={{ fontSize: '2.2rem', marginBottom: '3rem' }}>Checkout</h1>

        <div className="checkout-grid">
          {/* Left: Address + Coupon */}
          <form onSubmit={handleCheckout}>
            <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.85rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Shipping Address</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input required className="input-field" style={inputStyle} value={address.fullName} onChange={e => setAddress({ ...address, fullName: e.target.value })} placeholder="John Doe" />
              </div>
              <div>
                <label style={labelStyle}>Street Address</label>
                <input required className="input-field" style={inputStyle} value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} placeholder="123 Main St" />
              </div>
              <div className="grid-2" style={{ gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>City</label>
                  <input required className="input-field" style={inputStyle} value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder="New Delhi" />
                </div>
                <div>
                  <label style={labelStyle}>State</label>
                  <input required className="input-field" style={inputStyle} value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} placeholder="Delhi" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>ZIP Code</label>
                <input required className="input-field" style={{ ...inputStyle, maxWidth: '200px' }} value={address.zipCode} onChange={e => setAddress({ ...address, zipCode: e.target.value })} placeholder="110001" />
              </div>
            </div>

            {/* Coupon Section */}
            <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.85rem', margin: '2.5rem 0 1rem', color: 'var(--text-muted)' }}>Coupon Code</h3>
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <input
                  value={couponCode}
                  onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); setAppliedCoupon(null); }}
                  placeholder="e.g. SAVE20"
                  disabled={!!appliedCoupon}
                  className="input-field"
                  style={{ ...inputStyle, textTransform: 'uppercase', letterSpacing: '2px', fontFamily: "'Montserrat', sans-serif" }}
                />
                {couponError && <p style={{ color: '#e74c3c', fontSize: '0.78rem', marginTop: 6, fontFamily: "'Montserrat', sans-serif" }}>{couponError}</p>}
                {appliedCoupon && (
                  <p style={{ color: '#27ae60', fontSize: '0.78rem', marginTop: 6, fontFamily: "'Montserrat', sans-serif" }}>
                    ✓ {appliedCoupon.code} — ₹{appliedCoupon.discount.toFixed(0)} off! {appliedCoupon.description && `(${appliedCoupon.description})`}
                  </p>
                )}
              </div>
              {appliedCoupon ? (
                <button type="button" onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                  style={{ padding: '0.7rem 1.2rem', background: 'transparent', border: '0.5px solid #333', color: '#888', cursor: 'pointer', fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                  Remove
                </button>
              ) : (
                <button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode}
                  style={{ padding: '0.7rem 1.4rem', background: couponCode ? '#c9a96e' : 'transparent', border: '0.5px solid #c9a96e', color: couponCode ? '#0a0a0a' : '#555', cursor: couponCode ? 'pointer' : 'not-allowed', fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase', whiteSpace: 'nowrap', transition: 'all 0.25s' }}>
                  {couponLoading ? '...' : 'Apply'}
                </button>
              )}
            </div>

            {/* Payment */}
            <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.85rem', margin: '2.5rem 0 1rem', color: 'var(--text-muted)' }}>Payment</h3>
            <div style={{ padding: '1.2rem', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '4px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem', fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.5px' }}>
              🔒 Test mode — no real payment will be charged.
            </div>

            <button type="submit" disabled={loading} className="filled-btn" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
              {loading ? 'Processing Order...' : `Place Order · ₹${finalTotal.toLocaleString()}`}
            </button>
          </form>

          {/* Right: Order Summary */}
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', position: 'sticky', top: '2rem' }}>
            <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.85rem', marginBottom: '1.5rem' }}>In Your Bag</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map(i => (
                <div key={i.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '50px', height: '65px', backgroundImage: `url(${getPremiumImage(i.product)})`, backgroundSize: 'cover', borderRadius: '3px', flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 300, fontSize: '1rem' }}>{i.product?.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem' }}>Qty: {i.quantity}</div>
                  </div>
                  <div style={{ fontWeight: 400, fontSize: '0.9rem' }}>₹{(i.product?.price * i.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.5rem 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#27ae60' }}>
                  <span>Discount ({appliedCoupon?.code})</span><span>−₹{discount.toFixed(0)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Shipping</span><span style={{ color: '#27ae60' }}>Free</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.4rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 400, fontSize: '1.2rem' }}>
                <span>Total</span><span>₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
