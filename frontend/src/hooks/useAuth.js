import { useState, useEffect } from 'react';
import { authAPI, tokenManager, userManager } from '../utils/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = tokenManager.getToken();
        if (token) {
          // Try to get user profile from API
          const response = await authAPI.getProfile();
          const userData = response.data.data;
          setUser(userData);
          userManager.setUser(userData);
        }
      } catch (err) {
        // If API call fails, clear stored data
        tokenManager.removeToken();
        userManager.removeUser();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authAPI.login(credentials);
      const { user: userData, token } = response.data.data;
      
      // Store token and user data
      tokenManager.setToken(token);
      userManager.setUser(userData);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authAPI.register(userData);
      const { user: newUser, token } = response.data.data;
      
      // Store token and user data
      tokenManager.setToken(token);
      userManager.setUser(newUser);
      setUser(newUser);
      
      return { success: true, user: newUser };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    tokenManager.removeToken();
    userManager.removeUser();
    setUser(null);
    setError(null);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('admin');
  };

  // Check if user is doctor
  const isDoctor = () => {
    return hasRole('doctor');
  };

  // Check if user is patient
  const isPatient = () => {
    return hasRole('patient');
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    hasRole,
    isAdmin,
    isDoctor,
    isPatient,
    isAuthenticated,
  };
}; 