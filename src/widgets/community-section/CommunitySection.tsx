import { motion } from 'framer-motion';
import { HOME_SECTIONS } from '../../shared/config/routes';
import { Container } from '../../shared/ui/Container';
import { SectionHeading } from '../../shared/ui/SectionHeading';
import { cn } from '../../shared/lib/cn';

interface Channel {
  label: string;
  active?: boolean;
}

const SIDEBAR: { category: string; channels: Channel[] }[] = [
  {
    category: 'Lorenzo escribe aquí',
    channels: [
      { label: 'señales-swing', active: true },
      { label: 'pre-market', active: true },
      { label: 'noticias-del-dia' },
      { label: 'trade-recaps' },
      { label: 'links-zoom-en-vivo' },
    ],
  },
  {
    category: 'Eventos',
    channels: [{ label: 'webinar-mensual' }, { label: 'preguntas-qa' }],
  },
  {
    category: 'Educación',
    channels: [{ label: 'libreria-cursos' }, { label: 'libros-pdf' }, { label: 'repeticiones' }],
  },
  {
    category: 'Bonus',
    channels: [{ label: 'copytrading-binance', active: true }],
  },
];

const CHANNEL_DETAILS = [
  {
    label: 'señales-swing',
    description: 'Señales de compra y venta swing con entrada, salida y tesis, y registro público de resultados.',
  },
  {
    label: 'pre-market',
    description: 'Todos los días antes de la campana: los tickers en mi radar, niveles clave y escenarios.',
  },
  {
    label: 'trade-recaps',
    description: 'El resumen de la jornada: qué se hizo bien, qué se hizo mal y qué aprendemos.',
  },
  {
    label: 'links-zoom-en-vivo',
    description: 'Trading en vivo por Zoom 2 días a la semana. Todo queda grabado.',
  },
  {
    label: 'copytrading-binance',
    description: 'BONUS: acceso para copiar mis trades en Binance, con documentación transparente.',
  },
];

export function CommunitySection() {
  return (
    <section id={HOME_SECTIONS.community} className="py-24 bg-bg-2 border-y border-line">
      <Container>
        <SectionHeading eyebrow="La comunidad" title={<>¿Qué hay dentro de <span className="text-accent">mi Discord</span>?</>} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mt-16 grid grid-cols-1 lg:grid-cols-[280px_1fr] bg-panel border border-line rounded-[20px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
        >
          <aside aria-hidden="true" className="bg-bg-2 border-b lg:border-b-0 lg:border-r border-line px-5 py-6">
            <div className="flex items-center gap-2.5 font-bold text-sm tracking-[0.6px] pb-4 border-b border-line mb-4">
              <span className="w-[26px] h-[26px] rounded-lg bg-accent/10 flex items-center justify-center text-[13px]">📊</span>
              LORENZO BROKER
            </div>
            {SIDEBAR.map((group) => (
              <div key={group.category}>
                <div className="text-[10.5px] font-bold tracking-[2px] text-muted uppercase mt-5 mb-2">
                  {group.category}
                </div>
                {group.channels.map((ch) => (
                  <div
                    key={ch.label}
                    className={cn(
                      'flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg text-[#aab4c5]',
                      ch.active && 'text-accent bg-accent/10'
                    )}
                  >
                    <span className="text-[#5b6577] font-semibold">#</span> {ch.label}
                  </div>
                ))}
              </div>
            ))}
          </aside>

          <div className="px-6 py-9 lg:px-10 grid gap-1.5">
            {CHANNEL_DETAILS.map((item, index) => (
              <div key={item.label} className={cn('py-5', index < CHANNEL_DETAILS.length - 1 && 'border-b border-line')}>
                <h4 className="flex items-center gap-2 text-[15px] font-bold tracking-[1.2px] uppercase text-ink">
                  <span className="text-accent">#</span> {item.label}
                </h4>
                <p className="text-muted text-[15px] mt-2">{item.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
