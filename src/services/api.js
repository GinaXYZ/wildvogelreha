/**
 * Centralized API service for all backend calls
 * Supports both development (localhost) and production (relative proxy paths)
 */

const API_BASE_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3000/api'
  : '/api';

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Make HTTP request with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...(options.headers || {}),
      },
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // GET
  get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  // POST
  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // PUT
  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // DELETE
  delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  // Convenience methods
  getBlogs(limit = 10) {
    return this.get(`/blog/latest?limit=${limit}`);
  }

  getProducts(page = 1, limit = 20) {
    return this.get(`/products?page=${page}&limit=${limit}`);
  }

  getCategories() {
    return this.get('/category');
  }

  getDonations(limit = 10) {
    return this.get(`/donations?limit=${limit}`);
  }

  getTopDonations(limit = 10) {
    return this.get(`/donations/top10?limit=${limit}`);
  }

  register(userData) {
    return this.post('/register', userData);
  }

  login(username, password) {
    return this.post('/login', { username, password });
  }

  getProfile(token) {
    return this.get('/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  getOrders(token) {
    return this.get('/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  createOrder(orderData, token) {
    return this.post('/order', orderData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  updateOrderStatus(orderId, status, token) {
    return this.put('/order-status', { id: orderId, status }, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  createBlogPost(post, token) {
    return this.post('/blog', post, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  deleteBlogPost(postId, token) {
    return this.delete(`/blog/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  getContact() {
    return this.get('/contact');
  }

  sendContact(data) {
    return this.post('/contact', data);
  }
}

export default new APIService();
