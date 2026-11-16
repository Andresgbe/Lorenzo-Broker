# Pendientes

Lo que falta por hacer en la plataforma. Al terminar algo, se marca `[x]` (o se borra) y se anota en `Cambios.md`.

## Videos (Bunny Stream)

- [x] Crear la cuenta de Bunny Stream (prueba de 14 días, creada el 27/10/2026; reactivada tras el bloqueo antifraude).
- [x] Crear la Video Library "Lorenzo Broker".
- [ ] Confirmar que la región principal (Main) de la librería es New York; si sigue en Frankfurt y está vacía, crearla de nuevo con Main en NY. Réplica: São Paulo.
- [x] Subir un archivo de prueba (27/10/2026: un `.mp3` de solo audio, contenido de terceros; borrarlo cuando llegue el video real).
- [ ] **Esperando el video real de prueba** (lo envía otra persona). Mientras tanto, conviene subir un `.mp4` corto para ver la imagen.
- [ ] Ajustar el reproductor: color `#00b09a`, idioma Español.
- [ ] Security → Allowed Domains: `localhost` y el dominio de GitHub Pages (después, el dominio final).
- [x] Conectar el reproductor real (Library ID `792090` en `shared/config/bunny.ts`; embed público) en la clase y en el video de bienvenida del curso.
- [x] Probarlo (27/10/2026): funciona en PLAN DE AHORRO (Nivel 1) › Módulo 1 › "Nueva clase", con el `.mp3` de prueba (solo audio). Falta verlo con un `.mp4`.
- [ ] Poner en cada curso su librería de Bunny (Panel › Cursos › Editar › "Librería de Bunny Stream"). Cuenta nueva, con una librería por curso.
- [ ] En cada librería: color `#00b09a`, idioma Español y Allowed Domains.
- [x] Programar la Edge Function de URL firmada (`supabase/functions/bunny-video-url`, 02/11/2026).
- [ ] **Poner los videos privados:** guardar el secreto `BUNNY_TOKEN_KEYS`, publicar la función, probarla y activar Token Authentication en cada librería, en ese orden. Añadir el dominio final a `ALLOWED_ORIGINS` cuando exista.
- [ ] Decidir con Lorenzo quién es el titular de la cuenta definitiva (su correo y su tarjeta) **antes de que acabe la prueba** (≈ 10/11/2026).
- [ ] Más adelante (Fase 2): marca de agua con el correo del alumno.

## Bot de Telegram → web (10/11/2026)

- [x] Programar la integración: migración 0014, función `bot-access`, cambios en el bot y en Mi cuenta.
- [x] Ejecutar `0014_telegram_bot_access.sql` en el SQL Editor de LBP.
- [x] Crear los secretos `BOT_ACCESS_SECRET` y `SITE_URL` en Edge Functions → Secrets.
- [x] Publicar la función `bot-access` (sin verificación de JWT).
- [x] Añadir la dirección de `SITE_URL` en Supabase → Authentication → URL Configuration → Redirect URLs.
- [x] En el bot: poner `WEB_ACCESS_URL` y `WEB_ACCESS_SECRET` y reiniciarlo.
- [x] Probarlo de punta a punta (10/11/2026, con `/aprobar`): funciona.
- [ ] Publicar la web con estos cambios (aviso y formulario "Crear contraseña").
- [ ] Probarlo también con un pago real de 1 USDT.
- [ ] `/sacar` en el bot: que también quite el acceso a la web.
- [ ] Miembros que pagaron en el bot antes de la integración: que `/web` mande su membresía vigente, o darles acceso a mano.
- [ ] Igualar la gracia: el bot da 3 días y la web 2.
- [ ] Antes del lanzamiento: volver a los precios reales en el `.env` del bot (quitar `PRICE_MENSUAL` y `PRICE_ANUAL`), usar otra base de datos (`DB_PATH`) y subir el bot a Railway.

## Supabase

- [ ] Confirmar si se aplicaron las migraciones 0003, 0004, 0005 y 0006 en el proyecto LBP.
- [x] Acceso a LBP desde Claude Code: servidor MCP local `supabase`, limitado a LBP (10/11/2026).
- [ ] Cambiar el token de acceso de Supabase de ese servidor, porque se vio en una captura, y reinstalar el servidor con el token nuevo.

## Pagos

