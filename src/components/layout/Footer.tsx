/** Footer global con logo, copyright y links institucionales sobre fondo brand-purple. */

import { Link } from 'react-router-dom';

const footerLinks = [
  { label: 'Sobre Nosotros', to: '/sobre-nosotros' },
  { label: 'Términos de Servicio', to: '/terminos' },
  { label: 'Privacidad', to: '/privacidad' },
  { label: 'Centro de Ayuda', to: '/ayuda' },
];

export default function Footer() {
  return (
    <footer className="bg-brand-purple text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1">
            <span className="font-display font-extrabold text-2xl text-white">Mini</span>
            <span className="font-display font-extrabold text-2xl text-brand-teal">Max</span>
          </Link>

          {/* Links */}
          <nav className="flex flex-wrap justify-center sm:justify-end gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-body text-white/70 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-white/15 text-center text-xs font-body text-white/50">
          © {new Date().getFullYear()} MiniMax. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
