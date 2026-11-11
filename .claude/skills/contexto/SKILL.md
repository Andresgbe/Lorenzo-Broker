---
name: contexto
description: Genera un resumen completo y autosuficiente del proyecto Lorenzo-Broker (qué es, stack, estado de cada área, decisiones, pendientes y próximos pasos) para pegarlo en otro chat. Úsala cuando el usuario escriba /contexto o pida "el contexto del proyecto".
---

# Contexto del proyecto Lorenzo-Broker

Produce un resumen que el usuario va a **copiar y pegar en otro chat** (otra IA o una persona que no conoce el proyecto). Debe entenderse solo, sin acceso al repositorio.

## Fuentes, leídas en este orden

1. `CLAUDE.md`: proyecto, spec, stack, arquitectura, estado por área, decisiones del usuario, convenciones.
2. `TODO.md`: pendientes.
3. `Cambios.md`: solo las entradas de los últimos 7 días (es largo; lee el principio).
4. `git status --short` y `git log --oneline -10`: lo que está sin commit y lo último guardado.
5. `ls supabase/migrations supabase/functions`: migraciones y funciones que existen.

No leas archivos de `.env`, ni pidas o copies claves, tokens o contraseñas. Si alguna fuente mencionara un secreto, no lo incluyas.

## Formato de la respuesta

Un solo bloque de Markdown, en español, con estas secciones y en este orden. Sé concreto: nombres reales de rutas, tablas y archivos; nada de relleno.

1. **Qué es:** el producto, el cliente (Lorenzo Pérez), los usuarios (alumnos mayormente venezolanos, en el teléfono) y el objetivo del negocio, en 3 a 5 líneas.
2. **Stack y despliegue:** React + TypeScript + Vite, Tailwind v4, Supabase (proyecto LBP: Auth, Postgres con RLS, Storage, Edge Functions), Bunny Stream, GitHub Pages. Arquitectura Feature-Sliced Design.
3. **Estado por área:** sitio público, acceso, checkout y pagos, área del alumno, panel de administración, videos, foro. Para cada una: qué funciona con datos reales y qué sigue siendo demostración o solo pantalla.
4. **Decisiones vigentes del usuario:** las que cambian cómo se trabaja (por ejemplo: sin Discord, sin Cobrix en la UI, menú lateral en el panel, niveles de cursos, Lorenzo como dueño). Una línea cada una.
5. **Base de datos:** tablas principales, migraciones del repo (y que el usuario las aplica a mano en el SQL Editor; Claude no puede ejecutarlas) y funciones de Edge.
6. **Pendientes y bloqueos:** lo más importante de `TODO.md`, primero lo que bloquea el lanzamiento. Incluye las decisiones abiertas con el cliente.
7. **Últimos cambios:** 5 a 10 viñetas de los últimos días, según `Cambios.md`.
8. **Estado de git:** rama, si hay cambios sin commit y el último commit.
9. **Cómo trabajar en este proyecto:** las reglas que otro asistente debe respetar. Textos en español y de tú; rutas solo desde `shared/config/routes.ts`; tokens de color del manual de marca, nunca hex sueltos; RLS como frontera real; cada cambio pedido se anota en `Cambios.md`, y los pendientes en `TODO.md`.

Al final, una línea con la fecha de hoy: "Contexto generado el DD/MM/AAAA".

## Reglas

- Máximo unas 120 líneas: prioriza lo que alguien nuevo necesita para no equivocarse.
- Si una fuente contradice a otra, gana la más reciente (`Cambios.md` sobre `CLAUDE.md`) y menciónalo.
- No inventes estados: si no está claro si una migración se ejecutó, dilo como "por confirmar".
- Entrega solo el bloque, sin explicar cómo lo generaste.
