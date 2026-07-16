import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn('mx-auto max-w-6xl px-4', className)}>
      {children}
    </div>
  );
}
