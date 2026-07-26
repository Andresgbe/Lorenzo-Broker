import { useState, type ChangeEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../entities/session';
import { useSiteContentField } from '../../entities/site-content';
import { Container } from '../../shared/ui/Container';
import { SectionHeading } from '../../shared/ui/SectionHeading';
import { cn } from '../../shared/lib/cn';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  enabled: boolean;
  showOnHome: boolean;
}

const DEFAULT_FAQ_ITEMS: FaqItem[] = [
  {
    id: '1',
    question: '¿Necesito experiencia previa para unirme?',
    answer:
      'No. La librería de cursos está organizada para avanzar a tu ritmo desde cero, y en los vivos explico el porqué de cada decisión. Si ya tienes experiencia, las señales, los recaps y los webinars te dan profundidad.',
    enabled: true,
    showOnHome: true,
  },
  {
    id: '2',
    question: '¿Qué pasa si no puedo asistir a los vivos?',
    answer:
      'Todo queda grabado. Las sesiones de trading en vivo, los webinars y los Q&A se publican en el canal de repeticiones para que los veas cuando quieras.',
    enabled: true,
    showOnHome: true,
  },
  {
    id: '3',
    question: '¿Las señales son recomendaciones de inversión?',
    answer:
      'No. Las señales son contenido educativo que muestra mi operativa real, con entrada, salida y tesis. Cada persona es responsable de sus propias decisiones de inversión. El trading implica riesgo de pérdida de capital.',
    enabled: true,
    showOnHome: true,
  },
  {
    id: '4',
    question: '¿Cómo funciona el copytrading en Binance?',
    answer:
      'Es un bonus para miembros: acceso al perfil de copytrading donde puedes replicar mis trades con documentación transparente de la operativa. Es una actividad de alto riesgo y completamente opcional.',
    enabled: true,
    showOnHome: true,
  },
  {
    id: '5',
    question: '¿Puedo cancelar cuando quiera?',
    answer: 'Sí. La suscripción es mensual, sin permanencia. Cancelas en un clic y mantienes el acceso hasta el final de tu período pagado.',
    enabled: true,
    showOnHome: true,
  },
];

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M5 8 L10 13 L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M5 8 L10 13 L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface FaqSectionProps {
  // 'home' shows/edits only items flagged to appear on the home page.
  // 'full' (the dedicated /faq page) shows every enabled item, and — for
  // the logged-in admin — the entire bank including disabled ones to edit.
  variant?: 'home' | 'full';
}

