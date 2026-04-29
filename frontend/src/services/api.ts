import axios from 'axios';
import { cacheManager } from '../utils/cache';

// Use Vercel proxy (relative path)
const BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: BASE_URL,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;

      // Avoid redirect loop on auth routes
      if (currentPath !== '/login' && !error.config?.url?.startsWith('/auth/')) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Cache GET responses
api.interceptors.response.use((response) => {
  if (response.config.method === 'get' && response.status === 200) {
    const cacheKey = response.config.url || '';
    cacheManager.set(cacheKey, response.data);
  }
  return response;
});

// Wrapper with cache
export const apiWithCache = {
  get: async <T = any>(url: string, config?: any): Promise<any> => {
    const cached = cacheManager.get(url);

    if (cached) {
      return Promise.resolve({
        data: cached,
        status: 200,
        statusText: 'OK (CACHED)',
        config,
        headers: {},
      });
    }

    return api.get<T>(url, config);
  },
};

export default api;