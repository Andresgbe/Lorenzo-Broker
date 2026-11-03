# Cambios

Registro de los cambios pedidos sobre la plataforma, del más reciente al más antiguo.

## 02/11/2026 — Previsualización del video para el administrador

- La página de cada clase en el panel tiene ahora su propia **previsualización**, distinta a la del alumno, junto al formulario de edición.
- Muestra el video guardado, si está visible u oculta para los alumnos, el Video ID, la librería, la duración, los PDF y si falta algo para reproducirse.
- Si cambias el video o la librería, avisa que debes guardar para verlo.
- "Vista previa" pasó a llamarse **"Ver como alumno"**. Desde esa vista, un admin tiene un botón **"Editar clase"** para volver.
- Código: `pages/admin-lesson/LessonVideoPreview.tsx`.

## 02/11/2026 — Cada clase puede usar otra librería de Bunny

- Cada clase tiene un campo opcional, **"Librería de Bunny de este video"**. Vacío usa la librería del curso; con un número, usa esa solo para esa clase.
- Sirve para videos que están en otra librería, como los de Apertura de cuenta o Bonos y Acciones Preferidas, sin tener que moverlos.
- **Hay que ejecutar la migración** `0011_lesson_bunny_library.sql` y volver a publicar la función `bunny-video-url`.
- Código: `pages/admin-lesson/AdminLessonPage.tsx`, `entities/course` y `supabase/functions/bunny-video-url`.

## 02/11/2026 — Videos privados con enlace firmado

- Nueva función de servidor `bunny-video-url`: comprueba que el alumno tiene acceso y genera un enlace del video válido por **2 horas**.
- La clase y el video de bienvenida piden ese enlace antes de reproducir. Sin acceso, se ve "No tienes acceso a este video".
- **Todavía no están privados:** falta guardar las claves, publicar la función y activar Token Authentication en cada librería de Bunny.
- Mientras la función no esté publicada, los videos siguen viéndose con el enlace público.
- Código: `supabase/functions/bunny-video-url` y `features/video-player`.

## 02/11/2026 — Cada curso con su librería de Bunny

- **Problema:** los videos daban 404 porque el código apuntaba a una sola librería de Bunny (`792090`, de otra cuenta), y los videos reales están en una librería por curso.
- Ahora **cada curso tiene su campo "Librería de Bunny Stream"** en Panel › Cursos › Editar datos. El resumen del curso avisa si falta.
- Sin librería configurada, las clases con video muestran "Video en preparación" en lugar de un error.
- **Hay que ejecutar la migración** `0010_course_bunny_library.sql` y poner el número de la librería en cada curso.
- Código: `shared/config/bunny.ts`, `features/manage-courses/ui/CourseFields.tsx` y `entities/course`.

## 02/11/2026 — Foro por curso

- Cada curso tiene su **foro**, con el botón "Foro del curso" en la página del curso y "Foro" en Panel › Cursos.
- **Alumnos con acceso al curso:** abren hilos, responden, y editan o eliminan sus propias respuestas. Pueden editar sus hilos y eliminarlos mientras nadie haya respondido.
- **Administrador:** edita o elimina cualquier mensaje, fija hilos arriba y los cierra o reabre. En un hilo cerrado, los alumnos ya no responden ni editan.
- Sin acceso al curso o con la membresía vencida no se puede leer ni escribir.
- Se muestra solo el nombre del autor, nunca su correo. Si no tiene nombre guardado, sale "Alumno".
- **Hay que ejecutar la migración** `0009_course_forums.sql`.
- Código: `entities/forum`, `pages/student-forum` y `pages/student-forum-thread`.

## 02/11/2026 — Plan anual de $297

