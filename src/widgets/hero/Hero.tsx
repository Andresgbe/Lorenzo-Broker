import { motion } from 'framer-motion';
import { HOME_SECTIONS } from '../../shared/config/routes';
import { Container } from '../../shared/ui/Container';
import { Button } from '../../shared/ui/Button';
import { SubscribeButton } from '../../features/subscribe-cta';
import { VideoPlayer } from '../../features/video-player';

const STATS = [
  { value: '2×', label: 'sesiones en vivo\npor semana' },
  { value: '100%', label: 'en español,\ndesde LatAm' },
  { value: '24/7', label: 'comunidad activa\nen Discord' },
];

export function Hero() {
  return (
    <section
      id={HOME_SECTIONS.hero}
      className="pt-[110px] pb-[90px] bg-[radial-gradient(900px_420px_at_70%_-10%,rgba(37,233,138,0.09),transparent_60%),radial-gradient(700px_380px_at_10%_110%,rgba(37,233,138,0.05),transparent_60%)]"
    >
      <Container className="flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-4xl bg-panel border border-line rounded-[20px] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
        >
          <VideoPlayer
            source={{ type: 'placeholder' }}
            title="Video de bienvenida"
            className="w-full rounded-xl overflow-hidden"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          className="w-full mt-12"
        >
          <h1 className="font-display font-extrabold text-[clamp(38px,5.4vw,58px)] leading-[1.12] text-ink">
            Aprende bolsa con un <span className="text-accent">corredor real</span>, operando en vivo.
          </h1>
          <p className="text-muted text-lg mt-6 mb-9 max-w-3xl mx-auto">
            Trading en vivo dos días a la semana, señales swing con tesis completa y una comunidad en
            español donde ves el plan, la ejecución y el porqué de cada decisión.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <SubscribeButton label="Suscríbete ahora" />
            <Button href={`#${HOME_SECTIONS.includes}`} variant="ghost">
              Ver qué incluye
            </Button>
          </div>
          <div className="flex gap-10 flex-wrap justify-center mt-12">
            {STATS.map((stat) => (
              <div key={stat.value}>
                <b className="block font-display text-[28px] text-accent">{stat.value}</b>
                <span className="text-[13px] text-muted whitespace-pre-line">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
