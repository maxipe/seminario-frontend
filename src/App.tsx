/**
 * Punto de entrada de la aplicación.
 * Muestra un splash screen mientras AuthContext verifica la sesión guardada,
 * evitando el flash de contenido no autenticado en rutas protegidas.
 */

import Spinner from './components/ui/Spinner';
import { useAuth } from './context/AuthContext';
import AppRouter from './router';

function AppInner() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-5">
        <span className="font-display font-extrabold text-4xl text-brand-purple tracking-tight">
          MiniMax
        </span>
        <Spinner size="md" />
      </div>
    );
  }

  return <AppRouter />;
}

export default function App() {
  return <AppInner />;
}
