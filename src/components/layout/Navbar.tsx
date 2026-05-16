/**
 * Barra de navegación principal de MiniMax.
 * Tres configuraciones según rol:
 *   - Invitado: links públicos + botones de auth
 *   - Buyer: links de comprador + avatar con dropdown
 *   - Supplier: links de proveedor + avatar con dropdown
 * Mobile: hamburger con drawer lateral que replica los mismos links del rol.
 */

import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import Dropdown, { DropdownItem, DropdownDivider } from '../ui/Dropdown';
import AuthModal from '../../features/auth/components/AuthModal';
import { useAuth } from '../../context/AuthContext';

type AuthTab = 'login' | 'register';

// ─── Nav links by role ────────────────────────────────────────────────────────

const GUEST_LINKS = [
  { label: 'Explorar Grupos', to: '/explorar' },
  { label: 'Cómo Funciona', to: '/como-funciona' },
  { label: 'Para Proveedores', to: '/proveedores' },
];

const BUYER_LINKS = [
  { label: 'Explorar Grupos', to: '/explorar' },
  { label: 'Cómo Funciona', to: '/como-funciona' },
  { label: 'Mis Compras', to: '/mi-cuenta' },
];

const SUPPLIER_LINKS = [
  { label: 'Mi Dashboard', to: '/proveedor/dashboard' },
  { label: 'Explorar Marketplace', to: '/explorar' },
  { label: 'Cómo Funciona', to: '/como-funciona' },
];

// ─── Shared nav link styles ───────────────────────────────────────────────────

function desktopLinkClass({ isActive }: { isActive: boolean }) {
  return `text-sm font-body font-medium transition-colors ${
    isActive
      ? 'text-brand-purple border-b-2 border-brand-teal pb-0.5'
      : 'text-ink-muted hover:text-brand-purple'
  }`;
}

function drawerLinkClass({ isActive }: { isActive: boolean }) {
  return `px-4 py-3 rounded-xl text-sm font-body font-medium transition-colors ${
    isActive
      ? 'bg-brand-purple/10 text-brand-purple font-semibold'
      : 'text-ink hover:bg-surface hover:text-brand-purple'
  }`;
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: AuthTab }>({
    open: false,
    tab: 'login',
  });

  const role = user?.role ?? null;
  const navLinks = role === 'supplier' ? SUPPLIER_LINKS : role === 'buyer' ? BUYER_LINKS : GUEST_LINKS;

  const displayName =
    role === 'supplier'
      ? (user?.companyName ?? user?.name ?? '')
      : (user?.storeName ?? user?.name ?? '');

  function openAuth(tab: AuthTab) {
    setAuthModal({ open: true, tab });
    setDrawerOpen(false);
  }

  function closeAuth() {
    setAuthModal((prev) => ({ ...prev, open: false }));
  }

  async function handleLogout() {
    await logout();
    setDrawerOpen(false);
    navigate('/');
  }

  return (
    <>
      <header className="bg-surface-card border-b border-ink-faint/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 shrink-0">
            <span className="font-display font-extrabold text-2xl text-brand-purple">Mini</span>
            <span className="font-display font-extrabold text-2xl text-brand-teal">Max</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={desktopLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop auth / user area */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <Dropdown
                align="right"
                trigger={
                  <>
                    <Avatar src={user.avatarUrl} alt={user.name} size="sm" />
                    <span className="text-sm font-body font-medium text-ink">{displayName}</span>
                  </>
                }
              >
                {role === 'buyer' ? (
                  <DropdownItem onClick={() => { navigate('/mi-cuenta'); }}>
                    Mi Cuenta
                  </DropdownItem>
                ) : (
                  <DropdownItem onClick={() => { navigate('/proveedor/dashboard'); }}>
                    Mi Dashboard
                  </DropdownItem>
                )}
                <DropdownDivider />
                <DropdownItem onClick={handleLogout}>Cerrar Sesión</DropdownItem>
              </Dropdown>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => openAuth('login')}>
                  Iniciar Sesión
                </Button>
                <Button variant="primary" size="md" onClick={() => openAuth('register')}>
                  Unirse a un Grupo
                </Button>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-ink-muted hover:text-brand-purple hover:bg-surface transition-colors"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-surface-card z-50 shadow-xl flex flex-col transition-transform duration-300 ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-ink-faint/30">
          <Link to="/" onClick={() => setDrawerOpen(false)} className="flex items-center gap-1">
            <span className="font-display font-extrabold text-xl text-brand-purple">Mini</span>
            <span className="font-display font-extrabold text-xl text-brand-teal">Max</span>
          </Link>
          <button
            className="p-2 rounded-lg text-ink-muted hover:text-brand-purple"
            onClick={() => setDrawerOpen(false)}
            aria-label="Cerrar menú"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer nav — same links as desktop for the current role */}
        <nav className="flex flex-col gap-1 p-4 flex-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setDrawerOpen(false)}
              className={drawerLinkClass}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Drawer footer: user info + actions */}
        <div className="p-4 border-t border-ink-faint/30 flex flex-col gap-2">
          {isAuthenticated && user ? (
            <>
              <div className="flex items-center gap-3 px-2 py-2">
                <Avatar src={user.avatarUrl} alt={user.name} size="md" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold font-display text-ink truncate">{user.name}</p>
                  {displayName !== user.name && (
                    <p className="text-xs text-ink-muted font-body truncate">{displayName}</p>
                  )}
                </div>
              </div>
              {role === 'buyer' ? (
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => { setDrawerOpen(false); navigate('/mi-cuenta'); }}
                >
                  Mi Cuenta
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => { setDrawerOpen(false); navigate('/proveedor/dashboard'); }}
                >
                  Mi Dashboard
                </Button>
              )}
              <Button variant="ghost" size="md" fullWidth onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="md" fullWidth onClick={() => openAuth('login')}>
                Iniciar Sesión
              </Button>
              <Button variant="primary" size="md" fullWidth onClick={() => openAuth('register')}>
                Unirse a un Grupo
              </Button>
            </>
          )}
        </div>
      </aside>

      <AuthModal isOpen={authModal.open} onClose={closeAuth} defaultTab={authModal.tab} />
    </>
  );
}
