import type { World, Lesson } from "@/types/content";

const lesson7: Lesson = {
  id: "lesson-7",
  worldId: "world-3",
  order: 1,
  title: "Preparación para canciones",
  objective: "Tocar fragmentos cortos con ritmo libre",
  estimatedMinutes: 5,
  hand: "right",
  notesUsed: ["C4", "D4", "E4", "F4", "G4", "A4"],
  steps: [
    {
      id: "lesson-7-s1",
      type: "intro",
      instruction:
        "¡Ya estás listo para tocar canciones! Pero primero, practiquemos unos fragmentos.",
    },
    {
      id: "lesson-7-s2",
      type: "demo",
      instruction: "Escucha este fragmento de Estrellita",
      targetNotes: ["C4", "C4", "G4", "G4", "A4", "A4", "G4"],
    },
    {
      id: "lesson-7-s3",
      type: "sequence-quiz",
      instruction: "Toca: Do, Do, Sol, Sol",
      targetNotes: ["C4", "C4", "G4", "G4"],
      fingers: [1, 1, 5, 5],
    },
    {
      id: "lesson-7-s4",
      type: "play-real",
      instruction: "Practica ese fragmento en tu órgano",
    },
    {
      id: "lesson-7-s5",
      type: "demo",
      instruction: "Ahora escucha el inicio del Himno de la Alegría",
      targetNotes: ["E4", "E4", "F4", "G4", "G4", "F4", "E4"],
    },
    {
      id: "lesson-7-s6",
      type: "sequence-quiz",
      instruction: "Toca: Mi, Mi, Fa, Sol",
      targetNotes: ["E4", "E4", "F4", "G4"],
      fingers: [3, 3, 4, 5],
    },
    {
      id: "lesson-7-s7",
      type: "play-real",
      instruction:
        "¡Genial! Practica en tu órgano. ¡Ya puedes ir a Canciones!",
    },
  ],
};

export const world3Lessons: Lesson[] = [lesson7];

export const world3: World = {
  id: "world-3",
  order: 3,
  title: "Mis primeras canciones",
  description: "Aplica lo aprendido en melodías reales",
  lessonIds: ["lesson-7"],
};
