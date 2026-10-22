import { supabase } from '../../../shared/lib/supabaseClient';
import { isValidEmail } from '../../../shared/lib/validation';

// Los valores coinciden con el CHECK de contact_messages.topic (migración 0006).
export const CONTACT_TOPICS = [
  { value: 'duda', label: 'Tengo una duda' },
  { value: 'sugerencia', label: 'Quiero dejar una sugerencia' },
  { value: 'pago_acceso', label: 'Problema con mi pago o mi acceso' },
  { value: 'otro', label: 'Otro tema' },
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number]['value'];

export interface ContactValues {
  name: string;
  email: string;
  phone: string;
  topic: ContactTopic;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 2000;

export const EMPTY_CONTACT_VALUES: ContactValues = {
  name: '',
  email: '',
  phone: '',
  topic: 'duda',
  message: '',
};

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};

  if (values.name.trim().length < 2) {
    errors.name = 'Escribe tu nombre.';
  }

  if (!isValidEmail(values.email)) {
    errors.email = 'Escribe un correo válido para poder responderte.';
  }

  const phone = values.phone.trim();
  if (phone && !/^[+\d][\d\s-]{6,19}$/.test(phone)) {
    errors.phone = 'Solo números, espacios o guiones.';
  }

  const message = values.message.trim();
  if (message.length < MESSAGE_MIN) {
    errors.message = `Cuéntanos un poco más (mínimo ${MESSAGE_MIN} caracteres).`;
  } else if (message.length > MESSAGE_MAX) {
    errors.message = `Máximo ${MESSAGE_MAX} caracteres.`;
  }

  return errors;
}

/** Guarda el mensaje en contact_messages. Sin lectura de vuelta: anon no puede leer la tabla. */
export async function sendContactMessage(values: ContactValues): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Supabase no está configurado en este entorno.' };

  const { error } = await supabase.from('contact_messages').insert({
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim() || null,
    topic: values.topic,
    message: values.message.trim(),
  });

  return { error: error ? 'No pudimos enviar tu mensaje. Inténtalo de nuevo en unos minutos.' : null };
}