- [ ] Cobrix (puesto en pausa el 22/10/2026): checkout, webhook verificado, idempotencia y conciliación cada 15 min.
- [ ] **Guardar los pagos**: hoy "Ya pagué" no escribe nada, así que Panel › Pagos sale vacío. Falta crear el pago (Edge Function, porque el navegador no puede escribir en `payments`) y el flujo "Reporté mi pago" (comprobante ≤ 5 MB).
- [ ] Renovación y adelanto de meses: hoy solo cambian las pantallas. Falta guardar los meses en `payments` y que `apply_paid_payment` y `admin_review_payment_report` extiendan N meses (hoy extienden uno solo).
- [ ] Datos reales de cobro (`payTo`) y tasa de cambio en `shared/config/payment-methods.ts` (hoy son demo).

## Área del alumno

- [x] Membresía real en Inicio, Mi cuenta y checkout (02/11/2026, `useMembership` lee `entitlements`).
- [x] Historial de pagos de Mi cuenta con datos reales (02/11/2026).
- [ ] Pantalla de membresía vencida (`/alumno/membresia-vencida`) con la fecha real: hoy usa una de ejemplo.
- [ ] Foro: avisar por correo o Telegram cuando responden un hilo, buscar, y límite de mensajes contra spam.
- [ ] Bloquear el contenido con la membresía vencida (pantalla "Renovar"), no solo con la sesión.
- [x] Mi cuenta › Datos personales guarda de verdad (02/11/2026).
- [ ] Mi cuenta › Seguridad: que Cambiar correo y Cambiar contraseña guarden de verdad.

## Panel de administración

- [x] Lista de Alumnos con datos reales (02/11/2026, `useStudents`).
- [x] Alumnos: menú "⋯" y página de detalle con editar datos, dar o extender acceso, registrar pago y quitar acceso (02/11/2026).
- [ ] **Ejecutar las migraciones 0007, 0008, 0009, 0010, 0011, 0012 y 0013, en ese orden,** en el SQL Editor de LBP: sin ellas, las acciones de Alumnos no funcionan, el plan anual no existe en la base de datos, el foro da error y no se puede guardar la librería de Bunny de cada curso.
- [ ] Alumnos: cambiar el correo de un alumno (necesita una Edge Function con la Admin API). Exportar CSV.
- [x] Lista y detalle de Pagos con datos reales (02/11/2026, `usePayments`). Quedan vacíos hasta que se guarden pagos.
- [ ] Pagos: confirmar y rechazar a mano, con motivo registrado. Falta una función en la BD para pagos sin reporte (`admin_review_payment_report` solo sirve para reportes). Exportar CSV.
- [x] Resumen con datos reales (02/11/2026).
- [ ] Acciones manuales con motivo registradas en `admin_actions` (dar/quitar acceso, extender días, confirmar/rechazar pagos).
- [ ] Bandeja de mensajes de Contacto (`contact_messages`).

## Correos (Resend)

- [ ] Dominio verificado y correos en español: bienvenida, recibo, recordatorios, vencimiento, suspensión, reactivación, alertas al admin.

## Contenido que debe enviar Lorenzo

- [x] Imágenes de "Así funciona cada parte" (16/11/2026).
- [ ] Textos definitivos de "Así funciona cada parte" (`widgets/includes-detail`): hoy son de ejemplo.
- [x] Capturas de su contenido para la portada (15/11/2026, en `resources/capturas-portada/`). Falta decidir dónde y cómo se muestran.
- [x] Fotos para "Educación continua" (correo del 13/11/2026; 5 de 6 en `resources/educacion-continua/`).
- [ ] Guardar el sexto adjunto de ese correo, la segunda gráfica "Nuestros cursos", y decidir dónde va la sección.
- [x] Fotos para "Copy trading" (correo "3" del 13/11/2026, en `resources/copy-trading/`).
- [ ] Portadas de los 12 cursos (Apertura de cuenta, Opciones Pro, Bonos, Plan de ahorro, Plan de inversión, Mentalidad & Psicología, Estrategias, Trading like a pro, Futuros Pro, REITs, Bonos y acciones preferidas, Crypto): solo llegaron como captura del chat. Hay que guardar cada imagen original en `resources/cursos/` y después subirla como portada de su curso en la plataforma.
- [ ] Correo "2": no ha llegado. La gráfica de servicios (Plan de inversión, Plan de ahorro, Cursos…) está en `resources/por-clasificar/`.
- [ ] Teléfono de contacto (`CONTACT_PHONE` en `shared/config/contact.ts`).
- [ ] Enlaces pendientes en `shared/config/external-links.ts`: postulación a la mentoría y WhatsApp de soporte (hoy `REPLACE_ME`).
- [ ] Dominio final del sitio.
