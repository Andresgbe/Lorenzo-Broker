import { motion } from 'framer-motion';
import { HOME_SECTIONS } from '../../shared/config/routes';
import { Container } from '../../shared/ui/Container';
import { SubscribeButton } from '../../features/subscribe-cta';
import { VideoPlayer } from '../../features/video-player';

export function Hero() {
  return (
    <section id={HOME_SECTIONS.hero} className="py-20 lg:py-32">
      <Container className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-start gap-8"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Bienvenido a mi{' '}
            <span className="text-accent">
              única comunidad
            </span>
            , donde comparto todo lo que sé sobre la bolsa de valores, economía y dinero
          </h1>
          <SubscribeButton />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        >
          <VideoPlayer 
            source={{ type: 'youtube', videoId: 'REPLACE_ME' }}
            title="Video de bienvenida"
            className="w-full shadow-2xl border border-white/5"
          />
        </motion.div>
      </Container>
    </section>
  );
}
