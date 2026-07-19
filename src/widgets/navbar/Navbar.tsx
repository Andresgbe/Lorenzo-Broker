import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES, HOME_SECTIONS } from '../../shared/config/routes';
import { Container } from '../../shared/ui/Container';
import { Logo } from '../../shared/ui/Logo';
import { SubscribeButton } from '../../features/subscribe-cta';

type NavLinkItem =
  | { kind: 'anchor'; label: string; id: string }
  | { kind: 'route'; label: string; to: string };

const navLinks: NavLinkItem[] = [
  { kind: 'route', label: 'Sobre mí', to: ROUTES.about },
  { kind: 'anchor', label: 'La comunidad', id: HOME_SECTIONS.community },
  { kind: 'route', label: 'Mentoría 1:1', to: ROUTES.mentorship },
  { kind: 'anchor', label: 'Preguntas', id: HOME_SECTIONS.faq },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-bg/85 backdrop-blur-md border-b border-line">
      <Container className="flex items-center justify-between h-[76px]">
        <Logo />

        <nav className="hidden md:flex items-center gap-9 text-[12.5px] font-semibold tracking-[1.4px] uppercase text-[#c6cedb]">
          {navLinks.map((link) =>
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

        <div className="flex items-center gap-3.5">
          <SubscribeButton />
          <button
            type="button"
            className="md:hidden text-ink text-2xl leading-none cursor-pointer"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </Container>

      {open && (
        <nav className="md:hidden absolute top-[76px] left-0 right-0 bg-bg-2 border-b border-line flex flex-col gap-5 p-6 text-sm font-semibold tracking-[1.4px] uppercase text-[#c6cedb]">
          {navLinks.map((link) =>
            link.kind === 'route' ? (
              <Link key={link.label} to={link.to} onClick={() => setOpen(false)} className="hover:text-accent transition-colors">
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={`/#${link.id}`}
                onClick={() => setOpen(false)}
                className="hover:text-accent transition-colors"
              >
                {link.label}
              </a>
            )
          )}
        </nav>
      )}
    </header>
  );
}
