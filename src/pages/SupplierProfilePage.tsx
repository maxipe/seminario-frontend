import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPublicProfile, getGroups, type PublicProfile } from '../features/groups/services';
import { getSupplierReviews, type Review } from '../features/reviews/services';
import type { Group } from '../types';
import Avatar from '../components/ui/Avatar';
import GroupCard from '../features/groups/components/GroupCard';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

export default function SupplierProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError('');

    Promise.all([
      getPublicProfile(id),
      getGroups({ supplierId: id }),
      getSupplierReviews(id)
    ])
      .then(([profileData, groupsData, reviewsData]) => {
        setProfile(profileData);
        setGroups(groupsData);
        setReviews(reviewsData);
      })
      .catch((err) => {
        console.error('Error fetching supplier profile:', err);
        setError('No se pudo cargar el perfil del proveedor.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-28 px-4 gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-status-cancelled/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-status-cancelled" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="font-display font-bold text-ink text-xl">Error al cargar</h2>
          <p className="font-body text-ink-muted">{error || 'El proveedor no existe.'}</p>
        </div>
        <Button variant="primary" size="md" onClick={() => navigate('/explorar')}>
          Volver al Marketplace
        </Button>
      </div>
    );
  }

  const companyName = profile.companyName || profile.name;
  const memberSince = new Date(profile.createdAt).getFullYear();
  const activeGroups = groups.filter((g) => g.status === 'open');
  const pastGroups = groups.filter((g) => g.status !== 'open');

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 font-body text-xs text-ink-muted">
        <Link to="/explorar" className="hover:text-brand-purple transition-colors">Marketplace</Link>
        <span>/</span>
        <span className="text-ink">Perfil de Proveedor</span>
        <span>/</span>
        <span className="text-ink font-semibold">{companyName}</span>
      </nav>

      {/* Profile Header */}
      <header className="bg-brand-purple rounded-3xl relative overflow-hidden text-white p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 shadow-xl">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-teal/15 blur-3xl" />
        </div>
        <div className="relative shrink-0">
          <Avatar src={profile.avatarUrl ?? undefined} alt={companyName} size="lg" />
          <span className="absolute -bottom-1 -right-1 bg-brand-teal text-white rounded-full p-1 border-4 border-brand-purple shadow-md" title="Proveedor Verificado">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        </div>
        <div className="relative flex-1 text-center sm:text-left min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-center sm:justify-start">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl break-words">{companyName}</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-display bg-brand-teal/20 border border-brand-teal/40 text-brand-teal self-center sm:self-auto">
              Proveedor Oficial
            </span>
          </div>
          <p className="text-sm font-body text-white/70 mt-1">Miembro de MiniMax desde {memberSince}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 justify-center sm:justify-start text-xs font-body text-white/95 items-center">
            <span className="flex items-center gap-1">
              📦 <strong>{groups.length}</strong> {groups.length === 1 ? 'grupo publicado' : 'grupos publicados'}
            </span>
            <span className="flex items-center gap-1">
              🔥 <strong>{activeGroups.length}</strong> activos actualmente
            </span>
            {averageRating && (
              <span className="flex items-center gap-1 bg-yellow-400/20 px-2 py-0.5 rounded-full border border-yellow-400/30 text-yellow-300">
                ⭐ <strong>{averageRating}</strong> ({totalReviews} {totalReviews === 1 ? 'valoración' : 'valoraciones'})
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Active Groups Showcase */}
      <section className="flex flex-col gap-6">
        <div className="border-b border-ink-faint/30 pb-3">
          <h2 className="font-display font-extrabold text-xl text-ink">Grupos de Compra Activos</h2>
          <p className="font-body text-sm text-ink-muted mt-1">Unite a las compras grupales vigentes de este proveedor y conseguí el mejor precio.</p>
        </div>

        {activeGroups.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-ink-faint/30 rounded-2xl">
            <p className="font-body text-ink-muted text-sm italic">Este proveedor no tiene grupos de compra activos en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </section>

      {/* Historical/Closed Groups */}
      {pastGroups.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="border-b border-ink-faint/30 pb-3">
            <h2 className="font-display font-bold text-lg text-ink">Historial de Grupos Cerrados</h2>
            <p className="font-body text-sm text-ink-muted mt-1">Grupos anteriores completados con éxito o finalizados.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
            {pastGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews list */}
      <section className="flex flex-col gap-6">
        <div className="border-b border-ink-faint/30 pb-3">
          <h2 className="font-display font-extrabold text-xl text-ink">Opiniones de Compradores</h2>
          <p className="font-body text-sm text-ink-muted mt-1">Lo que opinan otros minoristas que ya le compraron a este proveedor.</p>
        </div>

        {reviews.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-ink-faint/30 rounded-2xl bg-white">
            <p className="font-body text-ink-muted text-sm italic">Este proveedor aún no tiene valoraciones.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white border border-ink-faint/30 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-purple/10 text-brand-purple font-display font-bold text-sm flex items-center justify-center">
                      {rev.author?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-display font-bold text-sm text-ink">
                        {rev.author?.storeName || rev.author?.name || 'Comprador'}
                      </p>
                      <p className="text-xs font-body text-ink-muted mt-0.5">
                        {new Date(rev.createdAt).toLocaleDateString()} · {rev.opportunity?.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-base ${
                          star <= rev.rating ? 'text-yellow-400' : 'text-ink-faint'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                {rev.comment && (
                  <p className="font-body text-sm text-ink leading-relaxed">
                    "{rev.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
