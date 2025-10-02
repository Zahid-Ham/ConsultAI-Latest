import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Components
import Navigation from './components/Navigation';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Admin from './components/Admin';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ChatbotPage from './components/ChatbotPage';
import PatientDoctorChat from './components/chat/PatientDoctorChat';
import FindDoctor from './components/FindDoctor';
import ProfilePage from './components/ProfilePage'; // 👈 1. IMPORT THE NEW COMPONENT

// CSS
import './App.css';
import './assets/css/ChatStyles.css';

function AppContent() {
  const { user } = useAuthContext();
  return (
    <div className="App">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          {/* 👇 2. ADD THE NEW PROFILE ROUTE HERE */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Admin />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute allowedRoles={['patient', 'doctor']} requireVerified={true}>
              <PatientDoctorChat />
            </ProtectedRoute>
          } />
          <Route path="/chat/ai" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <ChatbotPage />
            </ProtectedRoute>
          } />
          <Route path="/find-doctor" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <FindDoctor />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;