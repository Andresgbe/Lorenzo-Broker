import { Link } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { cn } from '../lib/cn';
// Imagotipo oficial de Lorenzo Broker, versión negativa (blanca): el manual de marca
// no permite las versiones a color sobre fondos oscuros, ni separar o reacomodar
// símbolo y tipografía. Se usa completo, sin alterar.
import logoNegativo from '../assets/images/logo-lorenzo-broker-negativo.png';

interface LogoProps {
  className?: string;
  /** 'md' para cabeceras (48 px en teléfono, 62 px desde sm; cabe en la de 76 px); 'lg' para el pie. */
  size?: 'md' | 'lg';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  return (
    <Link to={ROUTES.home} className={cn('inline-flex items-center shrink-0', className)} aria-label="Lorenzo Broker — inicio">
      <img
        src={logoNegativo}
        alt="Lorenzo Broker"
        className={cn('w-auto object-contain', size === 'lg' ? 'h-[84px]' : 'h-[48px] sm:h-[62px]')}
      />
    </Link>
  );
}
