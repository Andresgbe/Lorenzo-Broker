import { useMemo, useState } from 'react';
import { DEMO_PAYMENTS, PAYMENT_STATUS_TONE, type Payment, type PaymentStatus } from '../../entities/payment';
import { MAIN_PLAN, formatPrice } from '../../entities/plan';
import { formatDate } from '../../entities/membership';
import { Button } from '../../shared/ui/Button';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';
import { MenuButton, type MenuItem } from '../../shared/ui/MenuButton';
import { StatusPill } from '../../shared/ui/StatusPill';
import { AdminFilters, AdminPageHeading } from '../../widgets/admin-shell';

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  );
}

const FILTERS = ['Todos', 'En verificación', 'Pagado', 'Rechazado'] as const;
type Filter = (typeof FILTERS)[number];

const COLUMNS = ['Fecha', 'Alumno', 'Plan', 'Monto', 'Método', 'Estado'];

export function AdminPaymentsPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('Todos');
  const [rejecting, setRejecting] = useState<Payment | null>(null);

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

  // Datos de ejemplo: las acciones todavía no escriben nada.
  function actionsFor(payment: Payment): MenuItem[] {
    if (payment.status !== 'En verificación') return [{ label: 'Ver detalle', onSelect: () => {} }];
    return [
      { label: 'Confirmar pago', onSelect: () => {} },
      { label: 'Ver detalle', onSelect: () => {} },
      { label: 'Rechazar pago', tone: 'danger', onSelect: () => setRejecting(payment) },
    ];
  }

  return (
    <>
      <AdminPageHeading
        title="Pagos"
        action={
          <Button variant="ghost" size="sm" disabled>
            <DownloadIcon className="w-4 h-4" />
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
                <th key={column} scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-[1.8px] text-muted">
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
              <tr key={payment.id} className="border-b border-line last:border-b-0 hover:bg-bg-2/40 transition-colors">
                <td className="px-5 py-3 text-muted whitespace-nowrap">{formatDate(payment.date)}</td>
                <td className="px-5 py-3">
                  <span className="block text-ink">{payment.studentName}</span>
                  <span className="block text-[12px] text-muted">{payment.studentTaxId}</span>
                </td>
                <td className="px-5 py-3 text-muted">{payment.planName}</td>
                <td className="px-5 py-3 text-ink whitespace-nowrap">{formatPrice(MAIN_PLAN.price)}</td>
                <td className="px-5 py-3 text-muted whitespace-nowrap">{payment.method}</td>
                <td className="px-5 py-3">
                  <StatusPill tone={PAYMENT_STATUS_TONE[payment.status]}>{payment.status}</StatusPill>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end">
                    <MenuButton label={`Acciones del pago de ${payment.studentName}`} items={actionsFor(payment)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && <p className="px-5 py-8 text-[13.5px] text-muted text-center">Ningún pago coincide con la búsqueda.</p>}
      </div>

      <p className="text-[12.5px] text-muted mt-4">
        {rows.length} de {DEMO_PAYMENTS.length} pagos
      </p>

      <ConfirmDialog
        open={rejecting !== null}
        title={`¿Rechazar el pago de ${rejecting?.studentName ?? ''}?`}
        description="El alumno no recibe acceso por este pago y se le avisa para que lo reintente. Solo rechaza si verificaste que el dinero no llegó."
        confirmLabel="Rechazar pago"
        onConfirm={() => setRejecting(null)}
        onCancel={() => setRejecting(null)}
      />
    </>
  );
}
