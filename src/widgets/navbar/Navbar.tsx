import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../shared/config/routes';
import { Container } from '../../shared/ui/Container';
import { Logo } from '../../shared/ui/Logo';
import { SubscribeButton } from '../../features/subscribe-cta';

interface NavLinkItem {
  label: string;
  to: string;
}

const navLinks: NavLinkItem[] = [
  { label: 'Sobre mí', to: ROUTES.about },
  { label: 'La comunidad', to: ROUTES.community },
  { label: 'Preguntas', to: ROUTES.faq },
];

const mentorshipLink: NavLinkItem = { label: 'Mentoría 1:1', to: ROUTES.mentorship };

const navLinkClasses = 'hover:text-accent transition-colors text-[12.5px] font-semibold tracking-[1.4px] uppercase text-[#c6cedb]';

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-bg/85 backdrop-blur-md border-b border-line">
      <Container className="flex items-center justify-between h-[76px]">
        <Logo />

        <nav className="hidden md:flex items-center gap-9">
          {navLinks.map((link) => (
            <Link key={link.label} to={link.to} className={navLinkClasses}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Link to={mentorshipLink.to} className={`hidden md:inline ${navLinkClasses}`}>
            {mentorshipLink.label}
          </Link>
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
          {[...navLinks, mentorshipLink].map((link) => (
            <Link key={link.label} to={link.to} onClick={() => setOpen(false)} className="hover:text-accent transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
