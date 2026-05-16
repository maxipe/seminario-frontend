/** Indicador de carga animado. Color brand-teal por defecto. */

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
const strokeMap = { sm: '3', md: '3', lg: '2.5' };

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <svg
      className={`animate-spin text-brand-teal ${sizeMap[size]} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Cargando"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={strokeMap[size]}
        className="opacity-20"
      />
      <path
        fill="currentColor"
        className="opacity-80"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
