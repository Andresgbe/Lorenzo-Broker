import { Button } from '../../../shared/ui/Button';
import { EXTERNAL_LINKS } from '../../../shared/config/external-links';

interface SubscribeButtonProps {
  label?: string;
  className?: string;
}

export function SubscribeButton({ label = "Suscríbete ahora", className }: SubscribeButtonProps) {
  return (
    <Button href={EXTERNAL_LINKS.whopCheckout} variant="primary" className={className}>
      {label}
    </Button>
  );
}
