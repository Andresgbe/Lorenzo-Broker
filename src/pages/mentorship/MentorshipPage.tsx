import { motion } from 'framer-motion';
import { useAuth } from '../../entities/session';
import { useSiteContentDraft } from '../../entities/site-content';
import { Container } from '../../shared/ui/Container';
import { SectionHeading } from '../../shared/ui/SectionHeading';
import { Button } from '../../shared/ui/Button';
import { EditableText } from '../../shared/ui/EditableText';
import { EditableParagraphs, type Paragraph } from '../../shared/ui/EditableParagraphs';
import { RichText } from '../../shared/ui/RichText';
import { EXTERNAL_LINKS } from '../../shared/config/external-links';

interface MentorshipContent {
  eyebrow: string;
  title: string;
  /** Se muestra en verde, a continuación de `title`. Vacío = sin parte verde. */
  titleAccent: string;
  lead: string;
  paragraphs: Paragraph[];
  closing: string;
  ctaLabel: string;
  ctaNote: string;
}

// Valores por defecto: en cuanto el admin guarda, manda lo que está en site_content ('mentorship.page').
const DEFAULT_MENTORSHIP: MentorshipContent = {
  eyebrow: 'Mentoría 1:1',
  title: 'Mentoría privada',
  titleAccent: '',
  lead: 'No fui rentable durante años.',
  paragraphs: [
    {
      id: '1',
      text: 'Muchísimas horas frente a las pantallas, muchas cuentas quemadas y muchos errores que nadie me advirtió. Ese camino largo es exactamente lo que quiero acortarte.',
    },
    {
      id: '2',
      text: 'En la mentoría 1 a 1 trabajamos los cuatro pilares que a mí me cambiaron el juego: **estadística** para dejar de operar por corazonadas, **psicología** para que tus emociones no manejen tus decisiones, **constancia** para construir un proceso repetible, y **perseverancia** para sostenerlo cuando el mercado se pone difícil.',
    },
    {
      id: '3',
      text: 'La consistencia no se compra ni se regala: se construye. Pero no tienes que construirla solo ni a ciegas.',
    },
  ],
  closing: 'Trabajo con pocas personas a la vez. Si estás listo para dejar de improvisar, aplica — y conversamos.',
  ctaLabel: 'Aplica a la mentoría',
  ctaNote: 'Aplicar no tiene costo ni compromiso · No todas las aplicaciones son aceptadas',
};

const LEAD_CLASSES = 'text-ink text-xl md:text-[22px] font-semibold leading-relaxed';
const PARAGRAPH_CLASSES = 'text-muted text-[17px] md:text-lg leading-relaxed';

export function MentorshipPage() {
  const { isAdmin } = useAuth();
  const { draft, update, commit, replace } = useSiteContentDraft('mentorship.page', DEFAULT_MENTORSHIP);

  return (
    <Container className="py-20 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid gap-12 lg:grid-cols-[minmax(260px,1fr)_minmax(0,1.9fr)] lg:gap-16 xl:gap-24"
      >
        <div className="lg:sticky lg:top-28 lg:self-start">
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
                    label="Título, parte en verde (opcional)"
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
                  {draft.title}
                  {draft.titleAccent && <> <span className="text-accent">{draft.titleAccent}</span></>}
                </>
              }
            />
          )}
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
            paragraphClassName={PARAGRAPH_CLASSES}
            onUpdate={(paragraphs) => update({ paragraphs })}
            onCommit={commit}
            onReplace={(paragraphs) => replace({ ...draft, paragraphs })}
          />

          <div className="mt-12 pt-10 border-t border-line text-center lg:text-left">
            <div className="mb-7">
              {isAdmin ? (
                <EditableText
                  multiline
                  label="Texto de cierre"
                  value={draft.closing}
                  onChange={(closing) => update({ closing })}
                  onCommit={commit}
                  className={PARAGRAPH_CLASSES}
                />
              ) : (
                <p className={PARAGRAPH_CLASSES}>
                  <RichText text={draft.closing} />
                </p>
              )}
            </div>

            {isAdmin ? (
              <div className="max-w-xs mx-auto lg:mx-0">
                <EditableText
                  label="Texto del botón"
                  value={draft.ctaLabel}
                  onChange={(ctaLabel) => update({ ctaLabel })}
                  onCommit={commit}
                  className="font-bold text-[13px] uppercase tracking-[1.2px] text-accent"
                />
              </div>
            ) : (
              <Button href={EXTERNAL_LINKS.mentorshipApplication} variant="primary">
                {draft.ctaLabel}
              </Button>
            )}

            <div className="mt-4">
              {isAdmin ? (
                <EditableText
                  label="Nota bajo el botón"
                  value={draft.ctaNote}
                  onChange={(ctaNote) => update({ ctaNote })}
                  onCommit={commit}
                  className="text-muted text-xs italic"
                />
              ) : (
                <p className="text-muted text-xs italic">{draft.ctaNote}</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Container>
  );
}
