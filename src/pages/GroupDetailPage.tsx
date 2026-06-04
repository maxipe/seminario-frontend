/**
 * GroupDetailPage — página de decisión de compra de un grupo específico.
 * Es la página más importante del flujo: comunica valor, urgencia y confianza para
 * que el retailer decida unirse. Layout two-column en desktop, columna única en mobile.
 * El CTA queda fijo en la parte inferior en mobile para máxima accesibilidad.
 *
 * Lógica de CTA según rol:
 *   - Supplier → no se muestra el botón (no pueden comprar)
 *   - Invitado → botón abre AuthModal tab register
 *   - Buyer ya unido → estado "Ya te sumaste" con detalle del commitment
 *   - Buyer no unido → botón abre JoinGroupModal
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGroupDetail } from '../features/groups/hooks/useGroupDetail';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import CountdownTimer from '../components/ui/CountdownTimer';
import AvatarGroup from '../components/ui/AvatarGroup';
import Button from '../components/ui/Button';
import AuthModal from '../features/auth/components/AuthModal';
import JoinGroupModal from '../features/checkout/components/JoinGroupModal';
import { formatCurrency } from '../utils/formatCurrency';
import { useAuth } from '../context/AuthContext';
import { getMyAdhesions, updateAdhesionStatus } from '../features/checkout/services';
import type { Group, UserCommitment } from '../types';

// ─── Mock member avatars for social proof ────────────────────────────────────

const MOCK_MEMBERS = [
  { alt: 'M1', src: 'https://i.pravatar.cc/150?img=1' },
  { alt: 'M2', src: 'https://i.pravatar.cc/150?img=2' },
  { alt: 'M3', src: 'https://i.pravatar.cc/150?img=3' },
  { alt: 'M4', src: 'https://i.pravatar.cc/150?img=4' },
  { alt: 'M5', src: 'https://i.pravatar.cc/150?img=5' },
];

// ─── Loading skeleton ────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="h-4 w-48 bg-ink-faint/50 rounded mb-6" />
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-[3] flex flex-col gap-5">
          <div className="w-full h-80 bg-ink-faint/40 rounded-2xl" />
          <div className="h-7 w-3/4 bg-ink-faint/50 rounded" />
          <div className="h-4 w-full bg-ink-faint/30 rounded" />
          <div className="h-4 w-5/6 bg-ink-faint/30 rounded" />
          <div className="h-4 w-2/3 bg-ink-faint/30 rounded" />
        </div>
        <div className="flex-[2] flex flex-col gap-4">
          <div className="h-8 w-40 bg-ink-faint/50 rounded" />
          <div className="h-10 w-56 bg-ink-faint/40 rounded" />
          <div className="h-3 w-full bg-ink-faint/30 rounded" />
          <div className="h-3 w-full bg-ink-faint/50 rounded" />
          <div className="h-12 w-full bg-ink-faint/40 rounded-xl mt-4" />
        </div>
      </div>
    </div>
  );
}

// ─── Not found state ─────────────────────────────────────────────────────────

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-28 px-4 gap-6 text-center">
      <div className="w-20 h-20 rounded-full bg-ink-faint/30 flex items-center justify-center">
        <svg className="w-10 h-10 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-display font-bold text-ink text-2xl">Este grupo no existe o ya expiró</h2>
        <p className="font-body text-ink-muted">El grupo que buscás puede haber sido cancelado o completado.</p>
      </div>
      <Button variant="primary" size="lg" onClick={() => navigate('/explorar')}>
        Ver grupos disponibles
      </Button>
    </div>
  );
}

// ─── Generic error state ─────────────────────────────────────────────────────

function GenericError({ message }: { message: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-28 px-4 gap-6 text-center">
      <div className="w-16 h-16 rounded-full bg-status-cancelled/10 flex items-center justify-center">
        <svg className="w-8 h-8 text-status-cancelled" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-display font-bold text-ink text-xl">Algo salió mal</h2>
        <p className="font-body text-ink-muted">{message}</p>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" size="md" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
        <Button variant="ghost" size="md" onClick={() => navigate('/explorar')}>
          Ver grupos
        </Button>
      </div>
    </div>
  );
}

// ─── Pulso colectivo ─────────────────────────────────────────────────────────

function PulsoColectivo({ progressPercent }: { progressPercent: number }) {
  let text: string;
  if (progressPercent >= 80) {
    text = 'Este grupo ha crecido un 35% en las últimas 2 horas. Es probable que se complete antes de que expire el tiempo.';
  } else if (progressPercent >= 50) {
    text = 'Este grupo está ganando tracción. Unite antes de que se llenen los cupos.';
  } else {
    text = 'Grupo en formación. Sé de los primeros en reservar tu cupo.';
  }

  return (
    <div className="bg-surface border border-ink-faint/30 rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <span className="font-display font-bold text-xs text-ink-muted tracking-widest uppercase">
          Pulso Colectivo
        </span>
      </div>
      <p className="font-body text-sm text-ink-muted leading-relaxed">{text}</p>
    </div>
  );
}

// ─── Already joined state ─────────────────────────────────────────────────────

function AlreadyJoined({
  commitment,
  group,
  onAddMore,
}: {
  commitment: UserCommitment;
  group: Group;
  onAddMore: () => void;
}) {
  const statusLabel =
    commitment.status === 'confirmed'
      ? 'Confirmado'
      : commitment.status === 'cancelled'
      ? 'Cancelado'
      : 'Pendiente';

  const statusColor =
    commitment.status === 'confirmed'
      ? 'text-status-confirmed bg-status-confirmed/10'
      : commitment.status === 'cancelled'
      ? 'text-status-cancelled bg-status-cancelled/10'
      : 'text-status-urgent bg-status-urgent/10';

  const canAddMore = group.status === 'open' && group.remainingUnits > 0;

  return (
    <div className="rounded-2xl border-2 border-brand-teal/40 bg-brand-teal/5 p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-brand-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-display font-bold text-sm text-brand-teal">Ya estás participando</span>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-sm font-body">
          <span className="text-ink-muted">Cantidad reservada</span>
          <span className="font-semibold text-ink">{commitment.quantity} u.</span>
        </div>
        <div className="flex justify-between text-sm font-body">
          <span className="text-ink-muted">Total comprometido</span>
          <span className="font-semibold text-ink">{formatCurrency(commitment.totalAmount)}</span>
        </div>
        <div className="flex justify-between text-sm font-body items-center">
          <span className="text-ink-muted">Estado</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-display ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
      </div>
      {canAddMore && (
        <Button variant="secondary" size="lg" fullWidth onClick={onAddMore}>
          Agregar más unidades
        </Button>
      )}
      <Link
        to="/mi-cuenta"
        className="text-xs font-body font-medium text-brand-teal hover:underline text-center"
      >
        Ver mis compras →
      </Link>
    </div>
  );
}

// ─── CTA section — role-aware ─────────────────────────────────────────────────

interface CTAProps {
  group: Group;
  commitment: UserCommitment | null;
  onJoin: () => void;
  onOpenAuth: () => void;
}

function CTADesktop({ group, commitment, onJoin, onOpenAuth }: CTAProps) {
  const { user, isAuthenticated } = useAuth();
  const isOpen = group.status === 'open';

  // Suppliers: informational notice, no purchase CTA
  if (user?.role === 'supplier') {
    return (
      <div className="rounded-2xl border border-ink-faint/40 bg-surface p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-ink-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-display font-semibold text-sm text-ink">Modo proveedor</span>
        </div>
        <p className="font-body text-xs text-ink-muted leading-relaxed">
          Estás viendo este grupo como proveedor. Solo los compradores pueden unirse a grupos de compra.
        </p>
      </div>
    );
  }

  // Guest: auth prompt
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-2">
        <Button variant="primary" size="lg" fullWidth onClick={onOpenAuth}>
          Sumarme al grupo
        </Button>
        <p className="text-xs text-center text-ink-muted">
          Necesitás una cuenta de comprador para unirte
        </p>
      </div>
    );
  }

  // Buyer already joined
  if (commitment) {
    return <AlreadyJoined commitment={commitment} group={group} onAddMore={onJoin} />;
  }

  // Buyer — join
  return (
    <Button variant="primary" size="lg" fullWidth disabled={!isOpen} onClick={onJoin}>
      {isOpen ? 'Sumarme al grupo' : 'Grupo cerrado'}
    </Button>
  );
}

function CTAMobile({ group, commitment, onJoin, onOpenAuth }: CTAProps) {
  const { user, isAuthenticated } = useAuth();
  const isOpen = group.status === 'open';

  // Suppliers: no bottom bar at all
  if (user?.role === 'supplier') return null;

  const handleClick = !isAuthenticated ? onOpenAuth : onJoin;
  const label = !isAuthenticated ? 'Iniciar sesión' : isOpen ? 'Sumarme' : 'Cerrado';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-surface-card border-t border-ink-faint/30 px-4 py-3 shadow-lg">
      {commitment ? (
        <div className="flex items-center justify-between gap-3 py-1">
          <div className="flex items-center gap-2 min-w-0">
            <svg className="w-5 h-5 text-brand-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="min-w-0">
              <p className="font-display font-bold text-sm text-brand-teal">Ya estás participando</p>
              <p className="font-body text-xs text-ink-muted">{commitment.quantity} u. · {formatCurrency(commitment.totalAmount)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isOpen && group.remainingUnits > 0 && (
              <Button variant="secondary" size="sm" onClick={onJoin}>
                + Unidades
              </Button>
            )}
            <Link
              to="/mi-cuenta"
              className="text-xs font-body font-semibold text-brand-teal hover:underline"
            >
              Ver →
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex flex-col min-w-0">
              <span className="font-display font-extrabold text-brand-purple text-lg leading-tight">
                {formatCurrency(group.wholesalePrice)}
              </span>
              <span className="font-body text-xs text-ink-muted line-clamp-1">{group.title}</span>
            </div>
            <Button
              variant="primary"
              size="md"
              disabled={isAuthenticated && !isOpen}
              onClick={handleClick}
            >
              {label}
            </Button>
          </div>
          <div className="flex justify-center gap-6 mt-1.5">
            <span className="font-body text-xs text-ink-muted">🔒 PAGO SEGURO</span>
            <span className="font-body text-xs text-ink-muted">🚚 ENVÍO A REGIONES</span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Right column (sticky panel) ─────────────────────────────────────────────

interface RightPanelProps {
  group: Group;
  commitment: UserCommitment | null;
  onJoin: () => void;
  onOpenAuth: () => void;
}

function RightPanel({ group, commitment, onJoin, onOpenAuth }: RightPanelProps) {
  const progressColor = group.progressPercent >= 80 ? 'text-status-urgent' : 'text-brand-teal';

  return (
    <div className="flex flex-col gap-5">
      {/* Pricing */}
      <div className="bg-surface-card border border-ink-faint/30 rounded-2xl p-5 flex flex-col gap-3">
        <div>
          <p className="font-display font-semibold text-xs text-ink-muted tracking-widest uppercase mb-1">
            Precio unitario actual
          </p>
          <p className="font-body text-ink-muted line-through text-sm">
            {formatCurrency(group.unitPrice)}
          </p>
        </div>
        <div>
          <p className="font-display font-semibold text-xs text-ink-muted tracking-widest uppercase mb-1">
            Precio mayorista meta
          </p>
          <div className="flex items-baseline gap-3">
            <span className="font-display font-extrabold text-3xl text-brand-purple">
              {formatCurrency(group.wholesalePrice)}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-display bg-status-confirmed/10 text-status-confirmed">
              -{group.discountPercentage}% Ahorro Grupal
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="font-display font-semibold text-xs text-ink-muted uppercase tracking-widest">
              Progreso del grupo
            </span>
            <span className={`font-display font-bold text-sm ${progressColor}`}>
              {group.progressPercent}%
            </span>
          </div>
          <ProgressBar percent={group.progressPercent} size="md" />
          <p className="font-body text-xs text-ink-muted">
            {group.remainingUnits > 0
              ? `Faltan solo ${group.remainingUnits} unidades para alcanzar el precio mayorista.`
              : '¡Grupo completo!'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-card border border-ink-faint/30 rounded-xl p-4 flex flex-col gap-1">
          <span className="font-display font-semibold text-xs text-ink-muted uppercase tracking-widest">
            Finaliza en
          </span>
          <CountdownTimer expiresAt={group.expiresAt} />
        </div>
        <div className="bg-surface-card border border-ink-faint/30 rounded-xl p-4 flex flex-col gap-2">
          <span className="font-display font-semibold text-xs text-ink-muted uppercase tracking-widest">
            Miembros activos
          </span>
          <div className="flex items-center gap-2">
            <AvatarGroup users={MOCK_MEMBERS.slice(0, Math.min(4, group.activeMembers))} max={4} />
            <span className="font-display font-bold text-sm text-ink">{group.activeMembers}</span>
          </div>
        </div>
      </div>

      {/* CTA — hidden on mobile (shown in fixed bottom bar instead) */}
      <div className="hidden lg:flex flex-col gap-3">
        <CTADesktop group={group} commitment={commitment} onJoin={onJoin} onOpenAuth={onOpenAuth} />
        <div className="flex justify-center gap-6">
          <span className="font-body text-xs text-ink-muted">🔒 PAGO SEGURO</span>
          <span className="font-body text-xs text-ink-muted">🚚 ENVÍO A REGIONES</span>
        </div>
      </div>

      {/* Pulso Colectivo */}
      <PulsoColectivo progressPercent={group.progressPercent} />
    </div>
  );
}

