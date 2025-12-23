import axios from "axios";

// --- FORCE THE LIVE URL ---
// Do not use import.meta.env here anymore. We are hardcoding it to ensure it works.
const API_BASE_URL = "https://consultai-backend.onrender.com/api";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Optional: Force reload to clear state if needed
      // window.location.reload();
    }

    if (error.response?.status === 403) {
      console.error("Access denied. Insufficient permissions.");
    }

    return Promise.reject(error);
  }
);

// API helper functions
export const authAPI = {
  login: (credentials) => {
    if (credentials.googleLogin) {
      return api.post("/auth/google-login", credentials);
    }
    return api.post("/auth/login", credentials);
  },
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/users/profile"),
};

export const adminAPI = {
  getUnverifiedDoctors: () => api.get("/admin/unverified-doctors"),
  verifyDoctor: (doctorId) => api.put(`/admin/verify-doctor/${doctorId}`),
  getAllUsers: () => api.get("/admin/users"),
};

export const doctorAPI = {
  getAllDoctors: () => api.get("/doctors"),
  getUnverifiedDoctors: () => api.get("/doctors/unverified"),
  verifyDoctor: (doctorId) => api.put(`/doctors/verify/${doctorId}`),
};

export const tokenManager = {
  setToken: (token) => localStorage.setItem("token", token),
  getToken: () => localStorage.getItem("token"),
  removeToken: () => localStorage.removeItem("token"),
  isAuthenticated: () => !!localStorage.getItem("token"),
};

export const userManager = {
  setUser: (user) => localStorage.setItem("user", JSON.stringify(user)),
  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
  removeUser: () => localStorage.removeItem("user"),
  hasRole: (role) => {
    const user = userManager.getUser();
    return user?.role === role;
  },
  isAdmin: () => userManager.hasRole("admin"),
  isDoctor: () => userManager.hasRole("doctor"),
  isPatient: () => userManager.hasRole("patient"),
};

export default api;
