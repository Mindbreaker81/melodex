# PRD — Melodex (v1)

> App educativa para aprender órgano eléctrico desde cero.  
> Diseñada para un niño de 9 años, principiante absoluto, que practica en casa con su padre.

---

## 1. Contexto y problema

Un niño de 9 años tiene un órgano eléctrico en casa y quiere aprender a tocarlo. No tiene profesor. Su padre (con conocimientos técnicos pero no musicales) aprende con él. Las sesiones son mixtas: a veces juntos, a veces el niño solo.

**Problemas reales que resolver:**

- No hay un método estructurado adaptado a un niño sin profesor.
- Los libros de método son densos, teóricos y desmotivantes para un niño de 9 años.
- El padre necesita saber qué practicar y en qué orden sin ser músico.
- Cuando el niño practica solo, necesita guía visual clara y feedback inmediato.
- La motivación decae si no hay sensación de progreso rápido.

---

## 2. Solución

Una web-app que funciona como **método guiado paso a paso**: muestra qué tocar, con qué dedos, en qué orden, y registra el progreso. La pantalla acompaña al niño MIENTRAS toca su órgano real — no sustituye al instrumento.

**Modelo mental:** la app es una partitura interactiva con profesor incorporado. La pantalla va al lado del órgano.

---

## 3. Usuarios

### Usuario principal: el niño (9 años)
- Principiante absoluto.
- Atención limitada (~10 min de concentración sostenida).
- Aprende mejor con estímulos visuales y refuerzo inmediato.
- Tolera mal las explicaciones largas.
- Necesita éxito temprano: tocar algo reconocible en la primera o segunda sesión.

### Usuario secundario: el padre
- No es músico. Aprende con el niño.
- Necesita ver qué ha practicado, dónde falla, y qué toca a continuación.
- A veces supervisa, a veces deja al niño solo con la app.

---

## 4. Principios de diseño

1. **La app guía, el órgano suena.** El teclado virtual es referencia visual, no instrumento. El niño toca en su órgano real.
2. **Una cosa nueva por lección.** Nunca introducir dos conceptos simultáneos.
3. **Éxito en 5 minutos.** Cada sesión debe producir algo tangible.
4. **Instrucciones visuales, no textuales.** Mínimo texto. Máximo color, animación y señalización.
5. **Progresión visible.** El niño debe ver que avanza.
6. **Contenido expandible.** Añadir lecciones y canciones debe ser trivial (JSON/TS).

---

## 5. Alcance del MVP

### Incluido

- Teclado virtual de referencia (2 octavas, Do3 a Do5).
- Guía de digitación con colores por dedo y números.
- 7 lecciones progresivas (mano derecha).
- 2 canciones guiadas con práctica por fragmentos.
- Sistema de progreso: estrellas por lección (1-3), barra de avance global.
- Sonido de referencia (para que el niño escuche cómo suena la nota/melodía correcta).
- Vista de padre: lecciones completadas, estrellas, áreas débiles, tiempo de práctica.
- Notación en español: Do, Re, Mi, Fa, Sol, La, Si.
- Responsive: tablet, portátil, móvil.
- Persistencia de progreso en Supabase.

### Fuera del MVP (pero arquitectura preparada)

- Entrada MIDI desde el órgano real (investigar si el órgano tiene USB/MIDI).
- Mano izquierda (se añadirá como Mundo 3+).
- Acordes.
- Lectura de pentagrama.
- Ritmo avanzado / metrónomo independiente.
- Múltiples perfiles de niño.
- PWA / modo offline.
- Autenticación compleja (el MVP puede funcionar con un magic link simple).

---

## 6. Contenido del MVP

### Mundo 1 — Descubro el teclado (3 lecciones)

**Objetivo:** reconocer el patrón visual del teclado y ubicar las notas.

| # | Lección | Qué aprende | Actividad |
|---|---------|-------------|-----------|
| 1 | Las teclas negras | El teclado tiene un patrón repetitivo: grupos de 2 y 3 negras | Identificar grupos de 2 y 3 en el teclado virtual |
| 2 | Encuentra el Do | El Do está justo a la izquierda del grupo de 2 negras | Tocar todos los Do del teclado real |
| 3 | Do, Re, Mi, Fa, Sol | Las 5 notas principales de la escala en posición | Tocar cada nota cuando la app la pide |

### Mundo 2 — Mis dedos (3 lecciones)

**Objetivo:** numeración de dedos y posición básica de mano derecha.

