import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface FormAlertProps {
  variant: 'error' | 'success';
  children: ReactNode;
}

const VARIANTS = {
  error: 'bg-red-500/10 border-red-500/30 text-red-300',
  success: 'bg-accent/10 border-accent/30 text-accent',
} as const;

export function FormAlert({ variant, children }: FormAlertProps) {
  return (
    <p
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn('border rounded-[10px] px-3.5 py-3 text-[13.5px] leading-snug', VARIANTS[variant])}
    >
      {children}
    </p>
  );
}
