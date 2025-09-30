import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { Lock, Mail, LogIn, Shield, Copy, Check, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = ({ onAdminLogin }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState('');

  useEffect(() => {
    // Animation
    gsap.fromTo('.admin-login-container', 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    );
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://ai-dashboard-task-backend-1.onrender.com/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('admin', JSON.stringify(data.admin));
             
        // Navigate to ADMIN dashboard, not user dashboard
        navigate('/admin/dashboard');
    
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const demoCredentials = [
    { email: 'admin@demo.com', password: 'admin123', label: 'Demo Admin 1' },
    { email: 'super@admin.com', password: 'super123', label: 'Demo Admin 2' }
  ];

  const fillDemoCredentials = (credential) => {
    setFormData({
      email: credential.email,
      password: credential.password
    });
  };

  const goToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
      <div className="admin-login-container bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-2xl border border-white/20 relative">
        
        {/* Home Button */}
        <button
          onClick={goToHome}
          className="absolute top-4 left-4 flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-sm">Home</span>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-white/70">Sign in to access the admin dashboard</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white text-left text-sm font-medium mb-2 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-white/50 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                placeholder="admin@demo.com"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="text-white text-left text-sm font-medium mb-2 block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-white/50 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/50 text-sm">
            Use the demo credentials above for testing
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;