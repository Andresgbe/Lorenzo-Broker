import { motion } from 'framer-motion';
import { HOME_SECTIONS } from '../../shared/config/routes';
import { cn } from '../../shared/lib/cn';
import { Container } from '../../shared/ui/Container';
import { MediaPlaceholder } from '../../shared/ui/MediaPlaceholder';
import { SectionHeading } from '../../shared/ui/SectionHeading';

interface IncludeDetail {
  id: string;
  /** Número de la tarjeta de "¿Qué incluye?" a la que amplía. */
  index: number;
  title: string;
  intro: string;
  points: string[];
  /** Texto bajo la captura: qué se ve en ella. */
  caption: string;
  bonus?: boolean;
}

// Textos de ejemplo para diseñar: Lorenzo los va a reescribir y mandará las capturas reales.
// Siguen el orden de las tarjetas de "¿Qué incluye?" (IncludesSection).
const DEFAULT_INCLUDE_DETAILS: IncludeDetail[] = [
  {
    id: 'educacion',
    index: 1,
    title: 'Educación continua: cursos, libros y PDF',
    intro:
      'Todo lo que sé, ordenado para que avances a tu ritmo. Empiezas por lo básico y llegas a operar con un plan, sin saltarte pasos.',
    points: [
      'Un evento en vivo cada semana: webinar, preguntas, análisis o live trading',
      'Cursos por niveles: plan de ahorro, plan de inversión, acciones, futuros, opciones y cripto',
      'Biblioteca de libros en PDF para descargar',
      'Todas las clases quedan grabadas en tu área de alumno',
    ],
    caption: 'Así se ve tu área de alumno con los cursos y tu progreso.',
  },
  {
    id: 'ideas',
    index: 2,
    title: 'Ideas de inversión: chat privado',
    intro:
      'Te cuento lo que compro y vendo en el momento en que lo hago, con el porqué de cada operación y cómo manejo el riesgo.',
    points: [
      'Avisos en tiempo real de compras y ventas: acciones, ETFs y cripto',
      'Alertas diarias de mercado antes de la apertura',
      'Entrada, salida y stop de cada operación',
      'Un grupo privado solo para miembros',
    ],
    caption: 'Ejemplo de una alerta en el chat privado.',
  },
  {
    id: 'copytrading',
    index: 3,
    title: 'Bonus: Copytrading en Binance',
    intro:
      'Copia mis operaciones con el programa oficial de Lead Trader de Binance. Tu dinero se queda siempre en tu cuenta.',
    points: [
      'Binance replica cada operación automáticamente',
      'De las ganancias, 70 % para ti y 30 % para mí, cobrado por Binance',
      'Puedes dejar de copiar cuando quieras',
      'Alto riesgo: los resultados pasados no garantizan resultados futuros',
    ],
    caption: 'Mi perfil de Lead Trader en Binance.',
    bonus: true,
  },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" fill="none" className={className}>
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 10.5 L9 13 L14 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="m21 16-5-5-9 9" />
    </svg>
  );
}

/** Marco de la captura: ventana con su barra, a la espera de la imagen real. */
function ScreenshotFrame({ caption }: { caption: string }) {
  return (
    <figure className="w-full">
      <div className="rounded-[20px] border border-line bg-panel p-2.5 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-1.5 px-2.5 pb-2.5 pt-1" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-line-strong" />
          <span className="w-2.5 h-2.5 rounded-full bg-line-strong" />
          <span className="w-2.5 h-2.5 rounded-full bg-line-strong" />
        </div>
        <MediaPlaceholder
          icon={<ImageIcon className="w-7 h-7 text-ink-inverse" />}
          label="Captura de pantalla"
          className="aspect-[16/10] rounded-[14px]"
        />
      </div>
      <figcaption className="text-[12.5px] text-muted text-center mt-3">{caption}</figcaption>
    </figure>
  );
}

/**
 * Debajo del plan ("Un solo plan. Todo incluido."): cada parte de la membresía explicada
 * en detalle, con su captura.
 * En computadora texto y captura se alternan de lado; en el teléfono van uno debajo del otro.
 */
export function IncludesDetail() {
  return (
    <section id={HOME_SECTIONS.includesDetail} className="py-24">
      <Container>
        <SectionHeading eyebrow="En detalle" title={<>Así funciona <span className="text-accent">cada parte</span></>} />

        <div className="mt-16 flex flex-col gap-20 lg:gap-28">
          {DEFAULT_INCLUDE_DETAILS.map((detail, position) => {
            const imageFirst = position % 2 === 1;
            return (
              <motion.article
                key={detail.id}
                id={`${HOME_SECTIONS.includesDetail}-${detail.index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6 }}
                className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16 scroll-mt-28"
              >
                <div className={cn(imageFirst && 'lg:order-2')}>
                  <span
                    className={cn(
                      'inline-flex items-center justify-center w-[34px] h-[34px] rounded-[10px] font-bold text-base',
                      detail.bonus
                        ? 'bg-brand-petrol text-white shadow-[0_0_18px_rgba(0,110,150,0.6)]'
                        : 'bg-accent text-ink-inverse shadow-[0_0_18px_rgba(0,176,154,0.5)]'
                    )}
                  >
                    {detail.index}
                  </span>
                  <h3
                    className={cn(
                      'font-display font-bold text-[clamp(24px,3vw,32px)] leading-tight mt-5 text-balance',
                      detail.bonus ? 'text-highlight' : 'text-ink'
                    )}
                  >
                    {detail.title}
                  </h3>
                  <p className="text-muted text-[16px] leading-relaxed mt-4 text-pretty">{detail.intro}</p>
                  <ul className="flex flex-col gap-3 mt-6">
                    {detail.points.map((point) => (
                      <li key={point} className="flex gap-3 items-start text-[14.5px] text-ink-soft">
                        <CheckIcon className={cn('w-[18px] h-[18px] shrink-0 mt-0.5', detail.bonus ? 'text-highlight' : 'text-accent')} />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={cn(imageFirst && 'lg:order-1')}>
                  <ScreenshotFrame caption={detail.caption} />
                </div>
              </motion.article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
