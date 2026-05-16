/**
 * Servicios para la feature de grupos de compra.
 * Lee y escribe directamente en localStorage (sin backend).
 */

import {
  getGroups as getStoredGroups,
  findGroupById as findStoredGroupById,
} from '../../lib/localStorage';
import type { Group } from '../../types';

export interface GroupFilters {
  category?: string;
  status?: 'open' | 'confirmed' | 'cancelled';
  search?: string;
}

/**
 * Obtiene todos los grupos disponibles con filtros opcionales.
 */
export async function getGroups(filters?: GroupFilters): Promise<Group[]> {
  await new Promise((r) => setTimeout(r, 300));
  let results = getStoredGroups();
  if (filters?.category) {
    results = results.filter((g) => g.category === filters.category);
  }
  if (filters?.status) {
    results = results.filter((g) => g.status === filters.status);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q),
    );
  }
  return results;
}

/**
 * Obtiene el detalle completo de un grupo por su ID.
 * @param id - Identificador único del grupo.
 */
export async function getGroupById(id: string): Promise<Group> {
  await new Promise((r) => setTimeout(r, 200));
  const group = findStoredGroupById(id);
  if (!group) throw new Error(`Grupo ${id} no encontrado`);
  return group;
}
