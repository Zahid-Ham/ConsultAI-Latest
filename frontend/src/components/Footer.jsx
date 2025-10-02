import React from "react";
import { FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import "./Footer.css"; // <-- Import the new CSS file

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-content">
        <div className="footer-brand">
          <h3>ConsultAI</h3>
          <p>ConsultAI is a premium healthcare platform connecting patients and doctors securely, powered by AI.</p>
        </div>
        <div className="footer-links">
          <a href="/">Home</a>
          <a href="/dashboard">Dashboard</a>
          <a href="/chat">Chat With AI</a>
          <a href="/privacy-policy">Privacy Policy</a>
          <a href="/terms">Terms & Conditions</a>
        </div>
        <div className="footer-social">
          <a href="#" aria-label="Twitter"><FaTwitter /></a>
          <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
          <a href="#" aria-label="Instagram"><FaInstagram /></a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 ConsultAI. All rights reserved.</span>
        <span>May the code be with you. Always.</span>
      </div>
    </footer>
  );
}
