import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../shared/lib/supabaseClient';

const ROW_ID = 'site';

let cache: Record<string, unknown> | null = null;
let cachePromise: Promise<Record<string, unknown>> | null = null;

async function fetchContent(): Promise<Record<string, unknown>> {
  if (cache) return cache;
  if (!cachePromise) {
    cachePromise = (async () => {
      if (!supabase) return {};
      const { data, error } = await supabase.from('site_content').select('value').eq('id', ROW_ID).single();
      if (error || !data) return {};
      cache = (data.value as Record<string, unknown>) ?? {};
      return cache;
    })();
  }
  return cachePromise;
}

// Reads/writes one key inside the single site_content JSON blob. Multiple
// editable sections can each own their own key without stepping on each other.
export function useSiteContentField<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchContent().then((content) => {
      if (cancelled) return;
      const stored = content[key];
      if (stored !== undefined) setValue(stored as T);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const save = useCallback(
    async (next: T) => {
      setValue(next);
      if (!supabase) return;
      const content = await fetchContent();
      const merged = { ...content, [key]: next };
      cache = merged;
      const { error } = await supabase.from('site_content').update({ value: merged }).eq('id', ROW_ID);
      if (error) console.error('No se pudo guardar el contenido:', error.message);
    },
    [key]
  );

  return { value, setValue: save, isLoading };
}
