/**
 * Bot de Telegram de Lorenzo: cobra la membresía en USDT con Crypto Pay y da acceso al canal
 * privado. Es un sistema aparte (repo lorenzo-bot); la web solo enlaza a él.
 */
export const TELEGRAM_BOT_URL = 'https://t.me/BrokerLorenzoBot';

/** Enlace al bot con el origen en ?start=, para que el bot sepa de dónde llega cada persona. */
export function telegramBotLink(source: 'web' | 'instagram' | 'youtube' = 'web') {
  return `${TELEGRAM_BOT_URL}?start=${source}`;
}
