// frontend/src/components/Navigation.jsx

import React, { useState, useEffect, useRef } from "react";
import { FaMoon, FaCommentDots, FaUserMd, FaUserCircle } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import './Navigation.css'; // <-- Import the new CSS file

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuthContext();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    const bodyHasDarkClass = document.body.classList.contains("dark");
    setDarkMode(bodyHasDarkClass);
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const handleDarkModeToggle = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
      return newMode;
    });
  };

  const isAiChatPage = location.pathname === "/chat/ai";

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <h2>ConsultAI</h2>
        </Link>

        <button
          className={`dark-mode-toggle${darkMode ? " active" : ""}`}
          onClick={handleDarkModeToggle}
          aria-label="Toggle dark mode"
          style={{
            background: "none",
            border: "none",
            color: darkMode ? "#ffd700" : "#333",
            fontSize: "1.5rem",
            cursor: "pointer",
            marginLeft: "1rem",
            verticalAlign: "middle",
          }}
        >
          <FaMoon />
        </button>

        <div className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
          <Link
            to="/"
            className={`nav-link ${isActive("/") ? "active" : ""}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>

          {!isAuthenticated() ? (
            <>
              <Link
                to="/login"
                className={`nav-link ${isActive("/login") ? "active" : ""}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`nav-link ${isActive("/register") ? "active" : ""}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>

              {isAdmin() && (
                <Link
                  to="/admin"
                  className={`nav-link ${isActive("/admin") ? "active" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
              )}

              {user?.role === "patient" && (
                <Link
                  to="/chat/ai"
                  className={`nav-link ${isAiChatPage ? "active" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaCommentDots className="mr-2" /> Chat With AI
                </Link>
              )}

              {user?.role === "doctor" && (
                <Link
                  to="/chat"
                  className={`nav-link ${isActive("/chat") ? "active" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUserMd className="mr-2" /> Message Patients
                </Link>
              )}

              <div className="profile-dropdown-container" ref={dropdownRef}>
                <button
                  className="profile-icon-btn"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="welcome-text">Welcome, {user?.name}</span>
                  
                  {/* ===== THIS IS THE CHANGE ===== */}
                  {user?.profilePicture?.url ? (
                    <img 
                      src={user.profilePicture.url} 
                      alt="Profile" 
                      className="nav-profile-img" 
                      onError={(e) => { e.target.onerror = null; e.target.src='https://i.ibb.co/6r114Bw/user-default.png'}} // Fallback for broken image links
                    />
                  ) : (
                    <FaUserCircle size={32} /> // Fallback icon
                  )}
                  {/* ===== END OF CHANGE ===== */}

                </button>

                {isDropdownOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-header">
                      <strong>{user?.name}</strong>
                      <span>{user?.email}</span>
                    </div>
                    <Link
                      to="/profile"
                      className="profile-dropdown-item"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      View Profile
                    </Link>
                    <button
                      className="profile-dropdown-item logout-btn"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div
          className={`hamburger ${isMenuOpen ? "active" : ""}`}
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