- Nueva **Membresía anual: $297 al año**, 365 días de acceso. Frente a 12 meses a $29 ($348), ahorra **$51**.
- **Portada:** la sección de precios muestra dos tarjetas, Mensual y Anual, con la etiqueta "Ahorras $51". Los beneficios se editan en la tarjeta mensual y el admin puede cambiar el precio anual.
- **Checkout, primera compra:** se elige entre las dos tarjetas.
- **Checkout, renovación:** se elige 1, 2, 3 o 6 meses, o 1 año. Se quitó "12 meses" porque costaba más que el plan anual.
- **Panel › Alumnos › Registrar pago:** ahora permite elegir el plan.
- **Base de datos (migración 0008):** crea el plan con los mismos cursos que el mensual. Al pasar de mensual a anual se conservan los días ya pagados, y "Quitar acceso" quita todas las membresías del alumno.
- **Hay que ejecutar la migración** `0008_annual_plan.sql` después de la `0007`.
- Código: `entities/plan`, `features/renew-membership`, `widgets/pricing-section` y las páginas `checkout-*`.

## 02/11/2026 — Panel: acciones sobre los alumnos y Lorenzo como dueño

- **Cada alumno tiene menú "⋯" y página de detalle** (`/admin/alumnos/...`) con sus datos, membresía, pagos e historial.
- **Acciones**, todas con motivo obligatorio que queda en el historial:
  - **Editar datos:** nombre, cédula y teléfono. El correo no.
  - **Dar o extender acceso:** por el número de días que se indique.
  - **Registrar pago:** para un pago ya recibido. Queda como pagado, aparece en Pagos y Resumen y extiende el acceso por los meses pagados.
  - **Quitar acceso.**
- **Roles:** toda cuenta nueva es alumno. Lorenzo queda marcado como **dueño**: otros admins no pueden editarlo ni quitarle el acceso. La lista muestra una etiqueta Dueño o Admin.
- **Mi cuenta:** el historial de pagos muestra ahora los pagos reales del alumno.
- **Hay que ejecutar la migración** `supabase/migrations/0007_owner_and_student_actions.sql` en Supabase. Sin ella, la lista carga pero las acciones dan error.
- Código: `features/manage-student`, `pages/admin-student` y `entities/student`.

## 02/11/2026 — Panel: Resumen con datos reales y sin Cobrix

- **Resumen** calcula ahora sus cifras con los alumnos y pagos reales, en lugar de los datos de ejemplo:
  - **Alumnos activos:** todos los que tienen acceso (activos, por vencer y en gracia).
  - **Cobrado este mes:** suma de los pagos confirmados este mes, en hora de Caracas.
  - **Vencen pronto:** 3 días o menos.
  - **Pagos en verificación:** incluye los de monto por revisar.
- Por ahora Cobrado, Pagos en verificación y Últimos pagos salen en cero o vacíos, porque todavía no se guardan pagos.
- **Se quitó Cobrix de las pantallas:** el detalle de un pago ya no muestra "Origen" ni menciona Cobrix.
- Siguen en el proyecto, por si vuelve: `scripts/cobrix/` y la columna `cobrix_id` de la base de datos.
- Código: `pages/admin-overview/AdminOverviewPage.tsx` y `entities/payment`.

## 02/11/2026 — Panel: Pagos con datos reales

- La lista de **Pagos** y su página de detalle leen ahora la tabla `payments` de Supabase, en lugar de los datos de ejemplo.
- **La lista sale vacía por ahora:** el checkout todavía no guarda pagos, así que "Ya pagué" no crea ninguna fila.
- Nuevos estados: **Monto por revisar** (el monto no coincide) y **Expirado**. El filtro En verificación incluye el primero y Rechazado, el segundo.
- **Se quitaron Confirmar pago y Rechazar pago:** solo cambiaban la pantalla y no guardaban nada. Volverán cuando funcionen de verdad, con motivo registrado.
- **Resumen** y el historial de Mi cuenta siguen con datos de ejemplo.
- Código: `entities/payment`, `pages/admin-payments` y `pages/admin-payment`.

## 02/11/2026 — Panel: Alumnos con datos reales

- La lista de **Alumnos** muestra ahora todas las cuentas registradas en Supabase, las más recientes primero, en lugar de los datos de ejemplo. Incluye también las cuentas de admin.
- Nuevos estados: **Sin plan** (se registró pero no tiene membresía), **En gracia** (venció, pero aún tiene acceso) y **Acceso quitado**. "Por vencer" significa 3 días o menos.
- Se añadió el filtro **Sin plan**. El filtro Vencida incluye también a los que están en gracia.
- **Se quitó el menú "⋯" de cada fila** (Ver detalle, Extender vencimiento, Quitar acceso): eran botones de demostración que no hacían nada. Volverán cuando funcionen de verdad, con motivo registrado.
- **Resumen** sigue con datos de ejemplo.
- Código: `entities/student` y `pages/admin-students/AdminStudentsPage.tsx`.

