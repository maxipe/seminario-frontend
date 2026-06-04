/**
 * Página de cuenta del usuario comprador.
 * Muestra perfil, historial de compras grupales y resumen de ahorro.
 * Los proveedores son redirigidos a /proveedor/dashboard.
 * Protegida por ProtectedRoute — solo accesible con sesión activa.
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import CountdownTimer from '../components/ui/CountdownTimer';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { useUserCommitments, type CommitmentWithGroup } from '../features/checkout/hooks/useUserCommitments';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency } from '../utils/formatCurrency';
import { useToast } from '../hooks/useToast';
import Toast from '../components/ui/Toast';

// ─── Commitment status helpers ─────────────────────────────────────────────────

function getStatusText(item: CommitmentWithGroup): string {
  if (item.status === 'cancelled') {
    return item.cancellationReason === 'user'
      ? 'Cancelaste este pedido. Tu pago fue reintegrado.'
      : 'El grupo no alcanzó el mínimo. Tu pago fue reintegrado.';
  }
  const map: Record<string, string> = {
    pending: 'Esperando que el grupo alcance el mínimo...',
    confirmed: '¡Compra confirmada! Coordiná la entrega con el proveedor.',
    preparing: 'El proveedor está preparando tu pedido.',
    shipped: '¡Tu pedido ha sido enviado!',
    delivered: 'Tu pedido ha sido entregado.',
  };
  return map[item.status] || 'Estado del pedido actualizado.';
}

const statusBadgeVariant: Record<CommitmentWithGroup['status'], 'open' | 'urgent' | 'confirmed' | 'cancelled'> = {
  pending: 'open',
  confirmed: 'confirmed',
  preparing: 'urgent',
  shipped: 'open',
  delivered: 'confirmed',
  cancelled: 'cancelled',
};

const statusBadgeLabel: Record<CommitmentWithGroup['status'], string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  preparing: 'En preparación',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelada',
};

// ─── Loading skeleton ──────────────────────────────────────────────────────────

function CommitmentSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-2xl border border-ink-faint/30 bg-white animate-pulse">
      <div className="w-20 h-20 rounded-xl bg-ink-faint/30 shrink-0" />
      <div className="flex-1 flex flex-col gap-2 py-1">
        <div className="h-4 bg-ink-faint/30 rounded-full w-3/4" />
        <div className="h-3 bg-ink-faint/20 rounded-full w-1/2" />
        <div className="h-2 bg-ink-faint/20 rounded-full w-full mt-1" />
      </div>
    </div>
  );
}

// ─── Commitment card ───────────────────────────────────────────────────────────

function CommitmentCard({
  item,
  cancelling,
  onCancelClick,
}: {
  item: CommitmentWithGroup;
  cancelling: string | null;
  onCancelClick: (id: string) => void;
}) {
  const { group, quantity, totalAmount, status } = item;
  const isOpen = group.status === 'open';

  return (
    <article className="flex gap-4 p-4 rounded-2xl border border-ink-faint/30 bg-white hover:shadow-md transition-shadow">
      <Link to={`/grupos/${group.id}`} className="shrink-0">
        <img
          src={group.imageUrl}
          alt={group.title}
          className="w-20 h-20 rounded-xl object-cover hover:opacity-90 transition-opacity"
        />
      </Link>
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <Link to={`/grupos/${group.id}`} className="hover:text-brand-teal transition-colors">
            <h3 className="font-display font-semibold text-ink text-sm leading-snug line-clamp-2">
              {group.title}
            </h3>
          </Link>
          <Badge variant={statusBadgeVariant[status]}>{statusBadgeLabel[status]}</Badge>
        </div>

        <div className="flex flex-wrap gap-4 text-xs font-body text-ink-muted">
          <span>
            <span className="font-semibold text-ink">{quantity}</span> unidades
          </span>
          {totalAmount > 0 && (
            <span>
              Total pagado: <span className="font-semibold text-ink">{formatCurrency(totalAmount)}</span>
            </span>
          )}
        </div>

        <ProgressBar percent={group.progressPercent} size="sm" />

        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs font-body text-ink-muted leading-snug">{getStatusText(item)}</p>
          {isOpen && (
            <div className="flex items-center gap-1 text-xs text-ink-muted font-body shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <CountdownTimer expiresAt={group.expiresAt} />
            </div>
          )}
        </div>

        {status === 'pending' && (
          <div className="flex justify-end mt-1">
            <Button
              variant="ghost"
              size="sm"
              loading={cancelling === item.id}
              onClick={() => onCancelClick(item.id)}
            >
              Cancelar pedido
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}

// ─── Savings summary ───────────────────────────────────────────────────────────

function SavingsSummary({ commitments }: { commitments: CommitmentWithGroup[] }) {
  const confirmed = commitments.filter((c) => c.status === 'confirmed');
  const pending = commitments.filter((c) => c.status === 'pending');

  const totalSaved = confirmed.reduce((acc, c) => {
    return acc + (c.group.unitPrice - c.group.wholesalePrice) * c.quantity;
  }, 0);

  const stats = [
    {
      label: 'Total ahorrado',
      value: formatCurrency(totalSaved),
      sub: 'vs. precio de lista',
      color: 'text-status-confirmed',
    },
    {
      label: 'Grupos completados',
      value: String(confirmed.length),
      sub: 'compras cerradas',
      color: 'text-brand-purple',
    },
    {
      label: 'Grupos en curso',
      value: String(pending.length),
      sub: 'esperando quórum',
      color: 'text-brand-teal',
    },
  ];

  return (
    <section className="mt-10">
      <h2 className="font-display font-bold text-ink text-xl mb-1">Resumen de Ahorro</h2>
      <p className="text-sm font-body text-ink-muted mb-5">
        Lo que lograste comprando en grupo vs. el precio de lista unitario.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-ink-faint/30 bg-white p-5 flex flex-col gap-1"
          >
            <span className="text-xs font-body font-medium text-ink-muted uppercase tracking-wide">
              {stat.label}
            </span>
            <span className={`font-display font-extrabold text-2xl ${stat.color}`}>{stat.value}</span>
            <span className="text-xs font-body text-ink-muted">{stat.sub}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── MyAccountPage ─────────────────────────────────────────────────────────────

export default function MyAccountPage() {
  usePageTitle('Mi Cuenta');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { commitments, loading, error, cancelCommitment, cancelling } = useUserCommitments();
  const { toast, showToast } = useToast();

  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const commitmentToCancel = commitments.find((c) => c.id === confirmCancelId);

  useEffect(() => {
    if (user?.role === 'supplier') {
      navigate('/proveedor/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (!user || user.role === 'supplier') return null;

  const memberSince = new Date(user.createdAt).getFullYear();

  async function handleConfirmCancel() {
    if (!confirmCancelId) return;
    try {
      await cancelCommitment(confirmCancelId);
      setConfirmCancelId(null);
      showToast('Pedido cancelado. Tu pago será reintegrado.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al cancelar.', 'error');
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Profile header */}
      <div className="flex items-center gap-5 mb-10">
        <Avatar src={user.avatarUrl ?? undefined} alt={user.name} size="lg" />
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display font-extrabold text-2xl text-ink">{user.name}</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-display bg-brand-purple/10 text-brand-purple">
              Miembro desde {memberSince}
            </span>
          </div>
          {user.storeName && (
            <p className="text-sm font-body font-medium text-ink-muted mt-0.5">{user.storeName}</p>
          )}
          <p className="text-sm font-body text-ink-muted">{user.email}</p>
        </div>
      </div>

      {/* Compras section */}
      <section>
        <h2 className="font-display font-bold text-ink text-xl mb-1">Mis Compras Grupales</h2>
        <p className="text-sm font-body text-ink-muted mb-5">
          El estado de todos los grupos a los que te sumaste.
        </p>

        {loading && (
          <div className="flex flex-col gap-3">
            <CommitmentSkeleton />
            <CommitmentSkeleton />
            <CommitmentSkeleton />
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-status-cancelled font-body bg-status-cancelled/10 rounded-2xl px-5 py-4">
            {error}
          </p>
        )}

        {!loading && !error && commitments.length === 0 && (
          <EmptyState
            icon={
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
            title="Todavía no te uniste a ningún grupo."
            description="Explorá los grupos disponibles y empezá a ahorrar."
            action={
              <Link to="/explorar">
                <Button variant="primary" size="md">Explorar Grupos</Button>
              </Link>
            }
          />
        )}

        {!loading && !error && commitments.length > 0 && (
          <div className="flex flex-col gap-3">
            {commitments.map((item) => (
              <CommitmentCard
                key={item.id}
                item={item}
                cancelling={cancelling}
                onCancelClick={(id) => setConfirmCancelId(id)}
              />
            ))}
          </div>
        )}
      </section>

      {!loading && !error && commitments.length > 0 && (
        <SavingsSummary commitments={commitments} />
      )}

      {/* Cancel confirmation modal */}
      <Modal
        isOpen={confirmCancelId !== null}
        onClose={() => setConfirmCancelId(null)}
        title="¿Cancelar este pedido?"
        size="sm"
      >
        <p className="text-ink-muted text-sm">
          Vas a cancelar tu reserva de{' '}
          <strong>{commitmentToCancel?.quantity} unidades</strong> de{' '}
          <strong>{commitmentToCancel?.group.title}</strong>.
        </p>
        <p className="text-ink-muted text-sm mt-2">
          Tu pago de{' '}
          <strong>{formatCurrency(commitmentToCancel?.totalAmount ?? 0)}</strong>{' '}
          será reintegrado automáticamente.
        </p>

        <div className="flex gap-3 mt-6">
          <Button
            variant="ghost"
            fullWidth
            onClick={() => setConfirmCancelId(null)}
          >
            Volver
          </Button>
          <Button
            variant="primary"
            fullWidth
            loading={cancelling === confirmCancelId}
            onClick={handleConfirmCancel}
          >
            Sí, cancelar pedido
          </Button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => {}} />}
    </div>
  );
}
