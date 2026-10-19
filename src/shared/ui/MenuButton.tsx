import { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/cn';

export interface MenuItem {
  label: string;
  onSelect: () => void;
  tone?: 'danger';
}

interface MenuButtonProps {
  /** Nombre accesible del botón "⋯": "Más acciones del curso". */
  label: string;
  items: MenuItem[];
  className?: string;
}

const MENU_WIDTH = 220;

/**
 * Botón "⋯" que abre un menú de acciones secundarias (las destructivas van aquí, en rojo).
 * El menú es position: fixed junto al botón, así no lo recorta una tabla con scroll.
 */
export function MenuButton({ label, items, className }: MenuButtonProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const open = position !== null;

  function toggle() {
    if (open) {
      setPosition(null);
      return;
    }
    const rect = buttonRef.current!.getBoundingClientRect();
    const left = Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8));
    setPosition({ top: rect.bottom + 8, left });
  }

  useEffect(() => {
    if (!open) return;
    function close() {
      setPosition(null);
    }
    function handlePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close();
    }
    document.addEventListener('pointerdown', handlePointer);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={cn('relative', className)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setPosition(null);
          buttonRef.current?.focus();
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-[10px] border bg-panel-2 text-ink transition-colors cursor-pointer',
          open ? 'border-accent' : 'border-line-strong hover:border-muted'
        )}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </button>

      {position && (
        <ul
          role="menu"
          style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
          className="fixed z-[90] p-1.5 bg-panel-2 border border-line-strong rounded-xl shadow-[0_30px_80px_rgba(0,0,0,0.45)] text-left"
        >
          {items.map((item, index) => (
            <li key={item.label} role="none">
              {item.tone === 'danger' && index > 0 && <span aria-hidden="true" className="block h-px bg-line mx-1.5 my-1" />}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setPosition(null);
                  item.onSelect();
                }}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-lg text-[13.5px] whitespace-nowrap transition-colors cursor-pointer hover:bg-white/5',
                  item.tone === 'danger' ? 'text-red-400' : 'text-ink'
                )}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
