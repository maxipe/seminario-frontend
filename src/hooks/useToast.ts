/**
 * Hook para mostrar notificaciones temporales (toasts).
 * El toast se cierra automáticamente después de 3 segundos.
 */

import { useState, useCallback } from 'react';

export interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

export function useToast(): {
  toast: ToastState | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
} {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  return { toast, showToast };
}
