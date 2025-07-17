import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedRole = localStorage.getItem('role');
    if (token && savedUser && savedRole) {
      setUser(JSON.parse(savedUser));
      setRole(savedRole);
    }
    setLoading(false);
  }, []);

  const login = async (email, password, twofa_code) => {
    try {
      const response = await authAPI.login({ email, password, twofa_code });
      const { user, token, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', role);
      setUser(user);
      setRole(role);
      return { success: true, role };
    } catch (error) {
      if (error.response?.status === 206 && error.response?.data?.twofa_required) {
        return { success: false, twofa_required: true, error: error.response.data.error };
      }
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const register = async (fullName, email, password) => {
    try {
      const response = await authAPI.register({ fullName, email, password });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setUser(null);
    setRole(null);
  };

  const value = {
    user,
    role,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 