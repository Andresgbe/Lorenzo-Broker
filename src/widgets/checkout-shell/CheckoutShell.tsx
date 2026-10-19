import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Container } from '../../shared/ui/Container';
import { Logo } from '../../shared/ui/Logo';
import { cn } from '../../shared/lib/cn';

const STEPS = ['Plan', 'Pago', 'Listo'] as const;

interface CheckoutShellProps {
  /** 1-indexado, contra STEPS. */
  step: 1 | 2 | 3;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** 'wide' para la rejilla de planes, 'medium' para el resumen, 'narrow' para los estados. */
  width?: 'wide' | 'medium' | 'narrow';
  children: ReactNode;
}

export function CheckoutShell({
  step,
  eyebrow,
  title,
  subtitle,
  width = 'narrow',
  children,
}: CheckoutShellProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <header className="border-b border-line">
        <Container className="flex items-center justify-between gap-4 h-[76px]">
          <Logo />
          <ol className="hidden sm:flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[1.6px]">
            {STEPS.map((label, index) => {
              const position = index + 1;
              const isDone = position < step;
              const isCurrent = position === step;
              return (
                <li key={label} className="flex items-center gap-2.5">
                  {index > 0 && <span aria-hidden="true" className="w-5 h-px bg-line" />}
                  <span
                    aria-current={isCurrent ? 'step' : undefined}
                    className={cn(
                      isCurrent && 'text-accent',
                      isDone && 'text-muted',
                      !isCurrent && !isDone && 'text-[#49546a]'
                    )}
                  >
                    {position}. {label}
                  </span>
                </li>
              );
            })}
          </ol>
        </Container>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={cn(
            'w-full',
            width === 'wide' && 'max-w-[980px]',
            width === 'medium' && 'max-w-[760px]',
            width === 'narrow' && 'max-w-[560px]'
          )}
        >
          {eyebrow && (
            <span className="block text-center text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent mb-3">
              {eyebrow}
            </span>
          )}
          <h1 className="font-display font-bold text-[clamp(24px,3.4vw,32px)] leading-tight text-ink text-center text-balance">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted text-[14.5px] leading-relaxed text-center mt-2.5 max-w-[520px] mx-auto text-pretty">
              {subtitle}
            </p>
          )}

          <div className="mt-9">{children}</div>
        </motion.div>
      </main>
    </div>
  );
}
