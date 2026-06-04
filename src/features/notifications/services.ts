import apiClient from '../../lib/apiClient';
import type { Notification } from '../../types';

/** Obtiene la lista de notificaciones del usuario actual */
export async function getNotifications(): Promise<Notification[]> {
  const { data } = await apiClient.get<Notification[]>('/notifications');
  return data;
}

/** Marca una notificación específica como leída */
export async function markAsRead(id: string): Promise<Notification> {
  const { data } = await apiClient.patch<Notification>(`/notifications/${id}/read`);
  return data;
}

/** Marca todas las notificaciones como leídas */
export async function markAllAsRead(): Promise<{ message: string }> {
  const { data } = await apiClient.patch<{ message: string }>('/notifications/read-all');
  return data;
}
