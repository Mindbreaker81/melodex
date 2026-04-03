# Deploy — Melodex

Guía para desplegar la aplicación en Vercel o Netlify.

---

## Requisitos previos

- Repositorio publicado en GitHub (`mindbreaker81/melodex`).
- No se requieren variables de entorno ni base de datos. Todo funciona con localStorage y assets estáticos.

---

## Opción A — Vercel (recomendada)

Vercel es el creador de Next.js. La integración es nativa y sin configuración.

### Pasos

1. Ir a [vercel.com](https://vercel.com) e iniciar sesión con GitHub.
2. Clic en **"Add New Project"**.
3. Seleccionar el repositorio `mindbreaker81/melodex`.
4. Vercel detecta Next.js automáticamente. Configuración por defecto:
   - Framework: **Next.js**
   - Build command: `pnpm build`
   - Output directory: `.next`
   - Install command: `pnpm install`
5. Clic en **"Deploy"**.
6. En ~1 minuto tendrás la URL pública (ej: `melodex.vercel.app`).

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
5. Netlify detecta Next.js y agrega `@netlify/plugin-nextjs` automáticamente.
6. Clic en **"Deploy site"**.

### Nota sobre Netlify

Netlify ejecuta Next.js mediante su runtime propio. Algunas features avanzadas de Next.js (middleware, ISR) pueden comportarse diferente. Para Melodex (100% estático con client components) no hay diferencia.

---

## Verificación post-deploy

Después del primer deploy, verificar:

- [ ] La app carga y muestra la pantalla de onboarding.
- [ ] Completar el onboarding redirige a la Lección 1.
- [ ] El teclado virtual renderiza correctamente.
- [ ] El audio suena al reproducir una nota de referencia (requiere interacción del usuario por política del navegador).
- [ ] El progreso persiste al recargar la página.
- [ ] El panel del padre es accesible desde la pantalla de inicio.

---

## CI automático

El repositorio incluye `.github/workflows/ci.yml` que ejecuta lint, typecheck, tests y build en cada push a `main` y en pull requests. Vercel y Netlify también ejecutan el build en cada push, proporcionando una segunda capa de verificación.

---

## Notas

- **Sin variables de entorno**: la app no requiere `.env` ni secretos. Todo funciona con localStorage.
- **Audio**: los samples WAV se sirven desde `/public/audio/notes/` como assets estáticos.
- **Tamaño del bundle**: sin dependencias pesadas (no Tone.js, no Supabase). El bundle de producción es ligero.
