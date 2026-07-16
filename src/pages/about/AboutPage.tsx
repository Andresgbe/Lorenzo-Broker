import { motion } from 'framer-motion';
import { Container } from '../../shared/ui/Container';

export function AboutPage() {
  return (
    <Container className="py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-white mb-6">Sobre mí</h1>
        <p className="text-neutral-400 text-lg leading-relaxed">
          Este es un párrafo placeholder para la página "Sobre mí". Aquí irá el contenido detallado de tu historia y experiencia.
        </p>
      </motion.div>
    </Container>
  );
}
