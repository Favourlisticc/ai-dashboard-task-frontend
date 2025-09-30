import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Tab } from '@headlessui/react';
import { gsap } from 'gsap';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../services/authService';

// Validation schemas
const loginSchema = yup.object({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
});

const signupSchema = yup.object({
  username: yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password')
});

const AuthForm = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState({ type: '', message: '' });
  const [checkingSession, setCheckingSession] = useState(true);

  const { register: loginRegister, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors }, reset: resetLogin } = useForm({
    resolver: yupResolver(loginSchema)
  });

  const { register: signupRegister, handleSubmit: handleSignupSubmit, formState: { errors: signupErrors }, reset: resetSignup, watch } = useForm({
    resolver: yupResolver(signupSchema)
  });

  const passwordValue = watch('password');

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      setCheckingSession(true);
      
      // Check if user is already authenticated
      if (authService.isAuthenticated()) {
        console.log('User already authenticated, verifying token...');
        
        // Optional: Verify token with backend to ensure it's still valid
        try {
          // If you have a token verification endpoint, call it here
          // await authService.verifyToken();
          console.log('Token is valid, redirecting to dashboard...');
          redirectToDashboard();
        } catch (error) {
          console.log('Token verification failed, clearing session...');
          authService.logout();
          setCheckingSession(false);
        }
      } else {
        console.log('No existing session found');
        setCheckingSession(false);
        
        // Check for social auth callback parameters
        checkSocialAuthCallback();
        
        // Start animations only after session check
        startAnimations();
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setCheckingSession(false);
      startAnimations();
    }
  };

  const checkSocialAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userData = urlParams.get('user');


    
    if (token && userData) {
      console.log('Social auth callback detected');
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        authService.handleSocialAuthSuccess(token, user);
        redirectToDashboard();
      } catch (error) {
        console.error('Error processing social auth callback:', error);
        setAuthMessage({
          type: 'error',
          message: 'Failed to process authentication. Please try again.'
        });
      }
    } else {
      // Check for errors in URL parameters
      const error = urlParams.get('error');
      if (error) {
        setAuthMessage({
          type: 'error',
          message: getErrorMessage(error)
        });
      }
    }
  };

  const redirectToDashboard = () => {
    // Use replace instead of href to prevent back navigation to auth page
    window.location.replace('/dashboard');
  };

  const startAnimations = () => {
    gsap.fromTo('.auth-container', 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
    );
  };

  const handleTabChange = (index) => {
    setActiveTab(index);
    setAuthMessage({ type: '', message: '' });
    resetLogin();
    resetSignup();
  };

  const getErrorMessage = (errorCode) => {
    const errors = {
      'authentication_failed': 'Authentication failed. Please try again.',
      'google_auth_failed': 'Google authentication failed.',
      'github_auth_failed': 'GitHub authentication failed.',
      'facebook_auth_failed': 'Facebook authentication failed.',
      'github_rate_limit': 'GitHub API rate limit exceeded. Please try again later.',
      'github_email_access': 'Could not access your GitHub email. Please make your email public or use another method.',
    };
    return errors[errorCode] || 'An error occurred during authentication.';
  };

  const handleSocialAuth = (provider) => {
    const urls = authService.getSocialAuthUrls();
    
    switch (provider) {
      case 'Google':
        window.location.href = urls.google;
        break;
      case 'GitHub':
        window.location.href = urls.github;
        break;
      case 'Facebook':
        window.location.href = urls.facebook;
        break;
      case 'Face Recognition':
        setAuthMessage({ type: 'info', message: 'Face recognition authentication coming soon!' });
        break;
      default:
        break;
    }
  };

// In your AuthForm component
const onLogin = async (data) => {
  setIsLoading(true);
  setAuthMessage({ type: '', message: '' });

  try {
    console.log('Attempting login with:', { email: data.email });
    const result = await authService.login(data);
    
    if (result.success) {
      setAuthMessage({ type: 'success', message: 'Login successful!' });

      console.log('Storing session data...', result);
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      console.log('Login successful, redirecting to dashboard...');
      
      setTimeout(() => {
        redirectToDashboard();
      }, 1000);
    } else {
      setAuthMessage({ type: 'error', message: result.message || 'Login failed' });
    }
  } catch (error) {
    console.error('Full login error:', error);
    
    // Axios error structure
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data;
      console.log('Error response data:', errorData);
      
      if (errorData.errors && Array.isArray(errorData.errors)) {
        // Backend validation errors
        const errorMessages = errorData.errors.map(err => err.message || err.msg).join(', ');
        setAuthMessage({ 
          type: 'error', 
          message: errorMessages || 'Please check your input fields.' 
        });
      } else {
        setAuthMessage({ 
          type: 'error', 
          message: errorData.message || 'Login failed. Please try again.' 
        });
      }
    } else if (error.request) {
      // Network error - no response received
      setAuthMessage({ 
        type: 'error', 
        message: 'Network error. Please check your connection and try again.' 
      });
    } else {
      // Other errors
      setAuthMessage({ 
        type: 'error', 
        message: error.message || 'An unexpected error occurred.' 
      });
    }
  } finally {
    setIsLoading(false);
  }
};

