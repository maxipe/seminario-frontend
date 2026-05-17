/**
 * Cliente HTTP (Axios) para la API de MiniMax.
 * Inyecta automáticamente el Bearer token en cada request
 * y maneja errores de autenticación de forma centralizada.
 */

import axios from 'axios';

// Clave de localStorage para persistir el JWT
const TOKEN_STORAGE_KEY = 'minimax_token';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Interceptor de request: adjunta el token JWT si existe
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de response: loguea errores y maneja 401 (sesión expirada)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url;

    console.error(`[apiClient] Error ${status} en ${url}:`, error?.message);

    // Si el token expiró o es inválido, limpiamos la sesión
    if (status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }

    return Promise.reject(error);
  },
);

// ─── Utilidades de gestión de token ────────────────────────────────────────────

/** Persiste el token JWT en localStorage. */
export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

/** Obtiene el token JWT actual (o null si no hay sesión). */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/** Elimina el token JWT (cierra sesión del lado del cliente). */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export default apiClient;
