import { DEMO_EXPIRED_MEMBERSHIP, formatDate } from '../../entities/membership';
import { ROUTES } from '../../shared/config/routes';
import { Button } from '../../shared/ui/Button';
import { Container } from '../../shared/ui/Container';

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className={className}>
      <path d="M12 2a4 4 0 0 0-4 4v3H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a4 4 0 0 0-4-4Zm-2 7V6a2 2 0 1 1 4 0v3Z" />
    </svg>
  );
}

export function StudentExpiredPage() {
  return (
    <Container className="py-16 md:py-24 flex justify-center">
      <div className="w-full max-w-[460px] bg-panel border border-line rounded-[20px] px-7 py-10 flex flex-col items-center text-center shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <span className="flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 border border-gold/30">
          <LockIcon className="w-7 h-7 fill-gold" />
        </span>

        <h1 className="font-display font-bold text-[26px] text-ink mt-6">Tu membresía venció</h1>
        <p className="text-muted text-[14.5px] leading-relaxed mt-3 text-pretty">
          Venció el {formatDate(DEMO_EXPIRED_MEMBERSHIP.expiresOn)}. Renueva para volver a entrar a las clases y a
          la comunidad — tu progreso y tus módulos siguen guardados.
        </p>

        <Button to={ROUTES.checkoutPlan} variant="primary" className="w-full mt-7">
          Renovar membresía
        </Button>
      </div>
    </Container>
  );
}
