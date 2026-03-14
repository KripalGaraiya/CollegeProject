import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage, authAPI } from '../services/api';
import { User, LoginResponse } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and user on app start
    const token = storage.getString('token');
    const storedUser = storage.getString('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // Verify token is still valid
        authAPI.getMe()
          .then((userData) => {
            setUser(userData);
            storage.set('user', JSON.stringify(userData));
          })
          .catch(() => {
            storage.delete('token');
            storage.delete('user');
            setUser(null);
          })
          .finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await authAPI.login(email, password);
    storage.set('token', response.access_token);
    storage.set('user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const logout = (): void => {
    storage.delete('token');
    storage.delete('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
