/**
 * Servicios de checkout de MiniMax.
 * Registra la participación de un usuario en un grupo y actualiza el estado del grupo en localStorage.
 */

import {
  findGroupById,
  updateGroup,
  saveCommitment,
  getCommitments,
  getCommitmentsByUser,
  updateCommitment,
} from '../../lib/localStorage';
import type { UserCommitment } from '../../types';

/**
 * Une a un usuario a un grupo de compra, o suma unidades si ya participaba.
 * Actualiza committedUnits, progressPercent y remainingUnits del grupo.
 * Si se alcanza el mínimo, confirma el grupo y todos sus compromisos.
 *
 * @throws Error si el grupo no existe.
 */
export async function joinGroup(
  userEmail: string,
  groupId: string,
  quantity: number,
): Promise<UserCommitment> {
  await new Promise((r) => setTimeout(r, 1200));

  const group = findGroupById(groupId);
  if (!group) throw new Error('El grupo no existe o ya no está disponible.');

  const existing = getCommitmentsByUser(userEmail)
    .find((c) => c.groupId === groupId && c.status !== 'cancelled');

  const newCommittedUnits = group.committedUnits + quantity;
  const newProgressPercent = Math.min(
    100,
    Math.round((newCommittedUnits / group.minimumUnits) * 100),
  );
  const newRemainingUnits = Math.max(0, group.minimumUnits - newCommittedUnits);
  const reached = newCommittedUnits >= group.minimumUnits;

  updateGroup({
    ...group,
    committedUnits: newCommittedUnits,
    progressPercent: newProgressPercent,
    remainingUnits: newRemainingUnits,
    // activeMembers solo sube si es un miembro nuevo, no si suma más unidades
    activeMembers: existing ? group.activeMembers : group.activeMembers + 1,
    status: reached ? 'confirmed' : group.status,
  });

  if (existing) {
    const updated: UserCommitment = {
      ...existing,
      quantity: existing.quantity + quantity,
      totalAmount: group.wholesalePrice * (existing.quantity + quantity),
    };
    updateCommitment(updated);

    if (reached) {
      const allCommitments = getCommitments().filter((c) => c.groupId === groupId);
      for (const c of allCommitments) {
        updateCommitment({ ...c, status: 'confirmed' });
      }
      return { ...updated, status: 'confirmed' };
    }

    return updated;
  }

  const totalAmount = group.wholesalePrice * quantity;
  const commitment: UserCommitment = {
    id: crypto.randomUUID(),
    userEmail,
    groupId,
    quantity,
    totalAmount,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  saveCommitment(commitment);

  if (reached) {
    const allCommitments = getCommitments().filter((c) => c.groupId === groupId);
    for (const c of allCommitments) {
      updateCommitment({ ...c, status: 'confirmed' });
    }
    return { ...commitment, status: 'confirmed' };
  }

  return commitment;
}

/**
 * Cancela un compromiso pendiente y devuelve las unidades al grupo.
 * Solo se puede cancelar si el compromiso está en estado 'pending'.
 *
 * @throws Error si el compromiso no existe o ya no está en estado pending.
 */
export async function cancelCommitment(commitmentId: string): Promise<UserCommitment> {
  await new Promise((r) => setTimeout(r, 800));

  const all = getCommitments();
  const commitment = all.find((c) => c.id === commitmentId);
  if (!commitment) throw new Error('Compromiso no encontrado.');
  if (commitment.status !== 'pending') throw new Error('Este compromiso ya no puede cancelarse.');

  const cancelled: UserCommitment = {
    ...commitment,
    status: 'cancelled',
    cancellationReason: 'user',
  };
  updateCommitment(cancelled);

  const group = findGroupById(commitment.groupId);
  if (group && group.status === 'open') {
    const newCommittedUnits = Math.max(0, group.committedUnits - commitment.quantity);
    updateGroup({
      ...group,
      committedUnits: newCommittedUnits,
      progressPercent: Math.min(100, Math.round((newCommittedUnits / group.minimumUnits) * 100)),
      remainingUnits: Math.max(0, group.minimumUnits - newCommittedUnits),
    });
  }

  return cancelled;
}
