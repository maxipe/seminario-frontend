/**
 * Hace scroll al top de la página en cada cambio de ruta.
 * Se monta dentro del árbol del Router para poder usar useLocation.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
