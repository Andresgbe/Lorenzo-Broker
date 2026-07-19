import { motion } from 'framer-motion';
import { HOME_SECTIONS } from '../../shared/config/routes';
import { Container } from '../../shared/ui/Container';
import { SectionHeading } from '../../shared/ui/SectionHeading';
import { SubscribeButton } from '../../features/subscribe-cta';
import { cn } from '../../shared/lib/cn';

const PRICE_ITEMS = [
  { label: 'Trading en vivo 2 días a la semana (grabado)' },
  { label: 'Señales swing + pre-market y recaps diarios' },
  { label: 'Webinar + Q&A mensual' },
  { label: 'Librería completa de cursos, libros y PDF' },
  { label: 'Bonus: Close Friends de Instagram', bonus: true },
  { label: 'Bonus: Copytrading en Binance', bonus: true },
];

function CheckIcon({ bonus }: { bonus?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5">
      <circle cx="10" cy="10" r="9" stroke={bonus ? '#f2b636' : '#25e98a'} strokeWidth="1.6" />
      <path d="M6 10.5 L9 13 L14 7.5" stroke={bonus ? '#f2b636' : '#25e98a'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PricingSection() {
  return (
    <section id={HOME_SECTIONS.pricing} className="py-24 bg-bg-2 border-y border-line">
      <Container>
        <SectionHeading eyebrow="Suscripción" title={<>Un solo plan. <span className="text-accent">Todo incluido.</span></>} />

        <div className="mt-16 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[460px] bg-panel border border-accent/40 rounded-[22px] px-10 py-11 text-center shadow-[0_0_60px_rgba(37,233,138,0.08)]"
          >
            <div className="text-xs font-bold tracking-[3px] uppercase text-accent">Comunidad Lorenzo Broker</div>
            <div className="font-display font-extrabold text-[56px] mt-4 mb-1 text-ink">
              $97<small className="text-lg text-muted font-body font-medium">/mes</small>
            </div>
            <div className="text-muted text-[13.5px] mb-7">Sin permanencia. Cancela cuando quieras.</div>

            <div className="text-left grid gap-3 mb-8">
              {PRICE_ITEMS.map((item) => (
                <div key={item.label} className={cn('flex gap-3 items-start text-[14.5px] text-[#c6cedb]')}>
                  <CheckIcon bonus={item.bonus} />
                  {item.label}
                </div>
              ))}
            </div>

            <SubscribeButton label="Suscríbete ahora" className="w-full" />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