| # | Lección | Qué aprende | Actividad |
|---|---------|-------------|-----------|
| 4 | Los 5 dedos | Pulgar=1, índice=2... meñique=5 | Asociar número y color a cada dedo |
| 5 | Do-Re-Mi con 1-2-3 | Posición de 3 dedos en Do-Re-Mi | Tocar secuencia ascendente y descendente |
| 6 | Do a Sol con 5 dedos | Posición completa de 5 dedos | Tocar escala de Do a Sol y vuelta |

### Mundo 3 — Mis primeras canciones (1 lección + 2 canciones)

**Objetivo:** aplicar lo aprendido en melodías reales.

| # | Lección | Qué aprende | Actividad |
|---|---------|-------------|-----------|
| 7 | Preparación para canciones | Tocar fragmentos cortos con ritmo libre | Practicar los primeros compases de cada canción |

**Canciones del MVP:**

| Canción | Notas usadas | Por qué |
|---------|-------------|---------|
| Estrellita (Twinkle Twinkle) | Do-Sol | Universalmente conocida, repetitiva, rango limitado |
| Himno de la Alegría (simplificada) | Mi-Sol (fragmento) | Reconocible, solo 3 notas en la versión simplificada |

Cada canción tiene:
- Modo **escuchar**: la app toca la melodía completa como referencia.
- Modo **fragmento**: se practica por partes (4-8 notas cada una).
- Modo **completa**: tocar la canción entera.
- Control de **tempo**: lento (50%), normal (75%), original (100%).

---

## 7. Interacción principal

### El teclado virtual como guía

El teclado virtual NO es para tocar. Es un mapa visual que muestra:

- **Qué nota tocar:** la tecla se ilumina.
- **Con qué dedo:** número y color sobre la tecla.
- **Qué viene después:** la siguiente nota aparece atenuada.
- **Si acertó:** feedback visual al pulsar la tecla correcta (para cuando haya MIDI; en MVP sin MIDI, el niño avanza manualmente con un botón "Listo" o el padre confirma).

### Flujo de una lección típica

```
1. Pantalla de intro: "Hoy aprendemos dónde está el Do" + ilustración
2. Paso explicativo: animación corta mostrando el concepto (~5 seg)
3. Paso de práctica: "Toca el Do en tu órgano" + tecla iluminada en pantalla
4. El niño toca → pulsa "Siguiente" (o MIDI detecta la nota en el futuro)
5. Repetir 3-5 veces con variaciones
6. Paso de cierre: resumen + estrellas
```

### Sin MIDI: el problema de la validación

En el MVP sin MIDI, la app no puede saber si el niño tocó correctamente. Hay dos opciones:

**Opción A — Autoavance con honor system:**  
El niño pulsa "Siguiente" cuando cree que lo hizo bien. Simple, pero no valida nada.

**Opción B — Confirmación mixta:**  
Para ejercicios de identificación (¿dónde está el Do?) → el niño toca la tecla en el teclado virtual como respuesta. Para ejercicios de práctica en el órgano → autoavance con botón "Listo".

**Recomendación:** Opción B. Combina validación real (quiz en pantalla) con práctica real (tocar en el órgano). Cuando haya MIDI, se elimina el botón "Listo" y la validación es automática.

---

## 8. Progreso y motivación

### Sistema de estrellas (ligero)

- Cada lección otorga 1, 2 o 3 estrellas.
  - 1 estrella: completó la lección.
  - 2 estrellas: completó sin errores en los quiz de pantalla.
  - 3 estrellas: completó sin errores + repitió el ejercicio principal.
- Las canciones otorgan 1 estrella por fragmento completado + 1 extra por tocarla completa.

### Desbloqueo lineal

- Las lecciones se desbloquean secuencialmente. No se exige 3 estrellas para avanzar.
- Las canciones se desbloquean al completar el Mundo 2 (6 lecciones).
- Se puede repetir cualquier lección completada.

### Vista del padre

Una sola pantalla que muestra:

- **Progreso global:** "Lección 5 de 7 · 12 de 21 estrellas".
- **Última sesión:** fecha, duración, qué lecciones/canciones practicó.
- **Áreas débiles:** notas o lecciones donde más errores hubo (basado en quizzes).
- **Siguiente recomendación:** "Repetir lección 5" o "Probar Estrellita en modo lento".

No es un dashboard complejo. Es una pantalla resumen.

---

## 9. Estructura de contenido (formato de datos)

El contenido educativo vive en archivos TypeScript dentro del repositorio. No en base de datos.

