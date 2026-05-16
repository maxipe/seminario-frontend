/**
 * SuppliersPage — landing orientada a mayoristas que quieren ofrecer productos en MiniMax.
 * Audiencia: proveedores/fabricantes B2B. Tono formal y orientado a beneficios concretos.
 * Estructura: Hero · Beneficios · Proceso (timeline) · Formulario de contacto.
 */

import { useState, type FormEvent } from 'react';
import Button from '../components/ui/Button';
import { usePageTitle } from '../hooks/usePageTitle';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  company: string;
  category: string;
  email: string;
  phone: string;
  volume: string;
  message: string;
}

interface FormErrors {
  company?: string;
  email?: string;
}

// ─── Benefit card ─────────────────────────────────────────────────────────────

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function BenefitCard({ icon, title, description }: BenefitCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-ink-faint/20 shadow-sm p-6 flex flex-col gap-4">
      <div className="w-12 h-12 rounded-xl bg-brand-teal/10 flex items-center justify-center text-brand-teal shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-display font-bold text-ink text-base mb-2">{title}</h3>
        <p className="font-body text-ink-muted text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ─── Timeline step ────────────────────────────────────────────────────────────

interface TimelineStepProps {
  number: number;
  title: string;
  description: string;
  isLast?: boolean;
}

function TimelineStep({ number, title, description, isLast = false }: TimelineStepProps) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center shrink-0">
          <span className="font-display font-extrabold text-brand-teal text-sm">{number}</span>
        </div>
        {!isLast && <div className="w-px flex-1 bg-brand-purple/20 mt-2" />}
      </div>
      <div className={`flex flex-col gap-1 ${isLast ? 'pb-0' : 'pb-8'}`}>
        <h4 className="font-display font-bold text-ink text-base">{title}</h4>
        <p className="font-body text-ink-muted text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ─── Contact form ─────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { label: 'Seleccioná una categoría', value: '' },
  { label: 'Alimentos', value: 'Alimentos' },
  { label: 'Bebidas', value: 'Bebidas' },
  { label: 'Electrónica', value: 'Electrónica' },
  { label: 'Hogar', value: 'Hogar' },
  { label: 'Indumentaria', value: 'Indumentaria' },
  { label: 'Cafetería', value: 'Cafetería' },
  { label: 'Otro', value: 'Otro' },
];

