/**
 * Global domain types for MiniMax — shared across all features.
 * These model the core entities: suppliers, buying groups, user commitments, and users.
 */

export type UserRole = 'buyer' | 'supplier';

export interface Supplier {
  id: string;
  name: string;
  description: string;
  origin: string;
  catalogUrl?: string;
}

export interface Group {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  unitPrice: number;
  wholesalePrice: number;
  discountPercentage: number;
  minimumUnits: number;
  committedUnits: number;
  progressPercent: number;
  remainingUnits: number;
  expiresAt: string; // ISO string
  activeMembers: number;
  status: 'open' | 'confirmed' | 'cancelled';
  supplier: Supplier;
  supplierEmail?: string; // FK al usuario proveedor que lo creó
  tags?: string[];
}

export interface UserCommitment {
  id: string;
  userEmail: string; // FK al usuario comprador
  groupId: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string; // ISO string
  cancellationReason?: 'user' | 'group_expired';
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // plano, MVP sin seguridad
  role: UserRole;
  storeName?: string;    // buyers: nombre de su tienda
  companyName?: string;  // suppliers: nombre de su empresa
  avatarUrl?: string;
  createdAt: string; // ISO string
}
