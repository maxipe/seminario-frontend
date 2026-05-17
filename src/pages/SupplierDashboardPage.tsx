/**
 * Dashboard del proveedor. Muestra stats de sus oportunidades, el listado y un formulario
 * para publicar nuevas oportunidades de compra grupal.
 * Protegida por ProtectedRoute + verificación de rol (buyers son redirigidos a /mi-cuenta).
 */

import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../context/AuthContext';
import { getGroups, createOpportunity } from '../features/groups/services';
import type { Group } from '../types';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/formatCurrency';

const CATEGORIES = ['Alimentos', 'Bebidas', 'Electrónica', 'Hogar', 'Indumentaria', 'Otros'];
const DAYS_OPTIONS = [3, 5, 7, 14];

// ─── Stats header ──────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-2xl border border-ink-faint/30 bg-white p-5 flex flex-col gap-1">
      <span className="text-xs font-body font-medium text-ink-muted uppercase tracking-wide">{label}</span>
      <span className={`font-display font-extrabold text-2xl ${color}`}>{value}</span>
      <span className="text-xs font-body text-ink-muted">{sub}</span>
    </div>
  );
}

// ─── Supplier group card ───────────────────────────────────────────────────────

function SupplierGroupCard({ group }: { group: Group }) {
  const isOpen = group.status === 'open';
  const statusVariant: Record<string, 'open' | 'urgent' | 'confirmed' | 'cancelled'> = {
    open: group.progressPercent >= 90 ? 'urgent' : 'open',
    confirmed: 'confirmed',
    cancelled: 'cancelled',
  };
  const statusLabel: Record<string, string> = {
    open: group.progressPercent >= 90 ? 'Urgente' : 'Abierto',
    confirmed: 'Completado',
    cancelled: 'Cancelado',
  };

  return (
    <article className="flex gap-4 p-4 rounded-2xl border border-ink-faint/30 bg-white hover:shadow-md transition-shadow">
      <img
        src={group.imageUrl}
        alt={group.title}
        className="w-20 h-20 rounded-xl object-cover shrink-0"
      />
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-ink text-sm leading-snug line-clamp-2">
              {group.title}
            </h3>
            <p className="text-xs font-body text-ink-muted mt-0.5">{group.category}</p>
          </div>
          <Badge variant={statusVariant[group.status]}>{statusLabel[group.status]}</Badge>
        </div>

        <ProgressBar percent={group.progressPercent} size="sm" />

        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs font-body text-ink-muted">
            <span className="font-semibold text-ink">{group.committedUnits}</span>
            {' / '}
            <span>{group.minimumUnits}</span>
            {' unidades comprometidas'}
          </p>
          {isOpen && (
            <p className="text-xs font-body text-ink-muted">
              Precio mayorista: <span className="font-semibold text-ink">{formatCurrency(group.wholesalePrice)}</span>
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Link to={`/grupos/${group.id}`}>
            <Button variant="ghost" size="sm">Ver detalle →</Button>
          </Link>
        </div>
      </div>
    </article>
  );
}

// ─── Publish form ──────────────────────────────────────────────────────────────

interface PublishGroupFormProps {
  onPublished: (group: Group) => void;
}

function PublishGroupForm({ onPublished }: PublishGroupFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [minimumUnits, setMinimumUnits] = useState('');
  const [days, setDays] = useState(7);
  const [origin, setOrigin] = useState('');
  const [catalogUrl, setCatalogUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'El nombre del producto es requerido.';
    if (!description.trim()) e.description = 'La descripción es requerida.';
    if (!unitPrice || isNaN(Number(unitPrice)) || Number(unitPrice) <= 0)
      e.unitPrice = 'Ingresá un precio de mercado válido.';
    if (!wholesalePrice || isNaN(Number(wholesalePrice)) || Number(wholesalePrice) <= 0)
      e.wholesalePrice = 'Ingresá un precio mayorista válido.';
    if (Number(wholesalePrice) >= Number(unitPrice))
      e.wholesalePrice = 'El precio mayorista debe ser menor al precio de mercado.';
    if (!minimumUnits || isNaN(Number(minimumUnits)) || Number(minimumUnits) < 1)
      e.minimumUnits = 'Ingresá un mínimo de unidades válido.';
    if (!origin.trim()) e.origin = 'El origen del producto es requerido.';
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setServerError('');
    try {
      const pvp = Number(unitPrice);
      const wholesale = Number(wholesalePrice);
      const minUnits = Number(minimumUnits);

      const group = await createOpportunity({
        title: title.trim(),
        description: description.trim(),
        imageUrl: `https://picsum.photos/seed/${crypto.randomUUID()}/800/500`,
        category,
        unitPrice: pvp,
        wholesalePrice: wholesale,
        discountPercentage: Math.round((1 - wholesale / pvp) * 100),
        minimumUnits: minUnits,
        expiresAt: new Date(Date.now() + days * 86400000).toISOString(),
        tags: [category],
        supplierOrigin: origin.trim(),
        supplierCatalogUrl: catalogUrl.trim() || undefined,
      });

      onPublished(group);

      // Resetear formulario
      setTitle('');
      setCategory(CATEGORIES[0]);
      setDescription('');
      setUnitPrice('');
      setWholesalePrice('');
      setMinimumUnits('');
      setDays(7);
      setOrigin('');
      setCatalogUrl('');
      setErrors({});
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ocurrió un error al publicar el grupo. Intentá de nuevo.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <FormField label="Nombre del producto" error={errors.title}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Aceite de Oliva Extra Virgen"
          className={inputClass(!!errors.title)}
        />
      </FormField>

      <FormField label="Categoría">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputClass(false)}
        >
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </FormField>

      <FormField label="Descripción" error={errors.description}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describí el producto, su calidad, presentación, etc."
          rows={3}
          className={`${inputClass(!!errors.description)} resize-none`}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Precio de mercado (PVP)" error={errors.unitPrice}>
          <input
            type="number"
            min={0}
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            placeholder="Ej: 4800"
            className={inputClass(!!errors.unitPrice)}
          />
        </FormField>
        <FormField label="Precio mayorista" error={errors.wholesalePrice}>
          <input
            type="number"
            min={0}
            value={wholesalePrice}
            onChange={(e) => setWholesalePrice(e.target.value)}
            placeholder="Ej: 3200"
            className={inputClass(!!errors.wholesalePrice)}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Unidades mínimas para activar" error={errors.minimumUnits}>
          <input
            type="number"
            min={1}
            value={minimumUnits}
            onChange={(e) => setMinimumUnits(e.target.value)}
            placeholder="Ej: 200"
            className={inputClass(!!errors.minimumUnits)}
          />
        </FormField>
        <FormField label="Duración del grupo">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className={inputClass(false)}
          >
            {DAYS_OPTIONS.map((d) => (
              <option key={d} value={d}>{d} días</option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Origen del producto" error={errors.origin}>
        <input
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          placeholder="Ej: Mendoza, Argentina"
          className={inputClass(!!errors.origin)}
        />
      </FormField>

      <FormField label="URL del catálogo (opcional)">
        <input
          type="url"
          value={catalogUrl}
          onChange={(e) => setCatalogUrl(e.target.value)}
          placeholder="https://mi-empresa.com/catalogo"
          className={inputClass(false)}
        />
      </FormField>

      {serverError && (
        <p className="text-sm text-status-cancelled font-body bg-status-cancelled/10 rounded-xl px-4 py-2.5">
          {serverError}
        </p>
      )}

      <Button type="submit" variant="primary" size="md" fullWidth loading={submitting}>
        Publicar Grupo
      </Button>
    </form>
  );
}

function inputClass(hasError: boolean): string {
  return [
    'w-full rounded-xl border bg-white font-body text-sm text-ink placeholder:text-ink-muted',
    'py-2.5 px-4 outline-none transition-all duration-150',
    'focus:ring-2 focus:ring-brand-teal/20',
    hasError
      ? 'border-status-cancelled focus:border-status-cancelled'
      : 'border-ink-faint/40 focus:border-brand-teal',
  ].join(' ');
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold font-display text-ink-muted uppercase tracking-wide">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-status-cancelled font-body">{error}</p>}
    </div>
  );
}

// ─── SupplierDashboardPage ─────────────────────────────────────────────────────

export default function SupplierDashboardPage() {
  usePageTitle('Panel Proveedor');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'supplier') {
      navigate('/mi-cuenta', { replace: true });
      return;
    }

    // Cargamos las oportunidades del proveedor desde la API
    setLoading(true);
    getGroups({ supplierId: user.id })
      .then((data) => setGroups(data))
      .catch(() => showToast('Error al cargar tus grupos.', 'error'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user || user.role !== 'supplier') return null;

  const published = groups.length;
  const completed = groups.filter((g) => g.status === 'confirmed').length;
  const totalUnits = groups
    .filter((g) => g.status === 'confirmed')
    .reduce((acc, g) => acc + g.committedUnits, 0);

  function handlePublished(group: Group) {
    setGroups((prev) => [group, ...prev]);
    setShowForm(false);
    showToast('¡Grupo publicado exitosamente!', 'success');
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Profile header */}
      <div className="flex items-center gap-5 mb-10">
        <Avatar src={user.avatarUrl} alt={user.name} size="lg" />
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display font-extrabold text-2xl text-ink">
              {user.companyName ?? user.name}
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-display bg-brand-purple/10 text-brand-purple">
              Proveedor
            </span>
          </div>
          <p className="text-sm font-body text-ink-muted mt-0.5">{user.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard
          label="Grupos publicados"
          value={String(published)}
          sub="en total"
          color="text-brand-purple"
        />
        <StatCard
          label="Grupos completados"
          value={String(completed)}
          sub="alcanzaron el mínimo"
          color="text-status-confirmed"
        />
        <StatCard
          label="Unidades vendidas"
          value={String(totalUnits)}
          sub="en grupos confirmados"
          color="text-brand-teal"
        />
      </div>

      {/* Groups list */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display font-bold text-ink text-xl mb-1">Mis Grupos Publicados</h2>
            <p className="text-sm font-body text-ink-muted">El estado de todos los grupos que creaste.</p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowForm((s) => !s)}
          >
            {showForm ? 'Cancelar' : '+ Publicar Grupo'}
          </Button>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {!loading && groups.length === 0 && !showForm && (
          <EmptyState
            icon={
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            title="Todavía no publicaste ningún grupo."
            description="Creá tu primer grupo y empezá a vender al por mayor."
            action={
              <Button variant="primary" size="md" onClick={() => setShowForm(true)}>
                Publicar mi primer grupo
              </Button>
            }
          />
        )}

        {!loading && groups.length > 0 && (
          <div className="flex flex-col gap-3">
            {groups.map((g) => (
              <SupplierGroupCard key={g.id} group={g} />
            ))}
          </div>
        )}
      </section>

      {/* Publish form */}
      {showForm && (
        <section className="border border-ink-faint/30 rounded-2xl bg-white p-6">
          <h3 className="font-display font-bold text-ink text-lg mb-5">Publicar Nuevo Grupo</h3>
          <PublishGroupForm
            onPublished={handlePublished}
          />
        </section>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => {}}
        />
      )}
    </div>
  );
}
