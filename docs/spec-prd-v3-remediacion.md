# Spec técnico: Remediación de gaps contra PRD v3

> Estado: **implementada en `main`** el `2026-04-03`.  
> Este documento se conserva como spec histórica y como checklist de lo que se ejecutó.

## Objetivo

Cerrar los gaps detectados en `docs/auditoria-prd-v3.md` para dejar el repo
alineado con el **PRD v3** en los puntos que hoy están `parcial` o `faltante`,
sin ampliar scope más allá del MVP actual.

## Documento base

- Auditoría: `docs/auditoria-prd-v3.md`
- PRD fuente: `docs/prd.md`

## Resultado de ejecución

### Fases cerradas

- **Fase 1 — first-run / hidratación:** cerrada.
- **Fase 2 — panel del padre con sesiones reales:** cerrada.
- **Fase 3 — pedagogía visual en intros:** cerrada.
- **Fase 4 — unificación de audio:** cerrada.
- **Fase 5 — accesibilidad y responsive:** cerrada.
- **Fase 6 — índices y hardening de BD:** cerrada.
- **Fase 7 — alineación final de contenido vs PRD:** cerrada mediante actualización combinada de código y documentación.

### Abiertos menores tras la ejecución

1. Analytics más finos para áreas débiles por **nota/patrón**.
2. Offline determinista con **Service Worker / PWA**.
3. Migración técnica futura de `middleware.ts` a `proxy.ts`.

## Alcance

### Incluido

1. Corregir el flujo de **primera ejecución** (`login -> home -> onboarding`).
2. Mejorar el **panel del padre** para reflejar una sesión real y una recomendación más fiel.
3. Completar la capa de **pedagogía visual** en intros.
4. Unificar mejor la **reproducción de audio** usando la infraestructura ya existente.
5. Cerrar gaps de **accesibilidad** y **responsive touch**.
6. Añadir **índices de BD** faltantes.
7. Revisar el **drift de contenido** vs PRD y dejar una decisión explícita.

### Fuera de alcance

- MIDI
- PWA / offline completo
- Mano izquierda, acordes, pentagrama
- Múltiples perfiles por familia
- Reescritura de arquitectura

## Decisiones de implementación

1. **PIN familiar** sigue siendo la fuente canónica de auth.
2. **No se agregan librerías nuevas** para UI, animación o audio salvo necesidad crítica.
3. Las **sesiones** se calcularán agrupando intentos por cercanía temporal; no se crea una tabla nueva en esta fase.
4. Las **ilustraciones** serán assets estáticos ligeros (`svg` o `png`) dentro de `public/`.
5. La capa de audio debe pasar por `audioEngine` como fachada principal; los samples WAV ya existentes son el primer recurso, con fallback a oscilador.

## Fase 1 — Corregir hidratación y flujo first-run

### Problema

Hoy `AppHydrator` solo hidrata el store si `data` existe. Cuando una familia nueva no
tiene estudiante, `RootLayout` entrega `null`, `hydrated` queda en `false`, y la home
puede quedarse mostrando el estado de carga.

### Implementación

- Crear un estado vacío compartido:
  - `student: null`
  - `lessonAttempts: []`
  - `songAttempts: []`
- Cambiar `AppHydrator` para que siempre hidrate:
  - `hydrate(data ?? EMPTY_APP_STATE)`
- Mantener `hydrated = true` incluso cuando no hay alumno.
- Verificar que las páginas que hoy ya redirigen a `/onboarding` cuando
  `hydrated && !student` queden funcionando sin cambios de UX.

### Archivos

