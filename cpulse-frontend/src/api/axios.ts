import axios from "axios";

// Use Vercel backend for production, localhost for development
const baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://cpulse-backend.vercel.app'
  : 'http://localhost:5000';

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
