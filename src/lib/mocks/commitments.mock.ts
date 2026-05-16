/**
 * Mock de compromisos de compra para el usuario autenticado.
 * Cubre los tres estados posibles: confirmed, pending, cancelled.
 */

import type { UserCommitment } from '../../types';

export const mockCommitments: UserCommitment[] = [
  { groupId: 'g-003', quantity: 5, status: 'confirmed', totalAmount: 270000 },
  { groupId: 'g-001', quantity: 2, status: 'pending', totalAmount: 6400 },
  { groupId: 'g-006', quantity: 8, status: 'cancelled', totalAmount: 0 },
];
