import { cn } from '../../../shared/lib/cn';
import { RENEWAL_MONTHS, monthsLabel } from '../model/useCheckoutOrder';

interface MonthsPickerProps {
  /** null si está elegido el plan anual. */
  months: number | null;
  onChangeMonths: (months: number) => void;
  onChooseAnnual: () => void;
  /** Ya formateados. */
  priceFor: (months: number) => string;
  annualPrice: string;
  annualNote: string;
}

const optionClass = (isOn: boolean) =>
  cn(
    'flex items-center gap-3 px-4 py-3.5 rounded-xl border cursor-pointer transition-colors',
    isOn ? 'border-accent bg-accent/5' : 'border-line hover:border-accent/40'
  );

export function MonthsPicker({ months: selected, onChangeMonths, onChooseAnnual, priceFor, annualPrice, annualNote }: MonthsPickerProps) {
  return (
    <div role="radiogroup" aria-label="Meses a pagar" className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {RENEWAL_MONTHS.map((months) => (
        <label key={months} className={optionClass(selected === months)}>
          <input
            type="radio"
            name="renewal-months"
            value={months}
            checked={selected === months}
            onChange={() => onChangeMonths(months)}
            className="w-4 h-4 accent-accent cursor-pointer shrink-0"
          />
          <span className="flex-1 min-w-0">
            <span className="block text-[14px] text-ink">{monthsLabel(months)}</span>
            <span className="block text-[12px] text-muted">{priceFor(months)}</span>
          </span>
        </label>
      ))}
      <label className={optionClass(selected === null)}>
        <input
          type="radio"
          name="renewal-months"
          value="anual"
          checked={selected === null}
          onChange={onChooseAnnual}
          className="w-4 h-4 accent-accent cursor-pointer shrink-0"
        />
        <span className="flex-1 min-w-0">
          <span className="block text-[14px] text-ink">1 año · {annualPrice}</span>
          <span className="block text-[12px] text-accent">{annualNote}</span>
        </span>
      </label>
    </div>
  );
}
