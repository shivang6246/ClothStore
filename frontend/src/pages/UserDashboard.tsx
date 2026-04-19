import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const STATUS_STEPS = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const STATUS_LABELS: Record<string, string> = {
  PAID: 'Order Placed', PROCESSING: 'Processing', SHIPPED: 'Shipped', DELIVERED: 'Delivered'
};
const STATUS_ICONS: Record<string, string> = {
  PAID: '✓', PROCESSING: '⚙', SHIPPED: '🚚', DELIVERED: '📦'
};

function statusColor(status: string) {
  switch (status) {
    case 'PAID': return '#3b82f6';
    case 'PROCESSING': return '#f59e0b';
    case 'SHIPPED': return '#8b5cf6';
    case 'DELIVERED': return '#22c55e';
    case 'CANCELLED': return '#ef4444';
    default: return '#666';
  }
}

function StatusStepper({ status }: { status: string }) {
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, margin: '1.5rem 0 1rem', overflow: 'auto' }}>
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80, gap: 4 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: 700,
                backgroundColor: done ? statusColor(step) : 'rgba(255,255,255,0.05)',
                color: done ? 'white' : '#444',
                border: active ? `2px solid ${statusColor(step)}` : done ? 'none' : '1px solid #2a2a2a',
                boxShadow: active ? `0 0 12px ${statusColor(step)}55` : 'none',
                transition: 'all 0.3s',
              }}>
                {done ? STATUS_ICONS[step] : i + 1}
              </div>
              <span style={{
                fontSize: '0.6rem', textAlign: 'center', letterSpacing: '0.5px', textTransform: 'uppercase',
                color: done ? '#fff' : '#444', fontWeight: active ? 700 : 400, whiteSpace: 'nowrap'
              }}>{STATUS_LABELS[step]}</span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, backgroundColor: i < currentIdx ? statusColor(STATUS_STEPS[i + 1]) : '#1a1a1a', transition: 'background-color 0.4s', margin: '0 4px', marginBottom: 20 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order, onCancelled }: { order: any; onCancelled: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Cancel order #${order.id}? This cannot be undone.`)) return;
    setCancelling(true);
    try {
      await api.put(`/api/checkout/orders/${order.id}/cancel`);
      onCancelled();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Could not cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  const isCancelled = order.status === 'CANCELLED';

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)', border: '1px solid #1a1a1a', borderRadius: 6,
      overflow: 'hidden', transition: 'box-shadow 0.3s',
      boxShadow: expanded ? '0 4px 32px rgba(0,0,0,0.4)' : 'none',
    }}>
      {/* Header Row */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer', userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: 2, fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem' }}>
              Order #{order.id}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              &nbsp;·&nbsp; {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 300, fontSize: '1.2rem' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</div>
            <span style={{
              padding: '0.25rem 0.7rem', borderRadius: 3, fontSize: '0.6rem', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '1px',
              backgroundColor: statusColor(order.status) + '18',
              color: statusColor(order.status),
              border: `0.5px solid ${statusColor(order.status)}40`,
            }}>{order.status}</span>
          </div>
          {/* Cancel button — only for PAID orders */}
          {order.status === 'PAID' && (
            <button onClick={handleCancel} disabled={cancelling}
              style={{ padding: '0.4rem 1rem', background: 'transparent', border: '1px solid #ef444455', color: '#ef4444', cursor: 'pointer', borderRadius: 3, fontSize: '0.7rem', fontFamily: "'Montserrat',sans-serif", letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.2s', flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.background = '#ef444415'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
              {cancelling ? '...' : 'Cancel'}
            </button>
          )}
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', transition: 'transform 0.3s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}>▼</div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div style={{ borderTop: '1px solid #1a1a1a', padding: '1.5rem', animation: 'fadeIn 0.25s ease' }}>
          {isCancelled ? (
            <div style={{ padding: '1.2rem', background: '#ef444410', border: '1px solid #ef444430', borderRadius: 6, color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
              ✕ This order has been cancelled. Refund (if any) will be processed within 5–7 business days.
            </div>
          ) : (
            <StatusStepper status={order.status} />
          )}

          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {order.items?.map((item: any) => (
              <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                  width: 64, height: 80, borderRadius: 4, flexShrink: 0,
                  backgroundImage: `url(${item.product?.imageUrl})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  backgroundColor: '#111',
                }} />
                <div style={{ flex: 1 }}>
                  <Link to={`/product/${item.product?.id}`} style={{ textDecoration: 'none', color: 'var(--accent)', fontWeight: 500, fontSize: '0.9rem' }}>
                    {item.product?.name}
                  </Link>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3, letterSpacing: '0.5px' }}>
                    Size: {item.size} &nbsp;·&nbsp; Color: {item.color} &nbsp;·&nbsp; Qty: {item.quantity}
                  </div>
                </div>
                <div style={{ fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          {/* Address */}
          {order.address && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#0f0f0f', borderRadius: 4, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 4, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Delivery Address</div>
              {order.address.fullName} · {order.address.street}, {order.address.city}, {order.address.state} {order.address.zipCode}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function UserDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = localStorage.getItem('role') === 'ADMIN';
  const fullName = localStorage.getItem('fullName') || 'User';
  const email = localStorage.getItem('email') || '';

  const fetchOrders = () => {
    api.get('/api/checkout/orders')
      .then(res => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', fontFamily: "'Montserrat', sans-serif" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 5%', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-main)', letterSpacing: '13px', fontSize: '1.2rem', fontFamily: "'Cormorant Garamond', serif" }}>VOGUE</Link>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>Shop</Link>
          <Link to="/cart" style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>Bag</Link>
          <Link to="/wishlist" style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>Wishlist</Link>
          {isAdmin && <Link to="/admin" style={{ textDecoration: 'none', color: 'var(--accent)', fontWeight: 600 }}>Admin Panel</Link>}
          <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #333', padding: '0.4rem 1rem', color: 'var(--text-main)', borderRadius: 2, cursor: 'pointer', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 5%' }}>
        {/* Profile Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-gold), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', fontWeight: 700, color: 'white', boxShadow: '0 4px 20px rgba(201,169,110,0.3)',
          }}>
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: '2.4rem', marginBottom: 4, fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}>{fullName}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '1px', margin: 0 }}>{email}</p>
          </div>
        </div>

        {/* Stats Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '3rem' }}>
          {[
            { label: 'Total Orders', value: orders.length },
            { label: 'Delivered', value: orders.filter(o => o.status === 'DELIVERED').length },
            { label: 'Total Spent', value: '₹' + orders.reduce((s, o) => s + (o.totalAmount || 0), 0).toLocaleString('en-IN') },
          ].map(stat => (
            <div key={stat.label} style={{ padding: '1.2rem 1.5rem', backgroundColor: 'var(--bg-card)', border: '1px solid #1a1a1a', borderRadius: 4, textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 300, fontFamily: "'Cormorant Garamond', serif", marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <h3 style={{ fontWeight: 300, textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.75rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
          Order History &nbsp;
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>({orders.length})</span>
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍</div>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>No orders yet.</p>
            <Link to="/"><button className="filled-btn">Start Shopping</button></Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map(order => <OrderCard key={order.id} order={order} onCancelled={fetchOrders} />)}
          </div>
        )}
      </div>
    </div>
  );
}
