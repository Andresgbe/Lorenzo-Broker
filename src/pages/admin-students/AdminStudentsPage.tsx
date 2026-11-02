import { useMemo, useState } from 'react';
import { STUDENT_STATUS_TONE, useStudents, type StudentStatus } from '../../entities/student';
import { formatDate } from '../../entities/membership';
import { Button } from '../../shared/ui/Button';
import { FormAlert } from '../../shared/ui/FormAlert';
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

const FILTERS = ['Todos', 'Activa', 'Por vencer', 'Vencida', 'Sin plan'] as const;
type Filter = (typeof FILTERS)[number];

// Cada filtro agrupa estados parecidos, para no llenar la barra de botones.
const FILTER_STATUSES: Record<Exclude<Filter, 'Todos'>, StudentStatus[]> = {
  Activa: ['Activa'],
  'Por vencer': ['Por vencer'],
  Vencida: ['En gracia', 'Vencida'],
  'Sin plan': ['Sin plan', 'Acceso quitado'],
};

const COLUMNS = ['Alumno', 'Cédula', 'Plan', 'Vence', 'Estado'];

export function AdminStudentsPage() {
  const { students, isLoading, error } = useStudents();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('Todos');

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return students.filter((student) => {
      const matchesFilter = filter === 'Todos' || FILTER_STATUSES[filter].includes(student.status);
      const matchesQuery =
        !needle ||
        student.name?.toLowerCase().includes(needle) ||
        student.email.toLowerCase().includes(needle) ||
        student.taxId?.toLowerCase().includes(needle);
      return matchesFilter && matchesQuery;
    });
  }, [students, query, filter]);

  return (
    <>
      <AdminPageHeading
        title="Alumnos"
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
        searchPlaceholder="Busca por nombre, correo o cédula"
        options={FILTERS}
        active={filter}
        onActiveChange={setFilter}
      />

      {error ? (
        <FormAlert variant="error">{error}</FormAlert>
      ) : isLoading ? (
        <p className="text-muted text-[14px]">Cargando alumnos…</p>
      ) : (
        <>
          <div className="bg-panel border border-line rounded-[18px] overflow-x-auto">
            <table className="w-full min-w-[720px] text-[13.5px]">
              <thead>
                <tr className="border-b border-line text-left">
                  {COLUMNS.map((column) => (
                    <th key={column} scope="col" className="px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-[1.8px] text-muted">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((student) => (
                  <tr key={student.id} className="border-b border-line last:border-b-0 hover:bg-bg-2/40 transition-colors">
                    <td className="px-5 py-3">
                      <span className={student.name ? 'block text-ink' : 'block text-muted italic'}>{student.name ?? 'Sin nombre'}</span>
                      <span className="block text-[12px] text-muted">{student.email}</span>
                    </td>
                    <td className="px-5 py-3 text-muted whitespace-nowrap">{student.taxId ?? '—'}</td>
                    <td className="px-5 py-3 text-muted">{student.planName ?? '—'}</td>
                    <td className="px-5 py-3 text-muted whitespace-nowrap">{student.expiresOn ? formatDate(student.expiresOn) : '—'}</td>
                    <td className="px-5 py-3">
                      <StatusPill tone={STUDENT_STATUS_TONE[student.status]}>{student.status}</StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rows.length === 0 && (
              <p className="px-5 py-8 text-[13.5px] text-muted text-center">
                {students.length === 0 ? 'Todavía no hay cuentas registradas.' : 'Ningún alumno coincide con la búsqueda.'}
              </p>
            )}
          </div>

          <p className="text-[12.5px] text-muted mt-4">
            {rows.length} de {students.length} alumnos
          </p>
        </>
      )}
    </>
  );
}
