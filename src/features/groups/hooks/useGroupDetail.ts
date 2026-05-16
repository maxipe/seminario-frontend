/**
 * Hook para obtener el detalle completo de un grupo por su ID.
 * Diferencia entre not found (404) y error genérico de red para mostrar UIs distintas.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getGroupById } from '../services';
import type { Group } from '../../../types';

interface UseGroupDetailResult {
  group: Group | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
  refetch: () => void;
}

export function useGroupDetail(id: string | undefined): UseGroupDetailResult {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [tick, setTick] = useState(0);
  // Track the last id that triggered a full load so refetch()
  // (tick-only increment) can skip the loading/null reset.
  const loadedIdRef = useRef<string | undefined>(undefined);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const isRefetch = loadedIdRef.current === id;
    loadedIdRef.current = id;

    if (!isRefetch) {
      // Full page load or navigating to a different group — show skeleton.
      setLoading(true);
      setError(null);
      setNotFound(false);
      setGroup(null);
    }

    getGroupById(id)
      .then((data) => {
        if (!cancelled) setGroup(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404 || (err instanceof Error && err.message.includes('no encontrado'))) {
          setNotFound(true);
        } else {
          setError('No pudimos cargar el grupo. Intentá nuevamente.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, tick]);

  return { group, loading, error, notFound, refetch };
}