const VOLUME_OPTIONS = [
  { label: 'Volumen mínimo por pedido', value: '' },
  { label: 'Menos de 50 unidades', value: 'lt-50' },
  { label: '50-200 unidades', value: '50-200' },
  { label: '200-500 unidades', value: '200-500' },
  { label: 'Más de 500 unidades', value: 'gt-500' },
];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function ContactForm() {
  const [form, setForm] = useState<FormState>({
    company: '',
    category: '',
    email: '',
    phone: '',
    volume: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate(fields: FormState): FormErrors {
    const e: FormErrors = {};
    if (!fields.company.trim()) e.company = 'El nombre de la empresa es obligatorio.';
    if (!fields.email.trim()) e.email = 'El email es obligatorio.';
    else if (!isValidEmail(fields.email)) e.email = 'Ingresá un email válido.';
    return e;
  }

  function handleBlur(field: keyof FormState) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate({ ...form }));
  }

  function handleChange(field: keyof FormState, value: string) {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (touched[field]) setErrors(validate(updated));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const allTouched = Object.keys(form).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {} as Record<keyof FormState, boolean>,
    );
    setTouched(allTouched);
    const e2 = validate(form);
    setErrors(e2);
    if (Object.keys(e2).length > 0) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-5 py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-status-confirmed/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-status-confirmed" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-display font-bold text-ink text-xl">¡Recibimos tu consulta!</h3>
          <p className="font-body text-ink-muted text-sm">
            Te contactamos en menos de 48hs para coordinar los próximos pasos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Company name */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold font-display text-ink-muted uppercase tracking-wide">
          Nombre de la empresa <span className="text-status-cancelled">*</span>
        </label>
        <input
          type="text"
          value={form.company}
          onChange={(e) => handleChange('company', e.target.value)}
          onBlur={() => handleBlur('company')}
          placeholder="Ej: Distribuidora San Martín S.A."
          className={[
            'w-full rounded-xl border bg-white font-body text-sm text-ink placeholder:text-ink-muted',
            'py-2.5 px-4 outline-none transition-all duration-150 focus:ring-2 focus:ring-brand-teal/20',
            errors.company && touched.company
              ? 'border-status-cancelled focus:border-status-cancelled'
              : 'border-ink-faint/40 focus:border-brand-teal',
          ].join(' ')}
        />
        {errors.company && touched.company && (
          <p className="text-xs text-status-cancelled font-body">{errors.company}</p>
        )}
      </div>

      {/* Category */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold font-display text-ink-muted uppercase tracking-wide">
          Rubro / Categoría
        </label>
        <div className="relative">
          <select
            value={form.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full rounded-xl border border-ink-faint/40 bg-white font-body text-sm text-ink py-2.5 pl-4 pr-10 outline-none appearance-none transition-all duration-150 focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal cursor-pointer"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold font-display text-ink-muted uppercase tracking-wide">
          Email de contacto <span className="text-status-cancelled">*</span>
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="ventas@empresa.com"
          className={[
            'w-full rounded-xl border bg-white font-body text-sm text-ink placeholder:text-ink-muted',
            'py-2.5 px-4 outline-none transition-all duration-150 focus:ring-2 focus:ring-brand-teal/20',
            errors.email && touched.email
              ? 'border-status-cancelled focus:border-status-cancelled'
              : 'border-ink-faint/40 focus:border-brand-teal',
          ].join(' ')}
        />
        {errors.email && touched.email && (
          <p className="text-xs text-status-cancelled font-body">{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold font-display text-ink-muted uppercase tracking-wide">
          Teléfono{' '}
          <span className="text-ink-faint normal-case font-body">(opcional)</span>
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="+54 11 1234-5678"
          className="w-full rounded-xl border border-ink-faint/40 bg-white font-body text-sm text-ink placeholder:text-ink-muted py-2.5 px-4 outline-none transition-all duration-150 focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal"
        />
      </div>

      {/* Volume */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold font-display text-ink-muted uppercase tracking-wide">
          Volumen mínimo por pedido
        </label>
        <div className="relative">
          <select
            value={form.volume}
            onChange={(e) => handleChange('volume', e.target.value)}
            className="w-full rounded-xl border border-ink-faint/40 bg-white font-body text-sm text-ink py-2.5 pl-4 pr-10 outline-none appearance-none transition-all duration-150 focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal cursor-pointer"
          >
            {VOLUME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold font-display text-ink-muted uppercase tracking-wide">
          Descripción del producto{' '}
          <span className="text-ink-faint normal-case font-body">(opcional)</span>
        </label>
        <textarea
          value={form.message}
          onChange={(e) => handleChange('message', e.target.value)}
          rows={3}
          placeholder="Contanos brevemente qué productos ofrecés y en qué zonas operás..."
          className="w-full rounded-xl border border-ink-faint/40 bg-white font-body text-sm text-ink placeholder:text-ink-muted py-2.5 px-4 outline-none transition-all duration-150 focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal resize-none"
        />
      </div>

      <Button variant="primary" size="lg" fullWidth loading={loading} type="submit">
        Enviar Consulta
      </Button>
    </form>
  );
}

// ─── SuppliersPage ────────────────────────────────────────────────────────────

export default function SuppliersPage() {
  usePageTitle('Para Proveedores');

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-brand-purple relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-teal/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-brand-purple-light/30 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left */}
            <div className="flex-1 flex flex-col gap-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/20 border border-brand-teal/40 text-brand-teal text-xs font-display font-semibold tracking-widest uppercase self-center lg:self-start">
                Para Mayoristas y Fabricantes
              </span>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight">
                Vendé más,{' '}
                <span className="text-brand-teal">sin buscar clientes</span>{' '}
                uno por uno.
              </h1>
              <p className="font-body text-white/70 text-base leading-relaxed max-w-lg mx-auto lg:mx-0">
                Conectate con cientos de retailers pequeños que ya están buscando tus productos.
                MiniMax agrega la demanda, vos solo gestionás un pedido.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <a
                  href="#formulario"
                  className="inline-flex items-center justify-center gap-2 font-display font-semibold bg-brand-teal text-white hover:bg-brand-teal-dark transition-all duration-150 active:scale-95 px-7 py-3.5 text-base rounded-xl"
                >
                  Quiero ser proveedor
                </a>
              </div>
            </div>

            {/* Right — stat card */}
            <div className="flex-shrink-0 w-full max-w-xs lg:max-w-none lg:w-72">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-8 flex flex-col gap-2 text-center">
                <span className="font-display font-extrabold text-7xl text-brand-teal leading-none">
                  47
                </span>
                <p className="font-display font-semibold text-white text-base">
                  retailers por grupo
                </p>
                <p className="font-body text-white/60 text-sm">
                  Promedio de compradores en cada pedido grupal
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Beneficios ───────────────────────────────────────────────────── */}
      <section className="bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center mb-12">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink mb-3">
              ¿Por qué vender a través de MiniMax?
            </h2>
            <p className="font-body text-ink-muted text-base max-w-2xl mx-auto leading-relaxed">
              Dejá de gastar tiempo persiguiendo clientes individuales y empezá a gestionar pedidos
              consolidados con demanda ya validada.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BenefitCard
              title="Demanda Consolidada"
              description="Recibís un solo pedido ya validado con el volumen mínimo garantizado. Sin fragmentación, sin clientes que no cumplen."
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />
            <BenefitCard
              title="Cero Inversión en Marketing"
              description="Tu producto llega a nuestra red de +1.200 retailers activos sin que tengas que invertir en publicidad. Nosotros traemos la demanda."
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              }
            />
            <BenefitCard
              title="Pagos Garantizados"
              description="El pago completo al momento de unirse asegura compromiso real antes de confirmar la compra. Menos cancelaciones, más previsibilidad en tu flujo de caja."
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* ── Proceso ──────────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            {/* Left: text intro */}
            <div className="flex-1">
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink mb-4 leading-snug">
                Así funciona para{' '}
                <span className="text-brand-purple">proveedores</span>
              </h2>
              <p className="font-body text-ink-muted text-base leading-relaxed max-w-md">
                Un proceso simple de cuatro pasos. Vos publicás tu producto, nosotros nos encargamos
                de agregar la demanda y coordinar el proceso hasta la entrega.
              </p>
            </div>

            {/* Right: timeline */}
            <div className="flex-1 flex flex-col">
              <TimelineStep
                number={1}
                title="Publicás tu producto"
                description="Cargás el producto con precio mayorista, volumen mínimo y condiciones de entrega. Te damos acceso al panel de proveedor."
              />
              <TimelineStep
                number={2}
                title="MiniMax agrupa la demanda"
                description="Los retailers de nuestra red descubren tu producto y se van sumando al grupo. Hacemos toda la gestión de la comunidad."
              />
              <TimelineStep
                number={3}
                title="Te notificamos cuando se completa"
                description="Cuando el grupo alcanza el volumen mínimo, recibís una notificación con el detalle completo del pedido consolidado."
              />
              <TimelineStep
                number={4}
                title="Coordinás la entrega directamente"
                description="Te ponés en contacto con cada participante para coordinar envío o retiro. Un pedido, múltiples destinos, un solo proceso."
                isLast
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Formulario ───────────────────────────────────────────────────── */}
      <section id="formulario" className="bg-surface">
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 lg:py-24">
          <div className="text-center mb-8">
            <h2 className="font-display font-extrabold text-3xl text-ink mb-3">
              Empecemos a trabajar juntos
            </h2>
            <p className="font-body text-ink-muted text-base leading-relaxed">
              Completá el formulario y un especialista de MiniMax te contacta en menos de 48 horas
              para evaluar tu perfil como proveedor.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-ink-faint/20 shadow-sm p-6 sm:p-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
