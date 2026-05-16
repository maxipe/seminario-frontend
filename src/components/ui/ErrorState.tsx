/**
 * Estado de error reutilizable con ícono de advertencia, mensaje y botón de retry opcional.
 * Reemplaza los estados de error inline dispersos en ExplorePage y GroupDetailPage.
 */

import Button from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export default function ErrorState({
  title = 'Algo salió mal',
  message,
  onRetry,
  retryLabel = 'Reintentar',
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 gap-5 text-center">
      <div className="w-16 h-16 rounded-full bg-status-cancelled/10 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-status-cancelled"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div className="flex flex-col gap-1.5 max-w-sm">
        <h3 className="font-display font-bold text-ink text-lg">{title}</h3>
        <p className="font-body text-ink-muted text-sm leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
