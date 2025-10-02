import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    if (error.response?.status === 403) {
      console.error('Access denied. Insufficient permissions.');
    }
    
    return Promise.reject(error);
  }
);

// API helper functions
export const authAPI = {
  // Login
  login: (credentials) => {
    if (credentials.googleLogin) {
      return api.post('/auth/google-login', credentials);
    }
    return api.post('/auth/login', credentials);
  },
  
  // Register
  register: (userData) => api.post('/auth/register', userData),
  
  // Get current user profile
  // V V V THIS IS THE CORRECTED LINE V V V
  getProfile: () => api.get('/users/profile'),
};

export const adminAPI = {
  getUnverifiedDoctors: () => api.get('/admin/unverified-doctors'),
  verifyDoctor: (doctorId) => api.put(`/admin/verify-doctor/${doctorId}`),
  getAllUsers: () => api.get('/admin/users'),
};

export const doctorAPI = {
  getAllDoctors: () => api.get('/doctors'),
  getUnverifiedDoctors: () => api.get('/doctors/unverified'),
  verifyDoctor: (doctorId) => api.put(`/doctors/verify/${doctorId}`),
};

// Token management helpers
export const tokenManager = {
  setToken: (token) => {
    localStorage.setItem('token', token);
  },
  getToken: () => {
    return localStorage.getItem('token');
  },
  removeToken: () => {
    localStorage.removeItem('token');
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

// User management helpers
export const userManager = {
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  removeUser: () => {
    localStorage.removeItem('user');
  },
  hasRole: (role) => {
    const user = userManager.getUser();
    return user?.role === role;
  },
  isAdmin: () => {
    return userManager.hasRole('admin');
  },
  isDoctor: () => {
    return userManager.hasRole('doctor');
  },
  isPatient: () => {
    return userManager.hasRole('patient');
  },
};

export default api;