```typescript
// types/content.ts
export type FingerNumber = 1 | 2 | 3 | 4 | 5;

export type StepType =
  | "intro"           // Pantalla explicativa con ilustración
  | "demo"            // La app reproduce el sonido de referencia
  | "find-note"       // Quiz: el niño toca la nota en el teclado virtual
  | "play-real"       // Instrucción: "toca esto en tu órgano" + botón Listo
  | "sequence-quiz"   // Quiz: tocar secuencia en teclado virtual
  | "song-fragment";  // Práctica guiada de fragmento de canción

export interface LessonStep {
  id: string;
  type: StepType;
  instruction: string;        // Texto corto para el niño
  targetNotes?: string[];     // Notas objetivo (ej: ["C4", "D4", "E4"])
  fingers?: FingerNumber[];   // Digitación sugerida
  demoAudio?: string;         // Referencia al sonido de demostración
  image?: string;             // Ilustración opcional
}

export interface Lesson {
  id: string;
  worldId: string;
  order: number;
  title: string;
  objective: string;          // Una frase: "Aprende dónde está el Do"
  estimatedMinutes: number;
  hand: "right" | "left";
  notesUsed: string[];
  steps: LessonStep[];
}

export interface SongFragment {
  id: string;
  notes: { note: string; finger: FingerNumber; durationMs: number }[];
}

export interface Song {
  id: string;
  title: string;
  difficulty: "easy" | "medium";
  requiredLessonId: string;   // Lección mínima para desbloquear
  fragments: SongFragment[];
  fullDemoAudio: string;
}

export interface World {
  id: string;
  order: number;
  title: string;
  description: string;
  lessonIds: string[];
}
```

**Añadir contenido = añadir un archivo TS y registrar en el índice.** Sin migraciones de BD, sin CMS.

---

## 10. Arquitectura técnica

### Stack

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Framework | Next.js (App Router) | SSR para carga inicial, client components para interacción |
| UI | React + Tailwind CSS | Rápido de desarrollar, responsive nativo |
| Lenguaje | TypeScript | Tipado del contenido educativo y lógica |
| Audio | Tone.js | Reproducción de notas de referencia, secuencias, demos |
| Estado de sesión | Zustand | Estado efímero del ejercicio activo |
| Base de datos | Supabase (Postgres) | Progreso, perfiles, intentos |
| Auth | Supabase Auth (magic link) | Mínima fricción, una cuenta de padre |
| Deploy | Vercel o Netlify | Despliegue simple desde repo |

### Lo que NO necesita el MVP

- Backend propio / API custom.
- CMS de contenidos.
- Analítica avanzada (derivar métricas de la tabla de intentos es suficiente).
- Sistema de roles complejo.
- Internacionalización (todo en español).

### Modelo de datos (Supabase)

```sql
-- Cuenta del padre
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Perfil del niño
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) NOT NULL,
  display_name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  current_lesson_id TEXT NOT NULL DEFAULT 'lesson-1',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Intentos de lección (fuente de verdad para todo el progreso)
CREATE TABLE lesson_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) NOT NULL,
  lesson_id TEXT NOT NULL,
  stars INTEGER NOT NULL CHECK (stars BETWEEN 0 AND 3),
  quiz_errors INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Intentos de canción
CREATE TABLE song_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) NOT NULL,
  song_id TEXT NOT NULL,
  fragment_id TEXT,              -- NULL si es canción completa
  completed BOOLEAN NOT NULL DEFAULT false,
  tempo_percent INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

4 tablas. RLS activado: cada `profile_id` solo lee/escribe sus propios datos.

La vista del padre se construye con queries sobre `lesson_attempts` y `song_attempts`. No necesita tabla separada de "progreso resumido" — es una vista derivada.

### Separación de responsabilidades

```
contenido educativo (TS/JSON en repo)
       ↓
motor de lección (lesson-engine.ts)  ←  decide qué paso mostrar,
       ↓                                evalúa respuestas, calcula estrellas
componentes UI (React)               ←  renderiza, recoge input
       ↓
