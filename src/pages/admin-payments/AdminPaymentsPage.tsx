import { useMemo, useState } from 'react';
import { DEMO_PAYMENTS, PAYMENT_STATUS_TONE, type PaymentStatus } from '../../entities/payment';
import { MAIN_PLAN, formatPrice } from '../../entities/plan';
import { formatDate } from '../../entities/membership';
import { Button } from '../../shared/ui/Button';
import { StatusPill } from '../../shared/ui/StatusPill';
import { AdminFilters, AdminPageHeading } from '../../widgets/admin-shell';

const FILTERS = ['Todos', 'En verificación', 'Pagado', 'Rechazado'] as const;
type Filter = (typeof FILTERS)[number];

const COLUMNS = ['Fecha', 'Alumno', 'Plan', 'Monto', 'Método', 'Estado'];

export function AdminPaymentsPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('Todos');

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return DEMO_PAYMENTS.filter((payment) => {
      const matchesFilter = filter === 'Todos' || payment.status === (filter as PaymentStatus);
      const matchesQuery =
        !needle ||
        payment.studentName.toLowerCase().includes(needle) ||
        payment.studentTaxId.toLowerCase().includes(needle);
      return matchesFilter && matchesQuery;
    });
  }, [query, filter]);

  return (
    <>
      <AdminPageHeading
        title="Pagos"
        action={
          <Button variant="ghost" disabled>
            Exportar CSV
          </Button>
        }
      />

      <AdminFilters
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Busca por alumno o cédula"
        options={FILTERS}
        active={filter}
        onActiveChange={setFilter}
      />

      <div className="bg-panel border border-line rounded-[18px] overflow-x-auto">
        <table className="w-full min-w-[820px] text-[13.5px]">
          <thead>
            <tr className="border-b border-line text-left">
              {COLUMNS.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-[1.8px] text-muted"
                >
                  {column}
                </th>
              ))}
              <th scope="col" className="px-5 py-3.5">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((payment) => (
              <tr key={payment.id} className="border-b border-line last:border-b-0">
                <td className="px-5 py-3.5 text-muted whitespace-nowrap">{formatDate(payment.date)}</td>
                <td className="px-5 py-3.5">
                  <span className="block text-ink">{payment.studentName}</span>
                  <span className="block text-[12px] text-muted">{payment.studentTaxId}</span>
                </td>
                <td className="px-5 py-3.5 text-muted">{payment.planName}</td>
                <td className="px-5 py-3.5 text-ink whitespace-nowrap">{formatPrice(MAIN_PLAN.price)}</td>
                <td className="px-5 py-3.5 text-muted whitespace-nowrap">{payment.method}</td>
                <td className="px-5 py-3.5">
                  <StatusPill tone={PAYMENT_STATUS_TONE[payment.status]}>{payment.status}</StatusPill>
                </td>
                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                  {payment.status === 'En verificación' ? (
                    <span className="flex items-center justify-end gap-3">
                      <button type="button" className="text-[12.5px] text-accent hover:underline cursor-pointer">
                        Confirmar
                      </button>
                      <button type="button" className="text-[12.5px] text-red-400 hover:underline cursor-pointer">
                        Rechazar
                      </button>
                    </span>
                  ) : (
                    <button type="button" className="text-[12.5px] text-muted hover:text-accent cursor-pointer">
                      Ver detalle
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <p className="px-5 py-8 text-[13.5px] text-muted text-center">
            Ningún pago coincide con la búsqueda.
          </p>
        )}
      </div>

      <p className="text-[12.5px] text-muted mt-4">
        {rows.length} de {DEMO_PAYMENTS.length} pagos
      </p>
    </>
  );
}
