import { motion } from 'framer-motion';
import { HOME_SECTIONS } from '../../shared/config/routes';
import { cn } from '../../shared/lib/cn';
import { Container } from '../../shared/ui/Container';
import { EditableText } from '../../shared/ui/EditableText';
import { MediaPlaceholder } from '../../shared/ui/MediaPlaceholder';
import { SectionHeading } from '../../shared/ui/SectionHeading';
import { useEditMode } from '../../features/edit-mode';
import { useSiteContentDraft } from '../../entities/site-content';
import educacionCursos from '../../shared/assets/images/includes/educacion-cursos.webp';
import educacionClaseGrabada from '../../shared/assets/images/includes/educacion-clase-grabada.webp';
import educacionClasePresencial from '../../shared/assets/images/includes/educacion-clase-presencial.webp';
import educacionEscritorio from '../../shared/assets/images/includes/educacion-escritorio.webp';
import ideasAlertaNvda from '../../shared/assets/images/includes/ideas-alerta-nvda.webp';
import ideasMicron from '../../shared/assets/images/includes/ideas-micron.webp';
import ideasResumenMercado from '../../shared/assets/images/includes/ideas-resumen-mercado.webp';
import ideasZcashAntes from '../../shared/assets/images/includes/ideas-zcash-antes.webp';
import ideasZcashDespues from '../../shared/assets/images/includes/ideas-zcash-despues.webp';
import ideasHyperliquid from '../../shared/assets/images/includes/ideas-hyperliquid.webp';
import copytradingCartera from '../../shared/assets/images/includes/copytrading-cartera.webp';
import copytradingResumen from '../../shared/assets/images/includes/copytrading-resumen.webp';
import copytradingGrafico from '../../shared/assets/images/includes/copytrading-grafico.webp';

interface Shot {
  src: string;
  alt: string;
  /** Texto bajo la captura: qué se ve en ella. */
  caption: string;
}

interface IncludeDetail {
  id: string;
  /** Número de la tarjeta de "¿Qué incluye?" a la que amplía. */
  index: number;
  title: string;
  intro: string;
  points: string[];
  /** Capturas de esa parte; con más de una, se pasan con los puntos de abajo. */
  shots: Shot[];
  bonus?: boolean;
}

// Los textos siguen siendo de ejemplo: Lorenzo los va a reescribir. Las capturas son las que
// mandó el 12 y el 13/11/2026 (originales en `resources/`).
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
    shots: [
      { src: educacionCursos, alt: 'Portadas de los cursos: acciones preferidas, REITs, bonos, futuros, opciones y estrategias', caption: 'Los cursos de la academia.' },
      { src: educacionClaseGrabada, alt: 'Lorenzo explica un contrato de futuros en una clase grabada', caption: 'Una clase grabada: así se explica cada tema.' },
      { src: educacionClasePresencial, alt: 'Lorenzo da una clase en la pizarra a un grupo de alumnos', caption: 'Clase en vivo con alumnos.' },
      { src: educacionEscritorio, alt: 'Lorenzo en su escritorio de trading, rodeado de monitores', caption: 'Desde aquí se graban las clases y los eventos en vivo.' },
    ],
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
    shots: [
      { src: ideasAlertaNvda, alt: 'Alerta en el chat: comprando NVDA en 160 dólares, stop en 149, objetivo en 178', caption: 'Una alerta en el chat privado: entrada, stop y objetivo.' },
      { src: ideasMicron, alt: 'Idea de inversión sobre Micron (MU) antes de sus resultados', caption: 'Una idea de inversión con su porqué.' },
      { src: ideasResumenMercado, alt: 'Reporte "Resumen del mercado" del jueves 12 de noviembre', caption: 'El resumen diario del mercado.' },
      { src: ideasZcashAntes, alt: 'Zcash a 147 dólares el 3 de octubre de 2025', caption: 'Zcash el 3 de octubre de 2025: 147 dólares.' },
      { src: ideasZcashDespues, alt: 'Zcash a 513 dólares el 27 de diciembre de 2025', caption: 'Y el 27 de diciembre: 513 dólares.' },
      { src: ideasHyperliquid, alt: 'Publicación sobre Hyperliquid: acción PURR y cripto HYPE-USDT', caption: 'Ideas en acciones y en cripto.' },
    ],
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
    shots: [
      { src: copytradingCartera, alt: 'Cartera de copy trading LORENZOBROKER en Binance, con apalancamiento de 10x a 20x', caption: 'Mi cartera de Lead Trader en Binance.' },
      { src: copytradingResumen, alt: 'Resumen del trader principal y activos preferidos: Apple, ARM, Micron, Microsoft, Nvidia y otros', caption: 'Resumen de la cartera y los activos que más opero.' },
      { src: copytradingGrafico, alt: 'Gráfico de TSLAUSDT en Binance Futures', caption: 'Operando futuros en Binance.' },
    ],
    bonus: true,
  },
];

