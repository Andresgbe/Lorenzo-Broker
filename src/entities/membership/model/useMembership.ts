import { useEffect, useState } from 'react';
import { fetchMembership } from '../api/membershipApi';
import type { UserMembership } from './membership';

interface Loaded {
  userId: string;
  membership: UserMembership | null;
  failed: boolean;
}

/** La membresía real del usuario con sesión. Sin userId (visitante) no hay nada que cargar. */
export function useMembership(userId: string | undefined) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    if (!userId) return;
    let isCurrent = true;
    fetchMembership(userId)
      .then((membership) => {
        if (isCurrent) setLoaded({ userId, membership, failed: false });
      })
      .catch(() => {
        if (isCurrent) setLoaded({ userId, membership: null, failed: true });
      });
    return () => {
      isCurrent = false;
    };
  }, [userId]);

  const current = userId && loaded?.userId === userId ? loaded : null;
  return {
    membership: current?.membership ?? null,
    failed: current?.failed ?? false,
    isLoading: Boolean(userId) && current === null,
  };
}
