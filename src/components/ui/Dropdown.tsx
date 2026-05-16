/**
 * Dropdown accesible que se cierra al hacer click fuera o presionar Escape.
 * No depende de librerías externas — usa useRef + useEffect para detectar clicks externos.
 */

import { useRef, useEffect, useState, type ReactNode } from 'react';

interface DropdownProps {
  /** Elemento que dispara la apertura del menú (ej: avatar + nombre) */
  trigger: ReactNode;
  /** Items del menú */
  children: ReactNode;
  /** Alineación del panel respecto al trigger. Default: 'right' */
  align?: 'left' | 'right';
}

/**
 * Contenedor de dropdown con apertura/cierre accesible.
 * @param trigger - nodo que actúa como botón de apertura
 * @param children - contenido del panel desplegable
 * @param align - alineación horizontal del panel
 */
export default function Dropdown({ trigger, children, align = 'right' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity rounded-lg"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {trigger}
      </button>

      {open && (
        <div
          className={`absolute top-full mt-2 z-50 min-w-44 bg-surface-card border border-ink-faint/30 rounded-xl shadow-lg py-1 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          role="menu"
        >
          {children}
        </div>
      )}
    </div>
  );
}

/** Item de menú estilizado para usar dentro de Dropdown */
export function DropdownItem({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="w-full text-left px-4 py-2.5 text-sm font-body text-ink hover:bg-surface hover:text-brand-purple transition-colors"
    >
      {children}
    </button>
  );
}

/** Divider visual para separar grupos de items en el Dropdown */
export function DropdownDivider() {
  return <hr className="my-1 border-ink-faint/30" />;
}
