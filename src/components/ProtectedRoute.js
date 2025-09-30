import { useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/auth';
    }
  }, []);

  const token = localStorage.getItem('token');
  return token ? children : null;
};

export default ProtectedRoute;