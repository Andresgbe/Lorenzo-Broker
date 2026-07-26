import { motion } from 'framer-motion';
import { Container } from '../../shared/ui/Container';
import { SectionHeading } from '../../shared/ui/SectionHeading';

const BIO_PARAGRAPHS = [
  'Emigré a Estados Unidos en 2008. Me gradué en Business Administration con mención en Finanzas por la University of Central Florida y completé el programa de Wealth Management en Wharton Business School. Lo que empezó como una pasantía terminó en Wall Street, con Aegis Capital — y a los 21 años me convertí en corredor de bolsa de Nueva York. A los 25 me independicé.',
  'He tenido licencia como corredor de bolsa en Estados Unidos, Panamá y Venezuela. He operado acciones, opciones, cripto y CFDs durante todos estos años.',
  'También quebré cuentas cuando empezaba. Y créeme: de ahí aprendí más que de cualquier clase. Por eso en mi comunidad vas a ver la operativa completa — las ganadoras y las perdedoras — no una selección de capturas verdes.',
  'Toda esa experiencia, la de los títulos y la de los golpes, es lo que comparto contigo aquí.',
];

export function AboutPage() {
  return (
    <Container className="py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <SectionHeading eyebrow="Sobre mí" title={<>Lorenzo <span className="text-accent">Pérez</span></>} />

        <p className="text-ink text-xl font-semibold leading-relaxed mt-10 mb-6">
          Soy Lorenzo Pérez y llevo más de 15 años dentro de los mercados.
        </p>

        <div className="grid gap-5">
          {BIO_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph} className="text-muted text-lg leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </motion.div>
    </Container>
  );
}
