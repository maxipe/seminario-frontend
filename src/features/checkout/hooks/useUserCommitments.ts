/**
 * Hook que devuelve los compromisos del usuario autenticado, enriquecidos con datos del grupo.
 * Lee directamente de localStorage a través de la capa de abstracción.
 */

import { useState, useEffect } from 'react';
import type { Group, UserCommitment } from '../../../types';
import { getCommitmentsByUser, findGroupById } from '../../../lib/localStorage';
import { useAuth } from '../../../context/AuthContext';
import { cancelCommitment as cancelCommitmentService } from '../services';

export type CommitmentWithGroup = UserCommitment & { group: Group };

export function useUserCommitments(): {
  commitments: CommitmentWithGroup[];
  loading: boolean;
  error: string | null;
  cancelCommitment: (commitmentId: string) => Promise<void>;
  cancelling: string | null;
} {
  const { user } = useAuth();
  const [commitments, setCommitments] = useState<CommitmentWithGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

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
        await new Promise((r) => setTimeout(r, 200));
        const userCommitments = getCommitmentsByUser(user.email);
        const enriched = userCommitments
          .map((c) => {
            const group = findGroupById(c.groupId);
            return group ? { ...c, group } : null;
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
  }, [user?.email]);

  async function cancelCommitment(commitmentId: string): Promise<void> {
    setCancelling(commitmentId);
    try {
      const updated = await cancelCommitmentService(commitmentId);
      const updatedGroup = findGroupById(updated.groupId);
      setCommitments((prev) =>
        prev.map((c) =>
          c.id === commitmentId && updatedGroup
            ? { ...updated, group: updatedGroup }
            : c
        )
      );
    } finally {
      setCancelling(null);
    }
  }

  return { commitments, loading, error, cancelCommitment, cancelling };
}
