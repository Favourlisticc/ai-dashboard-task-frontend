import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://ai-dashboard-task-backend.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth service methods
export const authService = {
  // Traditional login/register
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Social auth URLs
  getSocialAuthUrls() {
    return {
      google: `${API_URL}/auth/google`,
      github: `${API_URL}/auth/github`,
      facebook: `${API_URL}/auth/facebook`,
    };
  },

  // Handle social auth success
  handleSocialAuthSuccess(token, userId) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ id: userId }));
    
    // Redirect to dashboard
    window.location.href = '/dashboard';
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth';
  },

  // Verify token
  async verifyToken() {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      this.logout();
      throw error;
    }
  }
};

export default authService;