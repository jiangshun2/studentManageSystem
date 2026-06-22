import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  getCurrentUser,
  setCurrentUser,
  login as mockLogin,
  logout as mockLogout,
} from '../mock/data';

interface AuthContextValue {
  user: User | null;
  login: (username: string, password: string) => User | null;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const value: AuthContextValue = {
    user,
    login: (u, p) => {
      const result = mockLogin(u, p);
      if (result) setUser(result);
      return result;
    },
    logout: () => {
      mockLogout();
      setUser(null);
    },
    updateUser: (u) => {
      setCurrentUser(u);
      setUser(u);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
