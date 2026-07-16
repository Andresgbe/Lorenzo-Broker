import { Link } from 'react-router-dom';
import { ROUTES, HOME_SECTIONS } from '../../shared/config/routes';
import { Container } from '../../shared/ui/Container';
import { SubscribeButton } from '../../features/subscribe-cta';

type NavLinkItem = 
  | { kind: 'anchor'; label: string; id: string }
  | { kind: 'route'; label: string; to: string };

const navLinks: NavLinkItem[] = [
  { kind: 'anchor', label: 'Canal Privado', id: HOME_SECTIONS.community },
  { kind: 'anchor', label: 'Beneficios', id: HOME_SECTIONS.benefits },
  { kind: 'route', label: 'Sobre Mí', to: ROUTES.about },
  { kind: 'route', label: 'Mentoría Privada', to: ROUTES.mentorship },
];

export function Navbar() {
  return (
    <header className="py-4 border-b border-white/10 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
      <Container className="flex items-center justify-between">
        <Link to={ROUTES.home} className="font-bold text-xl tracking-wider text-white">
          MENU
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            if (link.kind === 'route') {
              return (
                <Link key={link.label} to={link.to} className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                  {link.label}
                </Link>
              );
            }
            return (
              <a key={link.label} href={`/#${link.id}`} className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                {link.label}
              </a>
            );
          })}
        </nav>
        <SubscribeButton />
      </Container>
    </header>
  );
}
