import { motion } from 'framer-motion';
import { HOME_SECTIONS } from '../../shared/config/routes';
import { Container } from '../../shared/ui/Container';
import { SectionHeading } from '../../shared/ui/SectionHeading';
import { BenefitCard, type Benefit } from '../../entities/benefit';

const INCLUDES_DATA: Benefit[] = [
  {
    id: '1',
    title: 'Trading en vivo — 2 días a la semana',
    description:
      'Sesiones por Zoom en la apertura del mercado: el plan, la ejecución y el porqué de cada decisión. Todas quedan grabadas.',
  },
  {
    id: '2',
    title: 'Señales SWING + análisis diario',
    description:
      'Señales de compra y venta swing con entrada, salida y tesis. Además, todos los días: pre-market, noticias y trade recaps de la jornada.',
  },
  {
    id: '3',
    title: '1 webinar y 1 Q&A cada mes',
    description:
      'Un tema a fondo cada mes (brokers desde LatAm, gestión de riesgo, análisis técnico) y una sesión en vivo para responder todas tus preguntas.',
  },
  {
    id: '4',
    title: 'Librería de cursos, libros y PDF',
    description: 'Material organizado para avanzar a tu ritmo, más todas las repeticiones de vivos y webinars.',
  },
  {
    id: '5',
    title: 'Bonus: Close Friends de Instagram',
    description:
      'Contenido exclusivo de bolsa y de mi vida personal — el detrás de cámaras de mi día a día como corredor.',
    bonus: true,
  },
  {
    id: '6',
    title: 'Bonus: Copytrading en Binance',
    description: 'Acceso para copiar mis trades en Binance, con documentación transparente de la operativa. Alto riesgo.',
    bonus: true,
  },
];

export function IncludesSection() {
  return (
    <section id={HOME_SECTIONS.includes} className="py-24">
      <Container>
        <SectionHeading title={<>¿Qué <span className="text-accent">incluye</span>?</>} />
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INCLUDES_DATA.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <BenefitCard benefit={item} index={index + 1} />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
