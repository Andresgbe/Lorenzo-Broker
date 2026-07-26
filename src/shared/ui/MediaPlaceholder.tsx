import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface MediaPlaceholderProps {
  icon: ReactNode;
  label: string;
  className?: string;
}

export function MediaPlaceholder({ icon, label, className }: MediaPlaceholderProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 bg-panel-2 px-6 text-center', className)}>
      <span className="flex items-center justify-center w-16 h-16 rounded-full bg-accent shadow-[0_0_24px_rgba(37,233,138,0.35)]">
        {icon}
      </span>
      <span className="text-xs font-bold uppercase tracking-[1.4px] text-muted">{label}</span>
    </div>
  );
}
