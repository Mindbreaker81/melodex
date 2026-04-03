# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Versionado semántico](https://semver.org/lang/es/).

## [Unreleased]

### Añadido

- **Auditoría PRD v3 actualizada**: `docs/auditoria-prd-v3.md` ahora refleja el estado del repo tras la remediación.
- **Spec histórica de remediación**: `docs/spec-prd-v3-remediacion.md` documenta el plan ejecutado y los abiertos restantes.
- **Ilustraciones intro**: assets SVG para las 7 lecciones en `public/illustrations/lesson-{1..7}/`.
- **Sesiones de práctica**: utilidad `session-utils.ts` para agrupar intentos de lecciones y canciones en sesiones reales.
- **Cobertura de tests ampliada**: nuevos tests para `AppHydrator`, `ParentDashboard`, `session-utils` y audio.

### Cambiado

- **README**: actualizado con el estado real del MVP, nuevos documentos y resultado actual de validación.
- **PRD v3**: alineado con el auth por PIN, audio WAV, flujo real de onboarding y modelo de contenido visual/audio actual.
- **Pendientes post-MVP**: reducido a pendientes vigentes tras la remediación PRD v3.
- **Panel del padre**: “Última sesión” ahora agrupa actividades reales y “Áreas débiles” pasa a presentarse como “Áreas a reforzar”.
- **Lecciones intro**: renderizan ilustración, `alt` descriptivo y micro-animaciones ligeras.
- **Audio**: canciones y lecciones usan la misma fachada `audioEngine` (`playReferenceNote`, `playReferenceSequence`, `playAsset`, `preloadNotes`).
- **Teclado móvil**: teclas negras ajustadas a `44px`, nuevos colores de dedos y pista visual de scroll horizontal en portrait.
- **Modelo de contenido**: `LessonStep` incluye `imageAlt` y `visualHint`; `Song.fullDemoAudio` pasa a ser opcional con fallback programático.

### Corregido

- **First-run / hidratación**: una familia nueva ya no puede quedarse bloqueada en loading antes del onboarding.
- **Persistencia Postgres**: se añadieron índices explícitos para `family_id` y `student_id`, incluyendo variantes por `created_at`.
- **Contenido guiado**: `Himno de la Alegría` vuelve a quedar dentro del rango de fragmentos guiados de `4–8` notas.
- **Auditoría/PRD**: se eliminaron referencias desalineadas a `magic link`, `.mp3` y estado pre-remediación.

## [0.4.0] - 2026-04-03

### Añadido

- **Postgres como fuente de verdad**: migración de localStorage a Postgres directo vía Drizzle ORM.
- **Auth por PIN familiar**: login con PIN de 4-6 dígitos, cookie httpOnly, middleware de protección de rutas.
- **Página de login** (`/login`): UI para ingresar/crear PIN familiar.
- **Schema Drizzle**: tablas `families`, `students`, `lesson_attempts`, `song_attempts` con cascade y índices.
- **Server actions**: `student-repo.ts` y `attempt-repo.ts` encapsulan todas las escrituras a BD.
- **AppHydrator**: componente que hidrata el store Zustand desde datos del servidor en el layout.
- **Importador localStorage → Postgres**: detecta progreso local post-login y ofrece importar.
- **Spec de migración**: `docs/spec-supabase-migration.md` con plan técnico completo.
- Nuevas dependencias: `drizzle-orm`, `postgres`, `bcryptjs`, `drizzle-kit`.

### Cambiado

- **Store Zustand**: eliminado `persist`, mutaciones ahora async (llaman server actions).
- **Layout**: server component que obtiene datos de BD y los pasa al hydrator.
- **Todas las pages**: migradas de `persist.onFinishHydration` a `store.hydrated`.
- **Onboarding**: `setStudent` ahora async, crea student en BD.
- **Lesson/Song pages**: `addLessonAttempt`, `addSongAttempt`, `setCurrentLessonId` ahora async.
- **Deploy**: ahora requiere variable de entorno `POSTGRES_URL`.

### Corregido (auditoria PRD v3)

- **Progresión lineal**: `orderedLessons` derivado de `worlds` para secuencia global real.
- **find-note**: acepta cualquier nota válida del step (multi-answer).
- **Canciones**: `requiredLessonId` unificado a `lesson-6` (alineado con PRD).
- **Estrellas separadas**: `getSongStars` y `getTotalSongStars` independientes de lecciones.
- **Panel del padre**: sección de canciones y tiempo total de práctica.
- **Mobile keyboard**: viewport de 1 octava en portrait (352px).
- **React hooks**: ref mutations y setState-in-effect corregidos.
- **Selectores Zustand**: estabilizados para evitar loops infinitos.

## [0.3.1] - 2026-04-03

### Corregido

