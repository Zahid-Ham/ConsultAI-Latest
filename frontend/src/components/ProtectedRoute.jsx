import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

/**
 * ProtectedRoute component to secure routes that require authentication
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string[]} [props.allowedRoles] - Optional array of roles allowed to access the route
 * @param {boolean} [props.requireVerified] - Optional flag to require verified status for doctors
 * @returns {React.ReactNode} - The protected component or redirect to login
 */
const ProtectedRoute = ({ children, allowedRoles, requireVerified = false }) => {
  const { user, isAuthenticated, loading } = useAuthContext();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role restrictions if specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // Redirect to home if user doesn't have required role
      return <Navigate to="/" replace />;
    }
  }
  
  // Check verification requirement for doctors
  if (requireVerified && user.role === 'doctor' && !user.isVerified) {
    // Redirect to a pending verification page or show message
    return (
      <div className="verification-required">
        <h2>Verification Required</h2>
        <p>Your doctor account is pending verification by an administrator.</p>
        <p>Please check back later or contact support.</p>
      </div>
    );
  }
  
  // Render children if all checks pass
  return children;
};

export default ProtectedRoute;