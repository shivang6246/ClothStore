import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiWithCache } from '../services/api';
import { useStore } from '../context/StoreContext';
import { getPremiumImage } from '../utils/imageUtils';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category?: string;
  stock?: number;
  sizes?: string[];
  colors?: string[];
  multipleImages?: string[];
}

const HERO_SLIDES = [
  { img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&h=1000&q=85",
    fb:  "https://picsum.photos/seed/h1/1600/1000", title: "The Power Suit",  sub: "SS 2025" },
  { img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&h=1000&q=85",
    fb:  "https://picsum.photos/seed/h2/1600/1000", title: "Après Couture",   sub: "Resort 2025" },
  { img: "https://images.unsplash.com/photo-1532453288672-3a17ac36f139?auto=format&fit=crop&w=1600&h=1000&q=85",
    fb:  "https://picsum.photos/seed/h3/1600/1000", title: "Noir Manifesto",  sub: "FW 2025" },
];

const CATEGORIES = ["All", "Outerwear", "Blazers", "Dresses", "Sets", "Bottoms", "T-shirt", "Jacket", "Pants", "Footwear"];

function SmartImg({ src, fb, alt, style, className }: any) {
  const [s, setS] = useState(src);
  const [done, setDone] = useState(false);
  const ultimateFb = "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&h=800&q=80"; // Premium clothing fallback
  return (
    <img src={s || fb || ultimateFb} alt={alt} style={style} className={className}
      onError={(e) => { 
        if (!done && fb) { setS(fb); setDone(true); }
        else { (e.target as any).src = ultimateFb; }
      }} />
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { cart, wishlist, user, isAdmin, addToCart, updateCart, removeFromCart, toggleWishlist, logout, cartTotal } = useStore();
  
  const [page, setPage]         = useState("home");
  const [products, setProducts] = useState<Product[]>([]);
  const [catFilter, setCatFilter] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [heroIdx, setHeroIdx]   = useState(0);
  const [toast, setToast]       = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery]       = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    apiWithCache.get<Product[]>('/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error("Failed to fetch products:", err));
  };

  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % HERO_SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleAddToCart = async (p: Product, qty: number = 1) => {
    try {
      await addToCart(p.id, selectedSize, "Default", qty);
      showToast(`${p.name} added to bag`);
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Action failed');
    }
  };

  const showToast  = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2400); };
  
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const nav = (p: string) => { setPage(p); setSearchOpen(false); setQuery(""); window.scrollTo(0,0); };

  const filtered = products.filter(p =>
    (catFilter === "All" || p.category?.toLowerCase() === catFilter.toLowerCase()) &&
    (query === "" || p.name.toLowerCase().includes(query.toLowerCase()) || (p.category && p.category.toLowerCase().includes(query.toLowerCase())))
  );

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", background: "#0a0a0a", color: "#f0ede6", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@200;300;400;500&display=swap');
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#0a0a0a}::-webkit-scrollbar-thumb{background:#2a2a2a}
        button,input{font-family:inherit}button:focus,input:focus{outline:none}
        .nb{cursor:pointer;background:none;border:none;color:#f0ede6;font-family:'Montserrat',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;padding:4px 0;white-space:nowrap;transition:opacity .25s}
        .nb:hover{opacity:.4}
        .ib{cursor:pointer;background:none;border:none;color:#f0ede6;display:flex;align-items:center;justify-content:center;padding:8px;transition:opacity .2s}
        .ib:hover{opacity:.4}
        .hfade{animation:hf 1.5s ease forwards}
        @keyframes hf{from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:scale(1)}}
        .pc:hover .co{opacity:1!important}
        .pc:hover .pi{transform:scale(1.05)}
        .pi{transition:transform .6s ease;width:100%;height:clamp(240px,45vw,360px);object-fit:cover;display:block}
        .co{opacity:0!important;transition:opacity .3s ease;position:absolute;inset:0;background:rgba(0,0,0,.4);display:flex;flex-direction:column;justify-content:flex-end;padding:20px;gap:10px}
        .si{animation:sl .35s cubic-bezier(.25,.8,.25,1)}
        @keyframes sl{from{transform:translateX(100%)}to{transform:translateX(0)}}
        .ti{animation:ti .3s ease}
        @keyframes ti{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .mw{overflow:hidden;white-space:nowrap}
        .mi{display:inline-block;animation:mq 24s linear infinite}
        @keyframes mq{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .lc:hover .li{transform:scale(1.07)!important}
        .lc:hover .lo{opacity:1!important}
        .li{transition:transform .6s ease!important;width:100%;height:100%;object-fit:cover;object-position:center top;display:block}
        .lo{opacity:0!important;transition:opacity .4s!important;position:absolute;inset:0;background:rgba(0,0,0,.42);display:flex;flex-direction:column;justify-content:flex-end;padding:28px 28px 32px}
        .ew:hover .ei{transform:scale(1.05)}
        .ei{transition:transform .6s ease;width:100%;height:100%;object-fit:cover;filter:brightness(.52);display:block}
        .qb{transition:all .2s}
        .qb:hover{background:rgba(240,237,230,.07)!important}
        .gh-btn{transition:all .28s}
        .gh-btn:hover{background:#f0ede6!important;color:#0a0a0a!important}
        .sz-btn{transition:all .2s; border: 0.5px solid #333; cursor:pointer; background:transparent;}
        .sz-btn.active {background:#f0ede6; color:#0a0a0a;}
        .sz-btn:hover:not(.active){background:rgba(240,237,230,0.1);}
      `}</style>

      {/* TOAST */}
      {toast && (
        <div className="ti" style={{ position:"fixed", bottom:36, left:"50%", transform:"translateX(-50%)", background:"#f0ede6", color:"#0a0a0a", padding:"13px 34px", fontFamily:"'Montserrat',sans-serif", fontSize:9, letterSpacing:2.5, textTransform:"uppercase", zIndex:9999, whiteSpace:"nowrap" }}>
          {toast}
        </div>
      )}

      {/* CART DRAWER */}
      {cartOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:1000 }}>
          <div onClick={() => setCartOpen(false)} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.75)" }} />
          <div className="si" style={{ position:"absolute", right:0, top:0, bottom:0, width:"min(420px,100vw)", background:"#111", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"28px 28px 22px", borderBottom:"0.5px solid #222", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:10, letterSpacing:3, textTransform:"uppercase" }}>Your Bag ({cartCount})</span>
              <button className="ib" onClick={() => setCartOpen(false)}>✕</button>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"4px 28px" }}>
              {cart.length === 0
                ? <p style={{ color:"#444", fontStyle:"italic", marginTop:72, textAlign:"center", fontSize:18 }}>Your bag is empty</p>
                : cart.map(item => (
                  <div key={item.id} style={{ display:"flex", gap:18, padding:"20px 0", borderBottom:"0.5px solid #1c1c1c" }}>
                    {item.product && (
                      <img src={getPremiumImage(item.product)} alt={item.product?.name} style={{ width:80, height:104, objectFit:"cover", flexShrink:0 }} />
                    )}
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:16, marginBottom:4, fontWeight:300 }}>{item.product?.name}</p>
                      <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:11, color:"#888", letterSpacing:1, marginBottom:14 }}>₹{item.product?.price?.toLocaleString()}</p>
                      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                        <button className="qb" onClick={() => updateCart(item.id, Math.max(1, item.quantity - 1))} style={{ width:28,height:28,border:"0.5px solid #333",color:"#f0ede6",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",background:"transparent",cursor:"pointer" }}>−</button>
                        <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:13, minWidth:16, textAlign:"center" }}>{item.quantity}</span>
                        <button className="qb" onClick={() => updateCart(item.id, item.quantity + 1)} style={{ width:28,height:28,border:"0.5px solid #333",color:"#f0ede6",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",background:"transparent",cursor:"pointer" }}>+</button>
                        <button onClick={() => removeFromCart(item.id)} style={{ marginLeft:"auto",color:"#555",fontSize:9,letterSpacing:2,fontFamily:"'Montserrat',sans-serif",textTransform:"uppercase",background:"none",border:"none",cursor:"pointer" }}>Remove</button>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
            {cart.length > 0 && (
              <div style={{ padding:"24px 28px", borderTop:"0.5px solid #222" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:20 }}>
                  <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:10, letterSpacing:2, textTransform:"uppercase", color:"#666" }}>Total</span>
                  <span style={{ fontSize:24, fontWeight:300 }}>₹{cartTotal.toLocaleString()}</span>
                </div>
                <button onClick={() => { setCartOpen(false); navigate("/checkout"); }} style={{ width:"100%",padding:"17px",background:"#f0ede6",color:"#0a0a0a",fontFamily:"'Montserrat',sans-serif",fontSize:10,letterSpacing:4,textTransform:"uppercase",border:"none",cursor:"pointer" }}>
                  Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QUICK VIEW */}
      {quickView && (
        <div style={{ position:"fixed", inset:0, zIndex:900, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div onClick={() => setQuickView(null)} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.88)" }} />
          <div style={{ position:"relative", background:"#111", display:"flex", flexDirection:"row", flexWrap:"wrap", width:"min(860px,95vw)", maxHeight:"90vh", overflow:"auto" }}>
            <div style={{ width:"100%", maxWidth:"44%", flexShrink:0, minWidth:"280px" }}>
              <img src={getPremiumImage(quickView)} alt={quickView.name} style={{ width:"100%", height:"100%", objectFit:"cover", minHeight:320, maxHeight:480, display:"block" }} />
            </div>
            <div style={{ flex:1, padding:"clamp(20px,4vw,48px) clamp(20px,4vw,40px)", display:"flex", flexDirection:"column", overflowY:"auto", minWidth:"260px" }}>
              <button className="ib" onClick={() => setQuickView(null)} style={{ alignSelf:"flex-end", marginBottom:16, fontSize:14, color:"#666" }}>✕</button>
              <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:9, letterSpacing:3.5, color:"#c9a96e", textTransform:"uppercase", marginBottom:10 }}>{quickView.category || "Couture"} · {quickView.stock && quickView.stock > 0 ? "Available" : "Limited"}</span>
              <h2 style={{ fontSize:34, fontWeight:300, marginBottom:14, lineHeight:1.15 }}>{quickView.name}</h2>
              <p style={{ fontStyle:"italic", color:"#999", marginBottom:28, lineHeight:1.9, fontSize:15 }}>{quickView.description}</p>
              <p style={{ fontSize:26, marginBottom:32, fontWeight:300 }}>₹{quickView.price.toLocaleString()}</p>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:9, letterSpacing:3, color:"#555", textTransform:"uppercase", marginBottom:12 }}>Select Size</p>
              <div style={{ display:"flex", gap:10, marginBottom:32, flexWrap:"wrap" }}>
                {["XS","S","M","L","XL"].map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)} className={`sz-btn ${selectedSize === s ? 'active' : ''}`} style={{ padding:"10px 18px",color:selectedSize === s ? '#0a0a0a' : '#f0ede6',fontFamily:"'Montserrat',sans-serif",fontSize:10,letterSpacing:2 }}>{s}</button>
                ))}
              </div>
              <button onClick={() => { handleAddToCart(quickView); setQuickView(null); }} style={{ padding:"17px",background:"#f0ede6",color:"#0a0a0a",fontFamily:"'Montserrat',sans-serif",fontSize:10,letterSpacing:4,textTransform:"uppercase",border:"none",cursor:"pointer",marginTop:"auto" }}>
                Add to Bag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ NAVBAR ══════════════ */}
      <nav className="responsive-nav" style={{
        position:"fixed", top:0, left:0, right:0, zIndex:500,
        height:72, display:"grid", gridTemplateColumns:"1fr auto 1fr",
        alignItems:"center", padding:"0 40px", gap:24,
        background: scrolled ? "rgba(10,10,10,.96)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        transition:"background .4s, border-color .4s",
        borderBottom: scrolled ? "0.5px solid #1a1a1a" : "0.5px solid transparent"
      }}>
        {/* LEFT  */}
        <div className="nav-links" style={{ display:"flex", gap:32, alignItems:"center" }}>
          <button className="nb" onClick={() => nav("home")}>Home</button>
          <button className="nb" onClick={() => nav("collection")}>Collection</button>
          <button className="nb" onClick={() => nav("looks")}>Looks</button>
          <button className="nb" onClick={() => nav("about")}>About</button>
        </div>

        {/* CENTER */}
        <div onClick={() => nav("home")} style={{ cursor:"pointer", textAlign:"center", userSelect:"none" }}>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:300, letterSpacing:13, textTransform:"uppercase", color:"#f0ede6", lineHeight:1 }}>
            VOGUE
          </span>
        </div>

        {/* RIGHT */}
        <div style={{ display:"flex", gap:14, alignItems:"center", justifyContent:"flex-end" }}>
          <button className="ib" onClick={() => setSearchOpen(o => !o)} title="Search">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          
          <button className="ib hide-mobile" onClick={() => navigate("/account")} title="Account" style={{fontSize: '11px', fontFamily:"'Montserrat',sans-serif", letterSpacing: '1px'}}>
            {user?.fullName?.split(' ')[0] || "Profile"}
          </button>

          {isAdmin && (
             <button className="ib hide-mobile" onClick={() => navigate("/admin")} title="Admin Dashboard" style={{fontSize: '10px', color:'#c9a96e', fontFamily:"'Montserrat',sans-serif", letterSpacing: '1px'}}>ADMIN</button>
          )}

          <button className="ib hide-mobile" onClick={logout} title="Logout" style={{fontSize: '10px', fontFamily:"'Montserrat',sans-serif", letterSpacing: '1px', opacity: 0.6}}>LOGOUT</button>

          <button className="ib" style={{ position:"relative" }} onClick={() => setCartOpen(true)} title="Bag">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            {cartCount > 0 && <span style={{ position:"absolute", top:2, right:2, background:"#c9a96e", color:"#0a0a0a", borderRadius:"50%", width:15, height:15, fontSize:8, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Montserrat',sans-serif", fontWeight:600 }}>{cartCount}</span>}
          </button>
          
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
          <button className="nb" onClick={() => { nav("home"); setMobileMenuOpen(false); }} style={{ fontSize:"1.2rem", textAlign:"left", color:"#f0ede6" }}>Home</button>
          <button className="nb" onClick={() => { nav("collection"); setMobileMenuOpen(false); }} style={{ fontSize:"1.2rem", textAlign:"left", color:"#f0ede6" }}>Collection</button>
          <button className="nb" onClick={() => { nav("looks"); setMobileMenuOpen(false); }} style={{ fontSize:"1.2rem", textAlign:"left", color:"#f0ede6" }}>Looks</button>
          <button className="nb" onClick={() => { nav("about"); setMobileMenuOpen(false); }} style={{ fontSize:"1.2rem", textAlign:"left", color:"#f0ede6" }}>About</button>
          <hr style={{ borderTop:"0.5px solid #222", margin:"1rem 0", border:"none" }} />
          <button className="nb" onClick={() => { navigate("/account"); setMobileMenuOpen(false); }} style={{ fontSize:"1rem", textAlign:"left", color:"#888" }}>Account</button>
          {isAdmin && <button className="nb" onClick={() => { navigate("/admin"); setMobileMenuOpen(false); }} style={{ fontSize:"1rem", textAlign:"left", color:"#c9a96e" }}>Admin Panel</button>}
          {user && <button className="nb" onClick={() => { logout(); setMobileMenuOpen(false); }} style={{ fontSize:"1rem", textAlign:"left", color:"#888", opacity:0.8 }}>Logout</button>}
        </div>
      </div>

      {/* SEARCH */}
      {searchOpen && (
        <div style={{ position:"fixed", top:72, left:0, right:0, zIndex:400, background:"rgba(10,10,10,.97)", padding:"24px clamp(16px,5vw,48px) 28px", borderBottom:"0.5px solid #1c1c1c", backdropFilter:"blur(12px)" }}>
          <input type="text" value={query} onChange={e => { setQuery(e.target.value); setPage("collection"); }}
            placeholder="Search the collection…"
            style={{ width:"100%", background:"none", border:"none", borderBottom:"0.5px solid #252525", color:"#f0ede6", fontFamily:"'Cormorant Garamond',serif", fontSize:22, padding:"8px 0", letterSpacing:2 }}
            autoFocus />
        </div>
      )}

      {page === "home"       && <HomePage slides={HERO_SLIDES} heroIdx={heroIdx} setHeroIdx={setHeroIdx} setPage={nav} products={products} addToCart={handleAddToCart} toggleWish={toggleWishlist} wishlist={wishlist} setQuickView={setQuickView} />}
      {page === "collection" && <CollectionPage products={filtered} CATEGORIES={CATEGORIES} catFilter={catFilter} setCatFilter={setCatFilter} addToCart={handleAddToCart} toggleWish={toggleWishlist} wishlist={wishlist} setQuickView={setQuickView} />}
      {page === "looks"      && <LooksPage />}
      {page === "about"      && <AboutPage />}

      {/* FOOTER */}
      <footer style={{ background:"#060606", borderTop:"0.5px solid #141414", padding:"64px 8% 40px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:48, marginBottom:56 }}>
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:300, letterSpacing:10, marginBottom:20, color:"#f0ede6" }}>VOGUE</div>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:11, color:"#555", lineHeight:2.2, fontWeight:300 }}>Couture for the<br/>conscious few.</p>
          </div>
          {/* Navigate */}
          <div>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:9, letterSpacing:3.5, textTransform:"uppercase", color:"#c9a96e", marginBottom:22 }}>Navigate</p>
            {[['Home','/'],['Collection','/collection'],['Looks','/looks'],['About','/about']].map(([label,href]) => (
              <Link key={label} to={href} style={{ display:'block', fontFamily:"'Montserrat',sans-serif", fontSize:11, color:"#888", marginBottom:14, letterSpacing:.3, textDecoration:'none', transition:'color 0.2s' }}
                onMouseEnter={e=>(e.currentTarget.style.color='#f0ede6')} onMouseLeave={e=>(e.currentTarget.style.color='#888')}>{label}</Link>
            ))}
          </div>
          {/* Contact */}
          <div>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:9, letterSpacing:3.5, textTransform:"uppercase", color:"#c9a96e", marginBottom:22 }}>Contact</p>
            {['Shivangv493@gmail.com','+91 8726740214','Lucknow, India'].map(i => (
              <p key={i} style={{ fontFamily:"'Montserrat',sans-serif", fontSize:11, color:"#888", marginBottom:14, letterSpacing:.3 }}>{i}</p>
            ))}
          </div>
          {/* Legal */}
          <div>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:9, letterSpacing:3.5, textTransform:"uppercase", color:"#c9a96e", marginBottom:22 }}>Legal</p>
            {[['Privacy Policy','/privacy-policy'],['Terms of Use','/terms-of-use'],['Returns & Care','/returns']].map(([label,href]) => (
              <Link key={label} to={href} style={{ display:'block', fontFamily:"'Montserrat',sans-serif", fontSize:11, color:"#888", marginBottom:14, letterSpacing:.3, textDecoration:'none', transition:'color 0.2s' }}
                onMouseEnter={e=>(e.currentTarget.style.color='#f0ede6')} onMouseLeave={e=>(e.currentTarget.style.color='#888')}>{label}</Link>
            ))}
          </div>
        </div>
        <div style={{ borderTop:"0.5px solid #141414", paddingTop:28, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:9, color:"#444", letterSpacing:2 }}>© 2026 VOGUE INDIA. ALL RIGHTS RESERVED.</p>
          <div style={{ display:"flex", gap:28 }}>
            {["Instagram","Pinterest","Twitter"].map(s => <span key={s} style={{ fontFamily:"'Montserrat',sans-serif", fontSize:9, letterSpacing:2.5, color:"#555", cursor:"pointer", textTransform:"uppercase" }}>{s}</span>)}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ────────── HOME ──────────
function HomePage({ slides, heroIdx, setHeroIdx, setPage, products, addToCart, toggleWish, wishlist, setQuickView }: any) {
  return (
    <div>
      {/* HERO */}
      <div style={{ height:"100vh", position:"relative", overflow:"hidden", background:"#080808" }}>
        {slides.map((sl: any, i: number) => (
          <div key={i} style={{ position:"absolute", inset:0, opacity: i===heroIdx ? 1 : 0, transition:"opacity 1s ease", pointerEvents: i===heroIdx ? "auto" : "none" }}>
            <SmartImg src={sl.img} fb={sl.fb} alt={sl.title}
              className={i===heroIdx ? "hfade" : ""}
              style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 20%", display:"block" }} />
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(160deg,rgba(0,0,0,.6) 0%,rgba(0,0,0,.2) 55%,rgba(0,0,0,.55) 100%)" }} />
          </div>
        ))}
        {/* text */}
        <div style={{ position:"absolute", bottom:"14%", left:"8%", maxWidth:600, zIndex:2 }}>
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:10, letterSpacing:5, color:"#c9a96e", textTransform:"uppercase", marginBottom:18 }}>{slides[heroIdx].sub}</p>
          <h1 className="home-hero-text" style={{ fontSize:"clamp(44px,8vw,92px)", fontWeight:300, lineHeight:1.06, letterSpacing:2, marginBottom:36, textShadow:"0 2px 40px rgba(0,0,0,.5)" }}>{slides[heroIdx].title}</h1>
          <button className="gh-btn" onClick={() => setPage("collection")}
            style={{ padding:"15px 44px", border:"0.5px solid rgba(240,237,230,.75)", background:"transparent", color:"#f0ede6", fontFamily:"'Montserrat',sans-serif", fontSize:9, letterSpacing:4.5, textTransform:"uppercase", cursor:"pointer" }}>
            Explore Collection
          </button>
        </div>
        {/* dots */}
        <div style={{ position:"absolute", bottom:"8%", right:"8%", display:"flex", gap:10, zIndex:2 }}>
          {slides.map((_: any, i: number) => (
            <button key={i} onClick={() => setHeroIdx(i)} style={{ width:i===heroIdx?36:8, height:2, background:i===heroIdx?"#c9a96e":"rgba(240,237,230,.3)", border:"none", cursor:"pointer", transition:"all .4s ease" }} />
          ))}
        </div>
        {/* scroll hint */}
        <div style={{ position:"absolute", bottom:"5%", left:"50%", transform:"translateX(-50%)", zIndex:2, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
          <div style={{ width:1, height:30, background:"linear-gradient(to bottom,rgba(201,169,110,.65),transparent)" }} />
          <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:8, letterSpacing:4, color:"rgba(240,237,230,.35)", textTransform:"uppercase" }}>Scroll</span>
        </div>
      </div>

      {/* MARQUEE */}
      <div style={{ background:"#c9a96e", padding:"13px 0", overflow:"hidden" }}>
        <div className="mw"><div className="mi" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, letterSpacing:7, color:"#0a0a0a" }}>
          {Array(6).fill("  ·  NEW COLLECTION 2026  ·  VOGUE INDIA  ·  COUTURE  ·  FREE SHIPPING ABOVE ₹5000  ·  EXCLUSIVE DROPS").join("")}
          &nbsp;&nbsp;&nbsp;&nbsp;
          {Array(6).fill("  ·  NEW COLLECTION 2026  ·  VOGUE INDIA  ·  COUTURE  ·  FREE SHIPPING ABOVE ₹5000  ·  EXCLUSIVE DROPS").join("")}
        </div></div>
      </div>

      {/* NEW ARRIVALS */}
      <section className="section-padding">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:52 }}>
          <div>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:9, letterSpacing:4, color:"#c9a96e", textTransform:"uppercase", marginBottom:14 }}>Curated</p>
            <h2 style={{ fontSize:42, fontWeight:300, letterSpacing:1 }}>New Arrivals</h2>
          </div>
          <button onClick={() => setPage("collection")} style={{ fontFamily:"'Montserrat',sans-serif", fontSize:9, letterSpacing:3, color:"#555", textTransform:"uppercase", background:"none", border:"none", cursor:"pointer", borderBottom:"0.5px solid #2a2a2a", paddingBottom:5 }}>View All</button>
        </div>
        <div className="mobile-gap-sm" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:28 }}>
          {products.slice(0,4).map((p: Product) => <ProductCard key={p.id} p={p} addToCart={addToCart} toggleWish={toggleWish} wishlist={wishlist} setQuickView={setQuickView} />)}
        </div>
      </section>

      {/* EDITORIAL SPLIT */}
      <section className="grid-2 responsive-padding" style={{ marginBottom:88, minHeight: 460 }}>
        {[
          { src:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&h=460&q=80", fb:"https://picsum.photos/seed/ed1/800/460", tag:"The Edit", title:"Winter Essentials" },
          { src:"https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&h=460&q=80", fb:"https://picsum.photos/seed/ed2/800/460", tag:"Lookbook", title:"Evening Glamour" },
        ].map((e,i) => (
          <div key={i} className="ew" onClick={() => setPage("looks")} style={{ position:"relative", overflow:"hidden", cursor:"pointer" }}>
            <SmartImg src={e.src} fb={e.fb} alt={e.title} className="ei" style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.52)", display:"block", transition:"transform .6s ease" }} />
            <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"30px 32px 36px", background:"linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 100%)" }}>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:9, letterSpacing:4, color:"#c9a96e", textTransform:"uppercase", marginBottom:10 }}>{e.tag}</p>
              <h3 style={{ fontSize:26, fontWeight:300 }}>{e.title}</h3>
            </div>
          </div>
        ))}
      </section>

      {/* NEWSLETTER */}
      <section className="section-padding" style={{ background:"#0d0d0d", textAlign:"center", borderTop:"0.5px solid #141414", borderBottom:"0.5px solid #141414" }}>
        <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:9, letterSpacing:5, color:"#c9a96e", textTransform:"uppercase", marginBottom:18 }}>Members Only</p>
        <h2 style={{ fontSize:38, fontWeight:300, letterSpacing:2, marginBottom:14 }}>Join the Inner Circle</h2>
        <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:11, color:"#888", letterSpacing:.5, lineHeight:2.2, maxWidth:360, margin:"0 auto 40px" }}>Early drops, exclusive editorials, and member privileges.</p>
        <div style={{ display:"flex", maxWidth:400, margin:"0 auto", border:"0.5px solid #2a2a2a" }}>
          <input type="email" placeholder="Your email address" style={{ flex:1, background:"transparent", border:"none", padding:"15px 20px", color:"#f0ede6", fontFamily:"'Montserrat',sans-serif", fontSize:11, letterSpacing:.5 }} />
          <button style={{ padding:"15px 26px", background:"#c9a96e", color:"#0a0a0a", fontFamily:"'Montserrat',sans-serif", fontSize:9, letterSpacing:3, textTransform:"uppercase", border:"none", cursor:"pointer", whiteSpace:"nowrap" }}>Join</button>
        </div>
      </section>
    </div>
  );
}


function ProductCard({ p, addToCart, toggleWish, wishlist }: any) {
  const liked = wishlist.some((w: any) =>(w.id === p.id || w.product?.id === p.id));
  const navigate = useNavigate();
  return (
    <div className="pc" style={{ cursor: 'pointer' }}>
      <div style={{ position: 'relative', overflow: 'hidden', marginBottom: 16, background: '#0f0f0f' }}
           onClick={() => navigate(`/product/${p.id}`)}>
        <img src={getPremiumImage(p)} alt={p.name} className="pi" />
        <div className="co">
          <button onClick={e => { e.stopPropagation(); addToCart(p); }}
            style={{ width: '100%', padding: '13px', background: '#f0ede6', color: '#0a0a0a', fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: 3.5, textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>
            Add to Bag
          </button>
          <button onClick={e => { e.stopPropagation(); navigate(`/product/${p.id}`); }}
            style={{ width: '100%', padding: '12px', background: 'transparent', color: '#f0ede6', fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: 3.5, textTransform: 'uppercase', border: '0.5px solid rgba(240,237,230,.55)', cursor: 'pointer' }}>
            View Product
          </button>
        </div>
        <button onClick={e => { e.stopPropagation(); toggleWish(p.id); }}
          style={{ position: 'absolute', top: 13, right: 13, background: 'none', border: 'none', cursor: 'pointer', fontSize: 19, color: liked ? '#c9a96e' : 'rgba(240,237,230,.65)', transition: 'color .2s' }}>
          {liked ? '♥' : '♡'}
        </button>
        <span style={{ position: 'absolute', top: 13, left: 13, background: '#c9a96e', color: '#0a0a0a', fontFamily: "'Montserrat',sans-serif", fontSize: 8, letterSpacing: 2.5, padding: '4px 10px', textTransform: 'uppercase' }}>
          {p.stock && p.stock > 0 ? 'New' : 'Limited'}
        </span>
      </div>
      <p style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: 2.5, color: '#444', textTransform: 'uppercase', marginBottom: 7 }}>{p.category || 'Couture'}</p>
      <p style={{ fontSize: 19, fontWeight: 300, marginBottom: 7, cursor: 'pointer' }}
         onClick={() => navigate(`/product/${p.id}`)}>{p.name}</p>
      <p style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 12, color: '#c9a96e' }}>₹{p.price.toLocaleString()}</p>
    </div>
  );
}

// ────────── COLLECTION ──────────
const ALL_SIZES = ['XS','S','M','L','XL','XXL','30','32','34','36','8','9','10','11','12'];

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px',
      backgroundColor: '#c9a96e18', border: '0.5px solid #c9a96e44', borderRadius: 3,
      fontFamily: "'Montserrat',sans-serif", fontSize: 8, letterSpacing: 1, color: '#c9a96e',
    }}>
      {label}
      <span onClick={onRemove} style={{ cursor: 'pointer', opacity: 0.7, fontSize: 10 }}>✕</span>
    </span>
  );
}

function CollectionPage({ products, CATEGORIES, catFilter, setCatFilter, addToCart, toggleWish, wishlist, setQuickView }: any) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sort, setSort] = useState('default');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const toggleSize = (s: string) =>
    setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const clearAll = () => {
    setSearch(''); setDebouncedSearch(''); setMinPrice(''); setMaxPrice('');
    setSelectedSizes([]); setSort('default'); setCatFilter('All');
  };

  const hasFilters = debouncedSearch || minPrice || maxPrice || selectedSizes.length > 0 || sort !== 'default' || catFilter !== 'All';

  let filtered = products.filter((p: Product) => {
    if (catFilter !== 'All' && p.category?.toLowerCase() !== catFilter.toLowerCase()) return false;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !(p.category || '').toLowerCase().includes(q)) return false;
    }
    if (minPrice && p.price < parseFloat(minPrice)) return false;
    if (maxPrice && p.price > parseFloat(maxPrice)) return false;
    if (selectedSizes.length > 0) {
      const pSizes: string[] = (p as any).sizes || [];
      if (!selectedSizes.some(s => pSizes.includes(s))) return false;
    }
    return true;
  });

  if (sort === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
  else if (sort === 'name-asc') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div style={{ paddingTop: 72 }}>
      <div style={{ padding: '56px 8% 36px', borderBottom: '0.5px solid #141414' }}>
        <p style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: 5, color: '#c9a96e', textTransform: 'uppercase', marginBottom: 14 }}>Vogue 2026</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
          <h1 style={{ fontSize: 50, fontWeight: 300, letterSpacing: 2, margin: 0 }}>The Collection</h1>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#444', fontSize: '0.8rem', pointerEvents: 'none' }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pieces…"
                style={{ paddingLeft: 32, paddingRight: 10, paddingTop: 8, paddingBottom: 8, backgroundColor: '#0d0d0d', border: '0.5px solid #222', borderRadius: 3, color: '#f0ede6', fontFamily: "'Montserrat',sans-serif", fontSize: 11, letterSpacing: 1, outline: 'none', width: 180 }} />
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)}
              style={{ padding: '8px 10px', backgroundColor: '#0d0d0d', border: '0.5px solid #222', color: '#f0ede6', fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: 1, borderRadius: 3, cursor: 'pointer', outline: 'none' }}>
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="name-asc">Name: A → Z</option>
            </select>
            <button onClick={() => setShowFilters(f => !f)}
              style={{ padding: '8px 14px', backgroundColor: showFilters ? '#c9a96e' : 'transparent', border: '0.5px solid #c9a96e', color: showFilters ? '#000' : '#c9a96e', fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', borderRadius: 3, transition: 'all 0.25s' }}>
              {showFilters ? '✕ Filters' : '⚙ Filters'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginBottom: showFilters ? 20 : 0 }}>
          {CATEGORIES.map((c: string) => (
            <button key={c} onClick={() => setCatFilter(c)}
              style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: catFilter === c ? '#f0ede6' : '#777', background: 'none', border: 'none', borderBottom: catFilter === c ? '0.5px solid #c9a96e' : '0.5px solid transparent', paddingBottom: 7, cursor: 'pointer', transition: 'all .25s' }}>
              {c}
            </button>
          ))}
        </div>

        {showFilters && (
          <div style={{ padding: '1.5rem', backgroundColor: '#080808', border: '0.5px solid #1a1a1a', borderRadius: 4, marginTop: 12, display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 8, letterSpacing: 3, color: '#c9a96e', textTransform: 'uppercase', marginBottom: 10 }}>Price Range (₹)</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                  style={{ width: 72, padding: '6px 8px', backgroundColor: '#111', border: '0.5px solid #222', color: '#f0ede6', borderRadius: 3, fontSize: 11, outline: 'none', fontFamily: 'inherit' }} />
                <span style={{ color: '#333' }}>–</span>
                <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                  style={{ width: 72, padding: '6px 8px', backgroundColor: '#111', border: '0.5px solid #222', color: '#f0ede6', borderRadius: 3, fontSize: 11, outline: 'none', fontFamily: 'inherit' }} />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 8, letterSpacing: 3, color: '#c9a96e', textTransform: 'uppercase', marginBottom: 10 }}>Size</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: 360 }}>
                {ALL_SIZES.map(s => (
                  <button key={s} onClick={() => toggleSize(s)} style={{ padding: '4px 10px', fontSize: 10, fontFamily: "'Montserrat',sans-serif", letterSpacing: 1, backgroundColor: selectedSizes.includes(s) ? '#c9a96e' : 'transparent', color: selectedSizes.includes(s) ? '#000' : '#555', border: `0.5px solid ${selectedSizes.includes(s) ? '#c9a96e' : '#222'}`, borderRadius: 3, cursor: 'pointer', transition: 'all 0.2s' }}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {hasFilters && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 14 }}>
            <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 8, letterSpacing: 2, color: '#444', textTransform: 'uppercase' }}>Filters:</span>
            {catFilter !== 'All' && <Chip label={catFilter} onRemove={() => setCatFilter('All')} />}
            {debouncedSearch && <Chip label={`"${debouncedSearch}"`} onRemove={() => { setSearch(''); setDebouncedSearch(''); }} />}
            {minPrice && <Chip label={`Min ₹${minPrice}`} onRemove={() => setMinPrice('')} />}
            {maxPrice && <Chip label={`Max ₹${maxPrice}`} onRemove={() => setMaxPrice('')} />}
            {selectedSizes.map(s => <Chip key={s} label={s} onRemove={() => toggleSize(s)} />)}
            {sort !== 'default' && <Chip label={sort} onRemove={() => setSort('default')} />}
            <button onClick={clearAll} style={{ fontSize: 9, letterSpacing: 2, color: '#c9a96e', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', fontFamily: "'Montserrat',sans-serif" }}>Clear All</button>
          </div>
        )}
      </div>

      <div style={{ padding: '56px 8% 88px' }}>
        <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: 2, color: '#3a3a3a', textTransform: 'uppercase', marginBottom: 32 }}>
          {filtered.length} piece{filtered.length !== 1 ? 's' : ''} found
        </div>
        {filtered.length === 0
          ? <div style={{ textAlign: 'center', padding: '5rem 0', color: '#333' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>🔍</div>
              <p style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 12 }}>No pieces match your filters.</p>
              <button onClick={clearAll} style={{ marginTop: 16, padding: '8px 20px', backgroundColor: 'transparent', border: '0.5px solid #c9a96e', color: '#c9a96e', cursor: 'pointer', fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', borderRadius: 3 }}>Clear Filters</button>
            </div>
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 32 }}>
              {filtered.map((p: Product) => <ProductCard key={p.id} p={p} addToCart={addToCart} toggleWish={toggleWish} wishlist={wishlist} setQuickView={setQuickView} />)}
            </div>
        }
      </div>
    </div>
  );
}

// ────────── LOOKS ──────────
function LooksPage() {
  const G = [
    { src:"https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80", fb:"https://picsum.photos/seed/g1/800/900", title:"The Silhouette", sub:"Pre-Fall 2026", tall:true },
    { src:"https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80", fb:"https://picsum.photos/seed/g2/800/700", title:"Power Dressing", sub:"SS 2026", tall:false },
    { src:"https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80", fb:"https://picsum.photos/seed/g3/800/700", title:"Red Carpet",     sub:"Resort 2026", tall:false },
    { src:"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80", fb:"https://picsum.photos/seed/g4/800/900", title:"The White Edit", sub:"Capsule", tall:true },
    { src:"https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80", fb:"https://picsum.photos/seed/g5/800/700", title:"Summer Bloom",   sub:"SS 2026", tall:false },
    { src:"https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80", fb:"https://picsum.photos/seed/g6/800/700", title:"Evening Noir",   sub:"FW 2026", tall:false },
  ];
  return (
    <div style={{ paddingTop:72 }}>
      <div style={{ padding:"56px 8% 48px" }}>
        <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:9, letterSpacing:5, color:"#c9a96e", textTransform:"uppercase", marginBottom:14 }}>Editorial</p>
        <h1 style={{ fontSize:50, fontWeight:300, letterSpacing:2 }}>The Looks</h1>
      </div>
      <div style={{ padding:"0 8% 88px", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:4 }}>
        {G.map((g,i) => (
          <div key={i} className="lc" style={{ position:"relative", overflow:"hidden", height:g.tall?520:370 }}>
            <SmartImg src={g.src} fb={g.fb} alt={g.title} className="li" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top", display:"block", transition:"transform .6s ease" }} />
            <div className="lo" style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.42)", display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"28px 28px 32px", opacity:0, transition:"opacity .4s" }}>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:8, letterSpacing:4, color:"#c9a96e", textTransform:"uppercase", marginBottom:10 }}>{g.sub}</p>
              <h3 style={{ fontSize:24, fontWeight:300, letterSpacing:1 }}>{g.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────── ABOUT ──────────
function AboutPage() {
  return (
    <div style={{ paddingTop:72 }}>
      <div style={{ height:"52vh", position:"relative", overflow:"hidden", background:"#0d0d0d" }}>
        <SmartImg
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1600&h=600&q=80"
          fb="https://picsum.photos/seed/ab1/1600/600" alt="About Vogue"
          style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.35)", display:"block" }} />
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }}>
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:9, letterSpacing:5, color:"#c9a96e", textTransform:"uppercase", marginBottom:18 }}>Our Story</p>
          <h1 style={{ fontSize:"clamp(30px,5.5vw,68px)", fontWeight:300, letterSpacing:4, textAlign:"center" }}>Dressed in Intention</h1>
        </div>
      </div>
      <div style={{ padding:"88px 8%" }}>
        <div style={{ maxWidth:660, margin:"0 auto" }}>
          <p style={{ fontSize:22, fontWeight:300, fontStyle:"italic", lineHeight:1.9, marginBottom:44, color:"#999" }}>
            "Fashion is not merely clothing. It is identity, architecture, art — worn as a declaration."
          </p>
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:12, color:"#484848", lineHeight:2.5, marginBottom:26, fontWeight:300 }}>
            Founded in New Delhi in 2018, Vogue India was born from a singular vision: to create clothes that outlast trends. We work with master artisans across Rajasthan, Banaras, and Bengal — blending ancestral craft with contemporary minimalism.
          </p>
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:12, color:"#484848", lineHeight:2.5, fontWeight:300 }}>
            Every piece is limited. Every stitch is intentional. Our fabrics are sourced from mills with fair trade certifications and our ateliers operate on a zero-waste principle. We believe the most luxurious thing a garment can be is honest.
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:32, marginTop:88 }}>
          {[["2018","Founded"],["12","Artisan Partners"],["100%","Sustainable Fabrics"],["6","Collections / Year"]].map(([n,l]) => (
            <div key={l} style={{ borderTop:"0.5px solid #181818", paddingTop:28, textAlign:"center" }}>
              <p style={{ fontSize:52, fontWeight:300, color:"#c9a96e", marginBottom:10, lineHeight:1 }}>{n}</p>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:9, letterSpacing:3, color:"#3a3a3a", textTransform:"uppercase" }}>{l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
