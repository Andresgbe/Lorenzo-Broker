import { useEffect, useState } from 'react';
import { fetchPaymentDetail, fetchPayments } from '../api/paymentApi';
import type { Payment, PaymentDetail } from './payments';

/** Todos los pagos, para el panel de admin. */
export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    fetchPayments()
      .then((rows) => {
        if (isCurrent) setPayments(rows);
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
  }, []);

  return { payments, isLoading, error };
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