## 02/11/2026 — Panel: una clase no sale publicada si su módulo está en borrador

- Con el **módulo en borrador**, el interruptor de sus clases se ve **apagado**, en la lista del curso y en la página de la clase.
- Al tocarlo aparece un aviso: "Primero publica el módulo".
- Al publicar el módulo, cada clase **vuelve a como estaba**: las publicadas se encienden solas y las que estaban en borrador siguen así.
- Los alumnos no notan cambios: nunca han podido ver clases de un módulo en borrador.
- Código: `features/manage-courses/ui/LessonPublishSwitch.tsx`.

## 02/11/2026 — Panel: menú lateral

- El menú hamburguesa del panel de administración se cambió por un **menú lateral siempre abierto** a la izquierda: Resumen, Alumnos, Pagos y Cursos con ícono; abajo, Ver el sitio, el correo y Cerrar sesión.
- Una **flechita** lo minimiza a solo íconos y lo vuelve a abrir. El navegador recuerda cómo lo dejaste.
- **En el teléfono** no cabe fijo: se abre con la hamburguesa, encima del contenido, y se cierra al elegir una sección, al tocar fuera o con Escape.
- La flecha de volver del panel ahora va dentro de la columna, para no pisar el menú.
- El menú de la web pública no cambia.
- Código: `widgets/admin-shell/AdminShell.tsx` y `AdminTopBar.tsx`.

## 02/11/2026 — Checkout: renovar o adelantar meses

- El checkout ahora **comprueba la membresía real** del usuario. Quien ya tiene plan (activo o vencido) deja de ver los textos de primera compra.
- **Con plan activo:** "Renueva o adelanta meses". Muestra la fecha de vencimiento, permite elegir **1, 2, 3, 6 o 12 meses** (sin descuento) y calcula la nueva fecha sumando a la actual.
- **Con plan vencido:** "Renueva tu membresía". La nueva fecha se cuenta desde hoy.
- **Sin plan o sin sesión:** todo sigue igual, como primera compra.
- Resumen, Pagar, En verificación y Confirmado usan el total por los meses elegidos y hablan de renovación.
- **Inicio y Mi cuenta** muestran la membresía real en lugar de la de ejemplo: activa, por vencer (3 días o menos), vencida o sin plan. "Cambiar de plan" pasa a ser "Renovar o adelantar meses".
- **Pendiente:** el pago todavía no se guarda, así que la renovación aún no extiende el acceso (ver `TODO.md`).
- Código: `features/renew-membership`, `entities/membership` y las páginas `checkout-*`.

## 02/11/2026 — Mi cuenta: los datos personales ya se guardan

- **Problema:** "Guardar cambios" solo actualizaba la pantalla, sin guardar nada, y al recargar los datos se perdían.
- Ahora el nombre, la cédula/RIF y el teléfono se guardan en la cuenta y en la tabla `profiles`. El saludo de Inicio y el avatar se actualizan al momento.
- El nombre es obligatorio (mínimo 3 letras). Si falla el guardado, el formulario sigue abierto con un aviso.
- Cambiar correo y Cambiar contraseña (pestaña Seguridad) siguen sin guardar; están en `TODO.md`.
- Código: `updateProfile` en `entities/session/model/AuthContext.tsx` y `pages/student-account/StudentAccountPage.tsx`.

## 02/11/2026 — "Suscríbete ahora" lleva al checkout

- Todos los botones **"Suscríbete ahora"** (barra superior, portada, precios y pie de página) abren ahora **Elegir plan** (`/suscripcion`) en la misma pestaña. Antes abrían una pestaña nueva con el enlace vacío `REPLACE_ME`.
- Se eliminó el enlace antiguo a Whop, que ya no se usa.
- Código: `features/subscribe-cta/ui/SubscribeButton.tsx`.

## 27/10/2026 — Clase y curso: reproductor de Bunny Stream

