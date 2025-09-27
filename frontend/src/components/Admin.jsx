import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import { useAuthContext } from '../contexts/AuthContext';

const Admin = () => {
  const [unverifiedDoctors, setUnverifiedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin } = useAuthContext();

  useEffect(() => {
    const fetchUnverifiedDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await adminAPI.getUnverifiedDoctors();
        setUnverifiedDoctors(response.data.data || []);
      } catch (err) {
        console.error('Error fetching unverified doctors:', err);
        setError('Failed to load unverified doctors. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin()) {
      fetchUnverifiedDoctors();
    } else {
      setLoading(false);
      setError('You do not have permission to access this page.');
    }
  }, [isAdmin]);

  const handleVerifyDoctor = async (doctorId) => {
    try {
      await adminAPI.verifyDoctor(doctorId);
      
      // Remove from unverified list
      setUnverifiedDoctors(prev => prev.filter(doctor => doctor._id !== doctorId));
    } catch (err) {
      console.error('Error verifying doctor:', err);
      alert('Failed to verify doctor. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }
  
  if (!isAdmin()) {
    return (
      <div className="admin-container">
        <div className="error-message">Access denied. Admin privileges required.</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your ConsultAI platform</p>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <h3>Unverified Doctors</h3>
          <p className="stat-number">{unverifiedDoctors.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">-</p>
        </div>
        <div className="stat-card">
          <h3>Active Sessions</h3>
          <p className="stat-number">-</p>
        </div>
      </div>

      <div className="admin-section">
        <h2>Unverified Doctors</h2>
        {unverifiedDoctors.length === 0 ? (
          <p className="no-data">No unverified doctors found.</p>
        ) : (
          <div className="doctors-list">
            {unverifiedDoctors.map(doctor => (
              <div key={doctor._id} className="doctor-card">
                <div className="doctor-info">
                  <h3>{doctor.name}</h3>
                  <p>{doctor.email}</p>
                  <p className="date">Registered: {new Date(doctor.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="doctor-actions">
                  <button 
                    className="btn btn-success"
                    onClick={() => handleVerifyDoctor(doctor._id)}
                  >
                    Verify Doctor
                  </button>
                  <button className="btn btn-secondary">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <button className="btn btn-primary">View All Users</button>
          <button className="btn btn-primary">System Settings</button>
          <button className="btn btn-primary">Generate Reports</button>
        </div>
      </div>
    </div>
  );
};

export default Admin;