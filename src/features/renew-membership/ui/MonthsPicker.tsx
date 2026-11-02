import { cn } from '../../../shared/lib/cn';
import { RENEWAL_MONTHS, monthsLabel } from '../model/useCheckoutOrder';

interface MonthsPickerProps {
  value: number;
  onChange: (months: number) => void;
  /** Ya formateado, para no depender del formato de precio de otro slice. */
  priceFor: (months: number) => string;
}

export function MonthsPicker({ value, onChange, priceFor }: MonthsPickerProps) {
  return (
    <div role="radiogroup" aria-label="Meses a pagar" className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {RENEWAL_MONTHS.map((months) => (
        <label
          key={months}
          className={cn(
            'flex items-center gap-3 px-4 py-3.5 rounded-xl border cursor-pointer transition-colors',
            value === months ? 'border-accent bg-accent/5' : 'border-line hover:border-accent/40'
          )}
        >
          <input
            type="radio"
            name="renewal-months"
            value={months}
            checked={value === months}
            onChange={() => onChange(months)}
            className="w-4 h-4 accent-accent cursor-pointer shrink-0"
          />
          <span className="flex-1 min-w-0">
            <span className="block text-[14px] text-ink">{monthsLabel(months)}</span>
            <span className="block text-[12px] text-muted">{priceFor(months)}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
