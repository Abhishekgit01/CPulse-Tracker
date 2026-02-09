import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle 401 responses — clear stale token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem("token");
      if (token) {
        // Token is expired/invalid — clear it
        localStorage.removeItem("token");
        // Reload to reset auth state (AuthContext will pick up null token)
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
