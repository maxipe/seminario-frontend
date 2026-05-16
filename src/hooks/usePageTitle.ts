/**
 * Setea el title del documento para cada página.
 * Formato: "Nombre de página | MiniMax"
 */

import { useEffect } from 'react';

export function usePageTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} | MiniMax`;
  }, [title]);
}
