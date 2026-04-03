# Pendientes post-MVP

Items no bloqueantes tras cerrar la remediación del PRD v3.

---

## 1. Service Worker / modo offline determinista

**PRD §17** — La app cachea bien sus assets estáticos, pero no garantiza todavía una experiencia offline determinista.

**Estado actual:** la persistencia depende de Postgres para login y progreso, y no existe Service Worker ni `manifest.json`.

**Acción requerida:**
- Configurar un Service Worker o estrategia PWA ligera para cachear bundles, CSS e ilustraciones.
- Agregar `manifest.json` si se quiere experiencia instalable.
- Definir explícitamente qué partes deben seguir funcionando sin red y cuáles no.

**Impacto:** bajo. Es una mejora de resiliencia, no un bloqueo del MVP.

---

## 2. Áreas débiles a nivel nota o patrón

**PRD §8** — El panel del padre ya muestra sesiones agrupadas, progreso y recomendaciones, pero las áreas a reforzar siguen agrupadas por lección.

**Estado actual:** `ParentDashboard` resume errores por lección. No hay analytics por nota, dedo o patrón de secuencia.

**Acción requerida:**
- Capturar errores con mayor granularidad en quizzes (`nota`, `paso`, `secuencia`).
- Extender el dashboard para recomendar repasar notas o patrones concretos.

**Impacto:** medio. Mejoraría la utilidad del panel del padre sin cambiar el flujo principal del niño.

---

## 3. Migrar `middleware.ts` a `proxy.ts`

**Next.js 16** — `next build` sigue mostrando el warning deprecado de `middleware`.

**Estado actual:** la protección de rutas funciona, pero la convención actual será reemplazada por `proxy`.

**Acción requerida:**
- Migrar `src/middleware.ts` a la convención recomendada por Next.js.
- Verificar que auth, assets estáticos y redirects sigan funcionando igual.

**Impacto:** bajo. Es mantenimiento técnico preventivo.
