import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HOME_SECTIONS } from '../../shared/config/routes';
import { cn } from '../../shared/lib/cn';
import { Container } from '../../shared/ui/Container';
import { EditableText } from '../../shared/ui/EditableText';
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
  id: 'educacion' | 'ideas' | 'copytrading';
  /** Número de la parte en "¿Qué incluye?". */
  index: number;
  title: string;
  intro: string;
  points: string[];
  /** Capturas de esa parte. */
  shots: Shot[];
  bonus?: boolean;
}

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

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

interface CaptionEditor {
  onChange: (index: number, caption: string) => void;
  onCommit: () => void;
}

interface BentoTileProps {
  shot: Shot;
  shotIndex: number;
  spanClassName: string;
  topCrop?: boolean;
  captionEditor?: CaptionEditor;
  onOpen: (index: number) => void;
}

function BentoTile({ shot, shotIndex, spanClassName, topCrop, captionEditor, onOpen }: BentoTileProps) {
  const tileClasses = cn(
    'group relative overflow-hidden rounded-[16px] bg-bg-2 border border-line text-left transition-[border-color,transform] duration-200',
    !captionEditor && 'hover:border-accent hover:-translate-y-0.5 cursor-zoom-in',
    spanClassName
  );

  const content = (
    <>
      <img
        src={shot.src}
        alt={shot.alt}
        loading="lazy"
        decoding="async"
        className={cn(
          'absolute inset-0 w-full h-full',
          topCrop ? 'object-cover object-top p-0' : 'object-contain p-2 pb-11 sm:pb-9'
        )}
      />
      <div className="absolute inset-x-0 bottom-0 pt-5 pb-2 px-2.5 sm:pt-6 sm:pb-2.5 sm:px-3 bg-[linear-gradient(transparent,rgba(18,19,20,0.95)_45%)]">
        {captionEditor ? (
          <EditableText
            label={`Texto de la captura ${shotIndex + 1}`}
            value={shot.caption}
            onChange={(caption) => captionEditor.onChange(shotIndex, caption)}
            onCommit={captionEditor.onCommit}
            multiline
            className="text-[11.5px] sm:text-[12px] leading-snug text-ink-soft"
          />
        ) : (
          <span className="block text-[11.5px] sm:text-[12px] leading-snug text-ink-soft line-clamp-2">{shot.caption}</span>
        )}
      </div>
      {!captionEditor && (
        <span className="absolute top-2 right-2 w-7 h-7 rounded-[8px] bg-black/55 text-ink grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ExpandIcon className="w-3.5 h-3.5" />
        </span>
      )}
    </>
  );

  if (captionEditor) {
    return <div className={tileClasses}>{content}</div>;
  }

  return (
    <button type="button" onClick={() => onOpen(shotIndex)} className={tileClasses}>
      {content}
    </button>
  );
}

interface ZcashComparisonTileProps {
  before: Shot;
  after: Shot;
  beforeIndex: number;
  afterIndex: number;
  captionEditor?: CaptionEditor;
  onOpen: (index: number) => void;
}

