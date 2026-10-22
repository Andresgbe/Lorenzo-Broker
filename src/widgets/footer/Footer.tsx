import { Link } from 'react-router-dom';
import { ROUTES } from '../../shared/config/routes';
import { EXTERNAL_LINKS } from '../../shared/config/external-links';
import { Container } from '../../shared/ui/Container';
import { Logo } from '../../shared/ui/Logo';
import { SubscribeButton } from '../../features/subscribe-cta';

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
  { label: 'Mentoría 1:1', to: ROUTES.mentorship },
  { label: 'Preguntas frecuentes', to: ROUTES.faq },
  { label: 'Contacto', to: ROUTES.contact },
];

const eyebrowClasses = 'text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent';
const columnLinkClasses = 'text-sm text-muted hover:text-accent transition-colors';

export function Footer() {
  return (
    <footer className="pt-14 pb-8 border-t border-line bg-bg">
      <Container className="flex flex-col gap-11">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-14">
          <div className="flex flex-col items-start gap-[18px]">
            <Logo size="lg" />
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
            <span className={eyebrowClasses}>Síguenos</span>
            <div className="flex flex-col items-start gap-[11px]">
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
            <p className="max-w-[800px] text-xs leading-[1.65] text-faint text-pretty">
              <span className="text-muted font-semibold">Aviso de riesgo.</span> Contenido exclusivamente
              educativo; no constituye asesoría financiera ni recomendación de inversión. Operar en los
              mercados implica un riesgo elevado de pérdida de capital y los resultados pasados no garantizan
              resultados futuros.
            </p>
            <p className="text-[12.5px] text-faint md:whitespace-nowrap">
              © {new Date().getFullYear()} Lorenzo Broker
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
