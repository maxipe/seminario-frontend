/**
 * Modal de autenticación con dos tabs: "Iniciar Sesión" y "Registrarse".
 * Registro incluye selector de rol (Comprador / Proveedor) con cards interactivas.
 * Maneja validaciones por campo (en blur y submit) sin librerías externas.
 */

import { useState, type FormEvent } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import type { UserRole } from '../../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

type Tab = 'login' | 'register';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Field input with error message ───────────────────────────────────────────

interface FieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error?: string;
  placeholder?: string;
  rightAddon?: React.ReactNode;
}

function Field({ label, type = 'text', value, onChange, onBlur, error, placeholder, rightAddon }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold font-display text-ink-muted uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className={[
            'w-full rounded-xl border bg-white font-body text-sm text-ink placeholder:text-ink-muted',
            'py-2.5 pl-4 pr-10 outline-none transition-all duration-150',
            'focus:ring-2 focus:ring-brand-teal/20',
            error
              ? 'border-status-cancelled focus:border-status-cancelled'
              : 'border-ink-faint/40 focus:border-brand-teal',
          ].join(' ')}
        />
        {rightAddon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightAddon}</span>
        )}
      </div>
      {error && <p className="text-xs text-status-cancelled font-body">{error}</p>}
    </div>
  );
}

// ─── Eye toggle button ─────────────────────────────────────────────────────────

function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-ink-muted hover:text-ink transition-colors"
      aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    >
      {show ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );
}

// ─── Role selector cards ───────────────────────────────────────────────────────

interface RoleCardProps {
  role: UserRole;
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function RoleCard({ selected, onSelect, icon, title, description }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 text-center',
        selected
          ? 'border-brand-purple bg-brand-purple/5'
          : 'border-ink-faint/40 bg-white hover:border-brand-purple/40',
      ].join(' ')}
    >
      <span className={selected ? 'text-brand-purple' : 'text-ink-muted'}>{icon}</span>
      <span className={`font-display font-semibold text-sm ${selected ? 'text-brand-purple' : 'text-ink'}`}>
        {title}
      </span>
      <span className="font-body text-xs text-ink-muted leading-snug">{description}</span>
    </button>
  );
}

// ─── Login tab ─────────────────────────────────────────────────────────────────

function LoginForm({ onSuccess, onSwitchTab }: { onSuccess: () => void; onSwitchTab: () => void }) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function validateEmail(): string | undefined {
    if (!email) return 'El email es requerido.';
    if (!isValidEmail(email)) return 'El email no tiene un formato válido.';
  }

  function validatePassword(): string | undefined {
    if (!password) return 'La contraseña es requerida.';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const emailErr = validateEmail();
    const passwordErr = validatePassword();
    setErrors({ email: emailErr, password: passwordErr });
    if (emailErr || passwordErr) return;

    setLoading(true);
    setServerError('');
    try {
      await login({ email, password });
      onSuccess();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Ocurrió un error. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Field
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        onBlur={() => setErrors((prev) => ({ ...prev, email: validateEmail() }))}
        error={errors.email}
        placeholder="tucorreo@ejemplo.com"
      />
      <Field
        label="Contraseña"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={setPassword}
        onBlur={() => setErrors((prev) => ({ ...prev, password: validatePassword() }))}
        error={errors.password}
        placeholder="Mínimo 6 caracteres"
        rightAddon={<EyeToggle show={showPassword} onToggle={() => setShowPassword((s) => !s)} />}
      />

      {serverError && (
        <p className="text-sm text-status-cancelled font-body bg-status-cancelled/10 rounded-xl px-4 py-2.5">
          {serverError}
        </p>
      )}

      <Button type="submit" variant="primary" size="md" fullWidth loading={loading}>
        Iniciar Sesión
      </Button>

      <p className="text-center text-sm font-body text-ink-muted">
        ¿No tenés cuenta?{' '}
        <button
          type="button"
          onClick={onSwitchTab}
          className="text-brand-teal font-semibold hover:underline"
        >
          Registrate
        </button>
      </p>
    </form>
  );
}

// ─── Register tab ──────────────────────────────────────────────────────────────

