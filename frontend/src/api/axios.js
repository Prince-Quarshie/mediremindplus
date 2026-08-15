import axios from 'axios';

const defaultApiUrl = import.meta.env.PROD
  ? 'https://mediremindplus.onrender.com/api'
  : 'http://localhost:5000/api';

const api = axios.create({
  // VITE_API_URL is set by the frontend host at build time. The fallback keeps
  // local development and the current Render deployment working out of the box.
  baseURL: (import.meta.env.VITE_API_URL || defaultApiUrl).replace(/\/+$/, ''),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
