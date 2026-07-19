import { cn } from '../../../shared/lib/cn';
import type { Benefit } from '../model/types';

interface BenefitCardProps {
  benefit: Benefit;
  index: number;
  className?: string;
}

export function BenefitCard({ benefit, index, className }: BenefitCardProps) {
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
          'absolute -top-4 left-6 w-[34px] h-[34px] rounded-[10px] flex items-center justify-center font-display font-bold text-base text-ink-inverse',
          bonus
            ? 'bg-gold shadow-[0_0_18px_rgba(242,182,54,0.45)]'
            : 'bg-accent shadow-[0_0_18px_rgba(37,233,138,0.5)]'
        )}
      >
        {index}
      </span>
      <h4 className={cn('text-[17.5px] font-bold leading-[1.35] mb-3', bonus && 'text-gold')}>
        {benefit.title}
      </h4>
      <p className="text-muted text-[14.5px]">{benefit.description}</p>
    </div>
  );
}
