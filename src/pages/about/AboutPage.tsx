import { motion } from 'framer-motion';
import { useAuth } from '../../entities/session';
import { useSiteContentDraft } from '../../entities/site-content';
import { Container } from '../../shared/ui/Container';
import { SectionHeading } from '../../shared/ui/SectionHeading';
import { EditableText } from '../../shared/ui/EditableText';
import { EditableParagraphs, type Paragraph } from '../../shared/ui/EditableParagraphs';
import deskPhoto from '../../shared/assets/images/wallstreet1.jpg';
import pressClipping from '../../shared/assets/images/wallstreet2.jpg';

interface AboutContent {
  eyebrow: string;
  title: string;
  /** Se muestra en verde, a continuación de `title`. */
  titleAccent: string;
  caption: string;
  lead: string;
  paragraphs: Paragraph[];
}

// Valores por defecto: en cuanto el admin guarda, manda lo que está en site_content ('about.page').
const DEFAULT_ABOUT: AboutContent = {
  eyebrow: 'Sobre mí',
  title: 'Lorenzo',
  titleAccent: 'Pérez',
  caption: 'En la mesa de operaciones y en Wall Street, durante su pasantía en Aegis Capital.',
  lead: 'Soy Lorenzo Pérez y llevo más de 15 años dentro de los mercados.',
  paragraphs: [
    {
      id: '1',
      text: 'Emigré a Estados Unidos en 2008. Me gradué en Business Administration con mención en Finanzas por la University of Central Florida y completé el programa de Wealth Management en Wharton Business School. Lo que empezó como una pasantía terminó en Wall Street, con Aegis Capital — y a los 21 años me convertí en corredor de bolsa de Nueva York. A los 25 me independicé.',
    },
    {
      id: '2',
      text: 'He tenido licencia como corredor de bolsa en Estados Unidos, Panamá y Venezuela. He operado acciones, opciones, cripto y CFDs durante todos estos años.',
    },
    {
      id: '3',
      text: 'También quebré cuentas cuando empezaba. Y créeme: de ahí aprendí más que de cualquier clase. Por eso en mi comunidad vas a ver la operativa completa — las ganadoras y las perdedoras — no una selección de capturas verdes.',
    },
    {
      id: '4',
      text: 'Toda esa experiencia, la de los títulos y la de los golpes, es lo que comparto contigo aquí.',
    },
  ],
};

const LEAD_CLASSES = 'text-ink text-xl md:text-[22px] font-semibold leading-relaxed';
const PARAGRAPH_CLASSES = 'text-muted text-[17px] md:text-lg leading-relaxed';

export function AboutPage() {
  const { isAdmin } = useAuth();
  const { draft, update, commit, replace } = useSiteContentDraft('about.page', DEFAULT_ABOUT);

  return (
    <Container className="py-20 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid gap-12 lg:grid-cols-[minmax(300px,1.35fr)_minmax(0,1.65fr)] lg:gap-16 xl:gap-20"
      >
        <div className="flex flex-col gap-9">
          {isAdmin ? (
            <SectionHeading
              align="left"
              eyebrow={
                <EditableText label="Antetítulo" value={draft.eyebrow} onChange={(eyebrow) => update({ eyebrow })} onCommit={commit} />
              }
              title={
                <span className="flex flex-col gap-2">
                  <EditableText label="Título" value={draft.title} onChange={(title) => update({ title })} onCommit={commit} />
                  <EditableText
                    label="Título, parte en verde"
                    value={draft.titleAccent}
                    onChange={(titleAccent) => update({ titleAccent })}
                    onCommit={commit}
                    className="text-accent"
                  />
                </span>
              }
            />
          ) : (
            <SectionHeading
              align="left"
              eyebrow={draft.eyebrow}
              title={
                <>
                  {draft.title} <span className="text-accent">{draft.titleAccent}</span>
                </>
              }
            />
          )}

          <figure className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <img
                src={deskPhoto}
                alt="Lorenzo Pérez en la mesa de operaciones, frente a las pantallas de cotizaciones"
                loading="lazy"
                className="w-full aspect-[5/4] object-cover rounded-xl border border-line"
              />
              <img
                src={pressClipping}
                alt="Recorte de prensa: Lorenzo Pérez junto al toro de Wall Street"
                loading="lazy"
                className="w-full aspect-[5/4] object-cover rounded-xl border border-line"
              />
            </div>
            <figcaption className="text-muted text-xs leading-relaxed">
              {isAdmin ? (
                <EditableText
                  multiline
                  label="Pie de foto"
                  value={draft.caption}
                  onChange={(caption) => update({ caption })}
                  onCommit={commit}
                />
              ) : (
                draft.caption
              )}
            </figcaption>
          </figure>
        </div>

        <div>
          {isAdmin && (
            <p className="text-[12.5px] text-muted mb-6">
              Modo edición: cada cambio se guarda al salir del campo. Escribe <span className="text-ink">**así**</span> para
              resaltar una palabra.
            </p>
          )}

          <div className="mb-7">
            {isAdmin ? (
              <EditableText
                multiline
                label="Frase principal"
                value={draft.lead}
                onChange={(lead) => update({ lead })}
                onCommit={commit}
                className={LEAD_CLASSES}
              />
            ) : (
              <p className={LEAD_CLASSES}>{draft.lead}</p>
            )}
          </div>

          <EditableParagraphs
            paragraphs={draft.paragraphs}
            editable={isAdmin}
            paragraphClassName={isAdmin ? PARAGRAPH_CLASSES : `${PARAGRAPH_CLASSES} text-justify hyphens-auto`}
            onUpdate={(paragraphs) => update({ paragraphs })}
            onCommit={commit}
            onReplace={(paragraphs) => replace({ ...draft, paragraphs })}
          />
        </div>
      </motion.div>
    </Container>
  );
}
