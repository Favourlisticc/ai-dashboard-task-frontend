import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/home';
import Chat from './pages/Chat';
import Auth from './pages/Auth';
import AuthSuccess from './pages/AuthSuccess';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import './App.css';
import Pricing from './pages/Pricing';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

import WhatsAppBot from './components/WhatsAppBot'; 



// Layout with navbar and footer
const DefaultLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

// Layout without navbar and footer (for dashboard/chat)
const CleanLayout = ({ children }) => (
  <main className="clean-layout">{children}</main>
);

// Admin layout (no navbar/footer)
const AdminLayout = ({ children }) => (
  <main className="admin-layout">{children}</main>
);

// Check if user has admin token
const isAdminAuthenticated = () => {
  const token = localStorage.getItem('adminToken');
  const admin = localStorage.getItem('admin');
  return !!(token && admin);
};

// Admin Protected Route
const AdminRoute = ({ children }) => {
  return isAdminAuthenticated() ? children : <Navigate to="/admin/login" />;
};

// Public Admin Route (redirect to dashboard if already logged in)
const PublicAdminRoute = ({ children }) => {
  return !isAdminAuthenticated() ? children : <Navigate to="/admin/dashboard" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <WhatsAppBot ></WhatsAppBot>
        <Routes>
          {/* Routes with navbar and footer */}
          <Route path="/" element={
            <DefaultLayout>
              <Home />
            </DefaultLayout>
          } />
          <Route path="/chat" element={
            <DefaultLayout>
              <Chat />
            </DefaultLayout>
          } />
          <Route path="/auth" element={
            <DefaultLayout>
              <Auth />
            </DefaultLayout>
          } />
          <Route path="/pricing" element={
            <DefaultLayout>
              <Pricing />
            </DefaultLayout>
          } />
          <Route path="/auth/success" element={
            <DefaultLayout>
              <AuthSuccess />
            </DefaultLayout>
          } />
          
          {/* User Dashboard */}
          <Route path="/dashboard" element={
            <CleanLayout>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </CleanLayout>
          } />
  
          {/* Admin Routes */}
          <Route path="/admin/login" element={
            <AdminLayout>
              <PublicAdminRoute>
                <AdminLogin onAdminLogin={(admin) => {
                  // This will be handled by the AdminLogin component
                  console.log('Admin logged in:', admin);
                }} />
              </PublicAdminRoute>
            </AdminLayout>
          } />
          
          <Route path="/admin/dashboard" element={
            <AdminLayout>
              <AdminRoute>
                <AdminDashboard 
                  admin={JSON.parse(localStorage.getItem('admin') || '{}')} 
                  onLogout={() => {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('admin');
                    window.location.href = '/admin/login';
                  }} 
                />
              </AdminRoute>
            </AdminLayout>
          } />

          {/* Redirect root admin to login */}
          <Route path="/admin" element={<Navigate to="/admin/login" />} />

          {/* 404 page with default layout */}
          <Route path="*" element={
            <DefaultLayout>
              <NotFound />
            </DefaultLayout>
          } />
        </Routes>
      </div>
    </Router>
  );
}

// Simple 404 component
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-red-50 pt-20">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <a href="/" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
        Go Home
      </a>
    </div>
  </div>
);

export default App;