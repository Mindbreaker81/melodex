import type { Song } from "@/types/content";

export const estrellita: Song = {
  id: "song-estrellita",
  title: "Estrellita",
  difficulty: "easy",
  requiredLessonId: "lesson-7",
  fullDemoAudio: "/audio/songs/estrellita.mp3",
  fragments: [
    {
      id: "estrellita-f1",
      notes: [
        { note: "C4", finger: 1, durationMs: 500 },
        { note: "C4", finger: 1, durationMs: 500 },
        { note: "G4", finger: 5, durationMs: 500 },
        { note: "G4", finger: 5, durationMs: 500 },
        { note: "A4", finger: 5, durationMs: 500 },
        { note: "A4", finger: 5, durationMs: 500 },
        { note: "G4", finger: 5, durationMs: 1000 },
      ],
    },
    {
      id: "estrellita-f2",
      notes: [
        { note: "F4", finger: 4, durationMs: 500 },
        { note: "F4", finger: 4, durationMs: 500 },
        { note: "E4", finger: 3, durationMs: 500 },
        { note: "E4", finger: 3, durationMs: 500 },
        { note: "D4", finger: 2, durationMs: 500 },
        { note: "D4", finger: 2, durationMs: 500 },
        { note: "C4", finger: 1, durationMs: 1000 },
      ],
    },
    {
      id: "estrellita-f3",
      notes: [
        { note: "G4", finger: 5, durationMs: 500 },
        { note: "G4", finger: 5, durationMs: 500 },
        { note: "F4", finger: 4, durationMs: 500 },
        { note: "F4", finger: 4, durationMs: 500 },
        { note: "E4", finger: 3, durationMs: 500 },
        { note: "E4", finger: 3, durationMs: 500 },
        { note: "D4", finger: 2, durationMs: 1000 },
      ],
    },
    {
      id: "estrellita-f4",
      notes: [
        { note: "G4", finger: 5, durationMs: 500 },
        { note: "G4", finger: 5, durationMs: 500 },
        { note: "F4", finger: 4, durationMs: 500 },
        { note: "F4", finger: 4, durationMs: 500 },
        { note: "E4", finger: 3, durationMs: 500 },
        { note: "E4", finger: 3, durationMs: 500 },
        { note: "D4", finger: 2, durationMs: 1000 },
      ],
    },
  ],
};
