import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../lib/api';

const AuthGuard = ({ children, allowedRoles = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { from: location } });
        return;
      }

      try {
        const response = await api.get('/users/profile');
        if (response.success) {
          const userRole = response.data.role_name?.toLowerCase();
          
          if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
            // Role not allowed
            navigate('/'); // Redirect to dashboard or forbidden page
            return;
          }
          
          setIsAuthorized(true);
        } else {
          throw new Error('Profile fetch failed');
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('token');
        navigate('/login', { state: { from: location } });
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [navigate, location, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthorized ? children : null;
};

export default AuthGuard;
