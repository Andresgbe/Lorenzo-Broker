import { Link } from 'react-router-dom';
import { ROUTES, HOME_SECTIONS } from '../../shared/config/routes';
import { Container } from '../../shared/ui/Container';
import { Logo } from '../../shared/ui/Logo';

type FooterLinkItem =
  | { kind: 'anchor'; label: string; id: string }
  | { kind: 'route'; label: string; to: string };

const footerLinks: FooterLinkItem[] = [
  { kind: 'route', label: 'Sobre mí', to: ROUTES.about },
  { kind: 'anchor', label: 'Comunidad', id: HOME_SECTIONS.community },
  { kind: 'route', label: 'Mentoría', to: ROUTES.mentorship },
  { kind: 'anchor', label: 'Preguntas', id: HOME_SECTIONS.faq },
];

export function Footer() {
  return (
    <footer className="py-8 border-t border-line bg-bg">
      <Container className="flex flex-col md:flex-row items-center justify-between gap-5 text-[13px] text-muted">
        <Logo />
        <nav className="flex gap-6">
          {footerLinks.map((link) =>
            link.kind === 'route' ? (
              <Link key={link.label} to={link.to} className="hover:text-accent transition-colors">
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={`/#${link.id}`} className="hover:text-accent transition-colors">
                {link.label}
              </a>
            )
          )}
        </nav>
        <p>© {new Date().getFullYear()} Lorenzo Broker. Todos los derechos reservados.</p>
      </Container>
    </footer>
  );
}