- **Flujo "Continuar"**: el botón ahora abre directamente la siguiente lección pendiente (antes iba al mapa de lecciones).
- **Onboarding**: al completar, redirige a la Lección 1 directamente (antes iba a la pantalla de inicio).
- **3 estrellas alcanzable**: agregado botón "Repetir lección" en la pantalla de finalización para poder obtener 3 estrellas.
- **Tempo en todos los modos**: controles de tempo visibles en escuchar, fragmento y completa (antes solo en escuchar).
- **Himno de la Alegría simplificado**: reducido a 3 notas (Mi, Fa, Sol) según el PRD.
- **Contraste WCAG AA**: colores de dedos actualizados a variantes más oscuras que cumplen ratio 4.5:1 contra texto blanco.
- **aria-labels enriquecidos**: teclas activas del teclado incluyen nombre y número de dedo (ej: "C4 (Do) - dedo 1, pulgar").
- **Teclas negras 36px**: aumentado ancho mínimo de 28px a 36px para mejorar touch targets.

## [0.3.0] - 2026-04-03

### Añadido

**Fase 0 — Scaffold**
- Proyecto Next.js 16 (App Router) con TypeScript strict, Tailwind CSS 4, ESLint 9.
- Zustand 5 para estado local, Vitest 3 + React Testing Library para tests.
- Estructura de carpetas: `src/{app,components,engine,content,store,types,lib}`.
- Scripts: `dev`, `build`, `lint`, `typecheck`, `test`, `ci`.

**Fase 1 — Tipos, store y onboarding**
- Tipos TypeScript para contenido educativo (`content.ts`) y esquema de persistencia (`storage.ts`).
- Store Zustand con `persist` en localStorage (perfil, intentos de lección, intentos de canción).
- Pantalla de onboarding (nombre + avatar) y pantalla de inicio.

**Fase 2 — Teclado virtual y audio**
- Componente `<Keyboard>` de 2 octavas (Do3–Do5) con iluminación por dedo, aria-labels en español, scroll en mobile.
- Motor de audio con Web Audio API: oscilador triangle, `playNote`, `playSequence`, carga de samples con fallback.

**Fase 3 — Motor de lección y Mundo 1**
- `lesson-engine`: funciones puras para gestión de estado de lección (`initLesson`, `processAction`, `calculateStars`, `isLessonUnlocked`).
- Mundo 1 "Descubro el teclado" (3 lecciones): teclas negras, encontrar el Do, Do-Re-Mi-Fa-Sol.
- Pantalla interactiva de lección con todos los tipos de step (intro, demo, find-note, play-real, sequence-quiz).
- Mapa de lecciones con estados (completada/actual/bloqueada).

**Fase 4 — Mundos 2-3 y sistema de estrellas**
- Mundo 2 "Mis dedos" (3 lecciones): numeración de dedos, Do-Re-Mi con 1-2-3, escala completa.
- Mundo 3 "Mis primeras canciones" (1 lección): preparación con fragmentos.
- Componentes `<Stars>` y `<ProgressBar>` para visualización de progreso.

**Fase 5 — Canciones y reproductor**
- 2 canciones: Estrellita (4 fragmentos) e Himno de la Alegría (3 fragmentos).
- `song-engine`: funciones puras para gestión de estado de canción.
- Reproductor con 3 modos (escuchar, fragmento, completa) y control de tempo (50%/75%/100%).

**Fase 6 — Panel del padre y pulido**
- Panel del padre: progreso global, última sesión, áreas débiles, recomendación.
- Componente `<RotateBanner>` para sugerir rotación a landscape en mobile portrait.
- Enlace al panel del padre desde la pantalla de inicio.

**Infraestructura**
- 67 tests unitarios y de componente pasando.
- CI: lint + typecheck + test en cada cambio.
- Samples de audio WAV generados para todas las notas (C3-C5).
- Workflow de GitHub Actions para CI automático.

## [0.2.0] - 2026-04-03

### Cambiado

- PRD actualizado a v2 con las siguientes mejoras:
  - Stack: Web Audio API nativa reemplaza a Tone.js (menor bundle, sin dependencias).
  - Stack: localStorage + Zustand persist reemplaza a Supabase en el MVP (validar producto sin backend).
  - Nuevo principio de diseño: estrategia mobile portrait (1 octava + scroll).
  - Nueva Fase 0 en orden de implementación (scaffold, linting, CI).
  - Nueva sección de testing (unitarios para lesson-engine, validación de contenido, CI).
  - Nueva sección de accesibilidad básica (contraste, navegación por teclado, aria-labels).
  - Nueva sección de estrategia de audio (samples locales, funcionamiento offline).

## [0.1.0] - 2026-04-03

### Añadido

- Documentación inicial del repositorio (`README.md`).
- Este archivo de historial de cambios (`CHANGELOG.md`).
- PRD v1 en `docs/prd.md` (definición de producto, MVP y arquitectura técnica).
- Repositorio Git inicial y publicación en GitHub (`mindbreaker81/melodex`).
