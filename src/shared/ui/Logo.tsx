import { Link } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { cn } from '../lib/cn';
import logoMark from '../assets/images/LorenzoBroker.png';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link to={ROUTES.home} className={cn('flex items-center gap-3', className)} aria-label="Lorenzo Broker — inicio">
      <img src={logoMark} alt="" aria-hidden="true" className="w-9 h-9 shrink-0 object-contain" />
      <span className="leading-none">
        <span className="block font-display font-bold text-[22px] tracking-[0.2px] text-ink">Lorenzo</span>
        <span className="block text-[9px] tracking-[4px] text-muted font-semibold mt-[3px]">BROKER</span>
      </span>
    </Link>
  );
}
