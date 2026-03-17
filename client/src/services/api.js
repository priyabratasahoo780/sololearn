import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:4000/api', // Hardcoded for now, ideal to use import.meta.env.VITE_API_URL
  withCredentials: true, // Important for Refresh Token Cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // We expect the token to be in localStorage if using Header based auth
    // But our backend setup sends a cookie for refresh token and a JSON token for access.
    // Let's store the access token in localStorage for simplicity in this setup.
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (Optional: Handle 401s globally)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        // Note: this endpoint relies on the httpOnly cookie
        const { data } = await api.post('/auth/refresh');
        
        // Save new access token
        localStorage.setItem('token', data.token);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, user is logged out
        localStorage.removeItem('token');
        // window.location.href = '/login'; // Or handle via Context
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
