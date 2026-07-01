import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import UserDashboard from './pages/UserDashboard';
import AdminPanel from './pages/AdminPanel';
import Collection from './pages/Collection';
import Looks from './pages/Looks';
import About from './pages/About';
import { PrivacyPolicy, TermsOfUse, ReturnsAndCare } from './pages/LegalPages';
import { StoreProvider } from './context/StoreContext';
import ChatWidget from './components/ChatWidget';
import './index.css';

// Route guard for authenticated users
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

// Route guard for admin users
function AdminRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = !!localStorage.getItem('token');
  const isAdmin = localStorage.getItem('role') === 'ADMIN';
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;
  return <>{children}</>;
}

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <StoreProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />

          {/* Customer Routes */}
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/product/:id" element={<PrivateRoute><ProductDetail /></PrivateRoute>} />
          <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
          <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/account" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

          {/* Public Marketing Pages */}
          <Route path="/collection" element={<Collection />} />
          <Route path="/looks" element={<Looks />} />
          <Route path="/about" element={<About />} />

          {/* Legal Pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/returns" element={<ReturnsAndCare />} />
        </Routes>
        <ChatWidget />
      </StoreProvider>
    </Router>
  );
}

export default App;
