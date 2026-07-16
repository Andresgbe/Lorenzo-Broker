import { motion } from 'framer-motion';
import { HOME_SECTIONS } from '../../shared/config/routes';
import { Container } from '../../shared/ui/Container';
import { BenefitCard, type Benefit } from '../../entities/benefit';

const BENEFITS_DATA: Benefit[] = [
  { id: '1', icon: '📈', title: 'Pre-mercado y análisis', description: 'Preparación diaria antes de la apertura del mercado.' },
  { id: '2', icon: '📰', title: 'Noticias del día', description: 'Información relevante que mueve los mercados.' },
  { id: '3', icon: '🔍', title: 'Análisis de empresas', description: 'Desglose fundamental y técnico de acciones específicas.' },
  { id: '4', icon: '🎯', title: 'Compañías posible swing', description: 'Oportunidades de inversión a corto y mediano plazo.' },
  { id: '5', icon: '🎙️', title: 'Llamadas en vivo', description: 'Sesiones interactivas para responder dudas y analizar el mercado.' },
  { id: '6', icon: '📚', title: 'Educación desde cero', description: 'Material didáctico para aprender a invertir desde lo básico.' },
];

export function BenefitsSection() {
  return (
    <section id={HOME_SECTIONS.benefits} className="py-24 bg-neutral-950">
      <Container>
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            ¿Qué hay en la comunidad?
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS_DATA.map((benefit, index) => (
            <motion.div
              key={benefit.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full"
            >
              <BenefitCard benefit={benefit} className="h-full" />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
