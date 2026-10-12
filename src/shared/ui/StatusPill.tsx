import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

const TONES: Record<StatusTone, string> = {
  success: 'bg-accent/10 text-accent border-accent/30',
  warning: 'bg-gold/10 text-gold border-gold/30',
  danger: 'bg-red-500/10 text-red-400 border-red-500/30',
  neutral: 'bg-panel-2 text-muted border-line',
};

export function StatusPill({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap border rounded-full px-2.5 py-1 text-[11.5px] font-semibold',
        TONES[tone]
      )}
    >
      {children}
    </span>
  );
}
