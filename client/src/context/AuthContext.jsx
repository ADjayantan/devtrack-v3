import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('devtrack_token');
    if (!token) {
      setLoading(false);
      return;
    }
    // Fix FE-DUP-01: Don't manually set api.defaults.headers here —
    // the request interceptor in api.js handles token injection automatically.
    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        // Token invalid or expired — clear it silently
        localStorage.removeItem('devtrack_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('devtrack_token', token);
    // Fix FE-DUP-01: No longer manually setting api.defaults.headers here
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('devtrack_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
