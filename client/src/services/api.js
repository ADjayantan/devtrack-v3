import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10s — avoids hanging requests when server is cold-starting on Render
});

// Request: attach token from localStorage on every call
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('devtrack_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Fix FE-SEC-01: Response — intercept 401s and redirect to /login
// Also normalize error shapes so every catch block gets a plain Error with .message
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Token expired or invalid — clean up and force re-login
      localStorage.removeItem('devtrack_token');
      // Only redirect if not already on an auth page to avoid redirect loops
      if (!window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }

    const message =
      err.response?.data?.message ||
      (err.code === 'ECONNABORTED' ? 'Request timed out. Is the server running?' : null) ||
      err.message ||
      'Something went wrong.';

    return Promise.reject(new Error(message));
  }
);

export default api;
