import { cn } from '../../../shared/lib/cn';
import { annualSavings, formatPrice } from '../model/plans';
import type { Plan } from '../model/types';

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

interface PlanCardProps {
  plan: Plan;
  selected: boolean;
  onSelect: () => void;
}

export function PlanCard({ plan, selected, onSelect }: PlanCardProps) {
  const savings = annualSavings(plan);

  return (
    <label
      className={cn(
        'relative rounded-[18px] border bg-panel p-7 flex flex-col gap-5 cursor-pointer transition-colors',
        selected ? 'border-accent shadow-[0_0_50px_rgba(0,176,154,0.1)]' : 'border-line hover:border-accent/40'
      )}
    >
      <input type="radio" name="plan" value={plan.id} checked={selected} onChange={onSelect} className="sr-only" />
      {savings > 0 && (
        <span className="absolute -top-3 right-5 rounded-full bg-accent px-3 py-1 text-[11.5px] font-bold text-ink-inverse">
          Ahorras {formatPrice(savings)}
        </span>
      )}
      <div>
        <h2 className="text-[15px] font-bold uppercase tracking-[1.6px] text-ink">{plan.name}</h2>
        <p className="text-muted text-[12.5px] mt-1">{plan.billingNote}</p>
      </div>

      <p className="font-display font-bold text-[48px] leading-none text-ink flex items-baseline gap-1">
        {formatPrice(plan.price)}
        <span className="font-body font-medium text-[17px] text-muted">{plan.period === 'year' ? '/año' : '/mes'}</span>
      </p>

      <ul className="flex flex-col gap-2.5">
        {plan.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2.5 text-[14px] text-muted">
            <CheckIcon className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
            {perk}
          </li>
        ))}
      </ul>
    </label>
  );
}
