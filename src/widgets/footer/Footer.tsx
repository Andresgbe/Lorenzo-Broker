import { Link } from 'react-router-dom';
import { ROUTES } from '../../shared/config/routes';
import { EXTERNAL_LINKS } from '../../shared/config/external-links';
import { Container } from '../../shared/ui/Container';
import { Logo } from '../../shared/ui/Logo';
import { SubscribeButton } from '../../features/subscribe-cta';

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M18.9 5.6A16.6 16.6 0 0 0 14.8 4.3c-.2.4-.4.8-.5 1.1a15.4 15.4 0 0 0-4.6 0c-.1-.3-.3-.7-.5-1.1A16.6 16.6 0 0 0 5.1 5.6C2.5 9.5 1.8 13.3 2.1 17a16.7 16.7 0 0 0 5.1 2.6c.4-.6.8-1.2 1.1-1.8-.6-.2-1.2-.5-1.7-.8l.4-.3a11.9 11.9 0 0 0 10.2 0l.4.3c-.5.3-1.1.6-1.7.8.3.6.7 1.2 1.1 1.8a16.7 16.7 0 0 0 5.1-2.6c.4-4.3-.7-8.1-3.2-11.4ZM8.7 14.7c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const navLinks = [
  { label: 'Sobre mí', to: ROUTES.about },
  { label: 'La comunidad', to: ROUTES.community },
  { label: 'Mentoría 1:1', to: ROUTES.mentorship },
  { label: 'Preguntas frecuentes', to: ROUTES.faq },
];

const eyebrowClasses = 'text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent';
const columnLinkClasses = 'text-sm text-muted hover:text-accent transition-colors';

export function Footer() {
  return (
    <footer className="pt-14 pb-8 border-t border-line bg-bg">
      <Container className="flex flex-col gap-11">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-14">
          <div className="flex flex-col items-start gap-[18px]">
            <Logo />
            <p className="text-sm leading-relaxed text-muted max-w-[320px] text-pretty">
              Trading en vivo, señales swing con tesis completa y educación de bolsa en español — con un
              corredor real operando frente a ti.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <span className={eyebrowClasses}>Navegación</span>
            <div className="flex flex-col items-start gap-[11px]">
              {navLinks.map((link) => (
                <Link key={link.label} to={link.to} className={columnLinkClasses}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className={eyebrowClasses}>Comunidad</span>
            <div className="flex flex-col items-start gap-[11px]">
              <a
                href={EXTERNAL_LINKS.discordInvite}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2.5 ${columnLinkClasses}`}
              >
                <DiscordIcon className="w-[17px] h-[17px] fill-current shrink-0" />
                Discord
              </a>
              <a
                href={EXTERNAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2.5 ${columnLinkClasses}`}
              >
                <InstagramIcon className="w-4 h-4 shrink-0" />
                Instagram
              </a>
            </div>
          </div>

          <div className="flex flex-col items-start gap-4">
            <span className={eyebrowClasses}>Empieza</span>
            <p className="text-[13.5px] leading-relaxed text-muted">Un solo plan, todo incluido.</p>
            <SubscribeButton />
          </div>
        </div>

        <div className="flex flex-col gap-[22px]">
          <div className="h-px bg-line" />
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-14">
            <p className="max-w-[800px] text-xs leading-[1.65] text-[#6f7a8b] text-pretty">
              <span className="text-muted font-semibold">Aviso de riesgo.</span> Contenido exclusivamente
              educativo; no constituye asesoría financiera ni recomendación de inversión. Operar en los
              mercados implica un riesgo elevado de pérdida de capital y los resultados pasados no garantizan
              resultados futuros.
            </p>
            <p className="text-[12.5px] text-[#6f7a8b] md:whitespace-nowrap">
              © {new Date().getFullYear()} Lorenzo Broker
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
