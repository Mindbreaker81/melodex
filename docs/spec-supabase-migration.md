# Spec técnico: Migración a Postgres (Drizzle + PIN familiar)

## Objetivo

Reemplazar `localStorage` como fuente de verdad por **Postgres directo vía Drizzle ORM**,
con autenticación simple por **PIN familiar** (sin email/magic link).
Zustand se mantiene como cache de UI.

---

## Variables de entorno requeridas

```
# Conexión directa a Postgres
POSTGRES_URL=YOUR_POSTGRES_CONNECTION_STRING_HERE
```

La variable `SUPABASE_API_KEY` existente en `.env` **no se usa** para conexión directa.
Se necesita el **connection string** de Postgres desde el dashboard de Supabase.

Agregar a `.env` (ya excluido por `.gitignore`).
En Vercel: Settings → Environment Variables.

Crear `.env.example` con placeholders (sin valores reales).

> **Nota**: `POSTGRES_URL` nunca debe llegar al cliente. Solo se usa en server actions
> y route handlers (`"use server"`).

---

## Fase 1 — Esquema con Drizzle

### Dependencias

```bash
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit
```

- `drizzle-orm`: ORM ligero y type-safe
- `postgres`: driver Postgres nativo (postgres.js)
- `drizzle-kit`: CLI para migraciones y push de schema

### Archivo nuevo: `src/db/schema.ts`

```ts
import { pgTable, uuid, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const families = pgTable("families", {
  id: uuid("id").defaultRandom().primaryKey(),
  pinHash: text("pin_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const students = pgTable("students", {
  id: uuid("id").defaultRandom().primaryKey(),
  familyId: uuid("family_id").references(() => families.id, { onDelete: "cascade" }).notNull(),
  displayName: text("display_name").notNull(),
  avatar: text("avatar").notNull(),
  currentLessonId: text("current_lesson_id").notNull().default("lesson-1"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const lessonAttempts = pgTable("lesson_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").references(() => students.id, { onDelete: "cascade" }).notNull(),
  lessonId: text("lesson_id").notNull(),
  stars: integer("stars").notNull(),
  quizErrors: integer("quiz_errors").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  durationSeconds: integer("duration_seconds"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const songAttempts = pgTable("song_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").references(() => students.id, { onDelete: "cascade" }).notNull(),
  songId: text("song_id").notNull(),
  fragmentId: text("fragment_id"),
  completed: boolean("completed").notNull().default(false),
  tempoPercent: integer("tempo_percent").notNull().default(100),
  durationSeconds: integer("duration_seconds"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```

### Archivo nuevo: `src/db/index.ts`

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle(client, { schema });
```

### Archivo nuevo: `drizzle.config.ts`

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
});
```

### Diferencias con PRD original

| Campo/Tabla        | PRD original        | Este spec           |
|--------------------|---------------------|---------------------|
| `profiles`         | email-based         | reemplazada por `families` (PIN-based) |
| `song_attempts.duration_seconds` | no existía | añadido |
| `ON DELETE CASCADE` | no especificado    | incluido            |
| ORM                | SQL manual          | Drizzle type-safe   |

### Ejecución

```bash
# Generar migración SQL
pnpm drizzle-kit generate

# Aplicar a la BD
pnpm drizzle-kit push
```

---

## Fase 2 — Auth por PIN familiar

No hay sesiones de email. El flujo es:

1. Padre crea cuenta con PIN de 4-6 dígitos.
2. Al entrar a la app, ingresa PIN.
3. El servidor compara hash (bcrypt), devuelve cookie `familyId` (httpOnly, signed).
4. Las rutas protegidas verifican la cookie.

### Archivo nuevo: `src/lib/auth.ts`

```ts
"use server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { families } from "@/db/schema";
import { eq } from "drizzle-orm";
import { compare, hash } from "bcryptjs";

const COOKIE_NAME = "melodex-family";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 año

export async function createFamily(pin: string) {
  const pinHash = await hash(pin, 10);
  const [family] = await db.insert(families).values({ pinHash }).returning();
  await setFamilyCookie(family.id);
  return family.id;
}

export async function verifyPin(familyId: string, pin: string) {
  const [family] = await db.select().from(families).where(eq(families.id, familyId));
  if (!family) return false;
  return compare(pin, family.pinHash);
}

export async function loginWithPin(pin: string) {
  const allFamilies = await db.select().from(families);
  for (const family of allFamilies) {
    if (await compare(pin, family.pinHash)) {
      await setFamilyCookie(family.id);
      return family.id;
    }
  }
  return null;
}

export async function getFamilyId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

async function setFamilyCookie(familyId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, familyId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
```

### Dependencia adicional

```bash
pnpm add bcryptjs
pnpm add -D @types/bcryptjs
```

### Archivo nuevo: `src/app/login/page.tsx`

Pantalla sencilla con input de PIN (4-6 dígitos) y botón "Entrar".
Si no existe familia, ofrece "Crear cuenta con PIN".

