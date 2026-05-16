/**
 * Tipos del dominio de autenticación.
 */

import type { User, UserRole } from '../../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  storeName?: string;    // buyers
  companyName?: string;  // suppliers
}

export interface AuthResponse {
  user: User;
  token: string;
}
