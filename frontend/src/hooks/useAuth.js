import { useState, useEffect } from 'react';
import axios from 'axios';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Requesting user's data from the updated /api/auth/me endpoint
        const response = await axios.get('/api/auth/me', {
          withCredentials: true // Send cookies along with the request
        });
        setUser(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch user data');
        // If not authenticated, redirect to login
        if (err.response?.status === 401 && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const logout = async () => {
    try {
      // Update endpoint to /api/auth/logout for consistency
      await axios.post('/api/auth/logout', {}, {
        withCredentials: true
      });
      setUser(null);
      window.location.href = '/login';
    } catch (err) {
      setError(err.response?.data?.message || 'Logout failed');
    }
  };

  return {
    user,
    loading,
    error,
    logout,
    setUser
  };
};

export default useAuth;