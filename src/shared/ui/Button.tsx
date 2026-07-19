import type { ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../lib/cn';

type BaseProps = {
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  className?: string;
};

type AsButtonProps = BaseProps & Omit<HTMLMotionProps<"button">, keyof BaseProps> & {
  to?: never;
  href?: never;
};

type AsAnchorProps = BaseProps & Omit<HTMLMotionProps<"a">, keyof BaseProps> & {
  href: string;
  to?: never;
};

type AsLinkProps = BaseProps & Omit<LinkProps, keyof BaseProps> & {
  to: string;
  href?: never;
};

type ButtonProps = AsButtonProps | AsAnchorProps | AsLinkProps;

// Type assertion to avoid ts errors with framer-motion wrapping react-router Link
const MotionLink = motion(Link as any) as any;

export function Button({
  children,
  variant = 'primary',
  className,
  ...props
}: ButtonProps) {
  const baseClasses = cn(
    'inline-flex items-center justify-center whitespace-nowrap cursor-pointer',
    'font-bold text-[13px] uppercase tracking-[1.2px] px-7 py-3.5 rounded-xl transition-all duration-150',
    variant === 'primary' &&
      'bg-accent text-ink-inverse shadow-[0_0_24px_rgba(37,233,138,0.35)] hover:shadow-[0_0_34px_rgba(37,233,138,0.5)]',
    variant === 'ghost' &&
      'bg-transparent text-ink border border-line shadow-none hover:border-accent hover:text-accent',
    className
  );

  const animationProps = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
  };

  if ('to' in props && props.to) {
    const { to, ...rest } = props;
    return (
      <MotionLink
        to={to}
        className={baseClasses}
        {...animationProps}
        {...(rest as any)}
      >
        {children}
      </MotionLink>
    );
  }

  if ('href' in props && props.href) {
    const { href, ...rest } = props;
    const isInPageAnchor = href.startsWith('#');
    return (
      <motion.a
        href={href}
        {...(!isInPageAnchor && { target: '_blank', rel: 'noopener noreferrer' })}
        className={baseClasses}
        {...animationProps}
        {...(rest as any)}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      className={baseClasses}
      {...animationProps}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
