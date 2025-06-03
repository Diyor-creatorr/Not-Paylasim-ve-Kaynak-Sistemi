import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Configure axios
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;

// Axios interceptor to add token to requests
axios.interceptors.request.use((config) => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Define types
interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  profilePicture: string;
  starAchievement: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (username: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Create context
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  register: async () => {},
  login: async () => {},
  logout: async () => {},
  clearError: () => {},
});

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const res = await axios.get('/api/users/me');
        
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        // User is not logged in
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Register user
  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/register', {
        username,
        email,
        password
      });
      
      if (res.data.success) {
        setUser(res.data.user);
        setError(null);
      }
    } catch (err: any) {
      console.error('Register error:', err.response?.data);
      setError(err.response?.data?.message || 'Kayıt işlemi başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/login', {
        email,
        password
      });
      
      if (res.data.success) {
        setUser(res.data.user);
        setError(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      await axios.post('/api/auth/logout');
      setUser(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => React.useContext(AuthContext);