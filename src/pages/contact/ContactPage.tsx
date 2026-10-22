import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ContactForm } from '../../features/contact-form';
import { CONTACT_PHONE } from '../../shared/config/contact';
import { EXTERNAL_LINKS } from '../../shared/config/external-links';
import { ROUTES } from '../../shared/config/routes';
import { Container } from '../../shared/ui/Container';
import { SectionHeading } from '../../shared/ui/SectionHeading';

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function QuestionIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.2a2.6 2.6 0 0 1 5 .9c0 1.7-2.5 2.3-2.5 3.9" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function ChannelRow({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 py-4 first:pt-0 last:pb-0">
      <span className="flex items-center justify-center w-8 h-8 shrink-0 rounded-full bg-accent/10 border border-accent/30 text-accent">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-ink">{title}</p>
        <div className="text-[12.5px] text-muted mt-0.5 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export function ContactPage() {
  return (
    <section className="py-24">
      <Container>
        <SectionHeading
          eyebrow="Contacto"
          title={
            <>
              ¿Tienes una <span className="text-accent">duda</span>?
            </>
          }
          subtitle="Escríbeme tus dudas, sugerencias o cualquier problema con tu pago o tu acceso. Leo cada mensaje y te respondo por correo."
        />

        {/* El formulario va centrado en la página; Otros canales, más chico, a su derecha.
            La primera columna queda vacía a propósito para que el centro sea el de la página.
            Por debajo de xl va todo en una columna centrada. */}
        <div className="grid gap-6 xl:grid-cols-[1fr_minmax(0,640px)_1fr] mt-14 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[640px] mx-auto xl:col-start-2 bg-panel border border-line rounded-[18px] p-6 sm:p-8"
          >
            <h2 className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent mb-6">Escríbeme</h2>
            <ContactForm />
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-[640px] mx-auto xl:max-w-[280px] xl:mx-0 bg-panel border border-line rounded-[18px] p-5"
          >
            <h2 className="text-[10.5px] font-bold uppercase tracking-[2.6px] text-accent mb-4">Otros canales</h2>
            <div className="flex flex-col divide-y divide-line">
              {CONTACT_PHONE && (
                <ChannelRow icon={<PhoneIcon className="w-[18px] h-[18px]" />} title="Teléfono y WhatsApp">
                  <a href={`tel:+${CONTACT_PHONE.e164}`} className="block text-[16px] font-semibold text-ink hover:text-accent transition-colors">
                    {CONTACT_PHONE.display}
                  </a>
                  <a
                    href={`https://wa.me/${CONTACT_PHONE.e164}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline"
                  >
                    Escribir por WhatsApp
                  </a>
                </ChannelRow>
              )}

              <ChannelRow icon={<InstagramIcon className="w-[18px] h-[18px]" />} title="Instagram">
                <a href={EXTERNAL_LINKS.instagram} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                  @lorenzobroker
                </a>
              </ChannelRow>

              <ChannelRow icon={<QuestionIcon className="w-[18px] h-[18px]" />} title="Preguntas frecuentes">
                Puede que tu duda ya tenga respuesta.{' '}
                <Link to={ROUTES.faq} className="text-accent hover:underline">
                  Ver las preguntas
                </Link>
              </ChannelRow>
            </div>
          </motion.aside>
        </div>
      </Container>
    </section>
  );
}
