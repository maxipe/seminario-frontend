import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { createReview } from '../services';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityId: string;
  opportunityTitle: string;
  onSuccess: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  opportunityId,
  opportunityTitle,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError('Por favor, selecciona una calificación.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await createReview(opportunityId, rating, comment.trim() || undefined);
      onSuccess();
      setRating(0);
      setComment('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar la valoración.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Calificar Compra Grupal" size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold font-display text-ink-muted uppercase tracking-wide mb-1">
            Producto / Compra
          </p>
          <p className="text-sm font-display font-bold text-ink line-clamp-2">
            {opportunityTitle}
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 py-3 border-y border-ink-faint/30">
          <p className="text-xs font-semibold font-display text-ink-muted uppercase tracking-wide">
            ¿Cómo fue tu experiencia con el proveedor?
          </p>
          <div className="flex gap-1.5 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-2xl transition-transform duration-100 hover:scale-125 focus:outline-none"
              >
                <span
                  className={
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400'
                      : 'text-ink-faint'
                  }
                >
                  ★
                </span>
              </button>
            ))}
          </div>
          {rating > 0 && (
            <span className="text-xs font-semibold font-body text-brand-teal">
              {rating === 1 && 'Muy malo'}
              {rating === 2 && 'Malo'}
              {rating === 3 && 'Aceptable'}
              {rating === 4 && 'Bueno'}
              {rating === 5 && '¡Excelente!'}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold font-display text-ink-muted uppercase tracking-wide">
            Comentario (opcional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Contanos tu experiencia con el envío, la calidad del producto, la atención del proveedor..."
            rows={4}
            className="w-full rounded-xl border border-ink-faint/40 bg-white font-body text-sm text-ink placeholder:text-ink-muted py-2.5 px-4 outline-none transition-all duration-150 focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal resize-none"
          />
        </div>

        {error && (
          <p className="text-xs font-body text-status-cancelled bg-status-cancelled/10 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="flex gap-3 mt-2">
          <Button type="button" variant="ghost" fullWidth onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" fullWidth loading={submitting}>
            Enviar Calificación
          </Button>
        </div>
      </form>
    </Modal>
  );
}
