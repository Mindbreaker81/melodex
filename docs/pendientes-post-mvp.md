# Pendientes post-MVP

Items menores identificados en la auditoría PRD v2 que no bloquean el lanzamiento.

---

## 1. Ilustraciones en pantallas de intro

**PRD §7/§16** — Las pantallas de tipo `intro` en las lecciones mencionan "ilustración" y el PRD requiere textos alternativos (`alt`) para ellas.

**Estado actual:** las pantallas intro muestran solo texto e instrucciones. No hay imágenes.

**Acción requerida:**
- Diseñar o conseguir 7 ilustraciones simples (una por lección) que refuercen visualmente el concepto.
- Agregarlas en `public/images/lessons/` y referenciarlas desde el campo `image` de cada `LessonStep` de tipo `intro`.
- La UI de lección (`app/lesson/[id]/page.tsx`) ya soporta el campo `image` en el tipo; solo falta renderizar un `<img>` con `alt` descriptivo cuando esté presente.

**Impacto:** cosmético. Mejora la experiencia visual para el niño pero no bloquea funcionalidad.

---

## 2. Service Worker / modo offline garantizado

**PRD §17** — Afirma que la app funciona 100% offline después de la primera carga.

**Estado actual:** funciona de facto sin conexión (localStorage, audio local en `/public/audio/`, sin APIs externas). Sin embargo, no hay Service Worker ni manifiesto de caché que garantice la disponibilidad offline de los assets estáticos del framework (JS bundles, CSS).

**Acción requerida:**
- Configurar `next-pwa` o un Service Worker manual que pre-cachee los assets estáticos.
- Agregar `manifest.json` para PWA básica.
- El PRD §5 marca "PWA / modo offline" como fuera del MVP, así que esto es una mejora post-validación.

**Impacto:** bajo. En la práctica la app ya funciona sin red si el navegador tiene la página en caché. El Service Worker lo haría determinista.

---

## 3. Mobile portrait: 1 octava visible

**PRD §4.7** — En pantallas < 640px en portrait, el teclado debe mostrar 1 octava con scroll horizontal.

**Estado actual:** el teclado renderiza las 2 octavas completas con `overflow-x-auto`. En un teléfono de 375px de ancho, las teclas blancas de 44px hacen que ~1 octava (8 teclas × 44px = 352px) sea visible naturalmente, y el resto es accesible por scroll. El `RotateBanner` sugiere rotar a landscape.

**Acción requerida:** ninguna inmediata. El comportamiento actual ya cumple la intención del PRD por dimensiones naturales. Si se quiere ser más explícito, se podría agregar un indicador visual de scroll (flecha o sombra en el borde derecho) para que el niño sepa que hay más teclas.

**Impacto:** nulo. Ya funciona según lo esperado.
