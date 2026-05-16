/** Input de texto estilizado con soporte para ícono izquierdo. Parte del design system. */

import type { ReactNode } from 'react';

interface InputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  icon?: ReactNode;
  className?: string;
  type?: string;
}

export default function Input({
  placeholder,
  value,
  onChange,
  icon,
  className = '',
  type = 'text',
}: InputProps) {
  return (
    <div className={`relative flex items-center ${className}`}>
      {icon && (
        <span className="absolute left-3 text-ink-muted pointer-events-none flex items-center">
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={[
          'w-full rounded-xl border border-ink-faint/40 bg-white font-body text-sm text-ink placeholder:text-ink-muted',
          'py-2.5 pr-4 outline-none transition-all duration-150',
          'focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20',
          icon ? 'pl-10' : 'pl-4',
        ].join(' ')}
      />
    </div>
  );
}
