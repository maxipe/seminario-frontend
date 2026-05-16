/**
 * Sección CTA reutilizable para el final de las páginas principales.
 * Usada en HomePage y HowItWorksPage para invitar al usuario a explorar o registrarse.
 */

import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

interface CTASectionProps {
  title: React.ReactNode;
  subtitle?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export default function CTASection({
  title,
  subtitle,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: CTASectionProps) {
  const navigate = useNavigate();

  return (
    <section className="bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 lg:py-28 text-center flex flex-col gap-8 items-center">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-ink leading-tight">
          {title}
        </h2>

        {subtitle && (
          <p className="font-body text-ink-muted text-base leading-relaxed max-w-xl -mt-4">
            {subtitle}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" size="lg" onClick={() => navigate(primaryHref)}>
            {primaryLabel}
          </Button>
          {secondaryLabel && secondaryHref && (
            <Button variant="ghost" size="lg" onClick={() => navigate(secondaryHref)}>
              {secondaryLabel}
            </Button>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-ink-muted text-sm font-body -mt-2">
          {['Sin membresías', 'Sin contratos', 'Cancelá cuando quieras'].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-brand-teal"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
