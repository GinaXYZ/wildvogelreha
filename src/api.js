// API base URL — automatically resolves to current domain + /api
const API_BASE = (() => {
  if (typeof window !== 'undefined') {
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDev) {
      // Use relative path with Vite proxy in development
      return '/api';
    }
    // Production: use relative path (proxied through nginx)
    return '/api';
  }
  return 'http://localhost:3000/api'; // fallback for SSR
})();

export default API_BASE;
export { API_BASE };
