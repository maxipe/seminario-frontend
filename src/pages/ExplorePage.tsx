/**
 * ExplorePage — catálogo principal de grupos de compra.
 * Permite buscar, filtrar por categoría y estado, y navegar al detalle de cada grupo.
 */

import { useState } from 'react';
import { useGroups } from '../features/groups/hooks/useGroups';
import { useDebounce } from '../hooks/useDebounce';
import { usePageTitle } from '../hooks/usePageTitle';
import GroupCard from '../features/groups/components/GroupCard';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';

const CATEGORY_OPTIONS = [
  { label: 'Todas las categorías', value: '' },
  { label: 'Alimentos', value: 'Alimentos' },
  { label: 'Bebidas', value: 'Bebidas' },
  { label: 'Electrónica', value: 'Electrónica' },
  { label: 'Hogar', value: 'Hogar' },
  { label: 'Indumentaria', value: 'Indumentaria' },
];

const STATUS_OPTIONS = [
  { label: 'Todos los estados', value: '' },
  { label: 'Abiertos', value: 'open' },
  { label: 'Confirmados', value: 'confirmed' },
  { label: 'Cancelados', value: 'cancelled' },
];

/** Ícono de lupa inline para el input de búsqueda. */
function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function ExplorePage() {
  usePageTitle('Explorar Grupos');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  const debouncedSearch = useDebounce(searchInput, 400);

  const { groups, loading, error, refetch } = useGroups({
    search: debouncedSearch || undefined,
    category: category || undefined,
    status: (status as 'open' | 'confirmed' | 'cancelled') || undefined,
  });

  const hasActiveFilters = !!debouncedSearch || !!category || !!status;

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface to-white">
      {/* Page header */}
      <div className="bg-gradient-to-b from-surface to-white border-b border-ink-faint/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-brand-purple">
            Explorar Grupos
          </h1>
          <p className="mt-3 font-body text-lg text-ink-muted max-w-xl">
            Encontrá el grupo de compra ideal para tu negocio.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Input
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Buscar productos..."
            icon={<SearchIcon />}
            className="flex-1 min-w-0"
          />
          <Select
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={setCategory}
            className="sm:w-52"
          />
          <Select
            options={STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
            className="sm:w-48"
          />
        </div>

        {/* Results count */}
        {!loading && !error && (
          <p className="font-body text-sm text-ink-muted mb-5">
            {groups.length === 0
              ? 'Sin resultados'
              : `${groups.length} grupo${groups.length !== 1 ? 's' : ''} encontrado${groups.length !== 1 ? 's' : ''}`}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Spinner size="lg" />
            <p className="font-body text-sm text-ink-muted">Cargando grupos...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <ErrorState message={error} onRetry={refetch} />
        )}

        {/* Empty state */}
        {!loading && !error && groups.length === 0 && (
          <EmptyState
            icon={
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            }
            title="No encontramos grupos con esos filtros."
            action={
              hasActiveFilters ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchInput('');
                    setCategory('');
                    setStatus('');
                  }}
                >
                  Limpiar filtros
                </Button>
              ) : undefined
            }
          />
        )}

        {/* Grid */}
        {!loading && !error && groups.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
