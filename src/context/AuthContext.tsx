import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginApi } from '../services/api';

type UserSession = {
  id: string;
  nombre: string;
  rol: string;
  email?: string;
  token: string;
};

type AuthContextType = {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('session');
      if (saved) {
        setUser(JSON.parse(saved));
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await loginApi(email, password);
    const session: UserSession = { ...response.user, token: response.token };
    setUser(session);
    await AsyncStorage.setItem('session', JSON.stringify(session));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('session');
  };

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
