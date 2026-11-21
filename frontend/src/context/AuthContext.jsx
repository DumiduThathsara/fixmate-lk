import { createContext, useContext, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());

  const login = async (credentials) => {
    const data = await authService.loginCustomerOrTech(credentials);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.registerUser(userData);
    setUser(data.user);
    return data;
  };

  const adminLogin = async (credentials) => {
    const data = await authService.loginAdmin(credentials);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    role: user?.role ?? null,
    isAuthenticated: Boolean(user),
    login,
    register,
    adminLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
