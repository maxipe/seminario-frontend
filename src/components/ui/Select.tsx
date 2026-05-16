/** Select nativo estilizado. Sin dependencias externas. Parte del design system. */

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function Select({
  options,
  value,
  onChange,
  placeholder,
  className = '',
}: SelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          'w-full appearance-none rounded-xl border border-ink-faint/40 bg-white font-body text-sm text-ink',
          'py-2.5 pl-4 pr-9 outline-none transition-all duration-150 cursor-pointer',
          'focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20',
          !value ? 'text-ink-muted' : '',
        ].join(' ')}
      >
        {placeholder && (
          <option value="" disabled={false}>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {/* Chevron */}
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>
    </div>
  );
}
