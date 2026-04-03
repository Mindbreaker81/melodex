# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Versionado semántico](https://semver.org/lang/es/).

## [Unreleased]

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
