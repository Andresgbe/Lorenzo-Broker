import { motion } from 'framer-motion';
import { HOME_SECTIONS } from '../../shared/config/routes';
import { Container } from '../../shared/ui/Container';
import { Button } from '../../shared/ui/Button';

export function ClosingCta() {
  return (
    <section className="py-24 text-center bg-[radial-gradient(700px_300px_at_50%_0%,rgba(37,233,138,0.10),transparent_65%)] bg-bg-2 border-t border-line">
      <Container>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="font-display font-bold text-[clamp(32px,4.6vw,46px)] leading-[1.15] text-ink"
        >
          Opera con un plan.
          <br />
          Aprende con <span className="text-accent">alguien que opera</span>.
        </motion.h2>

        <Button href={`#${HOME_SECTIONS.pricing}`} variant="primary" className="mt-9">
          Únete a la comunidad
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-[820px] mx-auto mt-14 px-6 py-5 border border-line rounded-2xl bg-panel text-muted text-[12.5px] text-left"
        >
          <b className="text-[#c6cedb]">Aviso de riesgo.</b> El contenido de esta comunidad es exclusivamente educativo y
          no constituye asesoría financiera ni recomendación de inversión. Operar en los mercados financieros,
          incluyendo acciones, futuros y criptomonedas, implica un riesgo elevado de pérdida de capital. Los
          resultados pasados no garantizan resultados futuros. Cada miembro es responsable de sus propias
          decisiones. Invierte solo capital que puedas permitirte perder.
        </motion.div>
      </Container>
    </section>
  );
}
