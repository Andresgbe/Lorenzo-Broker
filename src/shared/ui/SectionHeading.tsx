import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/cn';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}

export function SectionHeading({ eyebrow, title, subtitle, className }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className={cn('text-center', className)}
    >
      {eyebrow && (
        <span className="block text-xs font-bold uppercase tracking-[3px] text-accent mb-4">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display font-bold text-[clamp(32px,4.6vw,46px)] leading-[1.15] text-ink">
        {title}
      </h2>
      <div className="w-[120px] h-1 bg-accent rounded-full mx-auto mt-6 shadow-[0_0_18px_rgba(37,233,138,0.6)]" />
      {subtitle && (
        <p className="text-muted max-w-xl mx-auto mt-5 text-[16.5px]">{subtitle}</p>
      )}
    </motion.div>
  );
}