- `src/components/AppHydrator.tsx`
- `src/store/useAppStore.ts`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/parent/page.tsx`
- `src/app/songs/[id]/page.tsx`

### Tests

- Nuevo test para hidratación con estado vacío.
- Extender `src/app/page.test.tsx` para cubrir redirect cuando no hay alumno.
- Añadir cobertura equivalente para `parent` y `songs/[id]` si se considera necesario.

### Criterio de aceptación

- Una familia nueva que crea cuenta llega correctamente a `/onboarding`.
- Ninguna de las rutas protegidas queda en loading infinito por falta de alumno.

## Fase 2 — Fidelidad del panel del padre

### Problema

El panel muestra progreso y recomendación, pero:

- “Última sesión” hoy equivale al **último intento**
- no muestra claramente **qué actividades** formaron esa sesión

### Implementación

Agregar una utilidad de agregación de sesiones:

- tomar `lessonAttempts` + `songAttempts`
- ordenar por `createdAt`
- agrupar en una misma sesión cuando el gap entre intentos consecutivos sea `<= 30 min`
- para la última sesión calculada, mostrar:
  - fecha/hora de inicio
  - duración total
  - actividades practicadas (lecciones/canciones sin duplicados)
  - cantidad de intentos

Mantener `weakAreas` por lección en esta fase, pero actualizar la presentación para que
se lea como **áreas a reforzar** y quede alineada con el PRD sin requerir un rediseño del modelo de datos.

### Archivos

- `src/components/ParentDashboard.tsx`
- `src/types/storage.ts` (solo si se necesita tipado auxiliar)
- Nuevo util sugerido: `src/lib/session-utils.ts`

### Tests

- Nuevo test unitario para agrupación de sesiones.
- Test del panel con intentos de varias actividades dentro de una misma sesión.

### Criterio de aceptación

- El panel ya no muestra una sola actividad suelta como “última sesión”.
- La última sesión agrupa correctamente práctica de lecciones y canciones.

## Fase 3 — Pedagogía visual en intros

### Problema

El PRD pide intros con ilustración, animación corta y alt descriptivo. Hoy los pasos
`intro` son casi solo texto y `image` existe en tipos pero no se usa.

### Implementación

#### 3.1. Modelo de contenido

Extender `LessonStep` con metadatos visuales mínimos:

```ts
image?: string;
imageAlt?: string;
```

Opcionalmente, permitir una pista visual ligera:

```ts
visualHint?: "group-2-3" | "find-c" | "fingers-1-5" | "scale-up" | "song-fragment";
```

#### 3.2. Assets

Crear assets estáticos para los intros principales en:

- `public/illustrations/lesson-1/*`
- `public/illustrations/lesson-2/*`
- `public/illustrations/lesson-3/*`
- `public/illustrations/lesson-4/*`
- `public/illustrations/lesson-5/*`
- `public/illustrations/lesson-6/*`
- `public/illustrations/lesson-7/*`

Preferencia: `svg` simples, sin dependencias externas.

#### 3.3. Render en la UI

En `src/app/lesson/[id]/page.tsx`:

- renderizar la ilustración en pasos `intro`
- usar `alt` descriptivo
- añadir micro-animación CSS no invasiva si hay `visualHint`

#### 3.4. Validación de contenido

Actualizar tests de contenido para exigir:

- `image` en los pasos `intro`
- `imageAlt` cuando exista `image`

### Archivos

- `src/types/content.ts`
- `src/content/world-1.ts`
- `src/content/world-2.ts`
- `src/content/world-3.ts`
- `src/app/lesson/[id]/page.tsx`
- `public/illustrations/**/*`
- `src/content/content.test.ts`

### Criterio de aceptación

- Todos los pasos `intro` muestran apoyo visual real.
- Todas las ilustraciones tienen `alt` descriptivo.

## Fase 4 — Unificación de audio

### Problema

La app ya tiene samples WAV y demos completas, pero el consumo está partido:

- lecciones: oscilador
- canciones: `new Audio(...)`
- `demoAudio` no participa en la UI actual

### Implementación

#### 4.1. AudioEngine como fachada

Extender `AudioEngine` para exponer métodos de alto nivel:

- `playReferenceNote(note)`
- `playReferenceSequence(notes, tempo)`
- `playAsset(url)`
- `preloadNotes(notes[])`

Regla:

- intentar sample WAV primero
- fallback a oscilador solo si falta sample o falla carga

#### 4.2. Lecciones

En `lesson/[id]/page.tsx`:

- reemplazar `playNote(...)` por `playReferenceNote(...)`
- en pasos `demo`:
  - usar `step.demoAudio` si existe
  - si no existe, reproducir secuencia con notes + samples

#### 4.3. Canciones

En `songs/[id]/page.tsx`:

- mover la reproducción de demo completa a `audioEngine.playAsset(...)`
- mantener highlight sincronizado como ahora
- conservar `stop()` centralizado

### Archivos

- `src/lib/audio.ts`
- `src/app/lesson/[id]/page.tsx`
- `src/app/songs/[id]/page.tsx`
- `src/types/content.ts`

### Tests

- ampliar `src/lib/audio.test.ts` para cubrir fallback sample -> oscilador
- cubrir `playAsset` y `stop()`

### Criterio de aceptación

- Lecciones y canciones usan la misma fachada de audio.
- Los samples existentes en `public/audio/notes/*` pasan a ser el camino principal.

## Fase 5 — Accesibilidad y responsive

### Problema

La app ya tiene base responsive, pero no cierra del todo con el PRD:

- teclas negras de `36px`
- contraste de algunos colores de dedos
- falta apoyo visual explícito para scroll horizontal en portrait

### Implementación

#### 5.1. Teclado táctil

Actualizar `Keyboard` para cumplir mínimo touch target:

- teclas blancas: mantener `>= 44px`
- teclas negras: subir a `>= 44px`
- ajustar el cálculo de `left` para preservar la geometría

#### 5.2. Contraste

Revisar `FINGER_COLORS` y, si hace falta:

- oscurecer colores con peor contraste
- definir color de texto por dedo (`white` o `black`) en lugar de asumir siempre blanco

#### 5.3. Scroll affordance

En mobile portrait:

- mantener viewport de 1 octava
- añadir una pista visual sutil de que existe scroll horizontal
  - sombra/gradiente lateral
  - o texto breve persistente

### Archivos

- `src/components/Keyboard.tsx`
- `src/types/content.ts`
- `src/app/globals.css`
- opcional: `src/components/RotateBanner.tsx`

### Tests

- actualizar tests de `Keyboard` si cambian labels o estilos clave

### Criterio de aceptación

- Todas las teclas son tocables en móvil bajo la regla mínima del PRD.
- La UI sigue mostrando 1 octava en portrait pequeño con scroll horizontal claro.

## Fase 6 — Índices y hardening de BD

### Problema

El PRD menciona índices en `family_id` y `student_id`, pero el schema actual no los declara.

### Implementación

Añadir índices en `src/db/schema.ts`:

- `students.family_id`
- `lesson_attempts.student_id`
- `song_attempts.student_id`

Recomendado además:

- `(student_id, created_at)` para `lesson_attempts`
- `(student_id, created_at)` para `song_attempts`

Aplicar con `drizzle-kit push`.

### Archivos

- `src/db/schema.ts`
- artefactos/migración de Drizzle si el repo los usa

### Criterio de aceptación

- El schema declara explícitamente los índices necesarios para carga de alumno y dashboard.

## Fase 7 — Alineación final de contenido vs PRD

### Problema

Hay una pequeña deriva entre el resumen del PRD y el contenido real de canciones.

### Implementación propuesta

Resolver con una decisión explícita:

### Opción A — PRD manda

- ajustar fragmentos y/o demos para que:
  - los fragmentos queden en rango `4–8` notas
  - el contenido quede estrictamente dentro del resumen del PRD

### Opción B — Código manda

- mantener el contenido actual
- actualizar el PRD para reflejarlo con precisión

### Recomendación

Para esta fase, usar **Opción A** solo si el equipo quiere mantener el PRD como contrato estricto.
Si no, cerrar primero Fases 1–6 y dejar la alineación musical como decisión de producto.

## Orden recomendado

1. Fase 1 — first-run
2. Fase 2 — panel del padre
3. Fase 4 — audio
4. Fase 3 — pedagogía visual
5. Fase 5 — accesibilidad
6. Fase 6 — índices
7. Fase 7 — contenido

## Plan de validación

Al terminar la implementación:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Además validar manualmente:

1. registro nuevo con PIN
2. redirección automática a onboarding
3. creación de alumno y entrada a la primera lección
4. panel del padre con varias actividades en una misma sesión
5. demo de audio en lecciones y canciones
6. comportamiento del teclado en móvil portrait

## Riesgos

1. **Introducir demasiada complejidad visual** en una app que hoy es muy ligera.
2. **Desincronizar audio e highlights** al centralizar más lógica en `audioEngine`.
3. **Scope creep** si la alineación de contenido deriva en rehacer demos y WAVs.

## Resultado esperado

Tras estas fases, el repo debería pasar de “MVP mayormente implementado con gaps”
a “MVP alineado con el PRD v3”, manteniendo la arquitectura actual y sin rehacer la base del proyecto.
