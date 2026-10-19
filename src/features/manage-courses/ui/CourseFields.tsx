import type { PlanOption } from '../../../entities/plan';
import { TextField, inputClasses } from '../../../shared/ui/TextField';
import { cn } from '../../../shared/lib/cn';

export interface CourseFieldValues {
  title: string;
  description: string;
  welcomeVideoId: string;
  planIds: string[];
}

interface CourseFieldsProps {
  values: CourseFieldValues;
  onChange: (patch: Partial<CourseFieldValues>) => void;
  plans: PlanOption[];
  titleError?: string;
  autoFocus?: boolean;
}

/** Título, descripción, video de bienvenida y planes de un curso: los mismos campos al crearlo y al editarlo. */
export function CourseFields({ values, onChange, plans, titleError, autoFocus }: CourseFieldsProps) {
  function togglePlan(id: string) {
    onChange({
      planIds: values.planIds.includes(id) ? values.planIds.filter((planId) => planId !== id) : [...values.planIds, id],
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <TextField
        label="Título del curso"
        value={values.title}
        error={titleError}
        placeholder="p. ej. Análisis técnico desde cero"
        autoFocus={autoFocus}
        onChange={(event) => onChange({ title: event.target.value })}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="course-description" className="text-[13px] text-[#c6cedb]">
          Descripción
        </label>
        <textarea
          id="course-description"
          rows={4}
          value={values.description}
          onChange={(event) => onChange({ description: event.target.value })}
          placeholder="Qué aprende el alumno en este curso. Se muestra en su tarjeta y en la página del curso."
          className={cn(inputClasses, 'resize-y')}
        />
      </div>

      <TextField
        label="Video de bienvenida (ID en Bunny Stream)"
        value={values.welcomeVideoId}
        placeholder="p. ej. 3f2a9c1e-…"
        hint="Se muestra arriba de la página del curso, antes de los módulos. Vacío = sin video de bienvenida."
        onChange={(event) => onChange({ welcomeVideoId: event.target.value })}
      />

      <fieldset className="flex flex-col gap-2.5">
        <legend className="text-[13px] text-[#c6cedb] mb-2">Incluido en</legend>
        {plans.length === 0 ? (
          <p className="text-[12.5px] text-muted">No hay planes guardados todavía.</p>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {plans.map((plan) => {
              const checked = values.planIds.includes(plan.id);
              return (
                <label
                  key={plan.id}
                  className={cn(
                    'flex items-center gap-2.5 rounded-[10px] border px-3.5 py-2.5 text-[13.5px] cursor-pointer transition-colors',
                    checked ? 'border-accent/40 bg-accent/10 text-ink' : 'border-line text-muted hover:text-ink'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePlan(plan.id)}
                    className="w-4 h-4 accent-[#25e98a] cursor-pointer"
                  />
                  {plan.name}
                  {!plan.isActive && <span className="text-[11.5px] text-muted">(inactivo)</span>}
                </label>
              );
            })}
          </div>
        )}
        {values.planIds.length === 0 && plans.length > 0 && (
          <p className="text-[11.5px] text-gold">Sin plan, ningún alumno verá este curso.</p>
        )}
      </fieldset>
    </div>
  );
}
