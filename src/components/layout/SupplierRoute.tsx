/**
 * Guard de ruta exclusivo para proveedores (role='supplier').
 * - isLoading → spinner de pantalla completa
 * - no autenticado → AuthModal; cerrar sin login redirige a /
 * - buyer autenticado → redirige a /mi-cuenta
 * - supplier autenticado → renderiza children
 */

import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../ui/Spinner';
import AuthModal from '../../features/auth/components/AuthModal';

interface SupplierRouteProps {
  children: React.ReactNode;
}

export function SupplierRoute({ children }: SupplierRouteProps): React.JSX.Element {
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

  if (user?.role === 'buyer') {
    return <Navigate to="/mi-cuenta" replace />;
  }

  return <>{children}</>;
}
