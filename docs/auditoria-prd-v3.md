# Auditoría PRD v3 — Melodex

## Fuente y alcance

- **PRD auditado:** `docs/prd.md`
- **Versión:** `PRD — Melodex (v3)`
- **Fecha de auditoría:** `2026-04-03`
- **Alcance:** contenido, flujos principales, auth, persistencia, panel del padre, audio, responsive, accesibilidad y validadores

## Resumen ejecutivo

El repo está **mayormente alineado** con el MVP definido en el PRD v3: ya existen las 7 lecciones, las 2 canciones, el flujo guiado, el sistema de estrellas, la persistencia en Postgres y el auth por PIN.

Los desajustes más importantes son:

1. **Bug de primera ejecución** en el flujo `login -> home -> onboarding`.
2. **Panel del padre parcial**: “última sesión” y “áreas débiles” no llegan al detalle del PRD.
3. **Capa visual pedagógica incompleta**: faltan ilustraciones/animación en intros.
4. **Audio parcialmente conectado**: canciones sí, lecciones no usan la misma ruta de audio esperada por el PRD.
5. **Accesibilidad/responsive incompletos**: tamaños táctiles y contraste aún no cierran del todo.

## Metodología

Se revisaron estos bloques:

- `docs/prd.md`
- `src/content/**/*`
- `src/app/**/*`
- `src/components/**/*`
- `src/engine/**/*`
- `src/lib/auth.ts`
- `src/lib/repositories/*`
- `src/lib/migrate-local-data.ts`
- `src/db/schema.ts`
- `src/store/useAppStore.ts`
- `public/audio/**/*`

También se ejecutaron los validadores del repo:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

Todos pasaron. `next build` solo emitió un warning por deprecación de `middleware` hacia `proxy`.

## Matriz de cumplimiento

