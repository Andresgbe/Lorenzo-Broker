import { Button } from '../../../shared/ui/Button';
import { ROUTES } from '../../../shared/config/routes';

interface SubscribeButtonProps {
  label?: string;
  className?: string;
}

export function SubscribeButton({ label = "Suscríbete ahora", className }: SubscribeButtonProps) {
  return (
    <Button to={ROUTES.checkoutPlan} variant="primary" className={className}>
      {label}
    </Button>
  );
}
