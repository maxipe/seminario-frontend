/**
 * Estado vacío reutilizable con ícono slot, título, descripción y acción opcional.
 * Reemplaza los empty states inline de ExplorePage y MyAccountPage.
 */

import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 gap-4 text-center">
      {icon && <div className="text-ink-faint/60">{icon}</div>}
      <div className="flex flex-col gap-1.5 max-w-xs">
        <h3 className="font-display font-semibold text-ink text-base">{title}</h3>
        {description && (
          <p className="font-body text-ink-muted text-sm leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
