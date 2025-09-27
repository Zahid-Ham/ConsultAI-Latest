import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import AdminDashboard from './Admin';
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';

const Dashboard = () => {
  const { user, isAdmin, isDoctor, isPatient } = useAuthContext();

  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  // Render the appropriate dashboard based on user role
  if (isAdmin()) {
    return <AdminDashboard />;
  }

  if (isDoctor()) {
    return <DoctorDashboard />;
  }

  if (isPatient()) {
    return <PatientDashboard />;
  }

  // Fallback for unknown role
  return (
    <div className="dashboard-container">
      <div className="error-message">
        <h2>Unknown User Role</h2>
        <p>We couldn't determine your user role. Please contact support.</p>
      </div>
    </div>
  );
};

export default Dashboard;