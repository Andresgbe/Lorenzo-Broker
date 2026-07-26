import { useState, type ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { HOME_SECTIONS } from '../../shared/config/routes';
import { Container } from '../../shared/ui/Container';
import { SectionHeading } from '../../shared/ui/SectionHeading';
import { SubscribeButton } from '../../features/subscribe-cta';
import { useAuth } from '../../entities/session';
import { useSiteContentField } from '../../entities/site-content';
import { cn } from '../../shared/lib/cn';

interface PriceItem {
  id: string;
  label: string;
  bonus?: boolean;
}

interface PricingContent {
  planName: string;
  price: string;
  billingNote: string;
  items: PriceItem[];
}

const DEFAULT_PRICING: PricingContent = {
  planName: 'Comunidad Lorenzo Broker',
  price: '29',
  billingNote: 'Sin permanencia. Cancela cuando quieras.',
  items: [
    { id: '1', label: 'Trading en vivo 2 días a la semana (grabado)' },
    { id: '2', label: 'Señales swing + pre-market y recaps diarios' },
    { id: '3', label: 'Webinar + Q&A mensual' },
    { id: '4', label: 'Librería completa de cursos, libros y PDF' },
    { id: '5', label: 'Bonus: Copytrading en Binance', bonus: true },
    { id: '6', label: 'Bonus: Close Friends de Instagram (información exclusiva)', bonus: true },
  ],
};

function CheckIcon({ bonus }: { bonus?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5">
      <circle cx="10" cy="10" r="9" stroke={bonus ? '#f2b636' : '#25e98a'} strokeWidth="1.6" />
      <path d="M6 10.5 L9 13 L14 7.5" stroke={bonus ? '#f2b636' : '#25e98a'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

export function PricingSection() {
  const { isAuthenticated } = useAuth();
  const { value: stored, setValue: persistContent, isLoading } = useSiteContentField(
    'pricing.plan',
    DEFAULT_PRICING
  );
  const [content, setContent] = useState(DEFAULT_PRICING);

  // Adjust local state during render when the stored content first arrives,
  // instead of in an effect — avoids an extra render pass.
  const [wasLoading, setWasLoading] = useState(true);
  if (wasLoading && !isLoading) {
    setWasLoading(false);
    setContent(stored);
  }

  function saveContent(next: PricingContent = content) {
    persistContent(next);
  }

  function updateField(patch: Partial<Omit<PricingContent, 'items'>>) {
    setContent((prev) => ({ ...prev, ...patch }));
  }

  function updateItem(id: string, patch: Partial<PriceItem>) {
    setContent((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }

  function toggleBonus(id: string) {
    setContent((prev) => {
      const next = { ...prev, items: prev.items.map((item) => (item.id === id ? { ...item, bonus: !item.bonus } : item)) };
      persistContent(next);
      return next;
    });
  }

  function removeItem(id: string) {
    setContent((prev) => {
      const next = { ...prev, items: prev.items.filter((item) => item.id !== id) };
      persistContent(next);
      return next;
    });
  }

  function addItem() {
    setContent((prev) => {
      const next = { ...prev, items: [...prev.items, { id: `custom-${Date.now()}`, label: 'Nuevo beneficio' }] };
      persistContent(next);
      return next;
    });
  }

  return (
    <section id={HOME_SECTIONS.pricing} className="py-24 bg-bg-2 border-y border-line">
      <Container>
        <SectionHeading eyebrow="Suscripción" title={<>Un solo plan. <span className="text-accent">Todo incluido.</span></>} />

        <div className="mt-16 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[460px] bg-panel border border-accent/40 rounded-[22px] px-10 py-11 text-center shadow-[0_0_60px_rgba(37,233,138,0.08)]"
          >
            {isAuthenticated ? (
              <input
                value={content.planName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateField({ planName: e.target.value })}
                onBlur={() => saveContent()}
                className="w-full text-center bg-transparent outline-none border-b border-dashed border-line focus:border-accent text-xs font-bold tracking-[3px] uppercase text-accent"
              />
            ) : (
              <div className="text-xs font-bold tracking-[3px] uppercase text-accent">{content.planName}</div>
            )}

            <div className="font-display font-extrabold text-[56px] mt-4 mb-1 text-ink flex items-baseline justify-center gap-0.5">
              $
              {isAuthenticated ? (
                <input
                  value={content.price}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateField({ price: e.target.value })}
                  onBlur={() => saveContent()}
                  className="w-20 text-center bg-transparent outline-none border-b border-dashed border-line focus:border-accent"
                />
              ) : (
                content.price
              )}
              <small className="text-lg text-muted font-body font-medium">/mes</small>
            </div>

            {isAuthenticated ? (
              <input
                value={content.billingNote}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateField({ billingNote: e.target.value })}
                onBlur={() => saveContent()}
                className="w-full text-center bg-transparent outline-none border-b border-dashed border-line focus:border-accent text-muted text-[13.5px] mb-7"
              />
            ) : (
              <div className="text-muted text-[13.5px] mb-7">{content.billingNote}</div>
            )}

            <div className="text-left grid gap-3 mb-8">
              {content.items.map((item) => (
                <div key={item.id} className="flex gap-3 items-start text-[14.5px] text-[#c6cedb]">
                  <CheckIcon bonus={item.bonus} />
                  {isAuthenticated ? (
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <input
                        value={item.label}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => updateItem(item.id, { label: e.target.value })}
                        onBlur={() => saveContent()}
                        className="flex-1 min-w-0 bg-transparent outline-none border-b border-dashed border-line focus:border-accent"
                      />
                      <button
                        type="button"
                        onClick={() => toggleBonus(item.id)}
                        className={cn(
                          'text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0 cursor-pointer transition-colors',
                          item.bonus ? 'border-gold/50 text-gold' : 'border-line text-muted hover:text-ink'
                        )}
                      >
                        {item.bonus ? 'Bonus' : 'Normal'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label="Eliminar ítem"
                        className="shrink-0 text-muted hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <XIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    item.label
                  )}
                </div>
              ))}

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-2 text-[13px] text-muted hover:text-accent transition-colors cursor-pointer"
                >
                  <PlusIcon className="w-4 h-4" /> Agregar ítem
                </button>
              )}
            </div>

            <SubscribeButton label="Suscríbete ahora" className="w-full" />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
