// frontend/src/components/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import FeatureRing3D from "./landing/FeatureRing3D";
import "./landing/featureRing3D.css";
import Testimonials from "./Testimonials";
import FAQ from "./FAQ";
import Footer from "./Footer";
import "./LandingTheme.css";
import TermsAndConditions from './TermsAndConditions'; // 👈 Import
import PrivacyPolicy from './PrivacyPolicy';         // 👈 Import

const Home = () => {
  const { isAuthenticated, user, isDoctor, isPatient } = useAuthContext();

  return (
    <div className="home-container">
      {/* Hero */}
      <header style={{ padding: "48px 16px", textAlign: "center" }}>
        <div className="welcome-card">
          <h1 className="welcome-title">
            Welcome to <span className="consultai-accent">ConsultAI</span>
          </h1>
          <p className="welcome-subtitle" style={{ color: "#ffff" }}>
            Your trusted healthcare consultation platform
          </p>

          {!isAuthenticated() && (
            <div className="welcome-actions">
              <Link to="/login">
                <button className="explore">Sign In</button>
              </Link>
              <Link to="/register">
                <button
                  className="explore"
                  style={{ background: "#7b97cfff", color: "#ffd700" }}
                >
                  Create Account
                </button>
              </Link>
            </div>
          )}

          {isAuthenticated() && (
            <div className="welcome-actions">
              <span className="welcome-user">Welcome, {user?.name}!</span>
              <Link to="/dashboard">
                <button className="explore">Go to Dashboard</button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* 3D carousel */}
      <main>
        <FeatureRing3D />
        <Testimonials />
        <FAQ />
      </main>

      {/* optional footer spacing */}
      <Footer />
    </div>
  );
};

export default Home;
