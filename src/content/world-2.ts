import type { World, Lesson } from "@/types/content";

const lesson4: Lesson = {
  id: "lesson-4",
  worldId: "world-2",
  order: 1,
  title: "Los 5 dedos",
  objective: "Pulgar=1, índice=2, medio=3, anular=4, meñique=5",
  estimatedMinutes: 3,
  hand: "right",
  notesUsed: ["C4", "D4", "E4", "F4", "G4"],
  steps: [
    {
      id: "lesson-4-s1",
      type: "intro",
      instruction: "Tu mano derecha tiene 5 dedos numerados del 1 al 5",
    },
    {
      id: "lesson-4-s2",
      type: "intro",
      instruction:
        "Pulgar = 1, Índice = 2, Medio = 3, Anular = 4, Meñique = 5",
    },
    {
      id: "lesson-4-s3",
      type: "find-note",
      instruction: "El dedo 1 (pulgar) toca el Do. ¡Tócalo!",
      targetNotes: ["C4"],
      fingers: [1],
    },
    {
      id: "lesson-4-s4",
      type: "find-note",
      instruction: "El dedo 3 (medio) toca el Mi. ¡Encuéntralo!",
      targetNotes: ["E4"],
      fingers: [3],
    },
    {
      id: "lesson-4-s5",
      type: "find-note",
      instruction: "El dedo 5 (meñique) toca el Sol. ¿Dónde está?",
      targetNotes: ["G4"],
      fingers: [5],
    },
    {
      id: "lesson-4-s6",
      type: "play-real",
      instruction: "Coloca tus 5 dedos desde Do hasta Sol en tu órgano",
    },
  ],
};

const lesson5: Lesson = {
  id: "lesson-5",
  worldId: "world-2",
  order: 2,
  title: "Do-Re-Mi con 1-2-3",
  objective: "Posición de 3 dedos en Do-Re-Mi",
  estimatedMinutes: 4,
  hand: "right",
  notesUsed: ["C4", "D4", "E4"],
  steps: [
    {
      id: "lesson-5-s1",
      type: "intro",
      instruction: "Vamos a tocar Do, Re, Mi con los dedos 1, 2 y 3",
    },
    {
      id: "lesson-5-s2",
      type: "demo",
      instruction: "Escucha: Do, Re, Mi",
      targetNotes: ["C4", "D4", "E4"],
    },
    {
      id: "lesson-5-s3",
      type: "find-note",
      instruction: "Dedo 1 en Do",
      targetNotes: ["C4"],
      fingers: [1],
    },
    {
      id: "lesson-5-s4",
      type: "find-note",
      instruction: "Dedo 2 en Re",
      targetNotes: ["D4"],
      fingers: [2],
    },
    {
      id: "lesson-5-s5",
      type: "find-note",
      instruction: "Dedo 3 en Mi",
      targetNotes: ["E4"],
      fingers: [3],
    },
    {
      id: "lesson-5-s6",
      type: "sequence-quiz",
      instruction: "Toca Do, Re, Mi en orden",
      targetNotes: ["C4", "D4", "E4"],
      fingers: [1, 2, 3],
    },
    {
      id: "lesson-5-s7",
      type: "sequence-quiz",
      instruction: "Ahora al revés: Mi, Re, Do",
      targetNotes: ["E4", "D4", "C4"],
      fingers: [3, 2, 1],
    },
    {
      id: "lesson-5-s8",
      type: "play-real",
      instruction: "¡Practica Do-Re-Mi y Mi-Re-Do en tu órgano!",
    },
  ],
};

const lesson6: Lesson = {
  id: "lesson-6",
  worldId: "world-2",
  order: 3,
  title: "Do a Sol con 5 dedos",
  objective: "Escala completa de 5 notas con 5 dedos",
  estimatedMinutes: 5,
  hand: "right",
  notesUsed: ["C4", "D4", "E4", "F4", "G4"],
  steps: [
    {
      id: "lesson-6-s1",
      type: "intro",
      instruction: "¡Ya conoces todas las notas! Ahora con los 5 dedos",
    },
    {
      id: "lesson-6-s2",
      type: "demo",
      instruction: "Escucha la escala: Do, Re, Mi, Fa, Sol",
      targetNotes: ["C4", "D4", "E4", "F4", "G4"],
    },
    {
      id: "lesson-6-s3",
      type: "find-note",
      instruction: "Dedo 4 (anular) en Fa",
      targetNotes: ["F4"],
      fingers: [4],
    },
    {
      id: "lesson-6-s4",
      type: "sequence-quiz",
      instruction: "Toca la escala: Do, Re, Mi, Fa, Sol",
      targetNotes: ["C4", "D4", "E4", "F4", "G4"],
      fingers: [1, 2, 3, 4, 5],
    },
    {
      id: "lesson-6-s5",
      type: "sequence-quiz",
      instruction: "Bajando: Sol, Fa, Mi, Re, Do",
      targetNotes: ["G4", "F4", "E4", "D4", "C4"],
      fingers: [5, 4, 3, 2, 1],
    },
    {
      id: "lesson-6-s6",
      type: "play-real",
      instruction: "¡Sube y baja la escala en tu órgano!",
    },
  ],
};

export const world2Lessons: Lesson[] = [lesson4, lesson5, lesson6];

export const world2: World = {
  id: "world-2",
  order: 2,
  title: "Mis dedos",
  description: "Numeración de dedos y posición básica de mano derecha",
  lessonIds: ["lesson-4", "lesson-5", "lesson-6"],
};
