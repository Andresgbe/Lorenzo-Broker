import { EXTERNAL_LINKS } from '../../shared/config/external-links';
import { Container } from '../../shared/ui/Container';

export function Footer() {
  return (
    <footer className="py-8 border-t border-white/10 bg-neutral-950">
      <Container className="flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-neutral-500">
          © {new Date().getFullYear()} Lorenzo Broker. Todos los derechos reservados.
        </p>
        <a 
          href={EXTERNAL_LINKS.instagram} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-neutral-400 hover:text-white transition-colors"
        >
          Instagram
        </a>
      </Container>
    </footer>
  );
}