- La página de la **clase** y el **video de bienvenida** del curso ya muestran el reproductor real de Bunny Stream cuando tienen un ID de video; antes había un marcador "Video en preparación".
- El ID del video se pega en Panel › Cursos, como siempre. La librería de Bunny (`792090`) está en `shared/config/bunny.ts`.
- **Por ahora el video es público** (sin Token Authentication): cualquiera con el ID podría verlo. La protección con URL firmada llega con la Edge Function (ver `TODO.md`).

## 27/10/2026 — Lista de pendientes

- Nuevo archivo `TODO.md` en la raíz con todo lo que falta: videos (Bunny Stream), Supabase, pagos, área del alumno, panel, correos y el contenido que debe enviar Lorenzo.
- Bunny queda a la espera del video de prueba.

## 27/10/2026 — Inicio: textos de "¿Qué incluye?" justificados

- La descripción de cada tarjeta de "¿Qué incluye?" (Educación continua, Ideas de inversión, Bonus: Copytrading…) ahora va **justificada**, con guiones automáticos en español para evitar espacios grandes entre palabras.
- También se ve así mientras el admin la edita.
- Código: `entities/benefit/ui/BenefitCard.tsx`.

## 22/10/2026 — Módulos y clases nuevos se crean publicados

- Al crear un **módulo** o una **clase** en Panel › Cursos, ahora nace **publicado**: los alumnos lo ven en cuanto el curso está publicado.
- Para esconder uno mientras lo armas, pásalo a borrador con su interruptor.
- **Los que ya existían no cambian:** siguen en borrador hasta publicarlos con su interruptor. También se pueden publicar todos de una vez en Supabase (SQL Editor):

  ```sql
  update public.modules set is_published = true where not is_published;
  update public.lessons set is_published = true where not is_published;
  ```
- Los cursos siguen naciendo en borrador y se publican con "Publicar".

## 22/10/2026 — Curso sin módulos visibles (corrección)

- **Problema:** al abrir un curso desde la cuenta de admin aparecía "Este curso todavía no tiene clases", aunque tuviera módulos.
- **Causa:** con el cambio de "Vista de alumno", las páginas del alumno ocultaban siempre los módulos y clases en **borrador**, también para el admin.
- **Ahora:**
  - **Admin sin Vista de alumno:** ve los borradores, marcados con la etiqueta **"Borrador · no lo ven los alumnos"**.
  - **Admin con Vista de alumno:** se ocultan, igual que para un alumno.
  - **Alumnos:** nunca reciben borradores; eso lo controla Supabase.
- Para que un alumno vea un módulo o una clase, hay que **publicarlo** con el interruptor en Panel › Cursos.

## 22/10/2026 — Contacto: formulario centrado

- En pantallas anchas (desde 1280 px), la tarjeta del formulario queda **centrada en la página**, con un ancho máximo de 640 px.
- "Otros canales" va **a su derecha y más pequeña**: 280 px de ancho, con íconos y textos más chicos.
- En pantallas más angostas van las dos centradas, una debajo de la otra, con el formulario primero.

## 22/10/2026 — Portada: sección "Así funciona cada parte"

- Sección nueva en la portada, **debajo de "Un solo plan. Todo incluido."** (antes de las preguntas frecuentes).
- Explica en detalle cada parte de la membresía, una fila por cada tarjeta de "¿Qué incluye?":
  1. Educación continua: cursos, libros y PDF.
  2. Ideas de inversión: chat privado.
  3. Bonus: Copytrading en Binance, en color petróleo como las demás tarjetas bonus.
- **Cada fila tiene:**
  - el número de la tarjeta, el título y una explicación;
  - una lista de lo que recibes;
  - un **marco para la captura de pantalla**, con un texto debajo que dice qué muestra.
- **Distribución:** en computadora, el texto y la captura se alternan de lado en cada fila. En el teléfono la captura va debajo del texto.
- **Pendiente:**
  - Los textos son **de ejemplo** para el diseño. Lorenzo los va a reescribir y mandar las capturas reales; hoy están en `src/widgets/includes-detail/IncludesDetail.tsx`.
  - No se pueden editar desde el sitio, como sí pasa con "¿Qué incluye?".

