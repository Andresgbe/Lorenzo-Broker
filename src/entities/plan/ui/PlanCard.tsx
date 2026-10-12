import { cn } from '../../../shared/lib/cn';
import { PRICE_PLACEHOLDER } from '../model/plans';
import type { Plan } from '../model/types';

interface PlanCardProps {
  plan: Plan;
  selected: boolean;
  onSelect: (plan: Plan) => void;
}

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

export function PlanCard({ plan, selected, onSelect }: PlanCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(plan)}
      aria-pressed={selected}
      className={cn(
        'relative text-left rounded-[18px] border p-6 h-full flex flex-col gap-4 cursor-pointer transition-all',
        'focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
        selected
          ? 'border-accent bg-panel shadow-[0_0_50px_rgba(37,233,138,0.12)]'
          : 'border-line bg-panel hover:border-accent/40'
      )}
    >
      {plan.badge && (
        <span
          className={cn(
            'absolute -top-2.5 left-6 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[1.6px]',
            selected ? 'bg-accent text-ink-inverse' : 'bg-panel-2 text-muted border border-line'
          )}
        >
          {plan.badge}
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold uppercase tracking-[1.6px] text-ink">{plan.name}</h3>
          <p className="text-muted text-[12.5px] mt-1">{plan.billingNote}</p>
        </div>
        <span
          className={cn(
            'mt-0.5 w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0',
            selected ? 'border-accent bg-accent' : 'border-line'
          )}
        >
          {selected && <CheckIcon className="w-3 h-3 text-ink-inverse" />}
        </span>
      </div>

      <p className="font-display font-extrabold text-[34px] leading-none text-ink">
        ${PRICE_PLACEHOLDER}
      </p>

      <ul className="flex flex-col gap-2 mt-auto">
        {plan.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2 text-[13.5px] text-muted">
            <CheckIcon className="w-3.5 h-3.5 mt-1 shrink-0 text-accent" />
            {perk}
          </li>
        ))}
      </ul>
    </button>
  );
}