function ZcashComparisonTile({
  before,
  after,
  beforeIndex,
  afterIndex,
  captionEditor,
  onOpen,
}: ZcashComparisonTileProps) {
  const combinedCaption = `${before.caption} → ${after.caption}`;

  const inner = (
    <>
      <div className="absolute inset-x-2 top-2 bottom-11 sm:bottom-9 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-1.5 sm:gap-2 items-center">
        <figure className="relative h-full m-0">
          <img src={before.src} alt={before.alt} loading="lazy" decoding="async" className="w-full h-full object-contain" />
          <span className="absolute top-1 left-1 text-[10px] sm:text-[11px] font-semibold bg-black/75 text-ink px-1.5 py-0.5 rounded-[6px]">
            3 oct 2025 · $147
          </span>
        </figure>
        <span className="flex flex-col items-center gap-0.5 text-accent font-bold text-base sm:text-lg">
          →
          <b className="text-[10.5px] sm:text-[11.5px] bg-accent/15 px-1.5 py-0.5 rounded-[6px]">+249%</b>
        </span>
        <figure className="relative h-full m-0">
          <img src={after.src} alt={after.alt} loading="lazy" decoding="async" className="w-full h-full object-contain" />
          <span className="absolute top-1 left-1 text-[10px] sm:text-[11px] font-semibold bg-black/75 text-ink px-1.5 py-0.5 rounded-[6px]">
            27 dic 2025 · $513
          </span>
        </figure>
      </div>

      <div className="absolute inset-x-0 bottom-0 pt-5 pb-2 px-2.5 sm:pt-6 sm:pb-2.5 sm:px-3 bg-[linear-gradient(transparent,rgba(18,19,20,0.95)_45%)]">
        {captionEditor ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
            <EditableText
              label={`Texto de la captura ${beforeIndex + 1}`}
              value={before.caption}
              onChange={(caption) => captionEditor.onChange(beforeIndex, caption)}
              onCommit={captionEditor.onCommit}
              multiline
              className="text-[11.5px] leading-snug text-ink-soft"
            />
            <EditableText
              label={`Texto de la captura ${afterIndex + 1}`}
              value={after.caption}
              onChange={(caption) => captionEditor.onChange(afterIndex, caption)}
              onCommit={captionEditor.onCommit}
              multiline
              className="text-[11.5px] leading-snug text-ink-soft"
            />
          </div>
        ) : (
          <span className="block text-[11.5px] sm:text-[12px] leading-snug text-ink-soft line-clamp-2">{combinedCaption}</span>
        )}
      </div>

      {!captionEditor && (
        <span className="absolute top-2 right-2 w-7 h-7 rounded-[8px] bg-black/55 text-ink grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ExpandIcon className="w-3.5 h-3.5" />
        </span>
      )}
    </>
  );

  const classes = cn(
    'group relative overflow-hidden rounded-[16px] bg-bg-2 border border-line text-left col-span-2 transition-[border-color,transform] duration-200',
    !captionEditor && 'hover:border-accent hover:-translate-y-0.5 cursor-zoom-in'
  );

  if (captionEditor) {
    return <div className={classes}>{inner}</div>;
  }

  return (
    <button type="button" onClick={() => onOpen(beforeIndex)} className={classes}>
      {inner}
    </button>
  );
}

interface BentoSectionGridProps {
  detailId: IncludeDetail['id'];
  shots: Shot[];
  captionEditor?: CaptionEditor;
  onOpen: (index: number) => void;
}

