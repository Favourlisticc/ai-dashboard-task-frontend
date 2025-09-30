import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { CheckCircle } from 'lucide-react';
import { authService } from '../services/authService';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userData = searchParams.get('user');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Animation
        gsap.fromTo('.success-container', 
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
        );

        // Redirect to dashboard after a delay
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } catch (error) {
        console.error('Error parsing user data:', error);
        window.location.href = '/auth?error=invalid_data';
      }
    } else {
      window.location.href = '/auth?error=missing_data';
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="success-container bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center max-w-md">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Successful!</h2>
        <p className="text-gray-600 mb-6">Welcome to NexusAI Dashboard</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthSuccess;