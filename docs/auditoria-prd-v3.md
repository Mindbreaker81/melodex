# Auditoría PRD v3 — Melodex

## Estado del documento

Documento actualizado el `2026-04-03` tras implementar la remediación descrita en `docs/spec-prd-v3-remediacion.md`.

## Fuente y alcance

- **PRD auditado:** `docs/prd.md`
- **Versión:** `PRD — Melodex (v3)`
- **Alcance:** contenido, flujos principales, auth, persistencia, panel del padre, audio, responsive, accesibilidad y validadores

## Resumen ejecutivo

El repo quedó **alineado con el PRD v3 en todos los caminos críticos del MVP**:

- primera ejecución (`login -> onboarding`) corregida
- 7 lecciones y 2 canciones operativas
- auth por PIN y persistencia en Postgres
- intros con ilustración y `alt`
- audio unificado vía `audioEngine`
- teclado móvil con targets táctiles de `44px`
- panel del padre con sesiones agrupadas

Las desviaciones que siguen abiertas son **menores y no bloqueantes**:

1. Las **áreas a reforzar** del panel siguen agregadas por **lección**, no por nota/patrón.
2. El modo offline sigue sin estar garantizado con Service Worker.
3. `next build` aún muestra el warning de migración futura de `middleware` a `proxy`.

## Metodología

Se contrastaron:

- `docs/prd.md`
- `src/content/**/*`
- `src/app/**/*`
- `src/components/**/*`
- `src/engine/**/*`
- `src/lib/**/*`
- `src/db/schema.ts`
- `src/store/useAppStore.ts`
- `public/audio/**/*`
- `public/illustrations/**/*`

Validación ejecutada:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

Resultado:

- lint OK
- typecheck OK
- test OK (`86` tests)
- build OK

## Matriz de cumplimiento

| Área | Estado | Evidencia | Observaciones |
|---|---|---|---|
| Contenido MVP (7 lecciones + 2 canciones) | Hecho | `src/content/world-1.ts`, `world-2.ts`, `world-3.ts`, `src/content/songs/*` | El contenido quedó documentado con el rango actual de canciones y fragmentos guiados de `4–8` notas. |
| Motor de lección, estrellas y desbloqueo | Hecho | `src/engine/lesson-engine.ts`, `src/app/lesson/[id]/page.tsx` | Mantiene `intro`, `demo`, `find-note`, `play-real`, `sequence-quiz`, estrellas y repetición del ejercicio principal. |
| Flujo de canciones y tempos 50/75/100 | Hecho | `src/app/songs/[id]/page.tsx`, `src/engine/song-engine.ts` | Modos `listen`, `fragment` y `full` con control de tempo. |
| Auth por PIN y rutas protegidas | Hecho | `src/lib/auth.ts`, `src/middleware.ts` | PIN 4–6 dígitos, hash bcrypt, cookie httpOnly y rutas protegidas. |
| Primera ejecución / onboarding | Hecho | `src/components/AppHydrator.tsx`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/login/page.tsx` | El store se hidrata también con estado vacío y ya no queda bloqueado el primer acceso. |
| Persistencia Postgres + migración local | Hecho | `src/db/schema.ts`, `src/lib/repositories/*`, `src/lib/migrate-local-data.ts` | Incluye índices explícitos para `family_id` / `student_id` y variantes por `created_at`. |
| Panel del padre | Parcial menor | `src/components/ParentDashboard.tsx`, `src/lib/session-utils.ts` | Ya agrupa sesiones reales. La única brecha restante es que las áreas a reforzar siguen a nivel lección. |
| Pedagogía visual (ilustraciones / animación) | Hecho | `src/types/content.ts`, `src/app/lesson/[id]/page.tsx`, `public/illustrations/**/*` | Todos los pasos `intro` tienen apoyo visual real, `alt` descriptivo y micro-animación ligera. |
| Audio de referencia | Hecho | `src/lib/audio.ts`, `src/app/lesson/[id]/page.tsx`, `src/app/songs/[id]/page.tsx`, `public/audio/**/*` | Lecciones y canciones usan la misma fachada y hacen fallback a secuencia/samples cuando falta asset pregrabado. |
| Responsive y accesibilidad | Hecho | `src/components/Keyboard.tsx`, `src/app/globals.css` | Teclas negras a `44px`, mejora de contraste y pista visual de scroll en portrait. |
| Tests y CI | Hecho | `package.json`, `.github/workflows/ci.yml`, `src/**/*.test.*` | Suite y build verdes con cobertura ampliada. |

## Hallazgos cerrados por la remediación

### 1. First-run / hidratación

Antes: una familia nueva podía quedarse en loading infinito.  
Ahora: `AppHydrator` hidrata también con estado vacío y permite redirección correcta a `/onboarding`.

### 2. Panel del padre

Antes: “Última sesión” equivalía al último intento.  
Ahora: se agrupan lecciones y canciones en sesiones reales por cercanía temporal.

### 3. Intros visuales

Antes: los pasos `intro` eran casi solo texto.  
Ahora: cada intro tiene ilustración SVG, `imageAlt` y una pista visual ligera.

### 4. Audio

Antes: lecciones y canciones usaban rutas de audio distintas.  
Ahora: ambas pasan por `audioEngine` con `playReferenceNote`, `playReferenceSequence`, `playAsset` y `preloadNotes`.

### 5. Touch targets y responsive

Antes: las teclas negras medían `36px`.  
Ahora: el teclado móvil cumple la base táctil esperada (`44px`) y comunica mejor el scroll horizontal.

## Abiertos menores

### 1. Áreas a reforzar por nota o patrón

El dashboard ya es útil, pero todavía no baja a granularidad de nota, dedo o patrón.

### 2. Offline determinista

La app cachea assets estáticos, pero no hay aún Service Worker ni estrategia PWA.

### 3. Migración futura `middleware -> proxy`

Es deuda técnica de framework, no una brecha funcional del producto.

## Documento relacionado

- Spec de remediación ya ejecutada: `docs/spec-prd-v3-remediacion.md`
- Pendientes no bloqueantes: `docs/pendientes-post-mvp.md`
