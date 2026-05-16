/**
 * Notificación temporal tipo toast. Se muestra en la esquina inferior derecha.
 * Se cierra sola después de 3 segundos (controlado por el padre vía useToast).
 */

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const iconByType = {
  success: (
    <svg className="w-5 h-5 text-status-confirmed" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-status-cancelled" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const borderByType = {
  success: 'border-status-confirmed/30',
  error: 'border-status-cancelled/30',
  info: 'border-brand-teal/30',
};

export default function Toast({ message, type, onClose }: ToastProps) {
  return (
    <div
      className={[
        'fixed bottom-5 right-5 z-[200] flex items-center gap-3',
        'bg-white border rounded-xl shadow-xl px-4 py-3 max-w-sm',
        'animate-[slideUp_0.2s_ease-out]',
        borderByType[type],
      ].join(' ')}
      role="alert"
    >
      <span className="shrink-0">{iconByType[type]}</span>
      <p className="font-body text-sm text-ink flex-1">{message}</p>
      <button
        onClick={onClose}
        className="text-ink-muted hover:text-ink transition-colors shrink-0 ml-1"
        aria-label="Cerrar notificación"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
