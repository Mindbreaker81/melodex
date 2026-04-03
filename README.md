# Melodex

Web app educativa para aprender **órgano eléctrico** desde cero. Está pensada para un niño de 9 años (principiante absoluto) que practica en casa, acompañado por un adulto sin formación musical: la aplicación guía qué practicar, en qué orden y con qué dedos, mientras el instrumento real es quien suena.

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [PRD v2](docs/prd.md) | Requisitos de producto: usuarios, MVP, contenido, arquitectura y modelo de datos |
| [Deploy](docs/deploy.md) | Instrucciones para desplegar en Vercel o Netlify |
| [Pendientes post-MVP](docs/pendientes-post-mvp.md) | Items menores no bloqueantes: ilustraciones, PWA offline, mobile portrait |

## Visión del producto

- **La app guía, el órgano suena:** el teclado en pantalla es referencia visual; el niño toca en su órgano real.
- **Una novedad por lección**, instrucciones muy visuales y sensación de progreso rápido.
- Contenido educativo versionado en el repositorio (TypeScript), no en un CMS.

## Stack previsto (MVP)

| Área | Tecnología |
|------|------------|
| Framework | Next.js (App Router) |
| UI | React + Tailwind CSS |
| Lenguaje | TypeScript |
| Audio | Web Audio API + samples mp3 |
| Estado local | Zustand |
| Persistencia (MVP) | localStorage + Zustand persist |
| Persistencia (futuro) | Supabase (Postgres + Auth con magic link) |
| Despliegue | Vercel o Netlify |

## Alcance del MVP (resumen)

- Teclado virtual de referencia (2 octavas, Do3–Do5), digitación por colores y números.
- 7 lecciones progresivas (mano derecha) y 2 canciones guiadas con práctica por fragmentos.
- Progreso con estrellas y barra global; vista resumida para el padre.
- Notación en español (Do, Re, Mi…); diseño responsive.
- Persistencia del progreso en localStorage (Supabase post-validación).

Detalle de mundos, lecciones, canciones y flujos: ver [PRD v2](docs/prd.md).

## Estado del repositorio

El proyecto está en fase de **definición y documentación**. El código de la aplicación se irá añadiendo según el PRD.

## Desarrollo local

Cuando exista la aplicación Next.js, las instrucciones concretas (`pnpm install`, `pnpm dev`, variables de entorno) se documentarán aquí.

## Licencia

Por definir.
