import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../shared/lib/cn';
import { Container } from '../../shared/ui/Container';
import { Logo } from '../../shared/ui/Logo';

interface AuthShellProps {
  title: string;
  subtitle: string;
  /** Enlace contextual arriba a la derecha, p. ej. "¿Ya tienes cuenta?". */
  headerAside?: ReactNode;
  children: ReactNode;
  /** Contenido bajo la tarjeta, fuera del formulario. */
  footer?: ReactNode;
  /** Encima de la tarjeta: el PageTopBar cuando se llega desde otra parte de la app. */
  topBar?: ReactNode;
  /** `wide` ensancha la tarjeta en computadora para formularios a dos columnas. */
  size?: 'default' | 'wide';
}

export function AuthShell({ title, subtitle, headerAside, children, footer, topBar, size = 'default' }: AuthShellProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <header className="border-b border-line">
        <Container className="flex items-center justify-between gap-4 h-[76px]">
          <Logo />
          {headerAside}
        </Container>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={cn('w-full', size === 'wide' ? 'max-w-[420px] md:max-w-[840px]' : 'max-w-[420px]')}
        >
          {topBar}
          <div className={cn('bg-panel border border-line rounded-[20px] px-6 sm:px-8 py-9 shadow-[0_30px_80px_rgba(0,0,0,0.45)]', size === 'wide' && 'md:px-12 md:py-11')}>
            <h1 className="font-display font-bold text-[26px] leading-tight text-ink text-center">{title}</h1>
            <p className="text-muted text-[14.5px] leading-relaxed text-center mt-2.5 text-pretty">{subtitle}</p>

            <div className="mt-7">{children}</div>
          </div>

          {footer && <div className="mt-5 text-center text-[13.5px]">{footer}</div>}
        </motion.div>
      </main>
    </div>
  );
}