export function FaqSection({ variant = 'full' }: FaqSectionProps) {
  const { isAuthenticated } = useAuth();
  const { value: stored, setValue: persistItems, isLoading } = useSiteContentField('faq.items', DEFAULT_FAQ_ITEMS);
  const [items, setItems] = useState(DEFAULT_FAQ_ITEMS);
  const [openId, setOpenId] = useState<string | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);

  // Adjust local state during render when the stored content first arrives,
  // instead of in an effect — avoids an extra render pass.
  const [wasLoading, setWasLoading] = useState(true);
  if (wasLoading && !isLoading) {
    setWasLoading(false);
    setItems(stored);
  }

  // On /faq, the admin edits question/answer text directly in place.
  // On the home page, the admin can't edit text there — they just pick
  // which bank questions show, via the dropdown selector below.
  const isAdminEditing = variant === 'full' && isAuthenticated;
  const canCurateHome = variant === 'home' && isAuthenticated;
  const visibleItems = isAdminEditing
    ? items
    : items.filter((item) => item.enabled && (variant === 'full' || item.showOnHome));

  function updateItem(id: string, patch: Partial<FaqItem>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function saveItems() {
    persistItems(items);
  }

  function toggleField(id: string, field: 'enabled' | 'showOnHome') {
    setItems((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, [field]: !item[field] } : item));
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

  function addItem() {
    setItems((prev) => {
      const next: FaqItem[] = [
        ...prev,
        {
          id: `custom-${Date.now()}`,
          question: 'Nueva pregunta',
          answer: 'Escribe la respuesta…',
          enabled: true,
          showOnHome: false,
        },
      ];
      persistItems(next);
      return next;
    });
  }

  return (
    <section className="py-24 bg-bg-2 border-t border-line">
      <Container>
        <SectionHeading eyebrow="Preguntas" title={<>Preguntas <span className="text-accent">frecuentes</span></>} />

        {canCurateHome && (
          <div className="max-w-[760px] mx-auto mt-14">
            <button
              type="button"
              onClick={() => setSelectorOpen((v) => !v)}
              className="flex items-center gap-2 text-sm font-semibold text-accent cursor-pointer"
            >
              Elegir preguntas a mostrar
              <ChevronDownIcon className={cn('transition-transform duration-200', selectorOpen && 'rotate-180')} />
            </button>
            <AnimatePresence initial={false}>
              {selectorOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 bg-panel border border-line rounded-2xl p-4 grid gap-1">
                    {items
                      .filter((item) => item.enabled)
                      .map((item) => (
                        <label key={item.id} className="flex items-center gap-3 text-sm px-2 py-2 rounded-lg cursor-pointer hover:bg-panel-2">
                          <input
                            type="checkbox"
                            checked={item.showOnHome}
                            onChange={() => toggleField(item.id, 'showOnHome')}
                            className="w-4 h-4 accent-accent cursor-pointer shrink-0"
                          />
                          <span className="text-[#c6cedb]">{item.question}</span>
                        </label>
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className={cn('max-w-[760px] mx-auto grid gap-3.5', canCurateHome ? 'mt-6' : 'mt-14')}>
          {visibleItems.map((item) =>
            isAdminEditing ? (
              <div key={item.id} className="bg-panel border border-line rounded-2xl p-5">
                <label className="text-[10px] font-bold uppercase tracking-wide text-muted">Pregunta</label>
                <input
                  value={item.question}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateItem(item.id, { question: e.target.value })}
                  onBlur={saveItems}
                  className="w-full bg-transparent outline-none border-b border-dashed border-line focus:border-accent font-semibold text-ink mt-1 mb-3"
                />
                <label className="text-[10px] font-bold uppercase tracking-wide text-muted">Respuesta</label>
                <textarea
                  value={item.answer}
                  onChange={(e) => updateItem(item.id, { answer: e.target.value })}
                  onBlur={saveItems}
                  rows={3}
                  className="w-full mt-1 bg-transparent outline-none resize-none border border-dashed border-line focus:border-accent rounded-lg p-2 text-muted text-[14.5px]"
                />
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleField(item.id, 'enabled')}
                      className={cn(
                        'text-[10px] font-bold uppercase px-2 py-1 rounded-full border cursor-pointer transition-colors',
                        item.enabled ? 'border-accent/50 text-accent' : 'border-line text-muted hover:text-ink'
                      )}
                    >
                      {item.enabled ? 'Habilitada' : 'Deshabilitada'}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleField(item.id, 'showOnHome')}
                      className={cn(
                        'text-[10px] font-bold uppercase px-2 py-1 rounded-full border cursor-pointer transition-colors',
                        item.showOnHome ? 'border-gold/50 text-gold' : 'border-line text-muted hover:text-ink'
                      )}
                    >
                      {item.showOnHome ? 'En el inicio' : 'Solo en preguntas'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label="Eliminar pregunta"
                    className="text-muted hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div key={item.id} className="bg-panel border border-line rounded-2xl overflow-hidden">
                <button
                  type="button"
                  className="w-full flex justify-between items-center gap-4 px-6 py-5 text-left font-semibold text-ink cursor-pointer"
                  aria-expanded={openId === item.id}
                  onClick={() => setOpenId(openId === item.id ? null : item.id)}
                >
                  {item.question}
                  <ChevronIcon className={cn('shrink-0 text-accent transition-transform duration-250', openId === item.id && 'rotate-180')} />
                </button>
                <AnimatePresence initial={false}>
                  {openId === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-muted text-[15px]">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          )}

          {isAdminEditing && (
            <button
              type="button"
              onClick={addItem}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl border border-dashed border-line text-muted hover:text-accent hover:border-accent/50 transition-colors cursor-pointer"
            >
              <PlusIcon className="w-4 h-4" /> Agregar pregunta
            </button>
          )}
        </div>
      </Container>
    </section>
  );
}