persistencia (Supabase)              ←  guarda intentos y progreso
```

La UI no decide lógica educativa. El motor de lección es una función pura que recibe estado y devuelve el siguiente paso.

---

## 11. Pantallas principales

### Pantalla de inicio (niño)
- Avatar + nombre.
- Botón grande: "Continuar" → abre la siguiente lección pendiente.
- Acceso a Canciones (si desbloqueadas).
- Contador de estrellas.

### Mapa de lecciones
- Lista visual de mundos con lecciones.
- Lecciones completadas: estrellas visibles.
- Siguiente lección: destacada.
- Lecciones futuras: bloqueadas (gris).

### Pantalla de lección
- Instrucción grande y clara en la parte superior.
- Teclado virtual de referencia en la parte inferior.
- Barra de progreso del ejercicio.
- Botón "Listo" / "Siguiente" prominente.

### Pantalla de canción
- Título y fragmentos como lista.
- Teclado virtual mostrando las notas del fragmento activo.
- Controles: Escuchar demo · Lento · Normal · Repetir.

### Panel del padre
- Accesible desde icono/menú.
- No requiere navegación compleja.
- Una pantalla con: progreso, última sesión, áreas débiles, recomendación.

---

## 12. Flujos principales

### A — Primera vez
1. Padre abre la app → login con magic link.
2. Onboarding: nombre del niño + elegir avatar (6-8 opciones predefinidas).
3. La app abre directamente la Lección 1.

### B — Sesión normal
1. Niño abre la app → pantalla de inicio.
2. Pulsa "Continuar".
3. Completa la lección → recibe estrellas.
4. Desbloquea la siguiente.

### C — Práctica de canción
1. Niño entra en Canciones.
2. Elige canción desbloqueada.
3. Escucha demo → practica por fragmentos → intenta completa.

### D — Padre revisa
1. Padre abre panel.
2. Ve progreso, errores, recomendación.
3. Decide si repetir algo o seguir avanzando.

---

## 13. Decisiones pendientes

| Decisión | Opciones | Impacto | Cuándo decidir |
|----------|---------|---------|----------------|
| ¿El órgano tiene MIDI/USB? | Sí → integrar desde MVP. No → usar Opción B (quiz + botón Listo) | Alto: cambia toda la validación | Antes de empezar desarrollo |
| ¿Qué avatar system usar? | Emojis simples / Ilustraciones custom / Generados | Bajo: cosmético | Durante diseño UI |
| ¿Añadir metrónomo visual para ritmo? | Sí (Mundo 3+) / No en MVP | Medio: scope | Después de validar Mundos 1-2 |
| ¿Landing page pública o acceso directo? | Landing / Solo login | Bajo | Al deployar |

---

## 14. MIDI: plan de integración futura

Si el órgano tiene MIDI/USB, esto transforma la app de "slideshow interactivo" a "profesor digital real". La integración sería:

- **Web MIDI API** (nativa en Chrome/Edge) para leer notas del órgano.
- El motor de lección recibe la nota tocada y valida en tiempo real.
- Se elimina el botón "Listo" en ejercicios de práctica.
- Se puede medir ritmo, velocidad, y errores reales.

**La arquitectura del MVP ya lo soporta:** el `lesson-engine` acepta un input de nota. Hoy viene del teclado virtual (quiz); mañana viene de MIDI. La UI no cambia.

---

## 15. Orden de implementación

| Fase | Qué | Entregable | Estimación |
|------|-----|-----------|-----------|
| 1 | Scaffold + Auth + Onboarding | App con login, perfil de niño, pantalla de inicio | 1-2 sesiones |
| 2 | Teclado virtual + Audio | Teclado de referencia con sonido de notas (Tone.js) | 1-2 sesiones |
| 3 | Motor de lección + Lecciones 1-3 | Mundo 1 jugable completo | 2-3 sesiones |
| 4 | Lecciones 4-7 + sistema de estrellas | Mundos 2-3 jugables, progreso persistido | 2-3 sesiones |
| 5 | Canciones + reproductor | 2 canciones con fragmentos y tempo variable | 2-3 sesiones |
| 6 | Panel del padre + pulido | Vista resumen, áreas débiles, recomendaciones | 1-2 sesiones |

**Test de validación:** si tu hijo completa el Mundo 1 (3 lecciones) sin que le obligues a seguir, el producto funciona.

---

## 16. Criterio de éxito

El MVP se considera exitoso si:

- El niño puede usar la app sin explicaciones largas del padre.
- Completa al menos 3 lecciones en su primera semana.
- Pide volver a practicar voluntariamente.
- El padre percibe progreso real (el niño toca notas correctas en el órgano).
- Añadir una lección nueva lleva menos de 30 minutos.

---

## 17. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Sin MIDI, la validación es débil | Alta | Medio | Diseño mixto: quiz en pantalla + práctica en órgano. Investigar MIDI del órgano ASAP |
| El niño se aburre antes de llegar a canciones | Media | Alto | Lecciones muy cortas (3-5 min). Estrellita disponible desde la lección 7 (no la 15) |
| Scope creep: añadir features antes de validar | Alta | Alto | Disciplina: no añadir nada hasta que Mundo 1 esté probado con el niño |
| El teclado virtual no se ve bien en móvil | Media | Medio | Diseñar mobile-first. 2 octavas son manejables en landscape |