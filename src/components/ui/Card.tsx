/** Contenedor con sombra sutil y esquinas redondeadas. Base para cards de grupo, producto, etc. */

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export default function Card({ children, className = '', onClick, hoverable = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={[
        'bg-surface-card rounded-2xl shadow-sm border border-ink-faint/30',
        hoverable
          ? 'transition-shadow duration-200 hover:shadow-md cursor-pointer'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
