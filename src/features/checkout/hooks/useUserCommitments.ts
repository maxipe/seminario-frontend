/**
 * Hook que devuelve las adhesiones (compras) del usuario autenticado,
 * enriquecidas con los datos de la oportunidad (grupo) asociada.
 * Los datos provienen de la API REST del backend.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Group, UserCommitment } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { getMyAdhesions, cancelCommitment as cancelAdhesionService } from '../services';

/** Adhesión enriquecida con datos del grupo al que pertenece. */
export type CommitmentWithGroup = Omit<UserCommitment, 'opportunity'> & { group: Group };

export function useUserCommitments(): {
  commitments: CommitmentWithGroup[];
  loading: boolean;
  error: string | null;
  cancelCommitment: (commitmentId: string) => Promise<void>;
  cancelling: string | null;
  refetch: () => void;
} {
  const { user } = useAuth();
  const [commitments, setCommitments] = useState<CommitmentWithGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user) {
        setCommitments([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const adhesions = await getMyAdhesions();

        // Mapeamos la respuesta de la API al formato que esperan los componentes
        const enriched = adhesions
          .map((adhesion) => {
            // La API retorna la oportunidad dentro de "opportunity"
            const group = adhesion.opportunity;
            if (!group) return null;

            return {
              id: adhesion.id,
              userId: adhesion.userId,
              opportunityId: adhesion.opportunityId,
              quantity: adhesion.quantity,
              totalAmount: adhesion.totalAmount,
              status: adhesion.status,
              createdAt: adhesion.createdAt,
              cancellationReason: adhesion.cancellationReason || undefined,
              group,
            } as CommitmentWithGroup;
          })
          .filter((c): c is CommitmentWithGroup => c !== null);

        if (!cancelled) setCommitments(enriched);
      } catch {
        if (!cancelled) setError('No pudimos cargar tus compras. Intentá de nuevo.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user?.id, tick]);

  async function cancelCommitment(commitmentId: string): Promise<void> {
    setCancelling(commitmentId);
    try {
      await cancelAdhesionService(commitmentId);
      // Recargamos las adhesiones para reflejar el estado actualizado
      refetch();
    } finally {
      setCancelling(null);
    }
  }

  return { commitments, loading, error, cancelCommitment, cancelling, refetch };
}
