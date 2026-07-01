import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../services/api';
import chatService from '../services/chatService';

const PREMIUM_BTN: React.CSSProperties = {
  padding: '0.55rem 1.2rem', backgroundColor: '#c9a96e', color: '#0a0a0a',
  border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
  fontFamily: "'Montserrat',sans-serif", textTransform: 'uppercase', letterSpacing: '1.5px',
  borderRadius: 6, transition: 'all 0.2s', whiteSpace: 'nowrap',
};
const GHOST_BTN: React.CSSProperties = {
  padding: '0.55rem 1.2rem', backgroundColor: 'transparent', color: '#888',
  border: '1px solid #1e1e1e', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500,
  fontFamily: "'Inter',sans-serif", borderRadius: 6, transition: 'all 0.2s', whiteSpace: 'nowrap',
};
const GHOST_BTN_SM: React.CSSProperties = {
  padding: '0.35rem 0.75rem', backgroundColor: 'transparent', color: '#666',
  border: '1px solid #1e1e1e', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 500,
  fontFamily: "'Inter',sans-serif", borderRadius: 5, transition: 'all 0.2s', whiteSpace: 'nowrap',
};

interface Product {
  id: number; name: string; description: string; price: number; imageUrl: string;
  category?: string; stock?: number; sizes?: string[]; colors?: string[]; multipleImages?: string[]; inStock?: boolean;
}
interface Coupon {
  id?: number; code: string; discountType: string; discountValue: number;
  minOrderAmount?: number; maxUses?: number; usedCount?: number;
  active?: boolean; expiryDate?: string; description?: string;
}

// ── CSS Bar Chart ─────────────────────────────────────────────────────────────
function BarChart({ data, color = '#c9a96e', label = '₹' }: { data: Record<string, number>; color?: string; label?: string }) {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 130, width: '100%', padding: '0 4px' }}>
      {entries.map(([key, val]) => (
        <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 4 }}
          title={`${key}: ${label}${val > 0 ? (label === '₹' ? val.toFixed(0) : val) : 0}`}>
          <div style={{
            width: '100%', background: `linear-gradient(180deg, ${color}, ${color}88)`,
            opacity: val > 0 ? 1 : 0.08, borderRadius: '3px 3px 0 0',
            height: `${(val / max) * 100}%`, minHeight: val > 0 ? 4 : 0, transition: 'height 0.8s ease',
          }} />
          <span style={{ fontSize: '0.58rem', color: '#888', transform: 'rotate(-45deg)', transformOrigin: 'center', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 22 }}>{key.split(' ')[1] || key}</span>
        </div>
      ))}
    </div>
  );
}

