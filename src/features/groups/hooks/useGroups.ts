/**
 * Hook para obtener y filtrar la lista de grupos de compra.
 * Maneja loading y error internamente; expone refetch para reintentos manuales.
 */

import { useState, useEffect, useCallback } from 'react';
import { getGroups } from '../services';
import type { GroupFilters } from '../services';
import type { Group } from '../../../types';

export function useGroups(filters?: GroupFilters): {
  groups: Group[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getGroups(filters)
      .then((data) => {
        if (!cancelled) setGroups(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg =
            err instanceof Error ? err.message : 'Error al cargar los grupos.';
          setError(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.category, filters?.status, filters?.search, tick]);

  return { groups, loading, error, refetch };
}
