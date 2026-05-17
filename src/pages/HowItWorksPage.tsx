/**
 * HowItWorksPage — guía explicativa del proceso de compra grupal de MiniMax.
 * Audiencia: retailers con dudas antes de unirse a su primer grupo.
 * Estructura: Hero · Pasos Detallados (layout alternado) · FAQ acordeón · CTA final.
 */

import { useState } from 'react';
import GroupCard from '../features/groups/components/GroupCard';
import CTASection from '../components/layout/CTASection';
import AuthModal from '../features/auth/components/AuthModal';
import { usePageTitle } from '../hooks/usePageTitle';
import { formatCurrency } from '../utils/formatCurrency';
import { useAuth } from '../context/AuthContext';
// ─── Mock data para ilustración ───────────────────────────────────────────────────

const DEMO_GROUP = {
  id: 'demo-group-1',
  title: 'Aceite de Oliva Extra Virgen — Mendoza',
  description: 'Aceite de oliva extra virgen de primera presión en frío. Acidez libre menor a 0.5%. Origen: Luján de Cuyo, Mendoza.',
  imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80',
  category: 'alimentos',
  unitPrice: 4800,
  wholesalePrice: 3200,
  discountPercentage: 33,
  minimumUnits: 200,
  committedUnits: 164,
  activeMembers: 34,
  status: 'open',
  expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
  tags: ['aceite', 'oliva', 'mendoza'],
  supplier: {
    id: 'supplier-demo',
    name: 'Finca Dorada S.A.',
    rating: 4.8,
    isVerified: true,
  },
} as any;

// ─── FAQ item ─────────────────────────────────────────────────────────────────

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border-b border-ink-faint/30 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 text-left cursor-pointer group"
        aria-expanded={isOpen}
      >
        <span className="font-display font-semibold text-ink text-base group-hover:text-brand-purple transition-colors">
          {question}
        </span>
        <span
          className={`shrink-0 w-6 h-6 rounded-full border border-ink-faint/50 flex items-center justify-center transition-transform duration-200 ${
            isOpen ? 'rotate-180 border-brand-teal text-brand-teal' : 'text-ink-muted'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-48 opacity-100 pb-5' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="font-body text-ink-muted text-sm leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

// ─── Step section ─────────────────────────────────────────────────────────────

interface StepSectionProps {
  number: string;
  title: string;
  description: string;
  illustration: React.ReactNode;
  reverse?: boolean;
}

function StepSection({ number, title, description, illustration, reverse = false }: StepSectionProps) {
  return (
    <div
      className={`flex flex-col ${
        reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'
      } gap-10 lg:gap-16 items-center py-16 lg:py-20`}
    >
      {/* Text */}
      <div className="flex-1 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-purple flex items-center justify-center shrink-0">
            <span className="font-display font-extrabold text-brand-teal text-lg">{number}</span>
          </div>
          <span className="font-display font-semibold text-xs text-ink-muted tracking-widest uppercase">
            Paso {parseInt(number)}
          </span>
        </div>
        <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-ink leading-snug">
          {title}
        </h3>
        <p className="font-body text-ink-muted text-base leading-relaxed max-w-lg">{description}</p>
      </div>

      {/* Illustration */}
      <div className="flex-1 w-full max-w-md lg:max-w-none">{illustration}</div>
    </div>
  );
}

// ─── Illustration: JoinGroupModal mockup ──────────────────────────────────────

function JoinModalMockup() {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-ink-faint/20 overflow-hidden max-w-sm mx-auto">
      {/* Header */}
      <div className="bg-brand-purple px-6 py-5">
        <p className="font-display font-bold text-white text-sm">Unirme al grupo</p>
        <p className="font-body text-white/60 text-xs mt-0.5">Aceite de Oliva Extra Virgen</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-0 px-6 pt-5">
        {['Cantidad', 'Confirmar', 'Listo'].map((step, i) => (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs ${
                  i === 0
                    ? 'bg-brand-teal text-white'
                    : 'bg-ink-faint/30 text-ink-muted'
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-xs font-body whitespace-nowrap ${i === 0 ? 'text-brand-teal font-semibold' : 'text-ink-muted'}`}>
                {step}
              </span>
            </div>
            {i < 2 && <div className="flex-1 h-px bg-ink-faint/30 mx-1.5 mb-4" />}
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="px-6 py-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-display font-semibold text-xs text-ink-muted uppercase tracking-wide">
            Cantidad de unidades
          </label>
          <div className="flex items-center border border-brand-teal rounded-xl overflow-hidden">
            <button type="button" className="px-4 py-2.5 font-display font-bold text-ink-muted text-lg hover:bg-surface transition-colors cursor-pointer">−</button>
            <span className="flex-1 text-center font-display font-bold text-ink text-lg py-2.5">10</span>
            <button type="button" className="px-4 py-2.5 font-display font-bold text-ink-muted text-lg hover:bg-surface transition-colors cursor-pointer">+</button>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-4 flex flex-col gap-2">
          <div className="flex justify-between text-xs font-body text-ink-muted">
            <span>Precio mayorista × 10</span>
            <span className="font-semibold text-ink">{formatCurrency(3200 * 10)}</span>
          </div>
          <div className="border-t border-ink-faint/30 pt-2 flex justify-between font-display font-bold text-sm text-ink">
            <span>Total a pagar ahora</span>
            <span className="text-brand-teal">{formatCurrency(3200 * 10)}</span>
          </div>
        </div>

        <div className="bg-brand-teal/10 rounded-xl px-4 py-2.5 text-xs font-body text-brand-teal/90 leading-relaxed">
          Si el grupo no se completa, te devolvemos el 100% de tu dinero de forma automática e inmediata.
        </div>
      </div>
    </div>
  );
}