/** Lo que el admin edita de cada parte. Las imágenes siguen en el código. */
interface DetailText {
  title: string;
  intro: string;
  points: string[];
  /** Un texto por captura, en el mismo orden que `shots`. */
  captions: string[];
}

type DetailTexts = Record<string, DetailText>;

// Valores por defecto: en cuanto el admin guarda, manda lo que está en site_content ('includes.details').
const DEFAULT_DETAIL_TEXTS: DetailTexts = Object.fromEntries(
  DEFAULT_INCLUDE_DETAILS.map((detail) => [
    detail.id,
    { title: detail.title, intro: detail.intro, points: detail.points, captions: detail.shots.map((shot) => shot.caption) },
  ])
);

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

interface ShotGridProps {
  shots: Shot[];
  /** Si llega, el texto bajo cada captura se edita en sitio. */
  captionEditor?: {
    onChange: (index: number, caption: string) => void;
    onCommit: () => void;
  };
}

/**
 * Todas las capturas a la vez, en mosaico a todo el ancho: columnas donde cada imagen se
 * apila debajo de la anterior con su altura natural (las hay verticales y apaisadas).
 */
function ShotGrid({ shots, captionEditor }: ShotGridProps) {
  if (shots.length === 0) {
    return (
      <MediaPlaceholder
        icon={<ImageIcon className="w-7 h-7 text-ink-inverse" />}
        label="Captura de pantalla"
        className="aspect-[16/10] rounded-[14px]"
      />
    );
  }

  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4">
      {shots.map((shot, i) => (
        <figure key={shot.src} className="mb-3 sm:mb-4 break-inside-avoid">
          <div className="rounded-[14px] border border-line bg-panel p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
            <img
              src={shot.src}
              alt={shot.alt}
              loading="lazy"
              decoding="async"
              className="block w-full h-auto rounded-[10px]"
            />
          </div>
          {captionEditor ? (
            <div className="mt-2">
              <EditableText
                label={`Texto de la captura ${i + 1}`}
                value={shot.caption}
                onChange={(caption) => captionEditor.onChange(i, caption)}
                onCommit={captionEditor.onCommit}
                multiline
                className="text-[12px] text-muted text-center"
              />
            </div>
          ) : (
            <figcaption className="text-[12px] leading-snug text-muted text-center mt-2">{shot.caption}</figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

/**
 * Debajo del plan ("Un solo plan. Todo incluido."): cada parte de la membresía explicada
 * en detalle: arriba el título y los puntos (en dos columnas en computadora) y debajo todas
 * sus capturas juntas, en mosaico.
 */
export function IncludesDetail() {
  const { isEditing } = useEditMode();
  const { draft, update, commit, replace } = useSiteContentDraft<DetailTexts>('includes.details', DEFAULT_DETAIL_TEXTS);

  // Lo guardado manda, campo por campo, sobre los valores por defecto.
  const textFor = (id: string): DetailText => ({ ...DEFAULT_DETAIL_TEXTS[id], ...draft[id] });
  const patchText = (id: string, patch: Partial<DetailText>) => update({ [id]: { ...textFor(id), ...patch } });
  const replaceText = (id: string, patch: Partial<DetailText>) => replace({ ...draft, [id]: { ...textFor(id), ...patch } });

  return (
    <section id={HOME_SECTIONS.includesDetail} className="py-24">
      <Container>
        <SectionHeading eyebrow="En detalle" title={<>Así funciona <span className="text-accent">cada parte</span></>} />

        <div className="mt-16 flex flex-col gap-20 lg:gap-28">
          {DEFAULT_INCLUDE_DETAILS.map((detail) => {
            const text = textFor(detail.id);
            const shots = detail.shots.map((shot, i) => ({ ...shot, caption: text.captions[i] ?? shot.caption }));
            const checkClasses = cn('w-[18px] h-[18px] shrink-0 mt-0.5', detail.bonus ? 'text-highlight' : 'text-accent');
            return (
              <motion.article
                key={detail.id}
                id={`${HOME_SECTIONS.includesDetail}-${detail.index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6 }}
                className="flex flex-col gap-10 scroll-mt-28"
              >
                <div className="grid gap-6 lg:grid-cols-2 lg:gap-16 items-start">
                  <div>
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
                    {isEditing ? (
                      <EditableText
                        label={`Título de la parte ${detail.index}`}
                        value={text.title}
                        onChange={(title) => patchText(detail.id, { title })}
                        onCommit={commit}
                        multiline
                      />
                    ) : (
                      text.title
                    )}
                  </h3>
                  {isEditing ? (
                    <div className="mt-4">
                      <EditableText
                        label={`Introducción de la parte ${detail.index}`}
                        value={text.intro}
                        onChange={(intro) => patchText(detail.id, { intro })}
                        onCommit={commit}
                        multiline
                        className="text-muted text-[16px] leading-relaxed"
                      />
                    </div>
                  ) : (
                    <p className="text-muted text-[16px] leading-relaxed mt-4 text-pretty">{text.intro}</p>
                  )}
                  </div>
                  <ul className="flex flex-col gap-3 lg:pt-14">
                    {text.points.map((point, i) => (
                      <li key={isEditing ? i : point} className="flex gap-3 items-start text-[14.5px] text-ink-soft">
                        <CheckIcon className={checkClasses} />
                        {isEditing ? (
                          <div className="flex-1 flex items-start gap-2 min-w-0">
                            <EditableText
                              label={`Punto ${i + 1} de la parte ${detail.index}`}
                              value={point}
                              onChange={(value) =>
                                patchText(detail.id, { points: text.points.map((p, j) => (j === i ? value : p)) })
                              }
                              onCommit={commit}
                              multiline
                            />
                            <button
                              type="button"
                              onClick={() => replaceText(detail.id, { points: text.points.filter((_, j) => j !== i) })}
                              aria-label={`Eliminar el punto ${i + 1}`}
                              className="shrink-0 mt-1 text-muted hover:text-red-400 transition-colors cursor-pointer"
                            >
                              <XIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          point
                        )}
                      </li>
                    ))}
                    {isEditing && (
                      <li>
                        <button
                          type="button"
                          onClick={() => replaceText(detail.id, { points: [...text.points, 'Nuevo punto'] })}
                          className="flex items-center gap-2 text-[13px] text-muted hover:text-accent transition-colors cursor-pointer"
                        >
                          <PlusIcon className="w-4 h-4" /> Agregar punto
                        </button>
                      </li>
                    )}
                  </ul>
                </div>

                <ShotGrid
                  shots={shots}
                  captionEditor={
                    isEditing
                      ? {
                          onChange: (index, caption) =>
                            patchText(detail.id, {
                              captions: shots.map((shot, j) => (j === index ? caption : shot.caption)),
                            }),
                          onCommit: commit,
                        }
                      : undefined
                  }
                />
              </motion.article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
