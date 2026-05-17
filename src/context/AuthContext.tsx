/**
 * Contexto de autenticación de MiniMax.
 * Persiste la sesión mediante JWT almacenado en localStorage.
 * Al montar, intenta restaurar la sesión llamando a GET /auth/me.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '../types';
import type { LoginCredentials, RegisterData } from '../features/auth/types';
import * as authService from '../features/auth/services';
import { getToken } from '../lib/apiClient';

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

  // Al montar, intentamos restaurar la sesión con el token existente
  useEffect(() => {
    const storedToken = getToken();
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);

    authService.getMe()
      .then((userData) => {
        setUser(userData);
      })
      .catch(() => {
        // Token inválido o expirado, limpiamos la sesión
        authService.logout();
        setToken(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  async function login(credentials: LoginCredentials): Promise<void> {
    const response = await authService.login(credentials);
    setUser(response.user);
    setToken(response.token);
  }

  async function register(data: RegisterData): Promise<void> {
    const response = await authService.register(data);
    setUser(response.user);
    setToken(response.token);
  }

  async function logout(): Promise<void> {
    await authService.logout();
    setUser(null);
    setToken(null);
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
