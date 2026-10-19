import { cn } from '../../shared/lib/cn';
import { inputClasses } from '../../shared/ui/TextField';

interface AdminFiltersProps<T extends string> {
  query: string;
  onQueryChange: (value: string) => void;
  searchPlaceholder: string;
  options: readonly T[];
  active: T;
  onActiveChange: (value: T) => void;
}

export function AdminFilters<T extends string>({
  query,
  onQueryChange,
  searchPlaceholder,
  options,
  active,
  onActiveChange,
}: AdminFiltersProps<T>) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
      <input
        type="search"
        aria-label={searchPlaceholder}
        placeholder={searchPlaceholder}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className={cn(inputClasses, 'lg:max-w-[300px]')}
      />

      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onActiveChange(option)}
            aria-pressed={option === active}
            className={cn(
              'px-3.5 py-2 rounded-lg border text-[12.5px] whitespace-nowrap transition-colors cursor-pointer',
              option === active
                ? 'border-accent bg-accent/10 text-accent font-semibold'
                : 'border-line text-muted hover:border-accent/40 hover:text-ink'
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
