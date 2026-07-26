import { Link } from 'react-router-dom';
import { ROUTES } from '../../shared/config/routes';
import { Container } from '../../shared/ui/Container';
import { Logo } from '../../shared/ui/Logo';

interface FooterLinkItem {
  label: string;
  to: string;
}

const footerLinks: FooterLinkItem[] = [
  { label: 'Sobre mí', to: ROUTES.about },
  { label: 'Comunidad', to: ROUTES.community },
  { label: 'Mentoría', to: ROUTES.mentorship },
  { label: 'Preguntas', to: ROUTES.faq },
];

export function Footer() {
  return (
    <footer className="py-8 border-t border-line bg-bg">
      <Container className="flex flex-col md:flex-row items-center justify-between gap-5 text-[13px] text-muted">
        <Logo />
        <nav className="flex gap-6">
          {footerLinks.map((link) => (
            <Link key={link.label} to={link.to} className="hover:text-accent transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>
        <p>© {new Date().getFullYear()} Lorenzo Broker. Todos los derechos reservados.</p>
      </Container>
    </footer>
  );
}
