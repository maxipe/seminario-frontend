/**
 * Servicios de checkout (adhesiones) de MiniMax.
 * Se comunican con la API REST del backend para gestionar la
 * participación de compradores en oportunidades de compra grupal.
 */

import apiClient from '../../lib/apiClient';
import type { UserCommitment } from '../../types';

/** Respuesta del endpoint de creación de adhesión. */
interface JoinResponse {
  adhesion: UserCommitment;
  opportunity: unknown;
}

/**
 * Une al usuario autenticado a una oportunidad de compra.
 * El backend identifica al usuario por el JWT.
 *
 * @param opportunityId - ID de la oportunidad a la que adherirse.
 * @param quantity - Cantidad de unidades a reservar.
 * @param paymentMethod - Método de pago (simulado en MVP).
 */
export async function joinGroup(
  opportunityId: string,
  quantity: number,
  paymentMethod: string = 'card',
): Promise<UserCommitment> {
  try {
    const { data } = await apiClient.post<JoinResponse>('/adhesions', {
      opportunityId,
      quantity,
      paymentMethod,
    });
    return data.adhesion;
  } catch (error: unknown) {
    throw extractError(error, 'Error al unirse a la oportunidad.');
  }
}

/**
 * Obtiene todas las adhesiones del usuario autenticado,
 * enriquecidas con los datos de la oportunidad asociada.
 */
export async function getMyAdhesions(): Promise<UserCommitment[]> {
  const { data } = await apiClient.get<UserCommitment[]>('/adhesions/my');
  return data;
}

/**
 * Cancela una adhesión pendiente del usuario autenticado.
 * El backend devuelve las unidades a la oportunidad y notifica al proveedor.
 *
 * @param adhesionId - ID de la adhesión a cancelar.
 */
export async function cancelCommitment(adhesionId: string): Promise<{ message: string }> {
  try {
    const { data } = await apiClient.patch<{ message: string }>(`/adhesions/${adhesionId}/cancel`);
    return data;
  } catch (error: unknown) {
    throw extractError(error, 'Error al cancelar la adhesión.');
  }
}

/**
 * Actualiza el estado de una adhesión (pedido) por parte del proveedor.
 *
 * @param adhesionId - ID de la adhesión a actualizar.
 * @param status - El nuevo estado (confirmed, preparing, shipped, delivered).
 */
export async function updateAdhesionStatus(adhesionId: string, status: string): Promise<UserCommitment> {
  try {
    const { data } = await apiClient.patch<UserCommitment>(`/adhesions/${adhesionId}/status`, { status });
    return data;
  } catch (error: unknown) {
    throw extractError(error, 'Error al actualizar el estado del pedido.');
  }
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
