import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session via API
    const checkAuth = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.data);
      } catch (err) {
        setUser(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    // Only check if we have a token
    if (localStorage.getItem('token')) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data.data);
      localStorage.setItem('token', data.token); // Store token
      return { success: true };
    } catch (err) {
       return { 
         success: false, 
         error: err.response?.data?.message || 'Invalid email or password' 
       };
    }
  };

  const signup = async (name, email, password) => {
    try {
      console.log('Attempting signup for:', email);
      const { data } = await api.post('/auth/signup', { name, email, password });
      console.log('Signup success:', data);
      setUser(data.data);
      localStorage.setItem('token', data.token); // Store token
      return { success: true };
    } catch (err) {
      console.error('Signup Error:', err);
      console.error('Response Data:', err.response?.data);
      
      let errorMessage = 'Registration failed';
      
      if (err.response) {
        // Server responded
        errorMessage = err.response.data?.message || err.response.data?.error || 'Server error';
      } else if (err.request) {
        // Request made but no response
        errorMessage = 'No response from server. Check internet connection.';
      } else {
        // Request setup error
        errorMessage = err.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data);
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  };

  const sendOtp = async (email) => {
    try {
      const { data } = await api.post('/auth/send-otp', { email });
      // Backend returns 200 even if email fails but provides OTP fallback
      return { 
        success: true, 
        otp: data.otp,
        emailSent: data.emailSent,
        message: data.message
      };
    } catch (err) {
      console.error('OTP Send Error:', err);
      return {
        success: false,
        error: err.response?.data?.message || err.response?.data?.error || 'Failed to send OTP. Please check your connection.'
      };
    }
  };

  const verifyOtp = async (email, otp, name = null) => {
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp, name });
      setUser(data.data);
      localStorage.setItem('token', data.token);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Invalid OTP'
      };
    }
  };

  const updateProfile = async (details) => {
    try {
      const { data } = await api.put('/auth/updatedetails', details);
      setUser(data.data);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to update profile'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, refreshUser, sendOtp, verifyOtp, updateProfile }}>
      {loading ? (
        <LoadingSpinner fullScreen />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
