import type { World, Lesson } from "@/types/content";

const lesson1: Lesson = {
  id: "lesson-1",
  worldId: "world-1",
  order: 1,
  title: "Las teclas negras",
  objective: "El teclado tiene un patrón: grupos de 2 y 3 teclas negras",
  estimatedMinutes: 3,
  hand: "right",
  notesUsed: ["C#3", "D#3", "F#3", "G#3", "A#3"],
  steps: [
    {
      id: "lesson-1-s1",
      type: "intro",
      instruction: "¡Mira tu órgano! Las teclas negras forman grupos de 2 y 3.",
    },
    {
      id: "lesson-1-s2",
      type: "intro",
      instruction: "Busca un grupo de 2 teclas negras juntas. ¿Lo ves?",
    },
    {
      id: "lesson-1-s3",
      type: "find-note",
      instruction: "Toca una tecla negra del grupo de 2",
      targetNotes: ["C#3", "D#3", "C#4", "D#4"],
    },
    {
      id: "lesson-1-s4",
      type: "find-note",
      instruction: "Ahora busca un grupo de 3 teclas negras",
      targetNotes: ["F#3", "G#3", "A#3", "F#4", "G#4", "A#4"],
    },
    {
      id: "lesson-1-s5",
      type: "play-real",
      instruction: "¡Genial! Toca todos los grupos de 2 y 3 en tu órgano",
    },
  ],
};

const lesson2: Lesson = {
  id: "lesson-2",
  worldId: "world-1",
  order: 2,
  title: "Encuentra el Do",
  objective: "El Do está justo a la izquierda del grupo de 2 negras",
  estimatedMinutes: 3,
  hand: "right",
  notesUsed: ["C3", "C4", "C5"],
  steps: [
    {
      id: "lesson-2-s1",
      type: "intro",
      instruction: "La nota Do está justo antes del grupo de 2 teclas negras.",
    },
    {
      id: "lesson-2-s2",
      type: "demo",
      instruction: "Escucha cómo suena el Do",
      targetNotes: ["C4"],
    },
    {
      id: "lesson-2-s3",
      type: "find-note",
      instruction: "¡Encuentra el Do!",
      targetNotes: ["C3", "C4", "C5"],
    },
    {
      id: "lesson-2-s4",
      type: "find-note",
      instruction: "¿Puedes encontrar otro Do más agudo?",
      targetNotes: ["C4", "C5"],
    },
    {
      id: "lesson-2-s5",
      type: "play-real",
      instruction: "Toca todos los Do que encuentres en tu órgano",
    },
  ],
};

const lesson3: Lesson = {
  id: "lesson-3",
  worldId: "world-1",
  order: 3,
  title: "Do, Re, Mi, Fa, Sol",
  objective: "Las 5 primeras notas de la escala",
  estimatedMinutes: 5,
  hand: "right",
  notesUsed: ["C4", "D4", "E4", "F4", "G4"],
  steps: [
    {
      id: "lesson-3-s1",
      type: "intro",
      instruction: "Desde el Do, las notas van: Do, Re, Mi, Fa, Sol",
    },
    {
      id: "lesson-3-s2",
      type: "demo",
      instruction: "Escucha las 5 notas",
      targetNotes: ["C4", "D4", "E4", "F4", "G4"],
    },
    {
      id: "lesson-3-s3",
      type: "find-note",
      instruction: "¿Dónde está el Re?",
      targetNotes: ["D4"],
    },
    {
      id: "lesson-3-s4",
      type: "find-note",
      instruction: "¿Y el Mi?",
      targetNotes: ["E4"],
    },
    {
      id: "lesson-3-s5",
      type: "find-note",
      instruction: "¿Dónde está el Sol?",
      targetNotes: ["G4"],
    },
    {
      id: "lesson-3-s6",
      type: "sequence-quiz",
      instruction: "Toca Do, Re, Mi, Fa, Sol en orden",
      targetNotes: ["C4", "D4", "E4", "F4", "G4"],
    },
    {
      id: "lesson-3-s7",
      type: "play-real",
      instruction: "¡Ahora tócalas en tu órgano! Do, Re, Mi, Fa, Sol",
    },
  ],
};

export const world1Lessons: Lesson[] = [lesson1, lesson2, lesson3];

export const world1: World = {
  id: "world-1",
  order: 1,
  title: "Descubro el teclado",
  description: "Reconoce el patrón visual del teclado y ubica las notas",
  lessonIds: ["lesson-1", "lesson-2", "lesson-3"],
};
