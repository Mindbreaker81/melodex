# Melodex

Web app educativa para aprender **órgano eléctrico** desde cero. Está pensada para un niño de 9 años (principiante absoluto) que practica en casa, acompañado por un adulto sin formación musical: la aplicación guía qué practicar, en qué orden y con qué dedos, mientras el instrumento real es quien suena.

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [PRD v3](docs/prd.md) | Requisitos de producto: usuarios, MVP, contenido, arquitectura y modelo de datos |
| [Deploy](docs/deploy.md) | Instrucciones para desplegar en Vercel o Netlify (requiere Postgres) |
| [Migración a Postgres](docs/spec-supabase-migration.md) | Spec técnico de la migración de localStorage a Postgres |
| [Pendientes post-MVP](docs/pendientes-post-mvp.md) | Items menores no bloqueantes: ilustraciones, PWA offline, mobile portrait |

## Visión del producto

- **La app guía, el órgano suena:** el teclado en pantalla es referencia visual; el niño toca en su órgano real.
- **Una novedad por lección**, instrucciones muy visuales y sensación de progreso rápido.
- Contenido educativo versionado en el repositorio (TypeScript), no en un CMS.

## Stack

| Área | Tecnología |
|------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| Lenguaje | TypeScript (strict) |
| Audio | Web Audio API + samples WAV |
| Estado local | Zustand 5 (cache de UI) |
| Persistencia | Postgres directo (Drizzle ORM) |
| Auth | PIN familiar (bcrypt + cookie httpOnly) |
| Tests | Vitest + React Testing Library |
| Despliegue | Vercel o Netlify |

## Alcance del MVP (resumen)

- Teclado virtual de referencia (2 octavas, Do3–Do5), digitación por colores y números.
- 7 lecciones progresivas (mano derecha) y 2 canciones guiadas con práctica por fragmentos.
- Progreso con estrellas y barra global; vista resumida para el padre.
- Notación en español (Do, Re, Mi…); diseño responsive.
- Persistencia del progreso en Postgres (con importador desde localStorage).

Detalle de mundos, lecciones, canciones y flujos: ver [PRD v2](docs/prd.md).

## Estado del repositorio

Aplicación funcional con 74 tests passing, lint clean, build OK. Lista para deploy.

## Desarrollo local

```bash
# Instalar dependencias
pnpm install

# Configurar base de datos (crear .env con POSTGRES_URL)
cp .env.example .env
# Editar .env con tu connection string de Postgres

# Crear tablas en la BD
pnpm drizzle-kit push

# Iniciar servidor de desarrollo
pnpm dev

# Ejecutar CI (lint + typecheck + tests)
pnpm run ci
```

## Licencia

Por definir.
