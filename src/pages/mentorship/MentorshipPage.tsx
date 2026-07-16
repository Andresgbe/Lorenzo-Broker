import { motion } from 'framer-motion';
import { Container } from '../../shared/ui/Container';
import { SubscribeButton } from '../../features/subscribe-cta';

export function MentorshipPage() {
  return (
    <Container className="py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto text-center"
      >
        <h1 className="text-4xl font-bold text-white mb-6">Mentoría privada</h1>
        <p className="text-neutral-400 text-lg leading-relaxed mb-8">
          Este es un párrafo placeholder para la página "Mentoría privada". Aquí irá la descripción del programa.
        </p>
        <SubscribeButton label="Aplicar ahora" />
      </motion.div>
    </Container>
  );
}
