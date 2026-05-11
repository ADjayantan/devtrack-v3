import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000, // 20s — Render free tier cold-starts take up to ~15s
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

// Response — intercept 401s and redirect to /login
// Also normalize error shapes so every catch block gets a plain Error with .message
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('devtrack_token');
      if (!window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }

    let message;
    if (err.response?.data?.message) {
      // Server responded with a structured error
      message = err.response.data.message;
    } else if (err.code === 'ECONNABORTED') {
      message = 'Request timed out — the server may be cold-starting. Please try again.';
    } else if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
      // CORS block or server unreachable — give an actionable message
      message = 'Cannot reach the server. Check that CLIENT_URL is set correctly on Render, or that your backend is running.';
    } else {
      message = err.message || 'Something went wrong.';
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
