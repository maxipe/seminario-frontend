/**
 * Wrapper de ruta que exige autenticación.
 * Si isLoading: spinner de pantalla completa.
 * Si no autenticado: abre AuthModal. Cerrar sin loguearse redirige a home.
 */

import React, { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Spinner from '../../../components/ui/Spinner';
import AuthModal from './AuthModal';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps): React.JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();
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
    function handleClose() {
      setModalOpen(false);
      navigate('/');
    }

    return (
      <AuthModal isOpen={modalOpen} onClose={handleClose} defaultTab="login" />
    );
  }

  return <>{children}</>;
}
