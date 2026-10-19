import { useEffect, useState } from 'react';
import { supabase } from '../../../shared/lib/supabaseClient';

export interface PlanOption {
  id: string;
  name: string;
  kind: 'subscription' | 'one_time';
  isActive: boolean;
}

/** Planes guardados en Supabase (tabla plans), para asociarlos a cursos. */
export async function fetchPlanOptions(): Promise<PlanOption[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('plans').select('id, name, kind, is_active').order('position');
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    kind: row.kind as PlanOption['kind'],
    isActive: row.is_active as boolean,
  }));
}

export function usePlanOptions() {
  const [plans, setPlans] = useState<PlanOption[]>([]);
  useEffect(() => {
    fetchPlanOptions()
      .then(setPlans)
      .catch(() => setPlans([]));
  }, []);
  return plans;
}
