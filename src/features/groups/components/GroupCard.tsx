/**
 * GroupCard — tarjeta de grupo de compra para grillas y listados.
 * Muestra imagen, estado, progreso, precios comparativos y CTA para reservar cupo.
 * Navega a /grupos/:id al hacer click en cualquier parte de la card o en el botón.
 */

import { useNavigate } from 'react-router-dom';
import type { Group } from '../types';
import Badge from '../../../components/ui/Badge';
import ProgressBar from '../../../components/ui/ProgressBar';
import Button from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/formatCurrency';

interface GroupCardProps {
  group: Group;
}

/** @returns días enteros hasta la fecha ISO dada; negativo si ya pasó */
function daysUntil(isoDate: string): number {
  return Math.ceil((new Date(isoDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function statusBadgeVariant(group: Group, isUrgent: boolean): 'open' | 'urgent' | 'confirmed' | 'cancelled' {
  if (group.status === 'confirmed') return 'confirmed';
  if (group.status === 'cancelled') return 'cancelled';
  return isUrgent ? 'urgent' : 'open';
}

function statusLabel(group: Group, isUrgent: boolean): string {
  if (group.status === 'confirmed') return 'Confirmado';
  if (group.status === 'cancelled') return 'Cancelado';
  return isUrgent ? 'Urgente' : 'Abierto';
}

export default function GroupCard({ group }: GroupCardProps) {
  const navigate = useNavigate();
  const days = daysUntil(group.expiresAt);
  const isUrgent = days <= 3 && group.status === 'open';

  const handleNavigate = () => navigate(`/grupos/${group.id}`);

  return (
    <div
      onClick={handleNavigate}
      className="bg-surface-card rounded-2xl shadow-sm border border-ink-faint/30 overflow-hidden flex flex-col transition-shadow duration-200 hover:shadow-lg cursor-pointer group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-ink-faint/20">
        <img
          src={group.imageUrl || `https://picsum.photos/seed/${group.id}/400/300`}
          alt={group.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent" />
        <div className="absolute top-3 left-3">
          <Badge variant={statusBadgeVariant(group, isUrgent)}>
            {statusLabel(group, isUrgent)}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-display tracking-wide bg-surface-card/90 text-ink backdrop-blur-sm">
            {group.category}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <h3 className="font-display font-semibold text-ink text-sm leading-snug line-clamp-2">
          {group.title}
        </h3>

        {/* Pricing */}
        <div className="flex items-baseline gap-2">
          <span className="font-display font-bold text-xl text-brand-teal">
            {formatCurrency(group.wholesalePrice)}
          </span>
          <span className="font-body text-sm text-ink-muted line-through">
            {formatCurrency(group.unitPrice)}
          </span>
          <span className="ml-auto font-display text-xs font-bold text-status-confirmed bg-status-confirmed/10 px-2 py-0.5 rounded-full">
            -{group.discountPercentage}%
          </span>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <ProgressBar percent={group.progressPercent} size="sm" />
          <p className="text-xs font-body text-ink-muted">
            <span className="font-semibold text-ink">{group.committedUnits}</span>{' '}
            de {group.minimumUnits} unidades comprometidas
          </p>
        </div>

        {/* Time left */}
        <p
          className={`text-xs font-body ${
            isUrgent ? 'text-status-urgent font-semibold' : 'text-ink-muted'
          }`}
        >
          {days > 0
            ? `${days} día${days !== 1 ? 's' : ''} restante${days !== 1 ? 's' : ''}`
            : days === 0
            ? 'Vence hoy'
            : 'Vencido'}
        </p>

        {/* CTA */}
        <div className="mt-auto pt-1">
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={handleNavigate}
          >
            Ver grupo
          </Button>
        </div>
      </div>
    </div>
  );
}
