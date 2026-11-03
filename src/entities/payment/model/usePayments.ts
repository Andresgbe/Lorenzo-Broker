import { useCallback, useEffect, useState } from 'react';
import { fetchPaymentDetail, fetchPayments } from '../api/paymentApi';
import type { Payment, PaymentDetail } from './payments';

/** Los pagos: todos para el panel de admin, o solo los de userId si se pasa. */
export function usePayments(userId?: string) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    fetchPayments(userId)
      .then((rows) => {
        if (isCurrent) {
          setPayments(rows);
          setError(null);
        }
      })
      .catch(() => {
        if (isCurrent) setError('No pudimos cargar los pagos. Intenta de nuevo en un momento.');
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [userId, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  return { payments, isLoading, error, reload };
}

interface LoadedDetail {
  id: string;
  payment: PaymentDetail | null;
  failed: boolean;
}

/** Un pago para su página de detalle. */
export function usePaymentDetail(id: string | undefined) {
  const [loaded, setLoaded] = useState<LoadedDetail | null>(null);

  useEffect(() => {
    if (!id) return;
    let isCurrent = true;
    fetchPaymentDetail(id)
      .then((payment) => {
        if (isCurrent) setLoaded({ id, payment, failed: false });
      })
      .catch(() => {
        if (isCurrent) setLoaded({ id, payment: null, failed: true });
      });
    return () => {
      isCurrent = false;
    };
  }, [id]);

  const current = id && loaded?.id === id ? loaded : null;
  return {
    payment: current?.payment ?? null,
    failed: current?.failed ?? false,
    isLoading: Boolean(id) && current === null,
  };
}
