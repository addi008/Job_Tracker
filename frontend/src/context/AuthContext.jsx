import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user and token are stored in localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // Corrupted localStorage, clear
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.auth.login(email, password);
    const userInfo = data.user;
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userInfo));
    setUser(userInfo);
    return userInfo;
  };

  const signup = async (email, password) => {
    const data = await api.auth.signup(email, password);
    const userInfo = data.user;
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userInfo));
    setUser(userInfo);
    return userInfo;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
