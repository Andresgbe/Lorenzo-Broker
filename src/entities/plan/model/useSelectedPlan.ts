import { useSearchParams } from 'react-router-dom';
import { findPlan } from './plans';
import type { Plan } from './types';

/** Lee ?plan= de la URL. null si falta o no existe: la pantalla debe devolver al paso 1. */
export function useSelectedPlan(): Plan | null {
  const [searchParams] = useSearchParams();
  return findPlan(searchParams.get('plan'));
}