function BentoSectionGrid({ detailId, shots, captionEditor, onOpen }: BentoSectionGridProps) {
  const baseGrid = 'mt-6 lg:mt-8 grid grid-cols-2 auto-rows-[175px] sm:auto-rows-[185px] lg:auto-rows-[190px] gap-2.5 lg:gap-3.5 grid-flow-dense';

  if (detailId === 'educacion') {
    return (
      <div className={cn(baseGrid, 'lg:grid-cols-[2fr_1fr_1fr]')}>
        <BentoTile
          shot={shots[0]}
          shotIndex={0}
          spanClassName="col-span-2 lg:col-span-1 lg:row-span-2"
          captionEditor={captionEditor}
          onOpen={onOpen}
        />
        <BentoTile
          shot={shots[1]}
          shotIndex={1}
          spanClassName="col-span-1"
          captionEditor={captionEditor}
          onOpen={onOpen}
        />
        <BentoTile
          shot={shots[2]}
          shotIndex={2}
          spanClassName="col-span-1"
          captionEditor={captionEditor}
          onOpen={onOpen}
        />
        <BentoTile
          shot={shots[3]}
          shotIndex={3}
          spanClassName="col-span-2 lg:col-span-2"
          captionEditor={captionEditor}
          onOpen={onOpen}
        />
      </div>
    );
  }

  if (detailId === 'ideas') {
    return (
      <div className={cn(baseGrid, 'lg:grid-cols-4')}>
        <BentoTile
          shot={shots[2]}
          shotIndex={2}
          spanClassName="col-span-1 row-span-2"
          topCrop
          captionEditor={captionEditor}
          onOpen={onOpen}
        />
        <BentoTile
          shot={shots[0]}
          shotIndex={0}
          spanClassName="col-span-1"
          captionEditor={captionEditor}
          onOpen={onOpen}
        />
        <ZcashComparisonTile
          before={shots[3]}
          after={shots[4]}
          beforeIndex={3}
          afterIndex={4}
          captionEditor={captionEditor}
          onOpen={onOpen}
        />
        <BentoTile
          shot={shots[1]}
          shotIndex={1}
          spanClassName="col-span-1"
          captionEditor={captionEditor}
          onOpen={onOpen}
        />
        <BentoTile
          shot={shots[5]}
          shotIndex={5}
          spanClassName="col-span-1"
          captionEditor={captionEditor}
          onOpen={onOpen}
        />
        <div className="col-span-1 rounded-[16px] border border-accent/40 bg-[radial-gradient(260px_180px_at_100%_0%,rgba(0,176,154,0.32),transparent_70%)] bg-panel-2 p-3 sm:p-4 flex flex-col justify-end gap-1 sm:gap-1.5 text-left">
          <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[1.6px] text-accent">Chat privado</span>
          <p className="text-[12.5px] sm:text-[14px] leading-snug text-ink font-semibold">
            Avisos en tiempo real de compras y ventas: acciones, ETFs y cripto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(baseGrid, 'lg:grid-cols-[1fr_1fr_1.5fr]')}>
      <BentoTile
        shot={shots[0]}
        shotIndex={0}
        spanClassName="col-span-1 row-span-2"
        captionEditor={captionEditor}
        onOpen={onOpen}
      />
      <BentoTile
        shot={shots[1]}
        shotIndex={1}
        spanClassName="col-span-1 row-span-2"
        captionEditor={captionEditor}
        onOpen={onOpen}
      />
      <BentoTile
        shot={shots[2]}
        shotIndex={2}
        spanClassName="col-span-2 lg:col-span-1 lg:row-span-2"
        captionEditor={captionEditor}
        onOpen={onOpen}
      />
    </div>
  );
}

interface LightboxState {
  shots: Shot[];
  index: number;
}

/**
 * Sección "¿Qué incluye?" debajo del hero: cada parte de la membresía dentro de su tarjeta
 * con mosaico Bento de celdas fijas (sin huecos ni alturas desparejas) y visor al tocar.
 */
