// API Service Example for Frontend Integration
// Place this in: src/services/api.js

import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// PRODUCT SERVICES
// ============================================

export const productService = {
  // Get all products with filters
  getAll: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get single product
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create product (admin)
  create: async (data) => {
    const response = await api.post('/products', data);
    return response.data;
  },

  // Update product (admin)
  update: async (id, data) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  // Delete product (admin)
  delete: async (id) => {
    await api.delete(`/products/${id}`);
  },

  // Export to CSV (admin)
  exportCSV: async () => {
    const response = await api.get('/products/export/csv', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Import from CSV (admin)
  importCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/products/import/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// ============================================
// CATEGORY SERVICES
// ============================================

export const categoryService = {
  getAll: async (params = {}) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/categories/${id}`);
  },
};

// ============================================
// ORDER SERVICES
// ============================================

export const orderService = {
  getAll: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}`, { status });
    return response.data;
  },

  getByCustomer: async (customerId) => {
    const response = await api.get('/orders', {
      params: { customerId },
    });
    return response.data;
  },
};

// ============================================
// CUSTOMER SERVICES
// ============================================

export const customerService = {
  getAll: async (params = {}) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/customers', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },
};

// ============================================
// WISHLIST SERVICES
// ============================================

export const wishlistService = {
  getByCustomer: async (customerId) => {
    const response = await api.get(`/wishlist/customer/${customerId}`);
    return response.data;
  },

  add: async (customerId, productId) => {
    const response = await api.post('/wishlist', { customerId, productId });
    return response.data;
  },

  remove: async (id) => {
    await api.delete(`/wishlist/${id}`);
  },

  removeByProduct: async (customerId, productId) => {
    await api.delete(`/wishlist/customer/${customerId}/product/${productId}`);
  },

  clear: async (customerId) => {
    await api.delete(`/wishlist/customer/${customerId}/clear`);
  },
};

// ============================================
// REVIEW SERVICES
// ============================================

export const reviewService = {
  getAll: async (params = {}) => {
    const response = await api.get('/reviews', { params });
    return response.data;
  },

  getTestimonials: async (approved = true) => {
    const response = await api.get('/reviews/testimonials', {
      params: { approved },
    });
    return response.data;
  },

  getByProduct: async (productId, approved = true) => {
    const response = await api.get(`/reviews/product/${productId}`, {
      params: { approved },
    });
    return response.data;
  },

  getProductRating: async (productId) => {
    const response = await api.get(`/reviews/product/${productId}/rating`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/reviews/${id}`, data);
    return response.data;
  },

  approve: async (id) => {
    const response = await api.patch(`/reviews/${id}/approve`);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/reviews/${id}`);
  },
};

// ============================================
// UPLOAD SERVICES
// ============================================

export const uploadService = {
  single: async (file, folder = 'products') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    const response = await api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
  },

  multiple: async (files, folder = 'products') => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    formData.append('folder', folder);
    
    const response = await api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.urls;
  },
};

// ============================================
// DASHBOARD SERVICES
// ============================================

export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

// ============================================
// AUTH SERVICES
// ============================================

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('authToken', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
};

// ============================================
// DISCOUNT SERVICES
// ============================================

export const discountService = {
  getAll: async () => {
    const response = await api.get('/discounts');
    return response.data;
  },

  validate: async (code) => {
    const response = await api.post('/discounts/validate', { code });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/discounts', data);
    return response.data;
  },
};

export default api;
