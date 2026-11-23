import { motion } from 'framer-motion';
import { HOME_SECTIONS } from '../../shared/config/routes';
import { Container } from '../../shared/ui/Container';
import { Button } from '../../shared/ui/Button';
import { EditableText } from '../../shared/ui/EditableText';
import { RichText } from '../../shared/ui/RichText';
import { SubscribeButton } from '../../features/subscribe-cta';
import { VideoPlayer } from '../../features/video-player';
import { useEditMode } from '../../features/edit-mode';
import { useSiteContentDraft, useSiteContentField } from '../../entities/site-content';
import logoNegativo from '../../shared/assets/images/logo-lorenzo-broker-negativo.png';
import { HeroVideoEditor, type HeroVideo } from './HeroVideoEditor';

interface HeroStat {
  value: string;
  label: string;
}

interface HeroContent {
  /** `**palabra**` se resalta en verde. */
  title: string;
  subtitle: string;
  stats: HeroStat[];
}

// Valores por defecto: en cuanto el admin guarda, manda lo que está en site_content ('hero.content').
const DEFAULT_HERO: HeroContent = {
  title: 'Aprende bolsa con un **corredor real**, operando en vivo.',
  subtitle:
    'Trading en vivo dos días a la semana, señales swing con tesis completa y una comunidad en español donde ves el plan, la ejecución y el porqué de cada decisión.',
  stats: [
    { value: '2×', label: 'sesiones en vivo\npor semana' },
    { value: '100%', label: 'en español,\ndesde LatAm' },
    { value: '24/7', label: 'clases grabadas\nsiempre disponibles' },
  ],
};

export function Hero() {
  const { isEditing } = useEditMode();
  const { draft, update, commit } = useSiteContentDraft('hero.content', DEFAULT_HERO);
  // 'hero.video' en site_content: null mientras nadie haya puesto un video de Bunny.
  const { value: video, setValue: saveVideo } = useSiteContentField<HeroVideo | null>('hero.video', null);

  const updateStat = (index: number, patch: Partial<HeroStat>) =>
    update({ stats: draft.stats.map((stat, i) => (i === index ? { ...stat, ...patch } : stat)) });

  return (
    <section
      id={HOME_SECTIONS.hero}
      className="pt-16 sm:pt-[110px] pb-16 sm:pb-[90px] bg-[radial-gradient(900px_420px_at_70%_-10%,rgba(0,110,150,0.22),transparent_60%),radial-gradient(700px_380px_at_10%_110%,rgba(40,51,128,0.30),transparent_60%)]"
    >
      <Container className="flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-5xl bg-panel border border-line rounded-[20px] p-4 sm:p-7 shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
        >
          {video ? (
            <VideoPlayer
              key={`${video.libraryId}/${video.videoId}`}
              source={{ type: 'bunny-public', libraryId: video.libraryId, videoId: video.videoId }}
              title="Video de bienvenida"
              className="w-full rounded-xl overflow-hidden"
            />
          ) : (
            // Mientras no haya video de Bunny: tarjeta de marca (luego, la foto de Lorenzo).
            <div className="aspect-video w-full rounded-xl flex items-center justify-center bg-[radial-gradient(600px_300px_at_70%_0%,rgba(0,110,150,0.35),transparent_65%),radial-gradient(500px_300px_at_20%_110%,rgba(40,51,128,0.45),transparent_65%)] bg-panel-2">
              <img src={logoNegativo} alt="Lorenzo Broker" className="h-auto w-[55%] max-w-[420px] object-contain" />
            </div>
          )}
          {isEditing && <HeroVideoEditor video={video} onSave={saveVideo} />}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          className="w-full mt-12"
        >
          <h1 className="font-display font-bold text-[clamp(32px,4.8vw,56px)] leading-[1.12] text-ink text-pretty w-full">
            {isEditing ? (
              <EditableText
                label="Título (usa **palabra** para resaltarla en verde)"
                value={draft.title}
                onChange={(title) => update({ title })}
                onCommit={commit}
                multiline
                className="text-center"
              />
            ) : (
              <RichText text={draft.title} strongClassName="text-accent font-bold" />
            )}
          </h1>
          <div className="text-muted text-[17px] sm:text-lg mt-6 mb-9 max-w-5xl mx-auto">
            {isEditing ? (
              <EditableText
                label="Descripción"
                value={draft.subtitle}
                onChange={(subtitle) => update({ subtitle })}
                onCommit={commit}
                multiline
                className="text-center"
              />
            ) : (
              <p>{draft.subtitle}</p>
            )}
          </div>
          <div className="flex gap-4 flex-wrap justify-center">
            <SubscribeButton label="Suscríbete ahora" />
            <Button href={`#${HOME_SECTIONS.includes}`} variant="ghost">
              Ver qué incluye
            </Button>
          </div>
          <div className={isEditing ? 'mt-12 grid grid-cols-1 gap-4 sm:flex sm:flex-wrap sm:justify-center sm:gap-10' : 'mt-12 grid grid-cols-3 gap-4 sm:flex sm:flex-wrap sm:justify-center sm:gap-10'}>
            {draft.stats.map((stat, index) => (
              <div key={index}>
                {isEditing ? (
                  <>
                    <EditableText
                      label={`Cifra ${index + 1}`}
                      value={stat.value}
                      onChange={(value) => updateStat(index, { value })}
                      onCommit={commit}
                      className="font-display text-[28px] font-bold text-accent text-center"
                    />
                    <EditableText
                      label={`Texto de la cifra ${index + 1}`}
                      value={stat.label}
                      onChange={(label) => updateStat(index, { label })}
                      onCommit={commit}
                      multiline
                      className="text-[13px] text-muted text-center"
                    />
                  </>
                ) : (
                  <>
                    <b className="block font-display text-[28px] text-accent">{stat.value}</b>
                    <span className="text-[13px] text-muted whitespace-pre-line">{stat.label}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
