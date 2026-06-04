/**
 * Barra de navegación principal de MiniMax.
 * Tres configuraciones según rol:
 *   - Invitado: links públicos + botones de auth
 *   - Buyer: links de comprador + avatar con dropdown
 *   - Supplier: links de proveedor + avatar con dropdown
 * Mobile: hamburger con drawer lateral que replica los mismos links del rol.
 */

import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import Dropdown, { DropdownItem, DropdownDivider } from '../ui/Dropdown';
import AuthModal from '../../features/auth/components/AuthModal';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

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
  const { notifications, unreadCount, toast, setToast, markNotificationAsRead, markAllNotificationsAsRead } = useNotifications();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: AuthTab }>({
    open: false,
    tab: 'login',
  });
  
  const notificationsRef = useRef<HTMLDivElement>(null);

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

  // Cerrar el panel al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleNotificationClick(n: any) {
    markNotificationAsRead(n.id);
    setShowNotifications(false);
    if (n.metadata?.opportunityId) {
      navigate(`/grupos/${n.metadata.opportunityId}`);
    } else if (role === 'buyer') {
      navigate('/mi-cuenta');
    } else {
      navigate('/proveedor/dashboard');
    }
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
              <>
                {/* Campanita de notificaciones */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-ink-muted hover:text-brand-purple hover:bg-surface rounded-full transition-all focus:outline-none"
                    title="Notificaciones"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-status-cancelled text-white font-display text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown de notificaciones */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-ink-faint/30 rounded-2xl shadow-xl z-50 p-4 max-h-96 overflow-y-auto flex flex-col gap-2">
                      <div className="flex items-center justify-between border-b border-ink-faint/30 pb-2 mb-1">
                        <span className="font-display font-bold text-sm text-ink">Notificaciones</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllNotificationsAsRead}
                            className="text-xs font-semibold text-brand-teal hover:text-brand-teal-dark transition-colors"
                          >
                            Marcar todas leídas
                          </button>
                        )}
                      </div>

                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs font-body text-ink-muted italic">
                          No tenés notificaciones.
                        </div>
                      ) : (
                        <div className="flex flex-col divide-y divide-ink-faint/20">
                          {notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`py-2.5 px-1.5 cursor-pointer hover:bg-surface rounded-lg transition-colors flex gap-2.5 items-start ${
                                !n.isRead ? 'bg-brand-teal/5' : ''
                              }`}
                            >
                              <div className="shrink-0 mt-0.5">
                                {n.type === 'order_status_updated' ? '📦' : '🔔'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-display text-xs text-ink ${!n.isRead ? 'font-bold' : 'font-semibold'}`}>
                                  {n.title}
                                </p>
                                <p className="font-body text-[11px] text-ink-muted mt-0.5 leading-snug line-clamp-2">
                                  {n.message}
                                </p>
                                <span className="text-[9px] text-ink-muted/85 font-body block mt-1">
                                  {new Date(n.createdAt).toLocaleDateString(undefined, {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              {!n.isRead && (
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-teal shrink-0 mt-1.5" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Toast flotante anclado al icono de campana */}
                  {toast && (
                    <div className="absolute right-0 top-12 w-72 bg-brand-purple text-white p-4 rounded-xl shadow-2xl z-50 animate-[slideUp_0.2s_ease-out] flex gap-3 border border-brand-purple-light">
                      <div className="shrink-0 mt-0.5">🔔</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-[10px] text-brand-teal uppercase tracking-wide">
                          Nueva Notificación
                        </p>
                        <p className="font-display font-bold text-xs mt-0.5 truncate">{toast.title}</p>
                        <p className="font-body text-[11px] text-white/95 mt-1 line-clamp-2 leading-relaxed">
                          {toast.message}
                        </p>
                      </div>
                      <button
                        onClick={() => setToast(null)}
                        className="text-white/70 hover:text-white shrink-0 self-start"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                <Dropdown
                  align="right"
                  trigger={
                    <>
                      <Avatar src={user.avatarUrl ?? undefined} alt={user.name} size="sm" />
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
              </>
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

          {/* Mobile bells + Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && user && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    // Si se abre la campanita en mobile, cerramos drawer
                    setDrawerOpen(false);
                  }}
                  className="relative p-2 text-ink-muted hover:text-brand-purple rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-status-cancelled text-white font-display text-[8px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown de notificaciones en mobile */}
                {showNotifications && (
                  <div className="absolute right-[-40px] mt-2 w-72 bg-white border border-ink-faint/30 rounded-2xl shadow-xl z-50 p-3 max-h-80 overflow-y-auto flex flex-col gap-1.5">
                    <div className="flex items-center justify-between border-b border-ink-faint/30 pb-2 mb-1">
                      <span className="font-display font-bold text-xs text-ink">Notificaciones</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-[10px] font-semibold text-brand-teal hover:text-brand-teal-dark transition-colors"
                        >
                          Marcar leídas
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="py-4 text-center text-[10px] font-body text-ink-muted italic">
                        No tenés notificaciones.
                      </div>
                    ) : (
                      <div className="flex flex-col divide-y divide-ink-faint/15">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`py-2 px-1 cursor-pointer hover:bg-surface rounded transition-colors flex gap-2 items-start ${
                              !n.isRead ? 'bg-brand-teal/5' : ''
                            }`}
                          >
                            <div className="text-xs shrink-0">📦</div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-display text-[10px] text-ink ${!n.isRead ? 'font-bold' : 'font-semibold'}`}>
                                {n.title}
                              </p>
                              <p className="font-body text-[9px] text-ink-muted leading-tight mt-0.5 line-clamp-2">
                                {n.message}
                              </p>
                            </div>
                            {!n.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-teal shrink-0 mt-1" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              className="p-2 rounded-lg text-ink-muted hover:text-brand-purple hover:bg-surface transition-colors"
              onClick={() => {
                setDrawerOpen(true);
                setShowNotifications(false);
              }}
              aria-label="Abrir menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
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
                <Avatar src={user.avatarUrl ?? undefined} alt={user.name} size="md" />
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