// ─── Illustration: Stats cards ────────────────────────────────────────────────

function StatsIllustration() {
  const stats = [
    {
      value: '-42%',
      label: 'Ahorro promedio',
      sub: 'vs. precio de lista',
      color: 'text-status-confirmed',
      bg: 'bg-status-confirmed/10',
    },
    {
      value: '+1.200',
      label: 'Retailers activos',
      sub: 'en toda Argentina',
      color: 'text-brand-purple',
      bg: 'bg-brand-purple/10',
    },
    {
      value: '100%',
      label: 'Garantía de devolución',
      sub: 'si el grupo no se completa',
      color: 'text-brand-teal',
      bg: 'bg-brand-teal/10',
    },
  ];

  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto lg:max-w-none">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-2xl border border-ink-faint/20 shadow-sm px-6 py-5 flex items-center gap-5"
        >
          <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0`}>
            <span className={`font-display font-extrabold text-sm ${stat.color}`}>{stat.value}</span>
          </div>
          <div>
            <p className="font-display font-bold text-ink text-sm">{stat.label}</p>
            <p className="font-body text-ink-muted text-xs mt-0.5">{stat.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    question: '¿Qué pasa si el grupo no alcanza el mínimo?',
    answer:
      'Tu pago se devuelve automáticamente al 100%. No hay ningún costo ni gestión de tu parte. MiniMax garantiza que nunca perdés dinero si el grupo no se completa.',
  },
  {
    question: '¿Cuánto tiempo tarda en completarse un grupo?',
    answer:
      'Depende del producto y la demanda. El promedio es 3-7 días. Cada grupo muestra su fecha límite claramente en la card y en la página de detalle.',
  },
  {
    question: '¿Puedo unirme a más de un grupo al mismo tiempo?',
    answer:
      'Sí, podés participar en todos los grupos que quieras simultáneamente. Tu cuenta muestra el estado de cada uno en tiempo real.',
  },
  {
    question: '¿Cómo se coordina la entrega?',
    answer:
      'Una vez confirmado el grupo, el proveedor se contacta directamente con cada participante para coordinar el envío o retiro. MiniMax facilita esa comunicación.',
  },
  {
    question: '¿Qué productos puedo encontrar?',
    answer:
      'Alimentos, electrónica, decoración, textil, cafetería y más. El catálogo crece continuamente con nuevos proveedores que se suman a la plataforma.',
  },
  {
    question: '¿Hay un monto mínimo para participar?',
    answer:
      'No. Podés comprometer desde 1 unidad. El precio mayorista aplica cuando el grupo completo alcanza el volumen mínimo — no importa cuánto ponés vos.',
  },
];

// ─── HowItWorksPage ───────────────────────────────────────────────────────────

export default function HowItWorksPage() {
  usePageTitle('Cómo Funciona');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { user } = useAuth();

  function toggleFaq(index: number) {
    setOpenFaq((prev) => (prev === index ? null : index));
  }

  const [authModalOpen, setAuthModalOpen] = useState(false);

  const isSupplier = user?.role === 'supplier';
  const isBuyer = user?.role === 'buyer';

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-brand-purple/5 via-surface to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 lg:py-28 text-center flex flex-col gap-5 items-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 border border-brand-teal/30 text-brand-teal text-xs font-display font-semibold tracking-widest uppercase">
            Guía paso a paso
          </span>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-ink leading-tight">
            ¿Cómo funciona{' '}
            <span className="text-brand-purple">MiniMax</span>?
          </h1>
          <p className="font-body text-ink-muted text-lg leading-relaxed max-w-2xl">
            En tres pasos simples, accedés a los mismos precios que las grandes cadenas.
          </p>
        </div>
      </section>

      {/* ── Steps ────────────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="divide-y divide-ink-faint/20">
            {/* Step 1 */}
            <StepSection
              number="01"
              title="Explorá y elegí tu grupo"
              description="Ingresá al catálogo y encontrá grupos de compra activos en tu categoría. Cada card muestra el producto, el proveedor, el precio mayorista meta, el progreso del grupo y la fecha límite. Cuando el porcentaje de llenado llega al 100%, el precio se confirma y todos los miembros acceden al costo de fábrica."
              illustration={
                <div className="max-w-xs mx-auto lg:max-w-sm">
                  <GroupCard group={DEMO_GROUP} />
                </div>
              }
            />

            {/* Step 2 */}
            <StepSection
              number="02"
              title="Pagá el total y asegurá tu lugar"
              description="Seleccioná la cantidad de unidades que necesitás y pagá el total al instante. Tu lugar queda reservado en el grupo. Si el grupo no alcanza el mínimo antes de que venza el tiempo, te devolvemos el 100% de tu dinero de forma automática e inmediata — sin trámites ni gestiones de tu parte."
              illustration={<JoinModalMockup />}
              reverse
            />

            {/* Step 3 */}
            <StepSection
              number="03"
              title="Recibí tu pedido al precio mayorista"
              description="Una vez que el grupo se completa, el proveedor se pone en contacto con cada participante para coordinar el envío o retiro directo. Recibís tu stock con precio de gran cadena, sin intermediarios ni costos ocultos. Si el grupo no alcanza el mínimo antes de la fecha límite, te devolvemos el 100% de tu pago de forma automática."
              illustration={<StatsIllustration />}
            />
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 lg:py-24">
          <div className="text-center mb-12">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink mb-3">
              Preguntas frecuentes
            </h2>
            <p className="font-body text-ink-muted text-base">
              Todo lo que necesitás saber antes de hacer tu primera compra grupal.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-ink-faint/20 shadow-sm px-6 sm:px-8 divide-y divide-transparent">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                isOpen={openFaq === i}
                onToggle={() => toggleFaq(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      {isSupplier ? (
        <CTASection
          title={
            <>
              ¿Tenés stock para{' '}
              <span className="text-brand-teal">ofrecer al por mayor</span>?
            </>
          }
          subtitle="Publicá tu grupo de compra y conectá con cientos de retailers que buscan tus productos."
          primaryLabel="Publicar Grupo"
          primaryHref="/proveedor/dashboard"
        />
      ) : (
        <CTASection
          title={
            <>
              ¿Listo para hacer tu{' '}
              <span className="text-brand-teal">primera compra grupal</span>?
            </>
          }
          subtitle="Unite a más de 1.200 retailers que ya acceden a precios mayoristas con MiniMax."
          primaryLabel="Explorar Grupos"
          primaryHref="/explorar"
          {...(!isBuyer && {
            secondaryLabel: 'Registrarme',
            onSecondaryClick: () => setAuthModalOpen(true),
          })}
        />
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab="register"
      />
    </div>
  );
}
