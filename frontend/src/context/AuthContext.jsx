import { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Set up global axios defaults once
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-ShopSphere-CSRF'] = 'shopsphere_v1';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('shopsphere_user'));
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const isRefreshing = useRef(false);

  // Set auth header from stored user on mount
  useEffect(() => {
    if (user?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user?.token]);

  // Axios interceptor — registered ONCE
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Don't retry refresh requests or already-retried requests
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/auth/refresh') &&
          !originalRequest.url?.includes('/auth/login') &&
          !isRefreshing.current
        ) {
          originalRequest._retry = true;
          isRefreshing.current = true;
          try {
            const { data } = await axios.get('/api/auth/refresh');
            if (data.success && data.token) {
              const updatedUser = { ...JSON.parse(localStorage.getItem('shopsphere_user') || '{}'), token: data.token };
              setUser(updatedUser);
              localStorage.setItem('shopsphere_user', JSON.stringify(updatedUser));
              axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
              originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
              isRefreshing.current = false;
              return axios(originalRequest);
            }
          } catch {
            // Refresh failed — log out silently
            setUser(null);
            localStorage.removeItem('shopsphere_user');
            delete axios.defaults.headers.common['Authorization'];
          }
          isRefreshing.current = false;
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []); // Empty deps — register only once

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      const userData = data.data;
      setUser(userData);
      localStorage.setItem('shopsphere_user', JSON.stringify(userData));
      if (userData.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      }
      return { success: true, role: userData.role };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/register', { name, email, password });
      const userData = data.data;
      setUser(userData);
      localStorage.setItem('shopsphere_user', JSON.stringify(userData));
      if (userData.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.get('/api/auth/logout');
    } catch {
      // ignore
    }
    setUser(null);
    localStorage.removeItem('shopsphere_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
