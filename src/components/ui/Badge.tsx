/** Pill semántico que representa el estado de un grupo de compra. */

interface BadgeProps {
  variant?: 'open' | 'urgent' | 'confirmed' | 'cancelled' | 'default';
  children: React.ReactNode;
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  open: 'bg-status-open/15 text-status-open',
  urgent: 'bg-status-urgent/15 text-status-urgent',
  confirmed: 'bg-status-confirmed/15 text-status-confirmed',
  cancelled: 'bg-status-cancelled/15 text-status-cancelled',
  default: 'bg-ink-faint/40 text-ink-muted',
};

export default function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-display tracking-wide ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
