import { useMemo, useState } from 'react';
import { DEMO_STUDENTS, STUDENT_STATUS_TONE, type StudentStatus } from '../../entities/student';
import { formatDate } from '../../entities/membership';
import { Button } from '../../shared/ui/Button';
import { StatusPill } from '../../shared/ui/StatusPill';
import { AdminFilters, AdminPageHeading } from '../../widgets/admin-shell';

const FILTERS = ['Todos', 'Activa', 'Por vencer', 'Vencida'] as const;
type Filter = (typeof FILTERS)[number];

const COLUMNS = ['Alumno', 'Cédula', 'Plan', 'Vence', 'Estado'];

export function AdminStudentsPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('Todos');

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return DEMO_STUDENTS.filter((student) => {
      const matchesFilter = filter === 'Todos' || student.status === (filter as StudentStatus);
      const matchesQuery =
        !needle ||
        student.name.toLowerCase().includes(needle) ||
        student.email.toLowerCase().includes(needle) ||
        student.taxId.toLowerCase().includes(needle);
      return matchesFilter && matchesQuery;
    });
  }, [query, filter]);

  return (
    <>
      <AdminPageHeading
        title="Alumnos"
        action={
          <Button variant="ghost" disabled>
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

      <div className="bg-panel border border-line rounded-[18px] overflow-x-auto">
        <table className="w-full min-w-[720px] text-[13.5px]">
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
            {rows.map((student) => (
              <tr key={student.id} className="border-b border-line last:border-b-0">
                <td className="px-5 py-3.5">
                  <span className="block text-ink">{student.name}</span>
                  <span className="block text-[12px] text-muted">{student.email}</span>
                </td>
                <td className="px-5 py-3.5 text-muted whitespace-nowrap">{student.taxId}</td>
                <td className="px-5 py-3.5 text-muted">{student.planName}</td>
                <td className="px-5 py-3.5 text-muted whitespace-nowrap">{formatDate(student.expiresOn)}</td>
                <td className="px-5 py-3.5">
                  <StatusPill tone={STUDENT_STATUS_TONE[student.status]}>{student.status}</StatusPill>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    type="button"
                    className="text-[12.5px] text-accent hover:underline cursor-pointer whitespace-nowrap"
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <p className="px-5 py-8 text-[13.5px] text-muted text-center">
            Ningún alumno coincide con la búsqueda.
          </p>
        )}
      </div>

      <p className="text-[12.5px] text-muted mt-4">
        {rows.length} de {DEMO_STUDENTS.length} alumnos
      </p>
    </>
  );
}
