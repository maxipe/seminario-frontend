/**
 * Guard de ruta exclusivo para compradores (role='buyer').
 * - isLoading → spinner de pantalla completa
 * - no autenticado → AuthModal; cerrar sin login redirige a /
 * - supplier autenticado → redirige a /proveedor/dashboard
 * - buyer autenticado → renderiza children
 */

import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../ui/Spinner';
import AuthModal from '../../features/auth/components/AuthModal';

interface BuyerRouteProps {
  children: React.ReactNode;
}

export function BuyerRoute({ children }: BuyerRouteProps): React.JSX.Element {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); navigate('/'); }}
        defaultTab="login"
      />
    );
  }

  if (user?.role === 'supplier') {
    return <Navigate to="/proveedor/dashboard" replace />;
  }

  return <>{children}</>;
}