export function IncludesDetail() {
  const { isEditing } = useEditMode();
  const { draft, update, commit, replace } = useSiteContentDraft<DetailTexts>('includes.details', DEFAULT_DETAIL_TEXTS);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  // Lo guardado manda, campo por campo, sobre los valores por defecto.
  const textFor = (id: string): DetailText => ({ ...DEFAULT_DETAIL_TEXTS[id], ...draft[id] });
  const patchText = (id: string, patch: Partial<DetailText>) => update({ [id]: { ...textFor(id), ...patch } });
  const replaceText = (id: string, patch: Partial<DetailText>) => replace({ ...draft, [id]: { ...textFor(id), ...patch } });

  useEffect(() => {
    if (!lightbox) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setLightbox(null);
      } else if (event.key === 'ArrowRight') {
        setLightbox((prev) => (prev ? { ...prev, index: (prev.index + 1) % prev.shots.length } : null));
      } else if (event.key === 'ArrowLeft') {
        setLightbox((prev) => (prev ? { ...prev, index: (prev.index - 1 + prev.shots.length) % prev.shots.length } : null));
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightbox]);

  return (
    <section id={HOME_SECTIONS.includes} className="py-24">
      <Container>
        <SectionHeading title={<>¿Qué <span className="text-accent">incluye</span>?</>} />

        <div className="mt-12 lg:mt-16 flex flex-col gap-6 lg:gap-7">
          {DEFAULT_INCLUDE_DETAILS.map((detail) => {
            const text = textFor(detail.id);
            const shots = detail.shots.map((shot, i) => ({ ...shot, caption: text.captions[i] ?? shot.caption }));
            const checkClasses = cn('w-[18px] h-[18px] shrink-0 mt-0.5', detail.bonus ? 'text-highlight' : 'text-accent');
            return (
              <motion.article
                key={detail.id}
                id={`${HOME_SECTIONS.includes}-${detail.index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6 }}
                className={cn(
                  'rounded-[24px] border bg-panel p-5 sm:p-7 lg:p-9 scroll-mt-28',
                  detail.bonus
                    ? 'border-brand-petrol/70 bg-[linear-gradient(180deg,rgba(0,110,150,0.12),transparent_45%)]'
                    : 'border-line'
                )}
              >
                <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr] lg:gap-14 items-start">
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
                        'font-display font-bold text-[clamp(22px,2.6vw,30px)] leading-tight mt-4 text-balance',
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
                      <div className="mt-3">
                        <EditableText
                          label={`Introducción de la parte ${detail.index}`}
                          value={text.intro}
                          onChange={(intro) => patchText(detail.id, { intro })}
                          onCommit={commit}
                          multiline
                          className="text-muted text-[15.5px] leading-relaxed"
                        />
                      </div>
                    ) : (
                      <p className="text-muted text-[15.5px] leading-relaxed mt-3 text-pretty">{text.intro}</p>
                    )}
                  </div>

                  <ul className="flex flex-col gap-3 lg:pt-13">
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

                <BentoSectionGrid
                  detailId={detail.id}
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
                  onOpen={(index) => setLightbox({ shots, index })}
                />
              </motion.article>
            );
          })}
        </div>
      </Container>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Vista ampliada de la captura"
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-[2px] flex items-center justify-center p-4 sm:px-16"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setLightbox(null);
          }}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Cerrar"
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-panel border border-line-strong text-ink hover:border-accent hover:text-accent grid place-items-center text-2xl transition-colors cursor-pointer"
          >
            ×
          </button>
          <button
            type="button"
            onClick={() =>
              setLightbox((prev) =>
                prev ? { ...prev, index: (prev.index - 1 + prev.shots.length) % prev.shots.length } : null
              )
            }
            aria-label="Captura anterior"
            className="absolute bottom-5 left-1/2 -translate-x-13 sm:bottom-auto sm:left-4 sm:top-1/2 sm:translate-x-0 sm:-translate-y-1/2 w-11 h-11 rounded-full bg-panel border border-line-strong text-ink hover:border-accent hover:text-accent grid place-items-center text-2xl transition-colors cursor-pointer"
          >
            ‹
          </button>
          <figure className="m-0 max-w-[min(1100px,100%)] pb-14 sm:pb-0 flex flex-col items-center">
            <img
              src={lightbox.shots[lightbox.index].src}
              alt={lightbox.shots[lightbox.index].alt}
              className="max-w-full max-h-[72vh] sm:max-h-[80vh] rounded-[12px] shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
            />
            <figcaption className="mt-3 text-[13.5px] sm:text-[14px] text-ink-soft text-center">
              {lightbox.shots[lightbox.index].caption} · {lightbox.index + 1} / {lightbox.shots.length}
            </figcaption>
          </figure>
          <button
            type="button"
            onClick={() =>
              setLightbox((prev) => (prev ? { ...prev, index: (prev.index + 1) % prev.shots.length } : null))
            }
            aria-label="Siguiente captura"
            className="absolute bottom-5 left-1/2 translate-x-2 sm:bottom-auto sm:left-auto sm:right-4 sm:top-1/2 sm:translate-x-0 sm:-translate-y-1/2 w-11 h-11 rounded-full bg-panel border border-line-strong text-ink hover:border-accent hover:text-accent grid place-items-center text-2xl transition-colors cursor-pointer"
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}
