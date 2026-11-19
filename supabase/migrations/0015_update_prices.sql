-- Precios vigentes: mensual USD 27.77 y anual USD 277.77, los mismos del bot de Telegram.
-- Deben coincidir con src/shared/config/pricing.ts (MONTHLY_PRICE_USD_CENTS / ANNUAL_PRICE_USD_CENTS).
-- Los pagos ya registrados no cambian: guardan su propio monto.

update public.plans set price_usd_cents = 2777  where id = 'mensual';
update public.plans set price_usd_cents = 27777 where id = 'anual';
