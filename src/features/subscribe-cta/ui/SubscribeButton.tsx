import { Button } from '../../../shared/ui/Button';
import { ROUTES } from '../../../shared/config/routes';

interface SubscribeButtonProps {
  label?: string;
  className?: string;
  /** Abre el checkout con este plan ya elegido. */
  planId?: string;
}

export function SubscribeButton({ label = "Suscríbete ahora", className, planId }: SubscribeButtonProps) {
  return (
    <Button to={planId ? `${ROUTES.checkoutPlan}?plan=${planId}` : ROUTES.checkoutPlan} variant="primary" className={className}>
      {label}
    </Button>
  );
}
