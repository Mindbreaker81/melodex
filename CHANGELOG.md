# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Versionado semántico](https://semver.org/lang/es/).

## [Unreleased]

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
