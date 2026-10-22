# Cambios

Registro de los cambios pedidos sobre la plataforma, del más reciente al más antiguo.

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
