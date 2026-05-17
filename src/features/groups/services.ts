/**
 * Servicios para la feature de oportunidades (grupos) de compra.
 * Se comunican con la API REST del backend.
 */

import apiClient from '../../lib/apiClient';
import type { Group } from '../../types';

export interface GroupFilters {
  category?: string;
  status?: 'open' | 'confirmed' | 'cancelled';
  search?: string;
  supplierId?: string;
}

/**
 * Obtiene las oportunidades (grupos) de compra con filtros opcionales.
 */
export async function getGroups(filters?: GroupFilters): Promise<Group[]> {
  const params: Record<string, string> = {};

  if (filters?.category) params.category = filters.category;
  if (filters?.status) params.status = filters.status;
  if (filters?.search) params.search = filters.search;
  if (filters?.supplierId) params.supplierId = filters.supplierId;

  const { data } = await apiClient.get<Group[]>('/opportunities', { params });
  return data;
}

/**
 * Obtiene el detalle completo de una oportunidad (grupo) por su ID.
 * @param id - Identificador único de la oportunidad.
 */
export async function getGroupById(id: string): Promise<Group> {
  const { data } = await apiClient.get<Group>(`/opportunities/${id}`);
  return data;
}

/**
 * Crea una nueva oportunidad de compra (solo proveedores).
 */
export async function createOpportunity(payload: CreateOpportunityPayload): Promise<Group> {
  const { data } = await apiClient.post<Group>('/opportunities', payload);
  return data;
}

/** Datos necesarios para publicar una nueva oportunidad. */
export interface CreateOpportunityPayload {
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  unitPrice: number;
  wholesalePrice: number;
  discountPercentage: number;
  minimumUnits: number;
  expiresAt: string;
  tags?: string[];
  supplierOrigin: string;
  supplierCatalogUrl?: string;
}
