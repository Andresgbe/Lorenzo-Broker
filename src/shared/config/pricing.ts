/**
 * ÚNICA fuente de los precios de la membresía. Cambia los valores aquí y se actualizan en toda la
 * web: la portada y las tarjetas de precios, el checkout y la renovación, el resumen, el ahorro del
 * plan anual y el monto sugerido al registrar un pago manual.
 *
 * Dinero en céntimos enteros (así lo pide el spec). Deben coincidir con el bot de Telegram
 * (lorenzo-bot, PRICE_MENSUAL / PRICE_ANUAL) y con la tabla `plans` de la BD (price_usd_cents):
 * si cambias un precio, corre también una migración que lo actualice (ver 0015_update_prices.sql).
 */
export const MONTHLY_PRICE_USD_CENTS = 2777;
export const ANNUAL_PRICE_USD_CENTS = 27777;

/** En dólares, para mostrar. */
export const MONTHLY_PRICE_USD = MONTHLY_PRICE_USD_CENTS / 100;
export const ANNUAL_PRICE_USD = ANNUAL_PRICE_USD_CENTS / 100;
