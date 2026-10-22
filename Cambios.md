# Cambios

Registro de los cambios pedidos sobre la plataforma, del más reciente al más antiguo.

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
