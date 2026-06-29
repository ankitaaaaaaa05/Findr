import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateUser: (u: User) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const token = await api.getToken();
      if (!token) {
        setUser(null);
        return;
      }
      const { user } = await api.get<{ user: User }>('/auth/me');
      setUser(user);
    } catch {
      await api.clearToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const login = async (email: string, password: string) => {
    const { token, user } = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    await api.saveToken(token);
    setUser(user);
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const { token, user } = await api.post<{ token: string; user: User }>('/auth/register', {
      name,
      email,
      password,
      phone,
    });
    await api.saveToken(token);
    setUser(user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore network error on logout — we still drop the local token
    }
    await api.clearToken();
    setUser(null);
  };

  const updateUser = (u: User) => setUser(u);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
