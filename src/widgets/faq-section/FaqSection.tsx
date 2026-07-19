import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HOME_SECTIONS } from '../../shared/config/routes';
import { Container } from '../../shared/ui/Container';
import { SectionHeading } from '../../shared/ui/SectionHeading';
import { cn } from '../../shared/lib/cn';

const FAQ_ITEMS = [
  {
    question: '¿Necesito experiencia previa para unirme?',
    answer:
      'No. La librería de cursos está organizada para avanzar a tu ritmo desde cero, y en los vivos explico el porqué de cada decisión. Si ya tienes experiencia, las señales, los recaps y los webinars te dan profundidad.',
  },
  {
    question: '¿Qué pasa si no puedo asistir a los vivos?',
    answer:
      'Todo queda grabado. Las sesiones de trading en vivo, los webinars y los Q&A se publican en el canal de repeticiones para que los veas cuando quieras.',
  },
  {
    question: '¿Las señales son recomendaciones de inversión?',
    answer:
      'No. Las señales son contenido educativo que muestra mi operativa real, con entrada, salida y tesis. Cada persona es responsable de sus propias decisiones de inversión. El trading implica riesgo de pérdida de capital.',
  },
  {
    question: '¿Cómo funciona el copytrading en Binance?',
    answer:
      'Es un bonus para miembros: acceso al perfil de copytrading donde puedes replicar mis trades con documentación transparente de la operativa. Es una actividad de alto riesgo y completamente opcional.',
  },
  {
    question: '¿Puedo cancelar cuando quiera?',
    answer: 'Sí. La suscripción es mensual, sin permanencia. Cancelas en un clic y mantienes el acceso hasta el final de tu período pagado.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id={HOME_SECTIONS.faq} className="py-24 bg-bg-2 border-t border-line">
      <Container>
        <SectionHeading eyebrow="Preguntas" title={<>Preguntas <span className="text-accent">frecuentes</span></>} />

        <div className="max-w-[760px] mx-auto mt-14 grid gap-3.5">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question} className="bg-panel border border-line rounded-2xl overflow-hidden">
                <button
                  type="button"
                  className="w-full flex justify-between items-center gap-4 px-6 py-5 text-left font-semibold text-ink cursor-pointer"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  {item.question}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="none"
                    className={cn('shrink-0 text-accent transition-transform duration-250', isOpen && 'rotate-180')}
                  >
                    <path d="M5 8 L10 13 L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
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
            );
          })}
        </div>
      </Container>
    </section>
  );
}
