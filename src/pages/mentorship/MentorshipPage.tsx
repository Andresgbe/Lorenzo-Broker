import { motion } from 'framer-motion';
import { Container } from '../../shared/ui/Container';
import { SectionHeading } from '../../shared/ui/SectionHeading';
import { Button } from '../../shared/ui/Button';
import { EXTERNAL_LINKS } from '../../shared/config/external-links';

function Pillar({ children }: { children: string }) {
  return <strong className="text-ink font-semibold">{children}</strong>;
}

export function MentorshipPage() {
  return (
    <Container className="py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <SectionHeading eyebrow="Mentoría 1:1" title="Mentoría privada" />

        <p className="text-ink text-xl font-semibold leading-relaxed mt-10 mb-6">
          No fui rentable durante años.
        </p>

        <div className="grid gap-5">
          <p className="text-muted text-lg leading-relaxed">
            Muchísimas horas frente a las pantallas, muchas cuentas quemadas y muchos errores que nadie me
            advirtió. Ese camino largo es exactamente lo que quiero acortarte.
          </p>
          <p className="text-muted text-lg leading-relaxed">
            En la mentoría 1 a 1 trabajamos los cuatro pilares que a mí me cambiaron el juego:{' '}
            <Pillar>estadística</Pillar> para dejar de operar por corazonadas, <Pillar>psicología</Pillar> para
            que tus emociones no manejen tus decisiones, <Pillar>constancia</Pillar> para construir un proceso
            repetible, y <Pillar>perseverancia</Pillar> para sostenerlo cuando el mercado se pone difícil.
          </p>
          <p className="text-muted text-lg leading-relaxed">
            La consistencia no se compra ni se regala: se construye. Pero no tienes que construirla solo ni a
            ciegas.
          </p>
        </div>

        <div className="mt-12 pt-10 border-t border-line text-center">
          <p className="text-muted text-lg leading-relaxed mb-7">
            Trabajo con pocas personas a la vez. Si estás listo para dejar de improvisar, aplica — y
            conversamos.
          </p>
          <Button href={EXTERNAL_LINKS.mentorshipApplication} variant="primary">
            Aplica a la mentoría
          </Button>
          <p className="text-muted text-xs italic mt-4">
            Aplicar no tiene costo ni compromiso · No todas las aplicaciones son aceptadas
          </p>
        </div>
      </motion.div>
    </Container>
  );
}
