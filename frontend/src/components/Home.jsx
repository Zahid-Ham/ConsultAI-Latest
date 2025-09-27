// frontend/src/components/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import FeatureRing3D from "./landing/FeatureRing3D";
import "./landing/featureRing3D.css"; // ensure CSS loaded

const Home = () => {
  const { isAuthenticated, user, isDoctor, isPatient } = useAuthContext();

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh" }}>
      {/* Hero */}
      <header style={{ padding: "48px 16px", textAlign: "center" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            background: "white",
            borderRadius: 18,
            padding: "42px 28px",
            boxShadow: "0 10px 30px rgba(25,28,38,0.08)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "3rem",
              fontWeight: 800,
              color: "#1f2937",
            }}
          >
            Welcome to <span style={{ color: "#6a5cff" }}>ConsultAI</span>
          </h1>
          <p style={{ color: "#6b6f86", marginTop: 12 }}>
            Your trusted healthcare consultation platform
          </p>

          {!isAuthenticated() && (
            <div style={{ marginTop: 18, display: "flex", gap: 12, justifyContent: "center" }}>
              <Link to="/login">
                <button
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg,#6a8dff,#7b5cff)",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Sign In
                </button>
              </Link>
              <Link to="/register">
                <button
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: "1px solid #e6e9f8",
                    background: "#f7f9ff",
                    color: "#222",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Create Account
                </button>
              </Link>
            </div>
          )}

          {isAuthenticated() && (
            <div style={{ marginTop: 18, display: "flex", gap: 12, justifyContent: "center", alignItems: "center" }}>
              <span style={{ fontWeight: 600 }}>Welcome, {user?.name}!</span>
              <Link to="/dashboard">
                <button style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg,#6a8dff,#7b5cff)",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}>
                  Go to Dashboard
                </button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* 3D carousel */}
      <main>
        <FeatureRing3D />
      </main>

      {/* optional footer spacing */}
      <div style={{ height: 40 }} />
    </div>
  );
};

export default Home;
