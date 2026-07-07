import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

// Glowing loader screen
const LoadingScreen = () => (
  <div style={{
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.15) 0%, #080B11 100%)',
    gap: '20px'
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      border: '3px solid rgba(124, 58, 237, 0.1)',
      borderTopColor: '#7C3AED',
      animation: 'spin 1s linear infinite',
      boxShadow: '0 0 15px rgba(124, 58, 237, 0.3)'
    }} />
    <h3 style={{
      fontFamily: "'Outfit', sans-serif",
      color: '#9CA3AF',
      fontWeight: 500,
      letterSpacing: '0.05em'
    }}>LOADING DATA...</h3>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
