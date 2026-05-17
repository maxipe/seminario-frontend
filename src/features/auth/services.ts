/**
 * Servicios de autenticación de MiniMax.
 * Se comunican con la API REST del backend (NestJS).
 */

import apiClient, { saveToken, clearToken } from '../../lib/apiClient';
import type { User } from '../../types';
import type { LoginCredentials, RegisterData, AuthResponse } from './types';

/**
 * Autentica un usuario contra la API y persiste el token JWT.
 * @throws Error con el mensaje del servidor si las credenciales son incorrectas.
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    saveToken(data.token);
    return data;
  } catch (error: unknown) {
    throw extractError(error, 'Error al iniciar sesión.');
  }
}

/**
 * Registra un nuevo usuario en la API y persiste el token JWT.
 * @throws Error con el mensaje del servidor si el email ya está en uso.
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  try {
    const { data: response } = await apiClient.post<AuthResponse>('/auth/register', data);
    saveToken(response.token);
    return response;
  } catch (error: unknown) {
    throw extractError(error, 'Error al registrarse.');
  }
}

/**
 * Obtiene el perfil del usuario autenticado usando el token JWT almacenado.
 * @throws Error si el token es inválido o expiró.
 */
export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>('/auth/me');
  return data;
}

/**
 * Solicita el envío de un enlace para restablecer la contraseña.
 * No lanza error si el email no existe (por seguridad anti-enumeración).
 */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
  return data;
}

/**
 * Restablece la contraseña utilizando el token provisto por email.
 */
export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>('/auth/reset-password', { token, newPassword });
  return data;
}

/**
 * Cierra la sesión eliminando el token del almacenamiento local.
 */
export async function logout(): Promise<void> {
  clearToken();
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Extrae el mensaje de error legible de la respuesta de Axios. */
function extractError(error: unknown, fallback: string): Error {
  const axiosError = error as { response?: { data?: { message?: string | string[] } } };
  const msg = axiosError?.response?.data?.message;

  if (Array.isArray(msg)) return new Error(msg[0]);
  if (typeof msg === 'string') return new Error(msg);
  return new Error(fallback);
}