### Archivo nuevo: `src/middleware.ts`

```ts
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();
  if (pathname.startsWith("/_next") || pathname.startsWith("/audio")) return NextResponse.next();

  const familyId = request.cookies.get("melodex-family")?.value;
  if (!familyId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

---

## Fase 3 — Repositorios (server actions)

### Archivo nuevo: `src/lib/repositories/student-repo.ts`

```ts
"use server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getFamilyId } from "@/lib/auth";

export async function getOrCreateStudent(data: {
  displayName: string;
  avatar: string;
}) {
  const familyId = await getFamilyId();
  if (!familyId) throw new Error("No autenticado");

  const existing = await db.select().from(students)
    .where(eq(students.familyId, familyId));

  if (existing.length > 0) return existing[0];

  const [student] = await db.insert(students)
    .values({ familyId, displayName: data.displayName, avatar: data.avatar })
    .returning();
  return student;
}

export async function updateCurrentLesson(studentId: string, lessonId: string) {
  await db.update(students)
    .set({ currentLessonId: lessonId })
    .where(eq(students.id, studentId));
}

export async function getStudentWithProgress(familyId: string) {
  // JOIN students + lesson_attempts + song_attempts
  // Retorna AppState completo para hidratación
}
```

### Archivo nuevo: `src/lib/repositories/attempt-repo.ts`

```ts
"use server";
import { db } from "@/db";
import { lessonAttempts, songAttempts } from "@/db/schema";

export async function addLessonAttempt(data: {
  studentId: string;
  lessonId: string;
  stars: number;
  quizErrors: number;
  completed: boolean;
  durationSeconds: number | null;
}) {
  const [attempt] = await db.insert(lessonAttempts).values(data).returning();
  return attempt;
}

export async function addSongAttempt(data: {
  studentId: string;
  songId: string;
  fragmentId: string | null;
  completed: boolean;
  tempoPercent: number;
  durationSeconds: number | null;
}) {
  const [attempt] = await db.insert(songAttempts).values(data).returning();
  return attempt;
}
```

### Mapeo de acciones actuales del store → server actions

| Acción actual en store        | Server action destino          |
|-------------------------------|-------------------------------|
| `setStudent(profile)`         | `getOrCreateStudent()`         |
| `setCurrentLessonId(id)`      | `updateCurrentLesson()`        |
| `addLessonAttempt(attempt)`   | `addLessonAttempt()`           |
| `addSongAttempt(attempt)`     | `addSongAttempt()`             |
| `clearStudent()`              | `logout()`                     |

Las funciones de **lectura** (`getTotalStars`, `getBestAttempt`, `getSongStars`,
`getCompletedLessonIds`, `isLessonCompleted`) siguen calculándose en el cliente
a partir de los arrays hidratados.

---

## Fase 4 — Refactor del store

### Archivo modificado: `src/store/useAppStore.ts`

Cambios principales:

1. **Eliminar** `persist(...)` — Postgres es la fuente de verdad.
2. **Añadir** `hydrate(data)` — carga inicial desde servidor.
3. **Mutaciones** llaman server action y luego actualizan estado local (optimistic update).

```ts
import { create } from "zustand";
// SIN persist

interface AppStore extends AppState {
  hydrated: boolean;
  hydrate: (data: AppState) => void;

  // mutaciones ahora async
  setStudent: (profile: StudentProfile) => Promise<void>;
  addLessonAttempt: (attempt: ...) => Promise<void>;
  addSongAttempt: (attempt: ...) => Promise<void>;

  // lecturas siguen sync
  getTotalStars: () => number;
  getBestAttempt: (lessonId: string) => LessonAttempt | undefined;
  getSongStars: (songId: string) => number;
  getTotalSongStars: () => number;
  getCompletedLessonIds: () => string[];
  isLessonCompleted: (lessonId: string) => boolean;
}
```

### Archivo nuevo: `src/components/AppHydrator.tsx`

```tsx
"use client";
import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { AppState } from "@/types/storage";

export function AppHydrator({ data }: { data: AppState | null }) {
  const hydrate = useAppStore((s) => s.hydrate);
  useEffect(() => { if (data) hydrate(data); }, [data, hydrate]);
  return null;
}
```

### Archivo modificado: `src/app/layout.tsx`

El server component obtiene datos y los pasa al hydrator:

```tsx
import { AppHydrator } from "@/components/AppHydrator";
import { getStudentWithProgress } from "@/lib/repositories/student-repo";
import { getFamilyId } from "@/lib/auth";

export default async function RootLayout({ children }) {
  const familyId = await getFamilyId();
  const data = familyId ? await getStudentWithProgress(familyId) : null;

  return (
    <html>
      <body>
        <AppHydrator data={data} />
        {children}
      </body>
    </html>
  );
}
```

---

## Fase 5 — Importador localStorage → Postgres

### Archivo nuevo: `src/lib/migrate-local-data.ts`

```ts
"use server";
import { db } from "@/db";
import { students, lessonAttempts, songAttempts } from "@/db/schema";
import type { AppState } from "@/types/storage";

