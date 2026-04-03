import type { Song } from "@/types/content";

export const himnoAlegria: Song = {
  id: "song-himno",
  title: "Himno de la Alegría",
  difficulty: "easy",
  requiredLessonId: "lesson-7",
  fullDemoAudio: "/audio/songs/himno-alegria.mp3",
  fragments: [
    {
      id: "himno-f1",
      notes: [
        { note: "E4", finger: 3, durationMs: 500 },
        { note: "E4", finger: 3, durationMs: 500 },
        { note: "F4", finger: 4, durationMs: 500 },
        { note: "G4", finger: 5, durationMs: 500 },
        { note: "G4", finger: 5, durationMs: 500 },
        { note: "F4", finger: 4, durationMs: 500 },
        { note: "E4", finger: 3, durationMs: 500 },
        { note: "D4", finger: 2, durationMs: 1000 },
      ],
    },
    {
      id: "himno-f2",
      notes: [
        { note: "C4", finger: 1, durationMs: 500 },
        { note: "C4", finger: 1, durationMs: 500 },
        { note: "D4", finger: 2, durationMs: 500 },
        { note: "E4", finger: 3, durationMs: 500 },
        { note: "E4", finger: 3, durationMs: 750 },
        { note: "D4", finger: 2, durationMs: 250 },
        { note: "D4", finger: 2, durationMs: 1000 },
      ],
    },
    {
      id: "himno-f3",
      notes: [
        { note: "E4", finger: 3, durationMs: 500 },
        { note: "E4", finger: 3, durationMs: 500 },
        { note: "F4", finger: 4, durationMs: 500 },
        { note: "G4", finger: 5, durationMs: 500 },
        { note: "G4", finger: 5, durationMs: 500 },
        { note: "F4", finger: 4, durationMs: 500 },
        { note: "E4", finger: 3, durationMs: 500 },
        { note: "D4", finger: 2, durationMs: 500 },
        { note: "C4", finger: 1, durationMs: 500 },
        { note: "C4", finger: 1, durationMs: 500 },
        { note: "D4", finger: 2, durationMs: 500 },
        { note: "E4", finger: 3, durationMs: 500 },
        { note: "D4", finger: 2, durationMs: 750 },
        { note: "C4", finger: 1, durationMs: 250 },
        { note: "C4", finger: 1, durationMs: 1000 },
      ],
    },
  ],
};
