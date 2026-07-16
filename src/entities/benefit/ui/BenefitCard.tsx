import { cn } from '../../../shared/lib/cn';
import type { Benefit } from '../model/types';

interface BenefitCardProps {
  benefit: Benefit;
  className?: string;
}

export function BenefitCard({ benefit, className }: BenefitCardProps) {
  return (
    <div className={cn('rounded-xl border border-white/10 bg-neutral-900 p-6', className)}>
      <div className="mb-4 text-4xl">{benefit.icon}</div>
      <h3 className="mb-2 text-xl font-semibold text-white">{benefit.title}</h3>
      <p className="text-neutral-400 leading-relaxed">{benefit.description}</p>
    </div>
  );
}