// ─── GroupDetailPage ──────────────────────────────────────────────────────────

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { group, loading, error, notFound, refetch } = useGroupDetail(id);
  const { user, isAuthenticated } = useAuth();
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [commitment, setCommitment] = useState<UserCommitment | null>(null);
  const [updatingAdhesionId, setUpdatingAdhesionId] = useState<string | null>(null);

  async function handleStatusUpdate(adhesionId: string, status: string) {
    setUpdatingAdhesionId(adhesionId);
    try {
      await updateAdhesionStatus(adhesionId, status);
      refetch();
    } catch (err) {
      console.error('Error updating order status:', err);
    } finally {
      setUpdatingAdhesionId(null);
    }
  }

  // Cargamos la adhesión del usuario para esta oportunidad desde la API
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'buyer' || !group) {
      setCommitment(null);
      return;
    }

    getMyAdhesions()
      .then((adhesions) => {
        const active = adhesions.find(
          (a) => a.opportunityId === group.id && a.status !== 'cancelled',
        );
        setCommitment(active ?? null);
      })
      .catch(() => {
        setCommitment(null);
      });
  }, [isAuthenticated, user?.role, group?.id]);

  useEffect(() => {
    if (group) {
      document.title = `${group.title} | MiniMax`;
    }
  }, [group]);

  if (loading) return <PageSkeleton />;
  if (notFound) return <NotFound />;
  if (error) return <GenericError message={error} />;
  if (!group) return null;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 font-body text-xs text-ink-muted mb-6">
          <Link to="/explorar" className="hover:text-brand-purple transition-colors">Marketplace</Link>
          <span>/</span>
          <Link to={`/explorar?category=${encodeURIComponent(group.category)}`} className="hover:text-brand-purple transition-colors">
            {group.category}
          </Link>
          <span>/</span>
          <span className="text-ink line-clamp-1 max-w-xs">{group.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* ── Left column ──────────────────────────────────────────────── */}
          <div className="flex-[3] flex flex-col gap-6 min-w-0">
            {/* Product image */}
            <div className="relative rounded-2xl overflow-hidden shadow-md h-80 sm:h-[400px] bg-ink-faint/10">
              <img
                src={group.imageUrl || `https://picsum.photos/seed/${group.id}/800/500`}
                alt={group.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent pointer-events-none" />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant={group.status === 'open' ? (group.progressPercent >= 80 ? 'urgent' : 'open') : group.status}>
                  {group.status === 'open'
                    ? group.progressPercent >= 80 ? 'Urgente' : 'Abierto'
                    : group.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                </Badge>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-display tracking-wide bg-surface-card/90 text-ink backdrop-blur-sm">
                  {group.category}
                </span>
                {group.tags && group.tags[0] && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-display tracking-wide bg-brand-teal/20 text-brand-teal backdrop-blur-sm">
                    {group.tags[0]}
                  </span>
                )}
              </div>
            </div>

            {/* Title and description */}
            <div className="flex flex-col gap-3">
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ink leading-tight">
                {group.title}
              </h1>
              <p className="font-body text-ink-muted leading-relaxed">{group.description}</p>
            </div>

            {/* Attribute pills */}
            <div className="flex flex-wrap gap-2">
              <AttributePill icon="🌍" label={group.supplierOrigin} />
              <AttributePill icon="📉" label={`${group.discountPercentage}% de descuento grupal`} />
              {group.remainingUnits > 0 && (
                <AttributePill icon="📦" label={`${group.remainingUnits} unidades disponibles`} />
              )}
            </div>

            {/* Supplier info */}
            <section className="flex flex-col gap-4">
              <h2 className="font-display font-bold text-xs text-ink-muted uppercase tracking-widest">
                Información del proveedor
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SupplierCard
                  title={group.supplier?.companyName ?? group.supplier?.name ?? 'Proveedor'}
                  body={`Origen: ${group.supplierOrigin}`}
                  footer={
                    group.supplierCatalogUrl ? (
                      <a
                        href={group.supplierCatalogUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-display font-bold text-xs text-brand-teal hover:underline tracking-widest uppercase"
                      >
                        Ver catálogo completo →
                      </a>
                    ) : null
                  }
                />
                <SupplierCard
                  title="Logística Grupal"
                  body="Los pedidos de todos los miembros se consolidan en un solo envío directo desde el proveedor, reduciendo costos y tiempos de entrega."
                  footer={
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-brand-teal/10 text-brand-teal">
                      Logística Eficiente
                    </span>
                  }
                />
                <SupplierCard
                  title="Garantía MiniMax"
                  body="Si el grupo no alcanza el mínimo, te devolvemos el 100% de tu dinero de forma inmediata y automática."
                  footer={
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-status-confirmed/10 text-status-confirmed">
                      Compra Protegida
                    </span>
                  }
                />
              </div>
            </section>

            {/* Supplier Order Management */}
            {user?.role === 'supplier' && group.supplierId === user.id && group.status === 'confirmed' && (
              <section className="flex flex-col gap-4 border-t border-ink-faint/30 pt-6">
                <div>
                  <h2 className="font-display font-bold text-lg text-ink">Gestión de Pedidos de Compradores</h2>
                  <p className="font-body text-xs text-ink-muted mt-0.5">
                    Modificá el estado de los pedidos individuales de los minoristas. Cada cambio les enviará una notificación flotante.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  {group.adhesions && group.adhesions.length > 0 ? (
                    group.adhesions.map((adhesion) => (
                      <SupplierAdhesionCard
                        key={adhesion.id}
                        adhesion={adhesion}
                        updating={updatingAdhesionId === adhesion.id}
                        onStatusUpdate={handleStatusUpdate}
                      />
                    ))
                  ) : (
                    <p className="font-body text-xs text-ink-muted italic">No hay pedidos para este grupo.</p>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* ── Right column (sticky) ────────────────────────────────────── */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0 lg:sticky lg:top-6">
            <RightPanel
              group={group}
              commitment={commitment}
              onJoin={() => setJoinModalOpen(true)}
              onOpenAuth={() => setAuthModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* ── Mobile fixed CTA ─────────────────────────────────────────────── */}
      <CTAMobile
        group={group}
        commitment={commitment}
        onJoin={() => setJoinModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* ── Auth modal (guests) ───────────────────────────────────────────── */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab="register"
      />

      {/* ── Join modal (buyers) ───────────────────────────────────────────── */}
      <JoinGroupModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        group={group}
        existingQuantity={commitment?.quantity}
        onSuccess={refetch}
      />
    </>
  );
}

// ─── Small internal components ────────────────────────────────────────────────

function AttributePill({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-ink-faint/40 font-body text-xs text-ink-muted">
      <span>{icon}</span>
      {label}
    </span>
  );
}

interface SupplierCardProps {
  title: string;
  body: string;
  footer?: React.ReactNode;
}

function SupplierCard({ title, body, footer }: SupplierCardProps) {
  return (
    <div className="bg-surface border border-ink-faint/30 rounded-2xl p-4 flex flex-col gap-3">
      <p className="font-display font-bold text-ink text-sm">{title}</p>
      <p className="font-body text-xs text-ink-muted leading-relaxed flex-1">{body}</p>
      {footer && <div>{footer}</div>}
    </div>
  );
}

function SupplierAdhesionCard({
  adhesion,
  updating,
  onStatusUpdate,
}: {
  adhesion: any;
  updating: boolean;
  onStatusUpdate: (id: string, status: string) => void;
}) {
  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    cancelled: 'Cancelado',
    preparing: 'En preparación',
    shipped: 'Enviado',
    delivered: 'Entregado',
  };

  const statusColors: Record<string, string> = {
    pending: 'text-status-open bg-status-open/10 border-status-open/20',
    confirmed: 'text-status-confirmed bg-status-confirmed/10 border-status-confirmed/20',
    cancelled: 'text-status-cancelled bg-status-cancelled/10 border-status-cancelled/20',
    preparing: 'text-status-urgent bg-status-urgent/10 border-status-urgent/20',
    shipped: 'text-brand-purple bg-brand-purple/10 border-brand-purple/20',
    delivered: 'text-brand-teal bg-brand-teal/10 border-brand-teal/20',
  };

  const canUpdate = adhesion.status !== 'cancelled' && adhesion.status !== 'pending';

  return (
    <div className="bg-white border border-ink-faint/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <p className="font-display font-bold text-sm text-ink">
            {adhesion.user?.storeName || adhesion.user?.name || 'Minorista'}
          </p>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${statusColors[adhesion.status] || ''}`}>
            {statusLabels[adhesion.status] || adhesion.status}
          </span>
        </div>
        <p className="font-body text-xs text-ink-muted">
          Contacto: <span className="text-ink">{adhesion.user?.email}</span>
        </p>
        <div className="flex gap-4 text-xs font-body text-ink-muted mt-1">
          <span>Cant: <span className="font-semibold text-ink">{adhesion.quantity} u.</span></span>
          <span>Monto: <span className="font-semibold text-ink">{formatCurrency(adhesion.totalAmount)}</span></span>
        </div>
      </div>

      {canUpdate && (
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={adhesion.status}
            disabled={updating}
            onChange={(e) => onStatusUpdate(adhesion.id, e.target.value)}
            className="rounded-xl border border-ink-faint/40 bg-white font-body text-xs text-ink py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
          >
            <option value="confirmed">Confirmado</option>
            <option value="preparing">En preparación</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
          </select>
          {updating && <span className="w-4 h-4 border-2 border-brand-teal border-t-transparent rounded-full animate-spin shrink-0" />}
        </div>
      )}
    </div>
  );
}
