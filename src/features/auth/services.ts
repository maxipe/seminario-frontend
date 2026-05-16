/**
 * Servicios de autenticación de MiniMax.
 * Persiste usuarios en localStorage — sin backend, sin seguridad real (MVP).
 */

import { findUserByEmail, saveUser, setCurrentUser, clearCurrentUser } from '../../lib/localStorage';
import type { User } from '../../types';
import type { LoginCredentials, RegisterData, AuthResponse } from './types';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Autentica un usuario buscándolo en localStorage por email y verificando password.
 * @throws Error si el email no existe o la contraseña es incorrecta.
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  await delay(400);
  const user = findUserByEmail(credentials.email);
  if (!user) throw new Error('No existe una cuenta con ese email.');
  if (user.password !== credentials.password) throw new Error('Contraseña incorrecta.');
  setCurrentUser(user);
  return { user, token: 'local-session' };
}

/**
 * Registra un nuevo usuario en localStorage.
 * @throws Error si ya existe una cuenta con ese email.
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  await delay(600);
  if (findUserByEmail(data.email)) {
    throw new Error('Ya existe una cuenta con ese email.');
  }
  const user: User = {
    id: crypto.randomUUID(),
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role,
    storeName: data.storeName,
    companyName: data.companyName,
    avatarUrl: undefined,
    createdAt: new Date().toISOString(),
  };
  saveUser(user);
  setCurrentUser(user);
  return { user, token: 'local-session' };
}

/**
 * Cierra la sesión del usuario actual.
 */
export async function logout(): Promise<void> {
  clearCurrentUser();
}
