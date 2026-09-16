import { motion } from 'framer-motion';
import { Container } from '../../shared/ui/Container';
import { SectionHeading } from '../../shared/ui/SectionHeading';
import deskPhoto from '../../shared/assets/images/wallstreet1.jpg';
import pressClipping from '../../shared/assets/images/wallstreet2.jpg';

const BIO_PARAGRAPHS = [
  'Emigré a Estados Unidos en 2008. Me gradué en Business Administration con mención en Finanzas por la University of Central Florida y completé el programa de Wealth Management en Wharton Business School. Lo que empezó como una pasantía terminó en Wall Street, con Aegis Capital — y a los 21 años me convertí en corredor de bolsa de Nueva York. A los 25 me independicé.',
  'He tenido licencia como corredor de bolsa en Estados Unidos, Panamá y Venezuela. He operado acciones, opciones, cripto y CFDs durante todos estos años.',
  'También quebré cuentas cuando empezaba. Y créeme: de ahí aprendí más que de cualquier clase. Por eso en mi comunidad vas a ver la operativa completa — las ganadoras y las perdedoras — no una selección de capturas verdes.',
  'Toda esa experiencia, la de los títulos y la de los golpes, es lo que comparto contigo aquí.',
];

export function AboutPage() {
  return (
    <Container className="py-20 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid gap-12 lg:grid-cols-[minmax(300px,1.35fr)_minmax(0,1.65fr)] lg:gap-16 xl:gap-20"
      >
        <div className="flex flex-col gap-9">
          <SectionHeading
            align="left"
            eyebrow="Sobre mí"
            title={<>Lorenzo <span className="text-accent">Pérez</span></>}
          />

          <figure className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <img
                src={deskPhoto}
                alt="Lorenzo Pérez en la mesa de operaciones, frente a las pantallas de cotizaciones"
                loading="lazy"
                className="w-full aspect-[5/4] object-cover rounded-xl border border-line"
              />
              <img
                src={pressClipping}
                alt="Recorte de prensa: Lorenzo Pérez junto al toro de Wall Street"
                loading="lazy"
                className="w-full aspect-[5/4] object-cover rounded-xl border border-line"
              />
            </div>
            <figcaption className="text-muted text-xs leading-relaxed">
              En la mesa de operaciones y en Wall Street, durante su pasantía en Aegis Capital.
            </figcaption>
          </figure>
        </div>

        <div>
          <p className="text-ink text-xl md:text-[22px] font-semibold leading-relaxed mb-7">
            Soy Lorenzo Pérez y llevo más de 15 años dentro de los mercados.
          </p>

          <div className="grid gap-5">
            {BIO_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph} className="text-muted text-[17px] md:text-lg leading-relaxed text-justify hyphens-auto">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </motion.div>
    </Container>
  );
}
