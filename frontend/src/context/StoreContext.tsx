import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface UserInfo {
  fullName: string;
  email: string;
  role: string;
}

interface StoreContextType {
  cart: any[];
  wishlist: any[];
  user: UserInfo | null;
  isAdmin: boolean;
  fetchCart: () => Promise<void>;
  fetchWishlist: () => Promise<void>;
  addToCart: (productId: number, size: string, color: string, quantity: number) => Promise<void>;
  updateCart: (cartItemId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  toggleWishlist: (productId: number) => Promise<void>;
  logout: () => void;
  cartTotal: number;
}

const StoreContext = createContext<StoreContextType>({} as StoreContextType);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);

  // Initialize user from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({
        fullName: localStorage.getItem('fullName') || '',
        email: localStorage.getItem('email') || '',
        role: localStorage.getItem('role') || 'CUSTOMER',
      });
    }
  }, []);

  const isAdmin = user?.role === 'ADMIN';

  const fetchCart = useCallback(async () => {
    try {
        const res = await api.get('/api/cart');
        setCart(res.data);
    } catch(e: any) {
        if (e.response?.status !== 401) console.error('Failed to fetch cart:', e.message);
    }
  }, []);

  const fetchWishlist = useCallback(async () => {
    try {
        const res = await api.get('/api/wishlist');
        setWishlist(res.data);
    } catch(e: any) {
        if (e.response?.status !== 401) console.error('Failed to fetch wishlist:', e.message);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchCart();
      fetchWishlist();
    }
  }, [fetchCart, fetchWishlist]);

  const addToCart = async (productId: number, size: string, color: string, quantity: number) => {
    await api.post('/api/cart', { product: {id: productId}, size, color, quantity });
    fetchCart();
  };

  const updateCart = async (cartItemId: number, quantity: number) => {
    await api.put(`/api/cart/${cartItemId}`, { quantity });
    fetchCart();
  };

  const removeFromCart = async (cartItemId: number) => {
    await api.delete(`/api/cart/${cartItemId}`);
    fetchCart();
  };

  const toggleWishlist = async (productId: number) => {
    await api.post(`/api/wishlist/${productId}`);
    fetchWishlist();
  }

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setCart([]);
    setWishlist([]);
    window.location.href = '/login';
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);

  return (
    <StoreContext.Provider value={{ cart, wishlist, user, isAdmin, fetchCart, fetchWishlist, addToCart, updateCart, removeFromCart, toggleWishlist, logout, cartTotal }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
