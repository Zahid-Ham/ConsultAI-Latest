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
    // Handle 401 Unauthorized - clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // You can add redirect logic here if needed
      // window.location.href = '/login';
    }
    
    // Handle 403 Forbidden
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
    // Check if this is a Google login
    if (credentials.googleLogin) {
      return api.post('/auth/google-login', credentials);
    }
    return api.post('/auth/login', credentials);
  },
  
  // Register
  register: (userData) => api.post('/auth/register', userData),
  
  // Get current user profile
  getProfile: () => api.get('/profile'),
};

export const adminAPI = {
  // Get unverified doctors
  getUnverifiedDoctors: () => api.get('/admin/unverified-doctors'),
  
  // Verify a doctor
  verifyDoctor: (doctorId) => api.put(`/admin/verify-doctor/${doctorId}`),
  
  // Get all users (admin only)
  getAllUsers: () => api.get('/admin/users'),
};

export const doctorAPI = {
  // Get all doctors
  getAllDoctors: () => api.get('/doctors'),
  
  // Get unverified doctors (admin only)
  getUnverifiedDoctors: () => api.get('/doctors/unverified'),
  
  // Verify doctor (admin only)
  verifyDoctor: (doctorId) => api.put(`/doctors/verify/${doctorId}`),
};

// Token management helpers
export const tokenManager = {
  // Set token in localStorage
  setToken: (token) => {
    localStorage.setItem('token', token);
  },
  
  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem('token');
  },
  
  // Remove token from localStorage
  removeToken: () => {
    localStorage.removeItem('token');
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

// User management helpers
export const userManager = {
  // Set user data in localStorage
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  // Get user data from localStorage
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  // Remove user data from localStorage
  removeUser: () => {
    localStorage.removeItem('user');
  },
  
  // Check if user has specific role
  hasRole: (role) => {
    const user = userManager.getUser();
    return user?.role === role;
  },
  
  // Check if user is admin
  isAdmin: () => {
    return userManager.hasRole('admin');
  },
  
  // Check if user is doctor
  isDoctor: () => {
    return userManager.hasRole('doctor');
  },
  
  // Check if user is patient
  isPatient: () => {
    return userManager.hasRole('patient');
  },
};

export default api;