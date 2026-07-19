import { Link } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { cn } from '../lib/cn';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link to={ROUTES.home} className={cn('flex items-center gap-3', className)} aria-label="Lorenzo Broker — inicio">
      <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className="w-8 h-8 shrink-0">
        <rect x="4" y="24" width="6" height="12" rx="1.5" fill="#25e98a" opacity=".55" />
        <rect x="13" y="18" width="6" height="18" rx="1.5" fill="#25e98a" opacity=".75" />
        <rect x="22" y="12" width="6" height="24" rx="1.5" fill="#25e98a" />
        <path d="M6 14 L28 4 M28 4 L21 5.5 M28 4 L27.5 11" stroke="#25e98a" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span className="leading-none">
        <span className="block font-display font-bold text-[22px] tracking-[0.2px] text-ink">Lorenzo</span>
        <span className="block text-[9px] tracking-[4px] text-muted font-semibold mt-[3px]">BROKER</span>
      </span>
    </Link>
  );
}
