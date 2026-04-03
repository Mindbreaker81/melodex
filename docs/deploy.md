# Deploy — Melodex

Guía para desplegar la aplicación en Vercel o Netlify.

---

## Requisitos previos

- Repositorio publicado en GitHub (`mindbreaker81/melodex`).
- Base de datos **Postgres** accesible desde internet (Supabase, Neon, o self-hosted).
- Variable de entorno `POSTGRES_URL` con el connection string.
- Tablas creadas en la BD (ver sección "Preparar la base de datos").

---

## Preparar la base de datos

Antes del primer deploy, las tablas deben existir en la BD.

### Opción A — Drizzle Kit (recomendada)

```bash
# Desde la raíz del proyecto, con POSTGRES_URL en .env
pnpm drizzle-kit push
```

### Opción B — SQL manual

Ejecutar el contenido generado por `pnpm drizzle-kit generate` en el SQL Editor
de tu proveedor (Supabase Dashboard, pgAdmin, psql, etc.).

Las tablas son: `families`, `students`, `lesson_attempts`, `song_attempts`.

---

## Variables de entorno

| Variable | Requerida | Dónde | Descripción |
|----------|-----------|-------|-------------|
| `POSTGRES_URL` | Sí | Servidor | Connection string de Postgres |

En Vercel: Settings → Environment Variables → agregar `POSTGRES_URL`.

> **Importante**: `POSTGRES_URL` solo se usa en el servidor (server actions).
> Nunca se expone al navegador.

---

## Opción A — Vercel (recomendada)

Vercel es el creador de Next.js. La integración es nativa.

### Pasos

1. Ir a [vercel.com](https://vercel.com) e iniciar sesión con GitHub.
2. Clic en **"Add New Project"**.
3. Seleccionar el repositorio `mindbreaker81/melodex`.
4. Vercel detecta Next.js automáticamente. Configuración por defecto:
   - Framework: **Next.js**
   - Build command: `pnpm build`
   - Output directory: `.next`
   - Install command: `pnpm install`
5. En **Environment Variables**, agregar `POSTGRES_URL`.
6. Clic en **"Deploy"**.
7. En ~1 minuto tendrás la URL pública (ej: `melodex.vercel.app`).

### Dominio personalizado (opcional)

En el dashboard del proyecto → Settings → Domains → agregar dominio y configurar DNS.

---

## Opción B — Netlify

### Pasos

1. Ir a [netlify.com](https://netlify.com) e iniciar sesión con GitHub.
2. Clic en **"Add new site" → "Import an existing project"**.
3. Seleccionar el repositorio `mindbreaker81/melodex`.
4. Configuración de build:
   - Build command: `pnpm build`
   - Publish directory: `.next`
   - Node version: `20`
5. En **Environment Variables**, agregar `POSTGRES_URL`.
6. Netlify detecta Next.js y agrega `@netlify/plugin-nextjs` automáticamente.
7. Clic en **"Deploy site"**.

### Nota sobre Netlify

Netlify ejecuta Next.js mediante su runtime propio. Melodex usa middleware
para auth y server actions para BD, que requieren el runtime de servidor de Netlify.

---

## Verificación post-deploy

Después del primer deploy, verificar:

- [ ] La app redirige a `/login` (pantalla de PIN).
- [ ] Crear una cuenta con PIN funciona.
- [ ] Ingresar con PIN redirige al onboarding (primera vez) o al inicio.
- [ ] Completar el onboarding crea el estudiante y redirige a la Lección 1.
- [ ] El teclado virtual renderiza correctamente.
- [ ] El audio suena al reproducir una nota de referencia (requiere interacción del usuario).
- [ ] El progreso persiste al recargar la página (guardado en BD).
- [ ] El progreso persiste al abrir en otro dispositivo con el mismo PIN.
- [ ] El panel del padre es accesible desde la pantalla de inicio.

---

## CI automático

El repositorio incluye `.github/workflows/ci.yml` que ejecuta lint, typecheck,
tests y build en cada push a `main` y en pull requests. Vercel y Netlify también
ejecutan el build en cada push, proporcionando una segunda capa de verificación.

---

## Notas

- **Variable de entorno requerida**: `POSTGRES_URL` debe configurarse en la plataforma de deploy.
- **Auth**: la app usa PIN familiar con cookie httpOnly. No requiere proveedor de auth externo.
- **Audio**: los samples WAV se sirven desde `/public/audio/` como assets estáticos.
- **Migración de datos**: si el usuario tenía progreso en localStorage (versiones anteriores),
  la app ofrece importarlo automáticamente tras el primer login.