function RegisterForm({ onSuccess, onSwitchTab }: { onSuccess: () => void; onSwitchTab: () => void }) {
  const { register } = useAuth();

  const [role, setRole] = useState<UserRole>('buyer');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    companyName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function validateName(): string | undefined {
    if (!name.trim()) return 'El nombre es requerido.';
  }

  function validateCompanyName(): string | undefined {
    if (role === 'supplier' && !companyName.trim()) return 'El nombre de tu empresa es requerido.';
  }

  function validateEmail(): string | undefined {
    if (!email) return 'El email es requerido.';
    if (!isValidEmail(email)) return 'El email no tiene un formato válido.';
  }

  function validatePassword(): string | undefined {
    if (!password) return 'La contraseña es requerida.';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
  }

  function validateConfirmPassword(): string | undefined {
    if (!confirmPassword) return 'Confirmá tu contraseña.';
    if (confirmPassword !== password) return 'Las contraseñas no coinciden.';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nameErr = validateName();
    const companyNameErr = validateCompanyName();
    const emailErr = validateEmail();
    const passwordErr = validatePassword();
    const confirmErr = validateConfirmPassword();
    setErrors({ name: nameErr, companyName: companyNameErr, email: emailErr, password: passwordErr, confirmPassword: confirmErr });
    if (nameErr || companyNameErr || emailErr || passwordErr || confirmErr) return;

    setLoading(true);
    setServerError('');
    try {
      await register({
        name,
        email,
        password,
        role,
        storeName: role === 'buyer' ? (storeName || undefined) : undefined,
        companyName: role === 'supplier' ? companyName : undefined,
      });
      onSuccess();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Ocurrió un error. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  const eyeToggle = <EyeToggle show={showPassword} onToggle={() => setShowPassword((s) => !s)} />;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {/* Role selector */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold font-display text-ink-muted uppercase tracking-wide">
          Tipo de cuenta
        </span>
        <div className="flex gap-3">
          <RoleCard
            role="buyer"
            selected={role === 'buyer'}
            onSelect={() => setRole('buyer')}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
            title="Comprador"
            description="Quiero unirme a grupos y comprar al por mayor"
          />
          <RoleCard
            role="supplier"
            selected={role === 'supplier'}
            onSelect={() => setRole('supplier')}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            title="Proveedor"
            description="Quiero publicar productos y vender en grupos"
          />
        </div>
      </div>

      <Field
        label="Nombre completo"
        value={name}
        onChange={setName}
        onBlur={() => setErrors((prev) => ({ ...prev, name: validateName() }))}
        error={errors.name}
        placeholder="Tu nombre y apellido"
      />

      {role === 'buyer' && (
        <Field
          label="Nombre de tu tienda (opcional)"
          value={storeName}
          onChange={setStoreName}
          onBlur={() => {}}
          placeholder="Ej: TecnoMundo Retail"
        />
      )}

      {role === 'supplier' && (
        <Field
          label="Nombre de tu empresa"
          value={companyName}
          onChange={setCompanyName}
          onBlur={() => setErrors((prev) => ({ ...prev, companyName: validateCompanyName() }))}
          error={errors.companyName}
          placeholder="Ej: Finca Dorada S.A."
        />
      )}

      <Field
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        onBlur={() => setErrors((prev) => ({ ...prev, email: validateEmail() }))}
        error={errors.email}
        placeholder="tucorreo@ejemplo.com"
      />
      <Field
        label="Contraseña"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={setPassword}
        onBlur={() => setErrors((prev) => ({ ...prev, password: validatePassword() }))}
        error={errors.password}
        placeholder="Mínimo 6 caracteres"
        rightAddon={eyeToggle}
      />
      <Field
        label="Confirmar contraseña"
        type={showPassword ? 'text' : 'password'}
        value={confirmPassword}
        onChange={setConfirmPassword}
        onBlur={() => setErrors((prev) => ({ ...prev, confirmPassword: validateConfirmPassword() }))}
        error={errors.confirmPassword}
        placeholder="Repetí tu contraseña"
      />

      {serverError && (
        <p className="text-sm text-status-cancelled font-body bg-status-cancelled/10 rounded-xl px-4 py-2.5">
          {serverError}
        </p>
      )}

      <Button type="submit" variant="primary" size="md" fullWidth loading={loading}>
        Crear Cuenta
      </Button>

      <p className="text-center text-sm font-body text-ink-muted">
        ¿Ya tenés cuenta?{' '}
        <button
          type="button"
          onClick={onSwitchTab}
          className="text-brand-teal font-semibold hover:underline"
        >
          Iniciá sesión
        </button>
      </p>
    </form>
  );
}

// ─── AuthModal ─────────────────────────────────────────────────────────────────

export default function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  function handleClose() {
    onClose();
  }

  const tabLabel: Record<Tab, string> = {
    login: 'Iniciar Sesión',
    register: 'Registrarse',
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Accedé a tu cuenta" size="sm">
      {/* Tab switcher */}
      <div className="flex rounded-xl bg-surface p-1 mb-5">
        {(['login', 'register'] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={[
              'flex-1 py-2 text-sm font-display font-semibold rounded-lg transition-all duration-150',
              activeTab === tab
                ? 'bg-white shadow text-brand-purple'
                : 'text-ink-muted hover:text-ink',
            ].join(' ')}
          >
            {tabLabel[tab]}
          </button>
        ))}
      </div>

      {activeTab === 'login' ? (
        <LoginForm key="login" onSuccess={handleClose} onSwitchTab={() => setActiveTab('register')} />
      ) : (
        <RegisterForm key="register" onSuccess={handleClose} onSwitchTab={() => setActiveTab('login')} />
      )}
    </Modal>
  );
}