// ── SVG Donut Chart ───────────────────────────────────────────────────────────
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 1);
  let offset = 0;
  const r = 42, cx = 56, cy = 56, circ = 2 * Math.PI * r;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
      <svg width={112} height={112} viewBox="0 0 112 112">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e1e1e" strokeWidth={16} />
        {segments.map((seg, i) => {
          const dash = (seg.value / total) * circ;
          const el = <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={16}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset * circ / total + circ / 4}
            style={{ transition: 'all 0.6s ease' }} />;
          offset += seg.value; return el;
        })}
        <text x={cx} y={cy + 5} textAnchor="middle" fill="#f0ede6" fontSize={18} fontWeight={600} fontFamily="Cormorant Garamond, serif">{total - 1}</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {segments.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
            <span style={{ color: '#aaa' }}>{s.label}</span>
            <span style={{ fontWeight: 700, color: '#f0ede6', marginLeft: 'auto', paddingLeft: '1rem' }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'products' | 'orders' | 'coupons' | 'users' | 'chat'>('dashboard');
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponForm, setCouponForm] = useState<Coupon>({ code: '', discountType: 'PERCENTAGE', discountValue: 10, minOrderAmount: 0, maxUses: 0, active: true, description: '' });
  const [editingCoupon, setEditingCoupon] = useState<number | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<FileList | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [_deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // ── Chat state ────────────────────────────────────────────────────────────
  const [chatConversations, setChatConversations] = useState<any[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatConnected, setChatConnected] = useState(false);
  const [unreadChats, setUnreadChats] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const convoSubRef = useRef<string | null>(null);
  const adminSubRef = useRef<string | null>(null);
  const activeTabRef = useRef(activeTab);

  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

  const isAdmin = localStorage.getItem('role') === 'ADMIN';
  const adminName = localStorage.getItem('fullName') || 'Admin';

  useEffect(() => { 
    if (isAdmin) {
      fetchAll(); 
      initChat();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (activeTab === 'analytics' && !analytics) fetchAnalytics();
    if (activeTab === 'coupons') fetchCoupons();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'chat') setUnreadChats(0);
  }, [activeTab]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, o] = await Promise.all([api.get('/api/products'), api.get('/api/checkout/admin/all')]);
      setProducts(p.data); setOrders(o.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  const fetchAnalytics = async () => { setAnalyticsLoading(true); try { const r = await api.get('/api/admin/analytics'); setAnalytics(r.data); } catch (e) { console.error(e); } finally { setAnalyticsLoading(false); } };
  const fetchCoupons = async () => { try { const r = await api.get('/api/admin/coupons'); setCoupons(r.data); } catch (e) { console.error(e); } };
  const fetchUsers = async () => { setUsersLoading(true); try { const r = await api.get('/api/admin/users'); setUsers(r.data); } catch (e) { console.error(e); } finally { setUsersLoading(false); } };
  const fetchProducts = () => api.get(`/api/products?t=${Date.now()}`).then(r => setProducts(r.data));
  const fetchOrders = () => api.get('/api/checkout/admin/all').then(r => setOrders(r.data));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formatted = {
        ...currentProduct,
        sizes: typeof currentProduct.sizes === 'string' ? (currentProduct.sizes as string).split(',').map(s => s.trim()) : currentProduct.sizes,
        colors: typeof currentProduct.colors === 'string' ? (currentProduct.colors as string).split(',').map(s => s.trim()) : currentProduct.colors,
        stock: parseInt(String(currentProduct.stock ?? 0), 10),
        price: parseFloat(String(currentProduct.price ?? 0)),
      };
      let saved: Product;
      if (currentProduct.id) { const r = await api.put(`/api/products/${currentProduct.id}`, formatted); saved = r.data; }
      else { const r = await api.post('/api/products', { ...formatted, imageUrl: '' }); saved = r.data; }
      if (imageFile && saved.id) {
        const fd = new FormData(); fd.append('file', imageFile);
        await api.post(`/api/products/${saved.id}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      if (additionalImageFiles && additionalImageFiles.length > 0 && saved.id) {
        const mfd = new FormData();
        Array.from(additionalImageFiles).forEach(file => mfd.append('files', file));
        await api.post(`/api/products/${saved.id}/multiple-images`, mfd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setShowModal(false); setImageFile(null); setAdditionalImageFiles(null); setCurrentProduct({}); fetchProducts();
    } catch { alert('Error saving product.'); }
  };

  const handleDelete = async (id: number) => { try { await api.delete(`/api/products/${id}`); fetchProducts(); setDeleteConfirm(null); } catch { alert('Error.'); } };
  const updateStatus = async (id: number, status: string) => { await api.put(`/api/checkout/admin/${id}/status?status=${status}`); fetchOrders(); };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCoupon) await api.put(`/api/admin/coupons/${editingCoupon}`, couponForm);
      else await api.post('/api/admin/coupons', couponForm);
      setShowCouponModal(false); setEditingCoupon(null);
      setCouponForm({ code: '', discountType: 'PERCENTAGE', discountValue: 10, minOrderAmount: 0, maxUses: 0, active: true, description: '' });
      fetchCoupons();
    } catch (e: any) { alert(e.response?.data?.error || 'Error saving coupon.'); }
  };
  const handleToggleCoupon = async (id: number) => { await api.patch(`/api/admin/coupons/${id}/toggle`); fetchCoupons(); };
  const handleDeleteCoupon = async (id: number) => { if (confirm('Delete this coupon?')) { await api.delete(`/api/admin/coupons/${id}`); fetchCoupons(); } };
  const handlePromoteUser = async (id: number, currentRole: string) => {
    const isCurrentlyAdmin = currentRole?.toUpperCase() === 'ADMIN';
    const newRole = isCurrentlyAdmin ? 'CUSTOMER' : 'ADMIN';
    
    if (!confirm(`Change role from ${currentRole} to ${newRole}?`)) return;
    
    try {
      const res = await api.patch(`/api/admin/users/${id}/role?role=${newRole}`);
      alert(res.data.message || `User successfully changed to ${newRole}`);
      fetchUsers();
    } catch (e: any) {
      console.error('Promotion failed:', e);
      alert(e.response?.data?.message || 'Failed to update user role.');
    }
  };
  const handleDeleteUser = async (id: number) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      const res = await api.delete(`/api/admin/users/${id}`);
      alert(res.data.message || 'User deleted successfully.');
      fetchUsers();
    } catch (e: any) {
      console.error('Delete failed:', e);
      alert(e.response?.data?.message || 'Failed to delete user.');
    }
  };
  const handleBulkRestock = async () => {
    if (!window.confirm("Set all products to 50 units stock?")) return;
    try {
      await api.post('/api/products/bulk-restock');
      fetchProducts();
      setAnalytics(null); // Force analytics to re-fetch on next visit
    } catch {
      alert("Failed to restock.");
    }
  };

  const handleFixImages = async () => {
    if (!window.confirm("Replace all broken/outdated images with high-quality stock photos?")) return;
    setLoading(true);
    try {
      await api.post('/api/products/fix-images');
      fetchProducts();
      alert("Success! High-end fashion images have been applied.");
      window.location.reload(); // Hard refresh to clear any cached random images
    } catch {
      alert("Failed to fix images.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { localStorage.clear(); window.location.href = '/login'; };

  // ── Chat functions ──────────────────────────────────────────────────────
  const scrollChatToBottom = useCallback(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  const initChat = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await chatService.connect(token);
      setChatConnected(true);

      // Load conversation list
      const res = await api.get('/api/chat/conversations');
      setChatConversations(res.data);

      // Subscribe to admin notifications for new messages
      if (adminSubRef.current) chatService.unsubscribe(adminSubRef.current);
      adminSubRef.current = chatService.subscribe('/topic/admin/conversations', (msg: any) => {
        // Increment unread if not on chat tab or if on chat tab but not this convo
        if (activeTabRef.current !== 'chat' && !msg.fromAdmin) {
          setUnreadChats(prev => prev + 1);
        }

        // Update conversation list
        setChatConversations((prev) => {
          const existing = prev.findIndex((c) => c.conversationEmail === msg.conversationEmail);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = msg;
            // Move to top
            updated.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            return updated;
          }
          return [msg, ...prev];
        });
        // If this convo is selected, add message to chat
        setChatMessages((prev) => {
          if (msg.id && prev.some((m: any) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        scrollChatToBottom();
      });
    } catch (e) {
      console.error('Chat init failed:', e);
    }
  };

  const selectConversation = async (email: string) => {
    setSelectedConvo(email);
    if (!email) return;
    try {
      const res = await api.get(`/api/chat/history/${email}`);
      setChatMessages(res.data);
      scrollChatToBottom();

      // Subscribe to this conversation
      if (convoSubRef.current) chatService.unsubscribe(convoSubRef.current);
      convoSubRef.current = chatService.subscribe(`/topic/conversation/${email}`, (msg: any) => {
        setChatMessages((prev) => {
          if (msg.id && prev.some((m: any) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        scrollChatToBottom();
      });

      setTimeout(() => chatInputRef.current?.focus(), 100);
    } catch (e) {
      console.error('Failed to load conversation:', e);
    }
  };

  const sendAdminReply = () => {
    const text = chatInput.trim();
    if (!text || !selectedConvo || !chatConnected) return;
    chatService.sendMessage('/app/chat.send', {
      conversationEmail: selectedConvo,
      content: text,
      fromAdmin: true,
    });
    setChatInput('');
    chatInputRef.current?.focus();
  };

  const formatChatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' ' +
        d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch { return ''; }
  };

  if (!isAdmin) return <Navigate to="/" />;

  const totalRevenue = orders.reduce((a: number, o: any) => a + (o.totalAmount || 0), 0);
  const paidOrders = orders.filter((o: any) => o.status === 'PAID').length;
  const shippedOrders = orders.filter((o: any) => o.status === 'SHIPPED').length;
  const deliveredOrders = orders.filter((o: any) => o.status === 'DELIVERED').length;
  const lowStock = products.filter(p => (p.stock || 0) <= 5).length;

  const filteredProducts = products.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.category?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredOrders = orderFilter === 'ALL' ? orders : orders.filter((o: any) => o.status === orderFilter);

  const STATUS_COLORS: Record<string, string> = { PAID: '#3b82f6', SHIPPED: '#f59e0b', DELIVERED: '#22c55e', PENDING: '#888' };

  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { key: 'analytics', label: 'Analytics', icon: '∿' },
    { key: 'products', label: 'Products', icon: '◫' },
    { key: 'orders', label: 'Orders', icon: '◻' },
    { key: 'users', label: 'Users', icon: '□' },
    { key: 'coupons', label: 'Coupons', icon: '⊕' },
    { key: 'chat', label: 'Chat', icon: '◎' },
  ] as const;

  // ── Shared styles ──────────────────────────────────────────────────────────
  const CARD = { background: '#141414', border: '1px solid #1e1e1e', borderRadius: 12, padding: '1.6rem' };
  const LABEL: React.CSSProperties = { display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#555', marginBottom: '0.4rem' };
  const INPUT: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', background: '#0d0d0d', border: '1px solid #222', borderRadius: 8, color: '#f0ede6', fontSize: '0.88rem', fontFamily: "'Inter',sans-serif", boxSizing: 'border-box', outline: 'none' };
  const MODAL_OVERLAY: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' };
  const MODAL_BOX: React.CSSProperties = { background: '#111', border: '1px solid #1e1e1e', borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' };

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', display: 'flex', background: '#0a0a0a', fontFamily: "'Inter', sans-serif", color: '#f0ede6' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .ap-fade { animation: fadeUp 0.35s ease both; }
        .ap-row:hover td { background: #111 !important; }
        .ap-nav-btn:hover { background: rgba(201,169,110,0.06) !important; color: #c9a96e !important; }
        input:focus, select:focus, textarea:focus { border-color: #c9a96e !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #1e1e1e; border-radius: 4px; }
      `}</style>

      {/* ═══════ SIDEBAR ═══════ */}
      <aside className="admin-sidebar">

        {/* Brand */}
        <div className="admin-sidebar-header" style={{ padding: '2rem 1.5rem 1.5rem', borderBottom: '1px solid #141414' }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.5rem', fontWeight: 300, letterSpacing: 10, color: '#f0ede6', marginBottom: 2 }}>VOGUE</div>
          <div style={{ fontSize: '0.6rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#666' }}>Admin Portal</div>
        </div>

        {/* User */}
        <div className="admin-sidebar-user" style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid #141414', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a96e,#7c5a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#0a0a0a', flexShrink: 0 }}>
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 500, color: '#e0ddd6' }}>{adminName}</div>
            <div style={{ fontSize: '0.6rem', color: '#777', letterSpacing: '1px', textTransform: 'uppercase', marginTop: 1 }}>Administrator</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.7rem' }}>
          <div style={{ fontSize: '0.58rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#666', padding: '0 0.8rem', marginBottom: '0.5rem' }}>Navigation</div>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="ap-nav-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.7rem', width: '100%',
                padding: '0.7rem 0.8rem', border: 'none', borderRadius: 8,
                background: activeTab === tab.key ? 'rgba(201,169,110,0.10)' : 'transparent',
                color: activeTab === tab.key ? '#c9a96e' : '#555',
                cursor: 'pointer', fontSize: '0.82rem', fontWeight: activeTab === tab.key ? 600 : 400,
                fontFamily: "'Inter',sans-serif", textAlign: 'left', marginBottom: 2,
                transition: 'all 0.15s',
                borderLeft: activeTab === tab.key ? '2px solid #c9a96e' : '2px solid transparent',
              }}>
              <span style={{ width: 18, textAlign: 'center', opacity: activeTab === tab.key ? 1 : 0.4, fontSize: '1rem' }}>{tab.icon}</span>
              {tab.label}
              {tab.key === 'orders' && paidOrders > 0 && (
                <span style={{ marginLeft: 'auto', background: '#c0392b', color: 'white', padding: '0.1rem 0.4rem', borderRadius: 8, fontSize: '0.6rem', fontWeight: 700 }}>{paidOrders}</span>
              )}
              {tab.key === 'chat' && unreadChats > 0 && (
                <span style={{ marginLeft: 'auto', background: '#c9a96e', color: '#0a0a0a', padding: '0.1rem 0.4rem', borderRadius: 8, fontSize: '0.6rem', fontWeight: 700 }}>{unreadChats}</span>
              )}
            </button>
          ))}
          
          <Link to="/" className="mobile-only-btn" style={{ textDecoration: 'none', color: '#777', fontSize: '0.7rem', fontWeight: 500, padding: '0.5rem 0.8rem', borderBottom: '2px solid transparent', whiteSpace: 'nowrap' }}>
            View Store
          </Link>
          <button onClick={handleLogout} className="mobile-only-btn" style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.7rem', fontWeight: 600, padding: '0.5rem 0.8rem', borderBottom: '2px solid transparent', whiteSpace: 'nowrap', cursor: 'pointer' }}>
            Logout
          </button>
        </nav>

        {/* Footer links */}
        <div className="admin-sidebar-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid #141414', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#777', textDecoration: 'none', fontSize: '0.78rem', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f0ede6')} onMouseLeave={e => (e.currentTarget.style.color = '#777')}>
            <span>↗</span> View Store
          </Link>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', background: 'none', border: 'none', color: '#777', cursor: 'pointer', fontSize: '0.78rem', padding: 0, fontFamily: "'Inter',sans-serif", transition: 'color 0.15s', textAlign: 'left' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')} onMouseLeave={e => (e.currentTarget.style.color = '#777')}>
            <span>→</span> Sign Out
          </button>
        </div>
      </aside>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <main className="admin-main">

        {/* Page header */}
        <div className="flex-stack" style={{ justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.6rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#888', marginBottom: 4 }}>Admin Panel</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.8rem', fontWeight: 300, margin: 0, color: '#f0ede6', letterSpacing: 1 }}>
              {activeTab === 'dashboard' ? 'Dashboard'
                : activeTab === 'analytics' ? 'Analytics'
                : activeTab === 'products' ? 'Products'
                : activeTab === 'orders' ? 'Orders'
                : activeTab === 'users' ? 'Users'
                : activeTab === 'chat' ? 'Live Chat'
                : 'Coupons'}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {activeTab === 'dashboard' && <button onClick={fetchAll} style={{...GHOST_BTN, padding: '0.5rem 1rem', fontSize: '0.7rem'}}>↻ Refresh</button>}
            {activeTab === 'products' && (
              <button onClick={() => { setCurrentProduct({ stock: 0 }); setShowModal(true); }} style={{...PREMIUM_BTN, padding: '0.5rem 1rem', fontSize: '0.7rem'}}>+ Add Product</button>
            )}
            {activeTab === 'coupons' && (
              <button onClick={() => { setEditingCoupon(null); setCouponForm({ code: '', discountType: 'PERCENTAGE', discountValue: 10, minOrderAmount: 0, maxUses: 0, active: true, description: '' }); setShowCouponModal(true); }} style={{...PREMIUM_BTN, padding: '0.5rem 1rem', fontSize: '0.7rem'}}>+ New Coupon</button>
            )}
            {activeTab === 'analytics' && <button onClick={fetchAnalytics} style={{...GHOST_BTN, padding: '0.5rem 1rem', fontSize: '0.7rem'}}>↻ Refresh</button>}
            {activeTab === 'users' && <button onClick={fetchUsers} style={{...GHOST_BTN, padding: '0.5rem 1rem', fontSize: '0.7rem'}}>↻ Refresh</button>}
          </div>
        </div>

        {/* Gold divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg,#c9a96e44,transparent)', marginBottom: '2.5rem' }} />

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '1rem', color: '#333' }}>
            <div style={{ width: 28, height: 28, border: '2px solid #1a1a1a', borderTopColor: '#c9a96e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: '0.72rem', letterSpacing: '3px', textTransform: 'uppercase' }}>Loading</span>
          </div>
        ) : (
          <>
            {/* ══ DASHBOARD ══ */}
            {activeTab === 'dashboard' && (
              <div className="ap-fade">
                {/* KPI Cards */}
                <div className="grid-4" style={{ marginBottom: '2rem' }}>
                  {[
                    { label: 'Total Products', value: products.length, sub: 'In catalog', color: '#3b82f6', icon: '◫' },
                    { label: 'Total Orders', value: orders.length, sub: 'All time', color: '#c9a96e', icon: '◻' },
                    { label: 'Revenue', value: `₹${totalRevenue.toFixed(0)}`, sub: 'Gross earnings', color: '#22c55e', icon: '₹' },
                    { label: 'Low Stock', value: lowStock, sub: 'Items ≤ 5 units', color: lowStock > 0 ? '#ef4444' : '#22c55e', icon: '!' },
                  ].map((k, i) => (
                    <div key={i} className="dashboard-card" style={CARD}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${k.color},transparent)` }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', fontWeight: 600 }}>{k.label}</span>
                        <span style={{ width: 24, height: 24, borderRadius: '50%', background: k.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: k.color }}>{k.icon}</span>
                      </div>
                      <div style={{ fontSize: '2.2rem', fontWeight: 700, color: k.color, fontFamily: "'Cormorant Garamond',serif", letterSpacing: 1, lineHeight: 1 }}>{k.value}</div>
                      <div style={{ fontSize: '0.65rem', color: '#555', marginTop: 4 }}>{k.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Status strip */}
                <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
                  {[{ label: 'Paid', count: paidOrders, color: '#3b82f6' }, { label: 'Shipped', count: shippedOrders, color: '#f59e0b' }, { label: 'Delivered', count: deliveredOrders, color: '#22c55e' }].map((s, i) => (
                    <div key={i} className="status-card" style={CARD}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color, fontFamily: "'Cormorant Garamond',serif", lineHeight: 1 }}>{s.count}</div>
                        <div style={{ fontSize: '0.65rem', color: '#777', marginTop: 2 }}>{s.label} Orders</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick actions */}
                <div className="flex-stack" style={{ ...CARD, gap: '0.8rem', padding: '1.2rem' }}>
                  <span style={{ fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#666', fontWeight: 600, marginRight: '0.5rem' }}>Quick Actions</span>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setActiveTab('analytics')} style={{ ...PREMIUM_BTN, padding: '0.5rem 1rem', fontSize: '0.7rem' }}>📈 Analytics</button>
                    <button onClick={handleBulkRestock} style={{ ...GHOST_BTN, padding: '0.5rem 1rem', fontSize: '0.7rem', borderColor: '#333' }}>⚡ Bulk Restock</button>
                    <button onClick={handleFixImages} style={{ ...GHOST_BTN, color: '#c9a96e', borderColor: '#c9a96e44', padding: '0.5rem 1rem', fontSize: '0.7rem' }}>🖼️ Repair Images</button>
                    <button onClick={() => setActiveTab('coupons')} style={{ ...PREMIUM_BTN, padding: '0.5rem 1rem', fontSize: '0.7rem' }}>🏷 Coupons</button>
                    <button onClick={handleBulkRestock} style={{ ...PREMIUM_BTN, background: '#3b82f6', padding: '0.5rem 1rem', fontSize: '0.7rem' }}>📦 Restock All</button>
                    <button onClick={() => setActiveTab('orders')} style={{ ...GHOST_BTN, padding: '0.5rem 1rem', fontSize: '0.7rem' }}>Orders ({paidOrders} pending)</button>
                  </div>
                </div>
              </div>
            )}

            {/* ══ ANALYTICS ══ */}
            {activeTab === 'analytics' && (
              <div className="ap-fade">
                {analyticsLoading ? (
                  <div style={{ textAlign: 'center', padding: '5rem', color: '#333' }}>
                    <div style={{ width: 28, height: 28, border: '2px solid #1a1a1a', borderTopColor: '#c9a96e', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                    <div style={{ fontSize: '0.7rem', letterSpacing: 3, textTransform: 'uppercase' }}>Analysing data</div>
                  </div>
                ) : analytics ? (
                  <>
                    {/* KPI Strip */}
                    <div className="grid-5" style={{ marginBottom: '2rem' }}>
                      {[
                        { label: 'Revenue', value: `₹${analytics.totalRevenue?.toLocaleString()}`, color: '#22c55e' },
                        { label: 'Orders', value: analytics.totalOrders, color: '#3b82f6' },
                        { label: 'Avg Order', value: `₹${analytics.avgOrderValue?.toFixed(0)}`, color: '#c9a96e' },
                        { label: 'Customers', value: analytics.totalUsers, color: '#8b5cf6' },
                        { label: 'Products', value: analytics.totalProducts, color: '#f59e0b' },
                      ].map((k, i) => (
                        <div key={i} style={{ ...CARD, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${k.color},transparent)` }} />
                          <span style={{ fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#999', marginBottom: 6 }}>{k.label}</span>
                          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: k.color, fontFamily: "'Cormorant Garamond',serif" }}>{k.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                      <div style={CARD}>
                        <div style={{ fontSize: '0.65rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#aaa', fontWeight: 600, marginBottom: '1.2rem' }}>Revenue — Last 14 Days</div>
                        <BarChart data={analytics.revenueByDay ?? {}} color="#c9a96e" label="₹" />
                      </div>
                      <div style={CARD}>
                        <div style={{ fontSize: '0.65rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#aaa', fontWeight: 600, marginBottom: '1.2rem' }}>Orders — Last 14 Days</div>
                        <BarChart data={analytics.ordersByDay ?? {}} color="#3b82f6" label="" />
                      </div>
                    </div>

                    <div className="grid-2">
                      {/* Top products */}
                      <div style={CARD}>
                        <div style={{ fontSize: '0.65rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#aaa', fontWeight: 600, marginBottom: '1.2rem' }}>Top Selling Products</div>
                        {(analytics.topProducts ?? []).length === 0 ? (
                          <p style={{ color: '#333', fontSize: '0.85rem' }}>No sales data yet.</p>
                        ) : (
                          <div className="admin-table-wrapper">
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                                {['Product', 'Units', 'Revenue'].map((h, i) => (
                                  <th key={h} style={{ padding: '0.5rem 0', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', fontWeight: 600, textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {analytics.topProducts.map((p: any, i: number) => (
                                <tr key={i} style={{ borderBottom: '1px solid #0f0f0f' }}>
                                  <td style={{ padding: '0.8rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: ['#c9a96e', '#555', '#7c5a2e', '#222', '#1a1a1a'][i] ?? '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: i < 3 ? '#0a0a0a' : '#444', flexShrink: 0 }}>{i + 1}</span>
                                    <span style={{ color: '#ddd', fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>{p.name}</span>
                                  </td>
                                  <td style={{ padding: '0.8rem 0', textAlign: 'right', color: '#aaa' }}>{p.unitsSold}</td>
                                  <td style={{ padding: '0.8rem 0', textAlign: 'right', color: '#22c55e', fontWeight: 600 }}>₹{p.revenue?.toFixed(0)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          </div>
                        )}
                      </div>

                      {/* Donut + Category */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={CARD}>
                          <div style={{ fontSize: '0.65rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#aaa', fontWeight: 600, marginBottom: '1.2rem' }}>Order Status</div>
                          <DonutChart segments={Object.entries(analytics.ordersByStatus ?? {}).map(([label, value]) => ({ label, value: value as number, color: STATUS_COLORS[label] ?? '#2a2a2a' }))} />
                        </div>
                        <div style={CARD}>
                          <div style={{ fontSize: '0.65rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#aaa', fontWeight: 600, marginBottom: '1rem' }}>Revenue by Category</div>
                          {Object.entries(analytics.categoryRevenue ?? {}).sort(([, a], [, b]) => (b as number) - (a as number)).map(([cat, rev]) => (
                            <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #0f0f0f', fontSize: '0.82rem' }}>
                              <span style={{ color: '#bbb' }}>{cat}</span>
                              <span style={{ fontWeight: 600, color: '#22c55e' }}>₹{(rev as number).toFixed(0)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ ...CARD, textAlign: 'center', padding: '4rem' }}>
                    <p style={{ color: '#444', fontSize: '0.85rem' }}>Failed to load. <button onClick={fetchAnalytics} style={{ color: '#c9a96e', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Inter',sans-serif", textDecoration: 'underline' }}>Retry</button></p>
                  </div>
                )}
              </div>
            )}

            {/* ══ PRODUCTS ══ */}
            {activeTab === 'products' && (
              <div className="ap-fade">
                <div className="flex-stack" style={{ marginBottom: '1.5rem', justifyContent: 'space-between' }}>
                  <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#333', fontSize: '0.85rem' }}>⌕</span>
                    <input type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      style={{ ...INPUT, paddingLeft: '2.2rem' }} />
                  </div>
                  <span style={{ fontSize: '0.65rem', color: '#555', letterSpacing: 1 }}>{filteredProducts.length} items</span>
                </div>

                <div className="admin-table-wrapper" style={{ ...CARD, padding: 0, overflowX: 'auto' }}>
                  {/* Desktop Table View */}
                  <table className="admin-table hide-mobile">
                    <thead>
                      <tr>
                        <th style={{ width: 50 }}></th>
                        <th style={{ textAlign: 'left' }}>Product</th>
                        <th style={{ textAlign: 'left' }}>Category</th>
                        <th style={{ textAlign: 'left' }}>Price</th>
                        <th style={{ textAlign: 'left' }}>Stock</th>
                        <th style={{ textAlign: 'right' }}>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: '4rem', color: '#333', fontSize: '0.85rem' }}>No products found</td></tr>
                      ) : filteredProducts.map(p => (
                        <tr key={p.id} className="ap-row">
                          <td style={{ padding: '0.9rem 1.2rem', width: 56 }}>
                            <div style={{ width: 44, height: 56, backgroundImage: `url(${p.imageUrl}), url('https://placehold.co/44x56?text=No+Image')`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 6, backgroundColor: '#111', flexShrink: 0 }} />
                          </td>
                          <td style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 500, color: '#f0ede6', marginBottom: 2 }}>{p.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#888', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</div>
                          </td>
                          <td style={{ textAlign: 'left' }}>
                            {p.category ? <span style={{ padding: '0.2rem 0.7rem', background: '#c9a96e18', border: '1px solid #c9a96e22', borderRadius: 4, fontSize: '0.7rem', color: '#c9a96e', fontWeight: 500 }}>{p.category}</span> : <span style={{ color: '#333' }}>—</span>}
                          </td>
                          <td style={{ textAlign: 'left', fontWeight: 600, color: '#f0ede6' }}>₹{p.price?.toFixed(0)}</td>
                          <td style={{ textAlign: 'left', fontWeight: 600, color: (p.stock || 0) <= 5 ? '#ef4444' : '#f0ede6' }}>{p.stock ?? 0}</td>
                          <td style={{ textAlign: 'right' }}>
                            <span style={{ padding: '0.25rem 0.8rem', borderRadius: 20, fontSize: '0.6rem', fontWeight: 700, background: (p.stock || 0) > 0 ? '#22c55e14' : '#ef444414', color: (p.stock || 0) > 0 ? '#22c55e' : '#ef4444', border: `1px solid ${(p.stock || 0) > 0 ? '#22c55e22' : '#ef444422'}` }}>
                              {(p.stock || 0) > 0 ? 'IN STOCK' : 'OUT'}
                            </span>
                          </td>
                          <td style={{ padding: '0.9rem 1.2rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button onClick={() => { setCurrentProduct(p); setShowModal(true); }} style={GHOST_BTN_SM}>Edit</button>
                              <button onClick={() => setDeleteConfirm(p.id!)} style={{ ...GHOST_BTN_SM, color: '#ef4444', borderColor: '#ef444433' }}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile Card View */}
                  <div className="mobile-only-btn" style={{ flexDirection: 'column', gap: '0.8rem', padding: '1rem', width: '100%' }}>
                    {filteredProducts.map(p => (
                      <div key={p.id} style={{ ...CARD, padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: 60, height: 80, backgroundImage: `url(${p.imageUrl}), url('https://placehold.co/60x80?text=No+Image')`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 8, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: '#f0ede6', fontSize: '0.9rem', marginBottom: 2 }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: 8 }}>{p.category}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 700, color: '#c9a96e' }}>₹{p.price?.toFixed(0)}</div>
                            <div style={{ fontSize: '0.7rem', color: (p.stock || 0) <= 5 ? '#ef4444' : '#aaa' }}>Stock: <span style={{fontWeight: 700}}>{p.stock ?? 0}</span></div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <button onClick={() => { setCurrentProduct(p); setShowModal(true); }} style={GHOST_BTN_SM}>Edit</button>
                          <button onClick={() => handleDelete(p.id!)} style={{ ...GHOST_BTN_SM, color: '#ef4444' }}>Del</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ ORDERS ══ */}
            {activeTab === 'orders' && (
              <div className="ap-fade">
                <div className="flex-stack" style={{ marginBottom: '1.5rem', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem', WebkitOverflowScrolling: 'touch' }}>
                    {['ALL', 'PAID', 'SHIPPED', 'DELIVERED'].map(f => (
                      <button key={f} onClick={() => setOrderFilter(f)} style={{
                        padding: '0.4rem 1rem', borderRadius: 20, fontSize: '0.65rem', fontWeight: 600,
                        border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
                        ...(orderFilter === f ? { background: '#c9a96e', color: '#0a0a0a' } : { background: '#111', color: '#555' }),
                      }}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="admin-table-wrapper" style={{ ...CARD, padding: 0, overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Order</th>
                        <th style={{ textAlign: 'left' }}>Customer</th>
                        <th className="mobile-hide" style={{ textAlign: 'left' }}>Date</th>
                        <th className="mobile-hide" style={{ textAlign: 'left' }}>Items</th>
                        <th style={{ textAlign: 'left' }}>Amount</th>
                        <th style={{ textAlign: 'right' }}>Status</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: '4rem', color: '#333' }}>No orders found</td></tr>
                      ) : filteredOrders.map((o: any) => (
                        <tr key={o.id} className="ap-row">
                          <td style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 700, color: '#c9a96e', fontSize: '0.85rem' }}>#{o.id}</div>
                          </td>
                          <td style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 500, color: '#f0ede6', fontSize: '0.8rem' }}>{o.user?.fullName || 'Guest'}</div>
                            <div className="mobile-hide" style={{ fontSize: '0.7rem', color: '#888' }}>{o.user?.email}</div>
                          </td>
                          <td className="mobile-hide" style={{ textAlign: 'left', color: '#999', fontSize: '0.78rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td className="mobile-hide" style={{ textAlign: 'left', color: '#aaa' }}>{o.items?.length || 0} items</td>
                          <td style={{ textAlign: 'left', fontWeight: 700, color: '#f0ede6' }}>₹{o.totalAmount?.toFixed(0)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: 4, fontSize: '0.6rem', fontWeight: 700, background: (STATUS_COLORS[o.status] ?? '#888') + '14', color: STATUS_COLORS[o.status] ?? '#888', border: `1px solid ${(STATUS_COLORS[o.status] ?? '#888')}22` }}>{o.status}</span>
                          </td>
                          <td style={{ padding: '1rem 1.2rem', textAlign: 'right' }}>
                            {o.status === 'PAID' && <button onClick={() => updateStatus(o.id, 'SHIPPED')} style={PREMIUM_BTN}>Ship</button>}
                            {o.status === 'SHIPPED' && <button onClick={() => updateStatus(o.id, 'DELIVERED')} style={{ ...GHOST_BTN_SM, color: '#22c55e', borderColor: '#22c55e55' }}>Deliver</button>}
                            {o.status === 'DELIVERED' && <span style={{ color: '#22c55e', fontSize: '0.8rem' }}>✓ Done</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ══ USERS ══ */}
            {activeTab === 'users' && (
              <div className="ap-fade">
                <div className="flex-stack" style={{ marginBottom: '1.5rem', justifyContent: 'space-between' }}>
                  <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555', fontSize: '0.85rem' }}>⌕</span>
                    <input type="text" placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)}
                      style={{ ...INPUT, paddingLeft: '2.2rem' }} />
                  </div>
                  <span style={{ fontSize: '0.65rem', color: '#555', letterSpacing: 1 }}>{users.length} users</span>
                </div>

                {usersLoading ? (
                  <div style={{ textAlign: 'center', padding: '4rem', color: '#555' }}>
                    <div style={{ width: 24, height: 24, border: '2px solid #1a1a1a', borderTopColor: '#c9a96e', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                    Loading users...
                  </div>
                ) : (
                  <div className="admin-table-wrapper" style={{ ...CARD, padding: 0, overflowX: 'auto' }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left' }}>User</th>
                          <th className="mobile-hide" style={{ textAlign: 'left' }}>Email</th>
                          <th className="mobile-hide" style={{ textAlign: 'left' }}>Role</th>
                          <th style={{ textAlign: 'left' }}>Orders</th>
                          <th style={{ textAlign: 'left' }}>Spent</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.filter((u: any) =>
                          u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email?.toLowerCase().includes(userSearch.toLowerCase())
                        ).length === 0 ? (
                          <tr><td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: '#555' }}>No users found</td></tr>
                        ) : users
                          .filter((u: any) =>
                            u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
                            u.email?.toLowerCase().includes(userSearch.toLowerCase())
                          )
                          .map((u: any) => (
                            <tr key={u.id} className="ap-row">
                              <td style={{ textAlign: 'left' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                                  <div className="mobile-hide" style={{ width: 28, height: 28, borderRadius: '50%', background: u.role === 'ADMIN' ? 'linear-gradient(135deg,#c9a96e,#7c5a2e)' : '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: u.role === 'ADMIN' ? '#0a0a0a' : '#888', flexShrink: 0 }}>
                                    {(u.fullName || u.email || '?').charAt(0).toUpperCase()}
                                  </div>
                                  <span style={{ fontWeight: 500, color: '#f0ede6' }}>{u.fullName || '—'}</span>
                                </div>
                              </td>
                              <td className="mobile-hide" style={{ textAlign: 'left', color: '#888', fontSize: '0.78rem' }}>{u.email}</td>
                              <td className="mobile-hide" style={{ textAlign: 'left' }}>
                                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: u.role === 'ADMIN' ? '#c9a96e' : '#555' }}>{u.role}</span>
                              </td>
                              <td style={{ textAlign: 'left', color: '#aaa' }}>{u.orderCount}</td>
                              <td style={{ textAlign: 'left', fontWeight: 600, color: '#22c55e' }}>₹{u.totalSpent?.toLocaleString()}</td>
                              <td style={{ padding: '1rem 1.2rem', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                  <button onClick={() => handlePromoteUser(u.id, u.role)}
                                    style={{ ...GHOST_BTN_SM, color: u.role === 'ADMIN' ? '#f59e0b' : '#c9a96e', borderColor: u.role === 'ADMIN' ? '#f59e0b33' : '#c9a96e33' }}>
                                    {u.role === 'ADMIN' ? 'Demote' : 'Promote'}
                                  </button>
                                  <button onClick={() => handleDeleteUser(u.id)} style={{ ...GHOST_BTN_SM, color: '#ef4444', borderColor: '#ef444433' }}>Delete</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ══ COUPONS ══ */}
            {activeTab === 'coupons' && (
              <div className="ap-fade">
                {coupons.length === 0 ? (
                  <div style={{ ...CARD, textAlign: 'center', padding: '5rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.3 }}>🏷</div>
                    <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem', letterSpacing: 1 }}>No coupons yet. Create one to offer discounts.</p>
                    <button onClick={() => setShowCouponModal(true)} style={PREMIUM_BTN}>+ Create First Coupon</button>
                  </div>
                ) : (
                  <div className="grid-3">
                    {coupons.map(c => (
                      <div key={c.id} style={{ ...CARD, position: 'relative', overflow: 'hidden', opacity: c.active ? 1 : 0.55 }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: c.active ? 'linear-gradient(90deg,#c9a96e,transparent)' : '#1a1a1a' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                          <div style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '3px', color: '#f0ede6' }}>{c.code}</div>
                          <span style={{ padding: '0.15rem 0.6rem', borderRadius: 10, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', background: c.active ? '#22c55e18' : '#ef444418', color: c.active ? '#22c55e' : '#ef4444', border: `1px solid ${c.active ? '#22c55e22' : '#ef444422'}` }}>{c.active ? 'Active' : 'Inactive'}</span>
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 300, color: '#c9a96e', fontFamily: "'Cormorant Garamond',serif", marginBottom: '0.3rem' }}>
                          {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                        </div>
                        {c.description && <p style={{ fontSize: '0.78rem', color: '#999', marginBottom: '0.8rem' }}>{c.description}</p>}
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem', color: '#888', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
                          {c.minOrderAmount && c.minOrderAmount > 0 && <span>Min ₹{c.minOrderAmount}</span>}
                          {c.maxUses && c.maxUses > 0 ? <span>{c.usedCount ?? 0}/{c.maxUses} used</span> : <span>∞ uses</span>}
                          {c.expiryDate && <span>Exp {c.expiryDate}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #1a1a1a', paddingTop: '0.8rem' }}>
                          <button onClick={() => { setEditingCoupon(c.id!); setCouponForm({ ...c }); setShowCouponModal(true); }} style={GHOST_BTN_SM}>Edit</button>
                          <button onClick={() => handleToggleCoupon(c.id!)} style={{ ...GHOST_BTN_SM, color: c.active ? '#f59e0b' : '#22c55e', borderColor: c.active ? '#f59e0b33' : '#22c55e33' }}>{c.active ? 'Deactivate' : 'Activate'}</button>
                          <button onClick={() => handleDeleteCoupon(c.id!)} style={{ ...GHOST_BTN_SM, color: '#ef4444', borderColor: '#ef444433' }}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ CHAT ══ */}
            {activeTab === 'chat' && (
              <div className="ap-fade admin-chat-layout" style={{ display: 'flex', gap: '1.2rem', height: 'calc(100vh - 200px)', minHeight: 400 }}>
                {/* Conversation List */}
                <div className={`admin-chat-list ${selectedConvo ? 'mobile-hidden' : ''}`} style={{ width: 320, flexShrink: 0, ...CARD, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ padding: '1.2rem 1.2rem 0.8rem', borderBottom: '1px solid #1a1a1a' }}>
                    <div style={{ fontSize: '0.6rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#888', fontWeight: 600 }}>Conversations</div>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    {chatConversations.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#555' }}>
                        <div style={{ fontSize: '2rem', opacity: 0.3, marginBottom: '0.8rem' }}>💬</div>
                        <div style={{ fontSize: '0.82rem' }}>No conversations yet</div>
                        <div style={{ fontSize: '0.72rem', color: '#444', marginTop: '0.3rem' }}>Customer messages will appear here</div>
                      </div>
                    ) : (
                      chatConversations.map((c: any) => (
                        <button
                          key={c.conversationEmail}
                          onClick={() => selectConversation(c.conversationEmail)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.8rem',
                            width: '100%', padding: '1rem 1.2rem',
                            background: selectedConvo === c.conversationEmail ? 'rgba(201,169,110,0.08)' : 'transparent',
                            border: 'none', borderBottom: '1px solid #111', borderLeft: selectedConvo === c.conversationEmail ? '2px solid #c9a96e' : '2px solid transparent',
                            cursor: 'pointer', textAlign: 'left',
                            fontFamily: "'Inter',sans-serif",
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => { if (selectedConvo !== c.conversationEmail) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                          onMouseLeave={(e) => { if (selectedConvo !== c.conversationEmail) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1e1e1e, #2a2a2a)',
                            border: '1px solid #333',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.85rem', fontWeight: 700,
                            color: '#c9a96e', flexShrink: 0,
                          }}>
                            {(c.senderName || c.conversationEmail || '?').charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#e0ddd6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {c.senderName || c.conversationEmail}
                              </span>
                              <span style={{ fontSize: '0.58rem', color: '#555', flexShrink: 0, marginLeft: 8 }}>
                                {formatChatTime(c.timestamp)}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {c.fromAdmin ? 'You: ' : ''}{c.content}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Chat View */}
                <div className={`admin-chat-view ${!selectedConvo ? 'mobile-hidden' : ''}`} style={{ flex: 1, ...CARD, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  {!selectedConvo ? (
                    <div className="admin-chat-empty" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#555', gap: '1rem' }}>
                      <div style={{ fontSize: '3rem', opacity: 0.15 }}>◎</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: '#888' }}>Select a Conversation</div>
                      <div style={{ fontSize: '0.75rem', color: '#555' }}>Choose a customer from the list to start chatting</div>
                    </div>
                  ) : (
                    <>
                      {/* Chat header */}
                      <div style={{
                        padding: '1rem 1.5rem',
                        borderBottom: '1px solid #1a1a1a',
                        display: 'flex', alignItems: 'center', gap: '0.8rem',
                        background: 'rgba(201,169,110,0.03)',
                      }}>
                        <button className="mobile-only-btn" onClick={() => selectConversation('')} style={{ background: 'transparent', border: 'none', color: '#c9a96e', fontSize: '1.2rem', cursor: 'pointer', padding: '0 0.5rem 0 0' }}>←</button>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #c9a96e, #7c5a2e)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.8rem', fontWeight: 700, color: '#0a0a0a', flexShrink: 0,
                        }}>
                          {selectedConvo.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#f0ede6' }}>
                            {chatConversations.find((c) => c.conversationEmail === selectedConvo)?.senderName || selectedConvo}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: '#888' }}>{selectedConvo}</div>
                        </div>
                      </div>

                      {/* Messages */}
                      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {chatMessages
                          .filter((m: any) => m.conversationEmail === selectedConvo)
                          .map((msg: any, i: number) => {
                            const isAdmin = msg.fromAdmin;
                            return (
                              <div key={msg.id || `am-${i}`} style={{
                                display: 'flex',
                                justifyContent: isAdmin ? 'flex-end' : 'flex-start',
                                paddingLeft: isAdmin ? '3rem' : 0,
                                paddingRight: isAdmin ? 0 : '3rem',
                              }}>
                                <div style={{
                                  maxWidth: '80%',
                                  padding: '0.6rem 0.9rem',
                                  borderRadius: isAdmin ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                  background: isAdmin ? 'linear-gradient(135deg, #c9a96e, #a8893e)' : '#1a1a1a',
                                  color: isAdmin ? '#0a0a0a' : '#e0ddd6',
                                  fontSize: '0.84rem',
                                  lineHeight: 1.45,
                                  border: isAdmin ? 'none' : '1px solid #252525',
                                  wordBreak: 'break-word',
                                }}>
                                  {!isAdmin && (
                                    <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#c9a96e', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 2 }}>
                                      {msg.senderName || msg.senderEmail}
                                    </div>
                                  )}
                                  <div>{msg.content}</div>
                                  <div style={{ fontSize: '0.56rem', color: isAdmin ? 'rgba(10,10,10,0.5)' : '#555', textAlign: 'right', marginTop: 3 }}>
                                    {formatChatTime(msg.timestamp)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Reply input */}
                      <div style={{ padding: '0.8rem 1.2rem', borderTop: '1px solid #1a1a1a', display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(10,10,10,0.4)' }}>
                        <input
                          ref={chatInputRef}
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAdminReply(); } }}
                          placeholder="Type your reply..."
                          style={{
                            flex: 1, padding: '0.7rem 1rem',
                            background: '#0d0d0d', border: '1px solid #222',
                            borderRadius: 8, color: '#f0ede6',
                            fontSize: '0.85rem', fontFamily: "'Inter',sans-serif",
                            outline: 'none',
                          }}
                          onFocus={(e) => (e.target.style.borderColor = '#c9a96e')}
                          onBlur={(e) => (e.target.style.borderColor = '#222')}
                        />
                        <button
                          onClick={sendAdminReply}
                          disabled={!chatInput.trim() || !chatConnected}
                          style={{
                            ...PREMIUM_BTN,
                            padding: '0.65rem 1.2rem',
                            opacity: chatInput.trim() && chatConnected ? 1 : 0.4,
                            cursor: chatInput.trim() && chatConnected ? 'pointer' : 'not-allowed',
                          }}
                        >
                          Send
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ══ PRODUCT MODAL ══ */}
      {showModal && (
        <div style={MODAL_OVERLAY} onClick={() => setShowModal(false)}>
          <div style={MODAL_BOX} className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: '0.3rem', fontSize: '0.6rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#888' }}>Product</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.6rem', fontWeight: 300, margin: '0 0 2rem', color: '#f0ede6' }}>{currentProduct.id ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label style={LABEL}>Product Name *</label><input style={INPUT} value={currentProduct.name || ''} onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })} required placeholder="e.g. Classic Oxford Shirt" /></div>
              <div className="grid-2">
                <div><label style={LABEL}>Category</label>
                  <select style={{ ...INPUT, cursor: 'pointer' }} value={currentProduct.category || ''} onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value })}>
                    <option value="">Select...</option>
                    {['T-shirt', 'Jacket', 'Pants', 'Footwear', 'Accessories', 'Blazer', 'Dress', 'Activewear'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={LABEL}>Price (₹) *</label><input type="number" step="0.01" style={INPUT} value={currentProduct.price || ''} onChange={e => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) })} required placeholder="999" /></div>
              </div>
              <div><label style={LABEL}>Description *</label><textarea style={{ ...INPUT, resize: 'vertical', minHeight: 80 }} value={currentProduct.description || ''} onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })} required placeholder="Describe the product..." /></div>
              <div className="grid-3">
                <div><label style={LABEL}>Sizes (CSV)</label><input style={INPUT} value={currentProduct.sizes?.join ? currentProduct.sizes.join(', ') : ''} onChange={e => setCurrentProduct({ ...currentProduct, sizes: e.target.value as any })} placeholder="S, M, L, XL" /></div>
                <div><label style={LABEL}>Colors (CSV)</label><input style={INPUT} value={currentProduct.colors?.join ? currentProduct.colors.join(', ') : ''} onChange={e => setCurrentProduct({ ...currentProduct, colors: e.target.value as any })} placeholder="Black, White" /></div>
                <div><label style={LABEL}>Stock *</label><input type="number" style={INPUT} value={currentProduct.stock ?? 0} onChange={e => setCurrentProduct({ ...currentProduct, stock: parseInt(e.target.value) || 0 })} required min={0} /></div>
              </div>
              <div className="grid-2">
                <div><label style={LABEL}>Primary Product Image</label><input type="file" accept="image/*" style={{ ...INPUT, padding: '0.6rem' }} onChange={e => setImageFile(e.target.files?.[0] || null)} /></div>
                <div><label style={LABEL}>Additional Size/Style Photos</label><input type="file" multiple accept="image/*" style={{ ...INPUT, padding: '0.6rem' }} onChange={e => setAdditionalImageFiles(e.target.files)} /></div>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem', borderTop: '1px solid #1a1a1a', paddingTop: '1.2rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={GHOST_BTN}>Cancel</button>
                <button type="submit" style={{ ...PREMIUM_BTN, flex: 1, padding: '0.9rem', fontSize: '0.82rem' }}>{currentProduct.id ? 'Update Product' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ COUPON MODAL ══ */}
      {showCouponModal && (
        <div style={MODAL_OVERLAY} onClick={() => setShowCouponModal(false)}>
          <div style={MODAL_BOX} className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: '0.3rem', fontSize: '0.6rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#888' }}>Coupon</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.6rem', fontWeight: 300, margin: '0 0 2rem', color: '#f0ede6' }}>{editingCoupon ? 'Edit Coupon' : 'New Coupon'}</h2>
            <form onSubmit={handleSaveCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label style={LABEL}>Coupon Code *</label><input style={{ ...INPUT, fontFamily: "'Montserrat',sans-serif", letterSpacing: '3px', textTransform: 'uppercase' }} value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} required placeholder="e.g. SAVE20" /></div>
              <div className="grid-2">
                <div><label style={LABEL}>Discount Type *</label>
                  <select style={{ ...INPUT, cursor: 'pointer' }} value={couponForm.discountType} onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value })}>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div><label style={LABEL}>{couponForm.discountType === 'PERCENTAGE' ? 'Discount %' : 'Discount ₹'} *</label><input type="number" step="0.01" style={INPUT} value={couponForm.discountValue} onChange={e => setCouponForm({ ...couponForm, discountValue: parseFloat(e.target.value) })} required min={0.01} /></div>
              </div>
                <div className="grid-2">
                <div><label style={LABEL}>Min Order (₹)</label><input type="number" style={INPUT} value={couponForm.minOrderAmount ?? 0} onChange={e => setCouponForm({ ...couponForm, minOrderAmount: parseFloat(e.target.value) || 0 })} min={0} /></div>
                <div><label style={LABEL}>Max Uses (0 = ∞)</label><input type="number" style={INPUT} value={couponForm.maxUses ?? 0} onChange={e => setCouponForm({ ...couponForm, maxUses: parseInt(e.target.value) || 0 })} min={0} /></div>
              </div>
              <div><label style={LABEL}>Expiry Date</label><input type="date" style={INPUT} value={couponForm.expiryDate || ''} onChange={e => setCouponForm({ ...couponForm, expiryDate: e.target.value })} /></div>
              <div><label style={LABEL}>Description (shown to customer)</label><input style={INPUT} value={couponForm.description || ''} onChange={e => setCouponForm({ ...couponForm, description: e.target.value })} placeholder="e.g. 20% off your entire order" /></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <input type="checkbox" id="active" checked={couponForm.active ?? true} onChange={e => setCouponForm({ ...couponForm, active: e.target.checked })} style={{ accentColor: '#c9a96e', width: 14, height: 14 }} />
                <label htmlFor="active" style={{ fontSize: '0.8rem', color: '#888', cursor: 'pointer' }}>Active — customers can apply this coupon</label>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem', borderTop: '1px solid #1a1a1a', paddingTop: '1.2rem' }}>
                <button type="button" onClick={() => setShowCouponModal(false)} style={GHOST_BTN}>Cancel</button>
                <button type="submit" style={{ ...PREMIUM_BTN, flex: 1, padding: '0.9rem', fontSize: '0.82rem' }}>{editingCoupon ? 'Update Coupon' : 'Create Coupon'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


