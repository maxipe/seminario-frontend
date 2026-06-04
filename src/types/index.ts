/**
 * Tipos globales del dominio de MiniMax — compartidos entre todas las features.
 * Modelan las entidades principales: proveedores, oportunidades de compra grupal,
 * adhesiones de usuarios y usuarios.
 *
 * NOTA: Estos tipos reflejan las respuestas de la API del backend (NestJS).
 */

export type UserRole = 'buyer' | 'supplier';

/**
 * Datos del proveedor incluidos en la respuesta de la oportunidad.
 * Es un subconjunto del User entity del backend (sin password/resetToken).
 */
export interface SupplierInfo {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName?: string | null;
  storeName?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Oportunidad de compra grupal (en la API se llama "Opportunity").
 * El frontend mantiene el alias "Group" por retrocompatibilidad con los componentes.
 */
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
  supplierId: string;
  supplierOrigin: string;
  supplierCatalogUrl?: string | null;
  supplier?: SupplierInfo;
  tags?: string[] | null;
  adhesions?: UserCommitment[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Adhesión del usuario a una oportunidad (en la API se llama "Adhesion").
 * El frontend mantiene el alias "UserCommitment" por retrocompatibilidad con los componentes.
 */
export interface UserCommitment {
  id: string;
  userId: string;
  opportunityId: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'preparing' | 'shipped' | 'delivered';
  createdAt: string; // ISO string
  cancellationReason?: 'user' | 'opportunity_expired';
  /** Oportunidad asociada, incluida cuando la API devuelve relaciones */
  opportunity?: Group;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: {
    opportunityId?: string;
    adhesionId?: string;
    status?: string;
    quantity?: number;
  } | null;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeName?: string | null;    // buyers: nombre de su tienda
  companyName?: string | null;  // suppliers: nombre de su empresa
  avatarUrl?: string | null;
  createdAt: string; // ISO string
}

export type Supplier = SupplierInfo;
