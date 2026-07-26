import { useRef, useState, type DragEvent, type MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { HOME_SECTIONS } from '../../shared/config/routes';
import { Container } from '../../shared/ui/Container';
import { SectionHeading } from '../../shared/ui/SectionHeading';
import { BenefitCard, type Benefit } from '../../entities/benefit';
import { useAuth } from '../../entities/session';
import { useSiteContentField } from '../../entities/site-content';
import { cn } from '../../shared/lib/cn';

const DEFAULT_INCLUDES_DATA: Benefit[] = [
  {
    id: '1',
    title: 'Trading en vivo — 2 días a la semana',
    description:
      'Sesiones por Zoom en la apertura del mercado: el plan, la ejecución y el porqué de cada decisión. Todas quedan grabadas.',
  },
  {
    id: '2',
    title: 'Señales SWING + análisis diario',
    description:
      'Señales de compra y venta swing con entrada, salida y tesis. Además, todos los días: pre-market, noticias y trade recaps de la jornada.',
  },
  {
    id: '3',
    title: '1 webinar y 1 Q&A cada mes',
    description:
      'Un tema a fondo cada mes (brokers desde LatAm, gestión de riesgo, análisis técnico) y una sesión en vivo para responder todas tus preguntas.',
  },
  {
    id: '4',
    title: 'Librería de cursos, libros y PDF',
    description: 'Material organizado para avanzar a tu ritmo, más todas las repeticiones de vivos y webinars.',
  },
  {
    id: '5',
    title: 'Bonus: Close Friends de Instagram',
    description:
      'Contenido exclusivo de bolsa y de mi vida personal — el detrás de cámaras de mi día a día como corredor.',
    bonus: true,
  },
  {
    id: '6',
    title: 'Bonus: Copytrading en Binance',
    description: 'Acceso para copiar mis trades en Binance, con documentación transparente de la operativa. Alto riesgo.',
    bonus: true,
    logo: 'binance',
  },
];

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IncludesSection() {
  const { isAuthenticated } = useAuth();
  const { value: stored, setValue: persistItems, isLoading } = useSiteContentField(
    'includes.items',
    DEFAULT_INCLUDES_DATA
  );
  const [items, setItems] = useState(DEFAULT_INCLUDES_DATA);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  // Native dragstart always reports the draggable element itself as e.target,
  // never the descendant that was actually pressed — so "did this drag start
  // from the handle" has to be captured on mousedown instead.
  const dragArmedRef = useRef(false);

  // Adjust local state during render when the stored content first arrives,
  // instead of in an effect — avoids an extra render pass.
  const [wasLoading, setWasLoading] = useState(true);
  if (wasLoading && !isLoading) {
    setWasLoading(false);
    setItems(stored);
  }

  function updateItem(id: string, patch: Partial<Benefit>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function saveItems() {
    persistItems(items);
  }

  function toggleBonus(id: string) {
    setItems((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, bonus: !item.bonus } : item));
      persistItems(next);
      return next;
    });
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      persistItems(next);
      return next;
    });
  }

  function handleMouseDown(event: MouseEvent<HTMLDivElement>) {
    dragArmedRef.current = !!(event.target as HTMLElement).closest('[data-drag-handle]');
  }

  function handleDragStart(event: DragEvent<HTMLDivElement>, id: string) {
    if (!dragArmedRef.current) {
      event.preventDefault();
      return;
    }
    // Some browsers (Firefox especially) refuse to start a native drag at
    // all unless dataTransfer has something set on dragstart.
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
    setDraggedId(id);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>, overId: string) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (!draggedId || draggedId === overId) return;
    setItems((prev) => {
      const fromIndex = prev.findIndex((item) => item.id === draggedId);
      const toIndex = prev.findIndex((item) => item.id === overId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  function handleDragEnd() {
    dragArmedRef.current = false;
    setDraggedId(null);
    persistItems(items);
  }

  function addItem() {
    setItems((prev) => {
      const next: Benefit[] = [
        ...prev,
        { id: `custom-${Date.now()}`, title: 'Nuevo beneficio', description: 'Descripción del beneficio…', bonus: false },
      ];
      persistItems(next);
      return next;
    });
  }

  return (
    <section id={HOME_SECTIONS.includes} className="py-24">
      <Container>
        <SectionHeading title={<>¿Qué <span className="text-accent">incluye</span>?</>} />
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable={isAuthenticated}
              onMouseDown={handleMouseDown}
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDrop={(e) => e.preventDefault()}
              onDragEnd={handleDragEnd}
              className={cn(draggedId === item.id && 'opacity-40')}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <BenefitCard
                  benefit={item}
                  index={index + 1}
                  editable={isAuthenticated}
                  onChange={(patch) => updateItem(item.id, patch)}
                  onBlurSave={saveItems}
                  onToggleBonus={() => toggleBonus(item.id)}
                  onRemove={() => removeItem(item.id)}
                />
              </motion.div>
            </div>
          ))}

          {isAuthenticated && (
            <button
              type="button"
              onClick={addItem}
              className="min-h-[180px] rounded-[18px] border border-dashed border-line flex flex-col items-center justify-center gap-2 text-muted hover:text-accent hover:border-accent/50 transition-colors cursor-pointer"
            >
              <PlusIcon className="w-6 h-6" />
              <span className="text-sm font-semibold">Agregar tarjeta</span>
            </button>
          )}
        </div>
      </Container>
    </section>
  );
}