const onSignup = async (data) => {
  setIsLoading(true);
  setAuthMessage({ type: '', message: '' });

  try {
    console.log('Attempting registration with:', { 
      username: data.username, 
      email: data.email 
    });
    
    const result = await authService.register(data);

    if (result.success) {
      setAuthMessage({ type: 'success', message: 'Account created successfully! Please login.' });
      resetSignup();
      setTimeout(() => setActiveTab(0), 2000);
    } else {
      setAuthMessage({ type: 'error', message: result.message || 'Registration failed' });
    }
  } catch (error) {
    console.error('Full signup error:', error);
    
    // Axios error structure
    if (error.response) {
      const errorData = error.response.data;
      console.log('Error response data:', errorData);
      
      if (errorData.errors && Array.isArray(errorData.errors)) {
        // Backend validation errors
        const errorMessages = errorData.errors.map(err => err.message || err.msg).join(', ');
        setAuthMessage({ 
          type: 'error', 
          message: errorMessages || 'Please check your input fields.' 
        });
      } else {
        setAuthMessage({ 
          type: 'error', 
          message: errorData.message || 'Registration failed. Please try again.' 
        });
      }
    } else if (error.request) {
      setAuthMessage({ 
        type: 'error', 
        message: 'Network error. Please check your connection and try again.' 
      });
    } else {
      setAuthMessage({ 
        type: 'error', 
        message: error.message || 'An unexpected error occurred.' 
      });
    }
  } finally {
    setIsLoading(false);
  }
};

  const InputField = ({ icon: Icon, error, ...props }) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
          error 
            ? 'border-red-500 focus:ring-red-200' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
        }`}
        {...props}
      />
      {error && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
      )}
    </div>
  );

  const PasswordField = ({ showPassword, setShowPassword, error, ...props }) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Lock className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type={showPassword ? 'text' : 'password'}
        className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
          error 
            ? 'border-red-500 focus:ring-red-200' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
        }`}
        {...props}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 pr-3 flex items-center"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        ) : (
          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        )}
      </button>
    </div>
  );

  // Show loading screen while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br pt-20 from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="auth-container max-w-md w-full space-y-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">AI</span>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to NexusAI
          </h2>
          <p className="mt-2 text-gray-600">Sign in to your account or create a new one</p>
        </div>

        {/* Auth Message */}
        {authMessage.message && (
          <div className={`p-4 rounded-lg border ${
            authMessage.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-700' 
              : authMessage.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            <div className="flex items-center">
              {authMessage.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {authMessage.message}
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tab.Group selectedIndex={activeTab} onChange={handleTabChange}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 ${
                  selected
                    ? 'bg-white shadow text-blue-600'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                }`
              }
            >
              Login
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 ${
                  selected
                    ? 'bg-white shadow text-blue-600'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                }`
              }
            >
              Sign Up
            </Tab>
          </Tab.List>

          <Tab.Panels className="mt-6">
            {/* Login Panel */}
            <Tab.Panel>
              <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-left text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <InputField
                    id="login-email"
                    type="email"
                    icon={Mail}
                    error={loginErrors.email}
                    {...loginRegister('email')}
                    placeholder="Enter your email"
                  />
                  {loginErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{loginErrors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-left text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <PasswordField
                    id="login-password"
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    error={loginErrors.password}
                    {...loginRegister('password')}
                    placeholder="Enter your password"
                  />
                  {loginErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{loginErrors.password.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            </Tab.Panel>

            {/* Signup Panel */}
            <Tab.Panel>
              <form onSubmit={handleSignupSubmit(onSignup)} className="space-y-4">
                <div>
                  <label htmlFor="signup-username" className="block text-left text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <InputField
                    id="signup-username"
                    type="text"
                    icon={User}
                    error={signupErrors.username}
                    {...signupRegister('username')}
                    placeholder="Choose a username"
                  />
                  {signupErrors.username && (
                    <p className="mt-1 text-sm text-red-600">{signupErrors.username.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="signup-email" className="block text-left text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <InputField
                    id="signup-email"
                    type="email"
                    icon={Mail}
                    error={signupErrors.email}
                    {...signupRegister('email')}
                    placeholder="Enter your email"
                  />
                  {signupErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{signupErrors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="signup-password" className="block text-left text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <PasswordField
                    id="signup-password"
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    error={signupErrors.password}
                    {...signupRegister('password')}
                    placeholder="Create a password"
                  />
                  {signupErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{signupErrors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="signup-confirmPassword" className="block text-left text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <PasswordField
                    id="signup-confirmPassword"
                    showPassword={showConfirmPassword}
                    setShowPassword={setShowConfirmPassword}
                    error={signupErrors.confirmPassword}
                    {...signupRegister('confirmPassword')}
                    placeholder="Confirm your password"
                  />
                  {signupErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{signupErrors.confirmPassword.message}</p>
                  )}
                  {passwordValue && !signupErrors.confirmPassword && watch('confirmPassword') && (
                    <p className="mt-1 text-sm text-green-600">✓ Passwords match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        {/* Social Auth Section */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <button
              onClick={() => handleSocialAuth('Google')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-200 hover:scale-105"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>

            <button
              onClick={() => handleSocialAuth('Facebook')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-200 hover:scale-105"
            >
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>

            <button
              onClick={() => handleSocialAuth('GitHub')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-200 hover:scale-105"
            >
              <svg className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;