| Área | Estado | Evidencia | Observaciones |
|---|---|---|---|
| Contenido MVP (7 lecciones + 2 canciones) | Parcial | `src/content/world-1.ts`, `world-2.ts`, `world-3.ts`, `src/content/songs/*` | El scope existe, pero hay drift con el PRD en rango/longitud de algunas canciones. |
| Motor de lección, estrellas y desbloqueo | Hecho | `src/engine/lesson-engine.ts`, `src/app/lesson/[id]/page.tsx` | Implementa `intro`, `demo`, `find-note`, `play-real`, `sequence-quiz`, estrellas y repetición del ejercicio principal. |
| Flujo de canciones y tempos 50/75/100 | Hecho | `src/app/songs/[id]/page.tsx`, `src/engine/song-engine.ts` | Están los modos `listen`, `fragment` y `full`, con control de tempo. |
| Auth por PIN y rutas protegidas | Hecho | `src/lib/auth.ts`, `src/middleware.ts` | PIN 4–6 dígitos, hash bcrypt, cookie httpOnly y middleware de protección. |
| Primera ejecución / onboarding | Parcial crítico | `src/components/AppHydrator.tsx`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/login/page.tsx` | Si `getStudentWithProgress()` devuelve `null`, el store no queda hidratado y `/` puede quedar cargando. |
| Persistencia Postgres + migración local | Parcial | `src/db/schema.ts`, `src/lib/repositories/*`, `src/lib/migrate-local-data.ts` | La arquitectura base está; faltan índices explícitos citados por el PRD. |
| Panel del padre | Parcial | `src/components/ParentDashboard.tsx` | Muestra progreso, tiempo y recomendación, pero “última sesión” es el último intento y “áreas débiles” solo agrupa por lección. |
| Pedagogía visual (ilustraciones / animación) | Faltante | `src/types/content.ts`, `src/app/lesson/[id]/page.tsx`, `public/` | `image?` y `demoAudio?` existen en tipos pero no se usan. No hay assets visuales para intros. |
| Audio de referencia | Parcial | `src/lib/audio.ts`, `src/app/lesson/[id]/page.tsx`, `src/app/songs/[id]/page.tsx`, `public/audio/**/*` | Hay WAV locales. Las canciones usan `fullDemoAudio`; las lecciones siguen con oscilador y no consumen `demoAudio`. |
| Responsive y accesibilidad | Parcial | `src/components/Keyboard.tsx`, `src/components/RotateBanner.tsx`, `src/app/globals.css` | Hay banner y viewport reducido en portrait, pero las teclas negras miden `36px` y el PRD pide mínimo `44x44px`. |
| Tests y CI | Hecho | `package.json`, `.github/workflows/ci.yml`, `src/**/*.test.*` | Lint, typecheck, tests y build están presentes y verdes. |

## Hallazgos prioritarios

### 1. Flujo `first-run` potencialmente roto

`AppHydrator` solo llama `hydrate(data)` cuando `data` existe:

- `src/components/AppHydrator.tsx`
- `src/store/useAppStore.ts`

Como `/` redirige a `/onboarding` solo cuando `hydrated === true && !student`, una familia nueva puede quedarse viendo el estado de carga indefinidamente.

### 2. El panel del padre no cumple por completo el resumen del PRD

`ParentDashboard` ya muestra:

- progreso global
- tiempo de práctica
- recomendación
- detalle por lección / canción

Pero todavía no cumple del todo:

- **Última sesión**: hoy se calcula como el último intento guardado.
- **Áreas débiles**: hoy se calcula por lección; el PRD habla de “notas o lecciones”.

### 3. Falta la capa visual pedagógica prometida por el PRD

El PRD describe:

1. intro con ilustración
2. animación corta del concepto
3. instrucción visual predominante sobre texto

En la app actual:

- los pasos `intro` son textuales
- no hay assets de ilustración
- `image` / `demoAudio` no tienen consumo real en la UI

### 4. La estrategia de audio está a medio camino

El repo ya tiene:

- samples por nota en `public/audio/notes`
- demos completas en `public/audio/songs`

Pero la UX no es uniforme:

- lecciones: `audioEngine.playNote(...)` con oscilador
- canciones: `new Audio(song.fullDemoAudio)`

Esto se aleja de la estrategia del PRD, que apunta a una capa unificada de Web Audio + assets locales.

### 5. Accesibilidad y touch targets aún no están cerrados

Puntos detectados:

- `BLACK_KEY_WIDTH = 36` en `src/components/Keyboard.tsx`
- el PRD exige mínimo `44x44px`
- los colores de dedos definidos en `src/types/content.ts` requieren revisión de contraste AA
- las ilustraciones todavía no existen, por lo que tampoco existe validación de `alt`

## Drift entre PRD y código

### Contenido de canciones

Hay una pequeña deriva entre el PRD y el contenido actual:

- `src/content/songs/estrellita.ts` usa más rango que el resumen “Do-Sol”.
- `src/content/songs/himno-alegria.ts` tiene un fragmento de 15 notas, por encima del rango “4–8 notas” mencionado en el PRD.

Esto no rompe la app, pero sí rompe la alineación documental.

### Auth: magic link vs PIN

El PRD v3 es inconsistente en un punto:

- una parte temprana aún menciona `magic link`
- la arquitectura y la sección técnica consolidan `PIN familiar`

La implementación actual sigue correctamente el modelo de **PIN familiar**, que debe considerarse la fuente canónica.

## Validación ejecutada

### Resultado

- `pnpm lint` -> OK
- `pnpm typecheck` -> OK
- `pnpm test` -> OK (`74 tests`)
- `pnpm build` -> OK

### Observación

`next build` mostró:

- warning de framework por deprecación de `middleware`

No bloquea esta auditoría, pero conviene atenderlo en una tarea separada.

## Recomendación de implementación

Orden sugerido:

1. Corregir hidratación / onboarding de primera ejecución.
2. Mejorar fidelidad del panel del padre.
3. Conectar mejor la capa de audio.
4. Añadir ilustraciones y micro-animación en intros.
5. Cerrar accesibilidad, tamaños táctiles e índices de BD.
6. Decidir si el contenido musical se alinea al PRD o si el PRD debe actualizarse.

## Documento relacionado

- Spec propuesta para ejecutar estos cambios: `docs/spec-prd-v3-remediacion.md`