export async function migrateLocalData(localState: AppState, familyId: string) {
  // 1. Upsert student
  // 2. INSERT lesson_attempts ON CONFLICT (id) DO NOTHING
  // 3. INSERT song_attempts ON CONFLICT (id) DO NOTHING
  // 4. Retorna { imported: true, lessons: N, songs: M }
}
```

### Flujo en el cliente

Después del primer login con PIN, si `localStorage` tiene `melodex-storage`:
1. Leer JSON local.
2. Mostrar modal: "Encontramos progreso local. ¿Importar?"
3. Si acepta → llamar `migrateLocalData()`.
4. Limpiar `melodex-storage` de `localStorage`.

La importación es **idempotente** — se puede reintentar sin duplicar.

---

## Fase 6 — Tests

### Tests a añadir/modificar

| Archivo                                       | Cambio |
|-----------------------------------------------|--------|
| `src/store/useAppStore.test.ts`               | Mockear server actions; validar `hydrate()` |
| `src/lib/repositories/student-repo.test.ts`   | (nuevo) Test con db mockeado |
| `src/lib/repositories/attempt-repo.test.ts`   | (nuevo) Test con db mockeado |
| `src/lib/auth.test.ts`                        | (nuevo) Test de hash/verify PIN, cookies |
| `src/lib/migrate-local-data.test.ts`          | (nuevo) Validar idempotencia |
| `src/app/page.test.tsx`                       | Ajustar mock para `hydrated` flag |

---

## Archivos — Resumen completo

### Archivos nuevos (11)

| Archivo | Propósito |
|---------|-----------|
| `.env.example` | Placeholders de variables sin secretos |
| `drizzle.config.ts` | Configuración de Drizzle Kit |
| `src/db/schema.ts` | Esquema de tablas con Drizzle |
| `src/db/index.ts` | Conexión a Postgres |
| `src/lib/auth.ts` | Lógica de PIN familiar |
| `src/middleware.ts` | Protección de rutas |
| `src/app/login/page.tsx` | Pantalla de PIN |
| `src/lib/repositories/student-repo.ts` | Queries de estudiante |
| `src/lib/repositories/attempt-repo.ts` | Queries de intentos |
| `src/lib/migrate-local-data.ts` | Importador local → BD |
| `src/components/AppHydrator.tsx` | Hidratación del store |

### Archivos modificados (4)

| Archivo | Cambio |
|---------|--------|
| `src/store/useAppStore.ts` | Quitar `persist`, añadir `hydrate`, mutaciones async |
| `src/app/layout.tsx` | Montar `AppHydrator` con datos del servidor |
| `package.json` | Añadir `drizzle-orm`, `postgres`, `bcryptjs`, `drizzle-kit` |
| `src/store/useAppStore.test.ts` | Ajustar a nueva interfaz async |

### Archivos NO tocados

- `src/engine/*` — motor de lecciones puro, sin cambios
- `src/content/*` — contenido educativo, sin cambios
- `src/components/Keyboard.tsx` — UI pura, sin cambios
- `src/lib/audio.ts` — audio, sin cambios

---

## Orden de implementación

```
 1. .env.example + instalar dependencias (drizzle-orm, postgres, bcryptjs)
 2. src/db/schema.ts + src/db/index.ts + drizzle.config.ts
 3. drizzle-kit push (crear tablas en la BD)
 4. src/lib/auth.ts (PIN hash + cookies)
 5. src/middleware.ts (protección de rutas)
 6. src/app/login/page.tsx (UI de PIN)
 7. src/lib/repositories/* (server actions)
 8. src/store/useAppStore.ts (refactor sin persist)
 9. src/components/AppHydrator.tsx + src/app/layout.tsx
10. src/lib/migrate-local-data.ts (importador)
11. Tests
12. pnpm run ci + pnpm build
13. Deploy a Vercel con POSTGRES_URL configurada
```

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| `POSTGRES_URL` expuesta en cliente | Solo importar `db` en archivos `"use server"` |
| PIN débil (4 dígitos) | bcrypt + rate limiting en login |
| Duplicar datos al importar | `ON CONFLICT DO NOTHING` usando `id` original |
| Hydration mismatch SSR/client | `AppHydrator` solo actúa en `useEffect` |
| Latencia en mutaciones | Optimistic update local antes del await |
| Conexión Postgres sin pool | `postgres.js` maneja pool interno |

---

## Prerequisitos antes de implementar

1. Obtener el **connection string** de Postgres desde Supabase dashboard
   (Settings → Database → Connection string → URI).
   El `SUPABASE_API_KEY` actual **no sirve** para conexión directa.
2. Decidir PIN familiar (4-6 dígitos) y generar su hash bcrypt.
3. Tener acceso al dashboard para verificar que las tablas se crearon.
