import React from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaCommentDots, FaUserMd } from "react-icons/fa";
import ChatFloatingButton from "./ChatWithAI";

const PatientDashboard = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Only show floating button if not on /chat or /chat/ai
  const showChatAIButton = location.pathname !== "/chat" && location.pathname !== "/chat/ai";

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Patient Dashboard</h1>
        <p>Welcome, {user?.name}</p>
      </div>

      <div className="dashboard-stats">
        {/* ... stat cards are unchanged ... */}
        <div className="stat-card">

          <h3>Appointments</h3>
          <p className="stat-number">0</p>
        </div>
        <div className="stat-card">
          <h3>Consultations</h3>
          <p className="stat-number">0</p>
        </div>
        <div className="stat-card">
          <h3>Prescriptions</h3>
          <p className="stat-number">0</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Upcoming Appointments</h2>
        <div className="appointments-list">
          <p className="no-data">No upcoming appointments found.</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Find a Doctor</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by specialty, name, or condition"
            className="search-input"
          />
          <button className="btn btn-primary">Search</button>
        </div>
        <div className="doctors-list">
          <p className="no-data">
            No doctors found. Try searching for a specialty.
          </p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <button className="btn btn-primary">Book Appointment</button>
          {/* Use only the new navigation button for medical report upload */}
          <button
            className="btn btn-primary"
            onClick={() => navigate("/medical-report-upload")}
          >
            Upload/View Medical Reports
          </button>
          <Link to="/chat" className="btn btn-primary">
            Message Doctor
          </Link>
          <Link to="/chat/ai" className="btn btn-primary">
            Chat With AI
          </Link>
        </div>
      </div>
      {showChatAIButton && <ChatFloatingButton />}
    </div>
  );
};

export default PatientDashboard;