## 22/10/2026 — Checkout sin Cobrix: datos para pagar y botón de volver

- **Nuevo flujo, mientras no haya pasarela:**
  1. Plan.
  2. "Da tu siguiente paso": se elige el método y se toca **"Continuar con [método]"**.
  3. Pantalla nueva **"Paga con [método]"** (`/suscripcion/pagar`).
  4. **"Ya pagué"** lleva a "Estamos verificando tu pago".
- **"Paga con [método]"** muestra:
  - El **monto**: en bolívares a la tasa del día para PagoMóvil y Transferencia; en dólares para Zelle y Binance Pay.
  - Los **datos para pagar** del método, cada uno con botón **"Copiar"**.
  - Un campo para la **referencia del pago**, obligatorio para continuar.
- **"Estamos verificando tu pago"** muestra además el método elegido.
- **Botón de volver** (el de siempre, con la ruta en mayúsculas) en el checkout:
  - Plan: INICIO / PLAN.
  - Resumen: PLAN / PAGO.
  - Pagar: PLAN / PAGO / MÉTODO.
- Se quitaron las menciones a Cobrix: el botón ya no dice "Pagar con Cobrix" y la pantalla del plan dice "Puedes pagar con PagoMóvil, Transferencia, Zelle, Binance Pay".
- **Pendiente:**
  - Las cuentas, teléfonos, Pay ID y la tasa (215,37 Bs por dólar) son **datos de ejemplo**, en `src/shared/config/payment-methods.ts`; hay que reemplazarlos por los reales de Lorenzo.
  - La referencia todavía no se guarda.

## 22/10/2026 — Checkout › "Revisa antes de pagar" en una sola tarjeta

- La pantalla de resumen del pago (`/suscripcion/resumen`) es ahora **una sola tarjeta grande**, más ancha en computadora:
  - **Arriba, en dos columnas:** "Tus datos" (nombre, cédula o RIF, correo, con "Editar datos") y "Tu plan" (plan, cobro, precio, con "Cambiar de plan").
  - **En medio:** "Método de pago", con las cuatro opciones en una fila en computadora (dos por fila en tablet, una debajo de otra en el teléfono).
  - **Abajo, siempre al final:** el total y el botón **"Pagar con Cobrix"**. En computadora el botón va a la derecha y en el teléfono ocupa todo el ancho.
- "Editar datos" ahora lleva a Mi cuenta (antes llevaba a la página de registro).
- Las notas de tiempo de cada método ("Suele confirmarse en segundos"…) se quitaron en `payment-methods.ts`; si se vuelven a escribir, aparecen debajo de cada método.

## 22/10/2026 — Interruptor "Vista de alumno" para administradores

- En el menú del avatar, **solo en cuentas de administrador**, hay un interruptor **"Vista de alumno"**.
- **Encendido:** la plataforma se ve exactamente como la ve un alumno, sin nada de administración. Te lleva al área del alumno y:
  - desaparecen el menú hamburguesa de admin y la opción "Panel de administrador";
  - los textos del sitio dejan de ser editables;
  - el panel (`/admin/...`) no abre: lleva al área del alumno;
  - en Cursos solo aparece lo **publicado**, sin borradores.
- **Apagado:** vuelve todo lo de administración y te lleva al panel (Resumen).
- El botón "Vista de alumno" de la cabecera del panel ahora enciende este mismo interruptor.
- La elección se recuerda en ese navegador al recargar, y se apaga sola al cerrar sesión.
- Es solo visual: los permisos reales de la cuenta no cambian. Además, la Vista de alumno muestra todos los cursos publicados, aunque un alumno real solo ve los de su plan.

## 22/10/2026 — Panel › Pagos: vista "Ver detalle"

- Nueva página de detalle de cada pago (`/admin/pagos/:id`). Se abre con **"Ver detalle"** del menú "⋯" o tocando el nombre del alumno en la tabla.
- **Arriba:**
  - El botón de volver con la ruta "PAGOS / NOMBRE DEL ALUMNO".
  - El monto en dólares y en bolívares, la fecha y hora (hora de Caracas) y el estado.
