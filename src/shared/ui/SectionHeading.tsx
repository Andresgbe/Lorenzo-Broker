import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/cn';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'center' | 'left';
  className?: string;
}

export function SectionHeading({ eyebrow, title, subtitle, align = 'center', className }: SectionHeadingProps) {
  const isLeft = align === 'left';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className={cn(isLeft ? 'text-left' : 'text-center', className)}
    >
      {eyebrow && (
        <span className="block text-xs font-bold uppercase tracking-[3px] text-accent mb-4">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display font-bold text-[clamp(32px,4.6vw,46px)] leading-[1.15] text-ink text-balance">
        {title}
      </h2>
      <div
        className={cn(
          'w-[120px] h-1 bg-accent rounded-full mt-6 shadow-[0_0_18px_rgba(37,233,138,0.6)]',
          !isLeft && 'mx-auto'
        )}
      />
      {subtitle && (
        <p className={cn('text-muted mt-5 text-[16.5px] max-w-2xl', !isLeft && 'mx-auto')}>{subtitle}</p>
      )}
    </motion.div>
  );
}
