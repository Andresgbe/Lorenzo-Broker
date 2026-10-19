import { useCallback, useState } from 'react';
import { useSiteContentField } from './useSiteContentField';

// Local, editable copy of one site_content key for pages edited in place by
// the admin. Typing updates the draft; `commit` persists it (call on blur);
// `replace` sets and persists in one step (add/remove actions).
export function useSiteContentDraft<T extends object>(key: string, defaultValue: T) {
  const { value: stored, setValue: persist, isLoading } = useSiteContentField(key, defaultValue);
  const [draft, setDraft] = useState(defaultValue);

  // Adopt the stored value once it arrives. Merged over the defaults so a row
  // saved before a field existed still renders that field.
  const [wasLoading, setWasLoading] = useState(true);
  if (wasLoading && !isLoading) {
    setWasLoading(false);
    setDraft({ ...defaultValue, ...stored });
  }

  const update = useCallback((patch: Partial<T>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const commit = useCallback(() => {
    void persist(draft);
  }, [draft, persist]);

  const replace = useCallback(
    (next: T) => {
      setDraft(next);
      void persist(next);
    },
    [persist]
  );

  return { draft, update, commit, replace, isLoading };
}