- **Tarjeta Pago:** monto en USD y en Bs, tasa usada, método, origen (Cobrix automático o reportado por el alumno), referencia, plan y fecha.
- **Comprobante:** solo en los pagos que el alumno reportó a mano (Zelle, Binance Pay). Muestra el archivo y un botón "Ver comprobante", que todavía no abre nada.
- **Historial:** línea de tiempo con cada paso (pago iniciado, confirmación de Cobrix, aprobado o rechazado a mano con quién lo hizo y el motivo, acceso activado).
- **Alumno:** nombre, cédula o RIF y correo.
- **Pagos en verificación:**
  - Un aviso explica qué revisar.
  - Arriba a la derecha hay **"Confirmar pago"** y, en el "⋯", **"Rechazar pago"**.
  - Las dos acciones abren un modal que **exige escribir un motivo**, que queda en el historial, como pide el spec para toda acción manual.
- En la lista, "Confirmar pago" del menú "⋯" ahora lleva a este detalle para confirmarlo con motivo.
- **Pendiente:** sigue usando **datos de ejemplo**. Confirmar o rechazar solo cambia la vista; no guarda nada ni da acceso al alumno.

## 22/10/2026 — Recuperar contraseña desde Mi cuenta: botón para volver

- Al abrir "¿La olvidaste?" desde el modal "Cambiar contraseña" (Mi cuenta › Seguridad), la pantalla "Recupera tu contraseña" muestra arriba **el botón de volver de siempre**: el cuadro con la flecha y la ruta "MI CUENTA / RECUPERAR CONTRASEÑA", igual que en Cursos. Regresa a la pestaña Seguridad y reemplaza a "Volver a iniciar sesión".
- Si se llega desde el inicio de sesión, sigue diciendo "Volver a iniciar sesión".

## 22/10/2026 — Nueva vista: Contacto (`/contacto`)

- Página nueva **Contacto**, enlazada en la barra (después de "Mentoría 1:1") y en el pie, bajo Navegación.
- **Formulario:** nombre, correo, teléfono (opcional, por si prefieren respuesta por WhatsApp), motivo (duda, sugerencia, problema con pago o acceso, otro) y mensaje (10 a 2000 caracteres, con contador). Si la persona tiene sesión iniciada, el nombre, el correo y el teléfono vienen rellenos.
- Al enviar se muestra "Recibí tu mensaje. Te respondo a …" y un botón para enviar otro.
- **Otros canales**, al lado del formulario: teléfono y WhatsApp, Instagram y un enlace a Preguntas frecuentes.
- **Pendientes:**
  - **Teléfono:** falta el número real. Se configura en `src/shared/config/contact.ts` y, mientras no esté, esa fila no se muestra.
  - **Base de datos:** los mensajes se guardan en la tabla nueva `contact_messages` (migración `supabase/migrations/0006_contact_messages.sql`). Cualquiera puede enviar y solo los administradores pueden leerlos. **Hay que ejecutar la migración en Supabase**; hasta entonces el formulario muestra un error al enviar.
  - **Lectura de mensajes:** todavía no hay una pantalla en el panel para leerlos; por ahora se ven en Supabase (Table Editor › contact_messages).

## 22/10/2026 — Seguridad: cambiar correo y contraseña en un modal

- "Cambiar correo" y "Cambiar contraseña" ya no abren el formulario dentro de la tarjeta: cada uno abre una **ventana (modal)** centrada sobre la página oscurecida, y todo se hace ahí.
- No hay botón "Cancelar": el modal se cierra con la **X** de la esquina superior derecha, con la tecla **Escape** o tocando fuera. El botón principal va solo, a la derecha.
- En el modal de contraseña, "¿La olvidaste?" está junto a la etiqueta "Contraseña actual".
- Nuevo componente reutilizable: `src/shared/ui/Modal.tsx`.

## 22/10/2026 — Panel: sin el aviso "Datos de ejemplo"

- Se quitó la línea "Datos de ejemplo — todavía no están conectados a la base de datos." que aparecía bajo el título de las páginas del panel (Resumen, Alumnos, Pagos).
- Ojo: Resumen, Alumnos y Pagos **siguen mostrando datos de ejemplo**; solo se quitó el aviso.

## 22/10/2026 — Menú de la cuenta: Panel de administrador

