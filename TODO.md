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

## Supabase

- [ ] Confirmar si se aplicaron las migraciones 0003, 0004, 0005 y 0006 en el proyecto LBP.
- [ ] Opcional: reautorizar el conector de Supabase de claude.ai con la organización "PROJECTS ENVIROMENT" para poder aplicar migraciones desde aquí.

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

- [ ] Textos e imágenes de "Así funciona cada parte" (`widgets/includes-detail`).
- [ ] Teléfono de contacto (`CONTACT_PHONE` en `shared/config/contact.ts`).
- [ ] Enlaces pendientes en `shared/config/external-links.ts`: postulación a la mentoría y WhatsApp de soporte (hoy `REPLACE_ME`).
- [ ] Dominio final del sitio.
