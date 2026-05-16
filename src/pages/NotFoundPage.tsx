/**
 * Página 404 — standalone sin Navbar/Footer.
 * Muestra un número 404 decorativo y un botón para volver al inicio.
 */

import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center gap-6 relative overflow-hidden">
      {/* Decorative background number */}
      <span
        aria-hidden
        className="absolute select-none font-display font-extrabold text-[20rem] leading-none text-brand-purple/5 pointer-events-none"
        style={{ userSelect: 'none' }}
      >
        404
      </span>

      {/* Logo */}
      <Link to="/" className="font-display font-extrabold text-2xl text-brand-purple tracking-tight mb-2">
        MiniMax
      </Link>

      <div className="relative flex flex-col gap-3 max-w-sm">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ink">
          Esta página no existe
        </h1>
        <p className="font-body text-ink-muted text-base leading-relaxed">
          Puede que el link esté roto o que la página haya sido movida.
        </p>
      </div>

      <Link to="/">
        <Button variant="primary" size="lg">
          Volver al inicio
        </Button>
      </Link>
    </div>
  );
}
