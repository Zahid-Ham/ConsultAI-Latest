// frontend/src/components/Navigation.jsx

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { FaCommentDots, FaUserMd } from 'react-icons/fa';

const Navigation = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    // Destructure the logout function from useAuthContext
    const { user, isAuthenticated, isAdmin, logout } = useAuthContext();

    const isActive = (path) => {
        return location.pathname === path;
    };

    const handleLogout = () => {
        // Correctly call the logout function from the AuthContext
        logout();
        setIsMenuOpen(false);
    };

    // Check if the current path is the AI chat page
    const isAiChatPage = location.pathname === '/chat/ai';

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    <h2>ConsultAI</h2>
                </Link>

                <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    <Link
                        to="/"
                        className={`nav-link ${isActive('/') ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Home
                    </Link>

                    {!isAuthenticated() ? (
                        <>
                            <Link
                                to="/login"
                                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className={`nav-link ${isActive('/register') ? 'active' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Register
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/dashboard"
                                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                            {isAdmin() && (
                                <Link
                                    to="/admin"
                                    className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Admin
                                </Link>
                            )}
                            {user?.role === 'patient' && (
                                <Link
                                    to="/chat/ai"
                                    className={`nav-link ${isAiChatPage ? 'active' : ''}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <FaCommentDots className="mr-2" /> Chat With AI
                                </Link>
                            )}
                            {user?.role === 'doctor' && (
                                <Link
                                    to="/chat"
                                    className={`nav-link ${isActive('/chat') ? 'active' : ''}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <FaUserMd className="mr-2" /> Message Patients
                                </Link>
                            )}
                            <div className="nav-user">
                                <span className="user-name">Welcome, {user?.name}</span>
                                <button
                                    className="nav-link logout-btn"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <div
                    className={`hamburger ${isMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;