- Para los **administradores**, el menú del avatar muestra primero **"Panel de administrador"**, que lleva al Resumen del panel (`/admin/resumen`). Después vienen Mi área, Mi cuenta y Cerrar sesión.
- Los alumnos no ven esa opción.

## 22/10/2026 — Mi cuenta: botón de guardar a la derecha

- En los formularios de Mi cuenta, el botón principal va **siempre en la esquina derecha**: "Guardar cambios" (con "Cancelar" a su izquierda), "Cambiar correo" y "Actualizar contraseña". El enlace "¿Olvidaste la actual?" queda a la izquierda.

## 22/10/2026 — Mi cuenta: pestaña Seguridad

- La pestaña **"Configuración" se llama ahora "Seguridad"**. Su dirección es `/alumno/cuenta?seccion=seguridad`, y las viejas (`?seccion=configuracion` y `?seccion=clave`) siguen abriéndola.
- Dentro de Seguridad, **"Cambiar correo" va primero** y "Cambiar contraseña" después.
- En Datos personales, el aviso del correo dice ahora que se cambia en "la pestaña Seguridad".

## 22/10/2026 — Mi cuenta: Datos personales y Seguridad

- **Datos personales** se muestran primero en modo lectura: nombre, correo, cédula o RIF y teléfono. Lo que falta aparece como "Sin agregar".
- El botón **"Editar"** abre el formulario para cambiar el nombre, la cédula o RIF y el **teléfono (WhatsApp)**, que es un campo nuevo. Tiene "Guardar cambios" y "Cancelar".
- **El correo no se edita en Datos personales.** Se muestra con un enlace a Configuración › Seguridad.
- **Configuración** tiene ahora el bloque **SEGURIDAD** con dos opciones, cada una con su botón:
  - **Cambiar contraseña:** contraseña actual, nueva y confirmación, con el enlace "¿Olvidaste la actual?".
  - **Cambiar correo:** correo nuevo y contraseña actual. Avisa que se enviará un enlace al correo nuevo para confirmarlo.
- **Pendiente:** estos formularios todavía no guardan en Supabase. "Guardar cambios" solo actualiza la pantalla, y los botones de Seguridad aún no hacen nada.

## 22/10/2026 — Menú de la cuenta simplificado

- Se quitaron "Configuración" y "Membresía y pagos" del menú del avatar: llevaban a la misma página que "Mi cuenta". Quedan **Mi área**, **Mi cuenta** y **Cerrar sesión**.
- Membresía y pagos y Configuración (con "Cambiar contraseña") siguen como pestañas dentro de Mi cuenta.

## 22/10/2026 — Menú de la cuenta: Configuración

- En el menú del avatar, **"Cambiar contraseña" pasa a ser "Configuración"**.
- Configuración es una sección nueva de Mi cuenta (`/alumno/cuenta?seccion=configuracion`), en lugar de la pestaña "Contraseña". Contiene "Cambiar contraseña" y es donde irán los demás ajustes de la cuenta.
- Los campos de contraseña tienen el botón para mostrarla u ocultarla.
- La dirección vieja (`?seccion=clave`) abre Configuración.

## 22/10/2026 — Vistas protegidas sin sesión

- Se comprobó en el navegador, sin sesión, que todas las páginas del alumno (`/alumno/...`) y del panel (`/admin/...`) llevan al inicio de sesión sin mostrar nada de su contenido.
- Las direcciones viejas o mal escritas (por ejemplo `/alumno/modulos` o `/admin/contenido`) mostraban la página de error del router. Ahora también pasan por el inicio de sesión. Al entrar, llevan al inicio del alumno o al Resumen del panel.
- Cualquier otra dirección que no existe vuelve a la portada.

## 22/10/2026 — Campos autocompletados

- Cuando el navegador autocompleta el correo o la contraseña, el campo ya no se pinta de celeste claro: mantiene el fondo oscuro y el texto claro del diseño.

## 22/10/2026 — Un solo inicio de sesión

