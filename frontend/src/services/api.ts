import axios from 'axios';
import { cacheManager } from '../utils/cache';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const fallbackApiUrl = isLocalhost ? 'http://localhost:8080' : 'https://clothstore-7jwr.onrender.com';

const api = axios.create({
  baseURL: (configuredApiUrl || fallbackApiUrl).replace(/\/$/, ''),
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 (expired or invalid JWT)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Don't redirect if we're already on login page or hitting auth endpoints
      if (currentPath !== '/login' && !error.config?.url?.startsWith('/auth/')) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Cache GET responses automatically
api.interceptors.response.use((response) => {
  if (response.config.method === 'get' && response.status === 200) {
    const cacheKey = `${response.config.url}`;
    cacheManager.set(cacheKey, response.data);
  }
  return response;
});

// Wrapper function to check cache before making requests
export const apiWithCache = {
  get: async <T = any>(url: string, config?: any): Promise<any> => {
    const cacheKey = url;
    const cached = cacheManager.get(cacheKey);

    if (cached) {
      // Return cached response immediately
      return Promise.resolve({ data: cached, status: 200, statusText: 'OK (CACHED)', config, headers: {} });
    }

    // Make actual request if not cached
    return api.get<T>(url, config);
  },
};

export default api;
