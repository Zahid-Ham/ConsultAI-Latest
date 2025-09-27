import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import LoginGuide from './LoginGuide';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleError, setGoogleError] = useState(null);
  
  const { login, error } = useAuthContext();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await login(formData);
    if (result.success) {
      navigate('/dashboard');
    }
    
    setIsSubmitting(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsSubmitting(true);
      setGoogleError(null);
      
      // Decode the credential to get user information
      const decoded = jwtDecode(credentialResponse.credential);
      
      // Create a payload with Google user information
      const googleUser = {
        email: decoded.email,
        googleId: decoded.sub,
        name: decoded.name,
        picture: decoded.picture
      };
      
      // Call the backend to handle Google login
      // This will be implemented in the backend
      const result = await login({
        googleLogin: true,
        googleUser
      });
      
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setGoogleError('Google sign-in failed. Please try again.');
      console.error('Google login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGoogleFailure = () => {
    setGoogleError('Google sign-in failed. Please try again.');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to ConsultAI</h2>
        <p className="auth-subtitle">Welcome back! Please sign in to your account.</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-divider">
          <span>OR</span>
        </div>
        
        <div className="google-login-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
            useOneTap
            theme="filled_blue"
            text="signin_with"
            shape="rectangular"
            logo_alignment="center"
            width="100%"
          />
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {googleError && (
          <div className="error-message">
            {googleError}
          </div>
        )}
        
        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="link">
              Sign up here
            </Link>
          </p>
        </div>
        
        <LoginGuide />
      </div>
    </div>
  );
};

export default Login;