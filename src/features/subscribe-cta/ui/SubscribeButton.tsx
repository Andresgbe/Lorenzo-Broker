import { Button } from '../../../shared/ui/Button';
import { telegramBotLink } from '../../../shared/config/telegram';

interface SubscribeButtonProps {
  label?: string;
  className?: string;
}

/** Abre el bot de Telegram, que es quien cobra, en una pestaña nueva. */
export function SubscribeButton({ label = "Suscríbete ahora", className }: SubscribeButtonProps) {
  return (
    <Button href={telegramBotLink()} variant="primary" className={className}>
      {label}
    </Button>
  );
}
