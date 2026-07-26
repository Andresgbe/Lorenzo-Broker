import type { ChangeEvent } from 'react';
import { cn } from '../../../shared/lib/cn';
import type { Benefit } from '../model/types';

interface BenefitCardProps {
  benefit: Benefit;
  index: number;
  className?: string;
  editable?: boolean;
  onChange?: (patch: Partial<Benefit>) => void;
  onBlurSave?: () => void;
  onToggleBonus?: () => void;
  onRemove?: () => void;
}

function BinanceLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <g fill="#F0B90B">
        <rect x="12" y="0" width="8" height="8" transform="rotate(45 16 4)" />
        <rect x="0" y="12" width="8" height="8" transform="rotate(45 4 16)" />
        <rect x="24" y="12" width="8" height="8" transform="rotate(45 28 16)" />
        <rect x="12" y="24" width="8" height="8" transform="rotate(45 16 28)" />
        <rect x="13" y="13" width="6" height="6" transform="rotate(45 16 16)" />
      </g>
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function GripIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" fill="currentColor" className={className}>
      <circle cx="7" cy="4" r="1.4" />
      <circle cx="13" cy="4" r="1.4" />
      <circle cx="7" cy="10" r="1.4" />
      <circle cx="13" cy="10" r="1.4" />
      <circle cx="7" cy="16" r="1.4" />
      <circle cx="13" cy="16" r="1.4" />
    </svg>
  );
}

export function BenefitCard({ benefit, index, className, editable, onChange, onBlurSave, onToggleBonus, onRemove }: BenefitCardProps) {
  const { bonus } = benefit;

  return (
    <div
      className={cn(
        'relative rounded-[18px] border pt-11 pb-8 px-7 transition-transform duration-200 hover:-translate-y-1',
        bonus
          ? 'border-gold/35 bg-[linear-gradient(180deg,rgba(242,182,54,0.10),var(--color-panel)_55%)] hover:border-gold/65'
          : 'border-line bg-panel hover:border-accent/40',
        className
      )}
    >
      <span
        className={cn(
          'absolute -top-4 left-6 w-[34px] h-[34px] rounded-[10px] flex items-center justify-center font-body font-bold text-base text-ink-inverse',
          bonus
            ? 'bg-gold shadow-[0_0_18px_rgba(242,182,54,0.45)]'
            : 'bg-accent shadow-[0_0_18px_rgba(37,233,138,0.5)]'
        )}
      >
        {index}
      </span>
      {benefit.logo === 'binance' && (
        <span className="absolute -top-4 right-6 w-[34px] h-[34px] rounded-[10px] bg-panel-2 border border-line flex items-center justify-center">
          <BinanceLogo className="w-5 h-5" />
        </span>
      )}

      {editable && (
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            data-drag-handle
            title="Arrastrar para reordenar"
            className="text-muted hover:text-ink cursor-grab active:cursor-grabbing -ml-1 p-1"
          >
            <GripIcon className="w-4 h-4" />
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleBonus}
              className={cn(
                'text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full border cursor-pointer transition-colors',
                bonus ? 'border-gold/50 text-gold' : 'border-line text-muted hover:text-ink'
              )}
            >
              {bonus ? 'Bonus' : 'Normal'}
            </button>
            <button
              type="button"
              onClick={onRemove}
              aria-label="Eliminar tarjeta"
              className="text-muted hover:text-red-400 transition-colors cursor-pointer"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {editable ? (
        <input
          value={benefit.title}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange?.({ title: e.target.value })}
          onBlur={onBlurSave}
          className={cn(
            'w-full bg-transparent outline-none border-b border-dashed border-line focus:border-accent text-[17.5px] font-bold leading-[1.35] mb-3',
            bonus && 'text-gold'
          )}
        />
      ) : (
        <h4 className={cn('text-[17.5px] font-bold leading-[1.35] mb-3', bonus && 'text-gold')}>{benefit.title}</h4>
      )}

      {editable ? (
        <textarea
          value={benefit.description}
          onChange={(e) => onChange?.({ description: e.target.value })}
          onBlur={onBlurSave}
          rows={3}
          className="w-full bg-transparent outline-none resize-none text-muted text-[14.5px] border border-dashed border-line focus:border-accent rounded-lg p-2 -mx-2"
        />
      ) : (
        <p className="text-muted text-[14.5px]">{benefit.description}</p>
      )}
    </div>
  );
}
