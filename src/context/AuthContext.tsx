/**
 * Contexto de autenticación de MiniMax.
 * Persiste la sesión en localStorage a través de la capa lib/localStorage.ts.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '../types';
import type { LoginCredentials, RegisterData } from '../features/auth/types';
import * as authService from '../features/auth/services';
import { getCurrentUser } from '../lib/localStorage';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getCurrentUser();
    if (stored) {
      setUser(stored);
      setToken('local-session');
    }
    setIsLoading(false);
  }, []);

  function persist(u: User) {
    setUser(u);
    setToken('local-session');
  }

  function clear() {
    setUser(null);
    setToken(null);
  }

  async function login(credentials: LoginCredentials): Promise<void> {
    const response = await authService.login(credentials);
    persist(response.user);
  }

  async function register(data: RegisterData): Promise<void> {
    const response = await authService.register(data);
    persist(response.user);
  }

  async function logout(): Promise<void> {
    await authService.logout();
    clear();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para consumir el contexto de autenticación.
 * @throws Error si se usa fuera de AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