- **Se quitó el login de administración** (`/admin`). Alumnos y administradores entran por el mismo inicio de sesión, **`/iniciar-sesion`**.
- **A dónde lleva al entrar:** si la persona venía de una página protegida, vuelve a ella. Si no, un **admin** va al panel (Resumen) y un **alumno** a su área.
- La dirección `/admin` sigue funcionando: lleva al panel, que pide iniciar sesión si hace falta. Un alumno que intente abrir el panel va a su área.
- El inicio de sesión tiene ahora el botón para **mostrar u ocultar la contraseña**.
- Si falta configurar Supabase (`.env.local`), el formulario ya lo dice en lugar de "Correo o contraseña incorrectos".

## 21/10/2026 — Barra de navegación (sitio público)

- "Mentoría 1:1" pasa al grupo central, junto a "Sobre mí" y "Preguntas", en lugar de ir sola a la derecha junto al botón "Suscríbete ahora". El menú del teléfono no cambia.

## 21/10/2026 — Nuevo diseño: manual de marca de Lorenzo Broker (todo el sitio)

Lorenzo envió un parche con el manual de marca aplicado. Se reprodujo en el código, sobre el registro ya cambiado. **A partir de ahora todas las vistas usan esta paleta.**

- **Paleta Pantone** (`src/index.css`):

  | Pantone | HEX | Uso |
  |---|---|---|
  | 426 C | `#262729` | Paneles y tarjetas |
  | 7540 C | `#4b4f54` | Bordes fuertes, paso inactivo |
  | 3275 C | `#00b09a` | Acento: botones, enlaces, palabras destacadas |
  | 7705 C | `#006e96` | Tarjetas "Bonus", halos de fondo |
  | 072 C | `#283380` | Halo de fondo en la portada |

  - Fondo general `#1c1d1f`. Texto `#f4f5f6`, secundario `#a7acb3`.
  - El azul y el petróleo no se usan como texto (no alcanzan el contraste).
  - Texto de "Bonus" en `highlight` `#4cb3dc`.
  - El dorado queda solo para estados de espera o aviso.
- **Tipografías:** Domine en los títulos (en lugar de Playfair Display) e Inter en el texto. Los títulos usan peso 700 como máximo.
- **Logo:** imagotipo oficial completo en versión negativa (blanca), `logo-lorenzo-broker-negativo.png`, de 62 px en la cabecera (48 px en el teléfono) y 84 px en el pie.
- **Colores fijos** de los componentes reemplazados por tokens: `ink-soft`, `faint`, `step-idle`, `accent`, `highlight`.
- **Cabecera en el teléfono:** el botón "Suscríbete ahora" se oculta bajo 640 px porque se superponía con el logo.
- **Vistas afectadas:** portada (hero, Qué incluye, Precio, cierre, pie), iniciar sesión y registro, checkout, área del alumno y panel de administración. Las vistas con sesión usan los mismos tokens y falta revisarlas con datos reales.

## 21/10/2026 — Registro (`/registro`)

- **Más ancho en computadora:** desde 768 px la tarjeta pasa de 420 px a 840 px y el formulario va a dos columnas (Nombre y apellido | Cédula o RIF; Correo electrónico a todo el ancho; Contraseña | Confirmar contraseña). El botón "Crear cuenta" queda centrado. En el teléfono sigue en una sola columna, igual que antes.
- **Confirmar contraseña:** campo nuevo. Si está vacío dice "Repite tu contraseña." y si no coincide, "Las contraseñas no coinciden."
- **Mostrar u ocultar la contraseña:** botón con ícono de ojo dentro de ambos campos de contraseña.
- Código: nuevo componente reutilizable `src/shared/ui/PasswordField.tsx`; `AuthShell` acepta `size="wide"`; la validación está en `src/features/register/model/validation.ts`.

## 21–22/10/2026 — Puesta en marcha del proyecto en este equipo

- `npm run dev` no arrancaba ("'vite' is not recognized"): faltaban las dependencias. Se instalaron con `npm ci`.
- No se podía iniciar sesión, aunque la contraseña era correcta: faltaba el archivo `.env.local` con la dirección y la clave publishable de Supabase (proyecto LBP). Se creó. Git lo ignora, así que hay que crearlo de nuevo en cada copia nueva del proyecto.
- Para una copia nueva: `npm ci`, crear `.env.local` (a partir de `.env.example`) y `npm run dev`.
